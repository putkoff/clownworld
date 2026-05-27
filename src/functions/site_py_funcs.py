import logging
import os
import re
import shutil
import cv2
import pytesseract
import spacy
import json
import numpy as np
from collections import Counter
from moviepy import VideoFileClip
from abstract_ocr.ocr_utils import *
from abstract_utilities import eatAll, safe_read_from_json, safe_dump_to_file

# Configure logging
logging.basicConfig(level=logging.INFO)

# Load spaCy model (run `python -m spacy download en_core_web_sm` first if not installed)
nlp = spacy.load("en_core_web_sm")


def split_it_out(obj1, obj2):
    """Remove obj1 from obj2 and return the remaining string."""
    obj_3 = obj2
    if obj2 and obj1 and obj1.lower() in obj2.lower():
        start = 0
        obj_3 = ''
        obj2_spl = obj2.lower().split(obj1.lower())
        len_obj1 = len(obj1)
        for each in obj2_spl:
            end = start + len(each)
            obj_3 += obj2[start:end]
            start += len_obj1 + len(each)
    return obj_3


def extract_hash_tags(strings):
    """Extract hashtags from a string and return the cleaned string with hashtags."""
    hash_tags = []
    hashtags = strings.split('#')
    for hashtag in hashtags:
        hashtag = f"#{hashtag.split(' ')[0]}"
        strings = split_it_out(hashtag, strings)
        hash_tags.append(hashtag[1:])
    return strings, hash_tags


def get_title_description(string, leng=65):
    """
    Split a string into a title and description based on length and separators.

    Args:
        string (str): Input string to split.
        leng (int): Maximum title length (default: 65).

    Returns:
        tuple: (title, description)
    """
    # If the string is short enough, return it as title with empty description
    if len(string) <= leng:
        return string, ""

    # Define separators to try splitting on
    separators = ['.', '!', ':', '|', ' ']

    # Try each separator
    for sep in separators:
        parts = string.split(sep)
        if len(parts) > 1:  # If the separator exists and splits the string
            title = ""
            for i, part in enumerate(parts):
                potential_title = sep.join(parts[:i + 1]) if i > 0 else part
                if len(potential_title) <= leng:
                    title = potential_title
                else:
                    if title:  # Use the last valid title
                        description = sep.join(parts[i:]).strip()
                        if len(title + sep) <= leng:
                            title += sep
                        return title, description
                    break

    # If no separators work, return full string as title
    return string, ""


def analyze_video_text(video_path, output_dir=None):
    """Extract text from video frames using OCR."""
    dirname = os.path.dirname(video_path)
    output_dir = output_dir or os.path.join(dirname, './frames')
    os.makedirs(output_dir, exist_ok=True)

    # Load the video
    video = VideoFileClip(video_path)
    duration = video.duration

    # Extract frames every 1 second
    frame_interval = 1
    for t in range(0, int(duration), frame_interval):
        frame = video.get_frame(t)
        frame_path = os.path.join(output_dir, f"frame_{t}.jpg")
        cv2.imwrite(frame_path, cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR))

    def extract_text_from_image(image_path):
        """Extract text from an image using OCR."""
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        text = pytesseract.image_to_string(thresh)
        return text.strip()

    # Process all extracted frames
    extracted_text = []
    for frame_file in os.listdir(output_dir):
        if frame_file.endswith(".jpg"):
            image_dir = os.path.join(output_dir, frame_file)
            text = extract_text_from_image(image_dir)
            if text:
                extracted_text.append({"frame": frame_file, "text": text})

    return extracted_text


def get_file(filename, directory):
    """Find a file in a directory by basename."""
    for item in os.listdir(directory):
        basename = os.path.splitext(item)[0]
        if basename and str(filename) == str(basename):
            return item
    return None


def get_thumbnail_texts(directory):
    """Extract text from thumbnail images in a directory."""
    texts = []
    thumbnails_dir = os.path.join(directory, 'thumbnails') if not directory.endswith('thumbnails') else directory
    if os.path.isdir(thumbnails_dir):
        for thumbnail in os.listdir(thumbnails_dir):
            thumbnail_path = os.path.join(thumbnails_dir, thumbnail)
            text = convert_image_to_text(thumbnail_path)
            if text:
                texts.append(text)
    return texts


def get_constants(text, constants=[]):
    """Identify constant text elements in a string."""
    if not constants:
        return [eatAll(line, [' ', '', '\n', '\t']) for line in text.split('\n')]
    
    constants_dict = {const: False for const in constants}
    for line in text.split('\n'):
        line = eatAll(line, [' ', '', '\n', '\t'])
        for key in constants_dict:
            if line in key and not constants_dict[key]:
                constants_dict[key] = True
    return [key for key, value in constants_dict.items() if value]


def get_text_constants(video_text):
    """Count text occurrences across video frames."""
    constants = {}
    for j, frame in enumerate(video_text):
        text = frame.get('text')
        # Extract the numeric frame number from the filename (e.g., "frame_1.jpg" -> 1)
        frame_name = os.path.splitext(frame.get('frame'))[0]  # "frame_1"
        frame_num = int(frame_name.split('_')[-1])  # "1" -> 1
        text_spl = text.split('\n')
        text_spl_len = len(text_spl)
        for i, line in enumerate(text_spl):
            line = eatAll(line, [' ', '', '\n', '\t'])
            if line not in constants:
                constants[line] = {"count": 0, "positions": []}
            constants[line]["count"] += 1
            constants[line]["positions"].append({"count": i + 1, "of": text_spl_len, "frame": frame_num})
    return constants


def derive_video_info(data, keywords=[], description='', title=''):
    """Derive video metadata like title, description, and uploader."""
    def preprocess_text(text):
        text = re.sub(r'[^\w\s@]', '', text).strip().lower()
        return text

    phrase_counts = {preprocess_text(phrase): info["count"] for phrase, info in data.items()}

    def extract_keywords_nlp(data, top_n=5):
        combined_text = " ".join([preprocess_text(phrase) * info["count"] for phrase, info in data.items()])
        doc = nlp(combined_text)
        word_counts = Counter()
        for token in doc:
            if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and len(token.text) > 2:
                word_counts[token.text] += 1
        entity_counts = Counter(ent.text.lower() for ent in doc.ents if len(ent.text.split()) > 1)
        combined_counts = word_counts + entity_counts
        return [word for word, count in combined_counts.most_common(top_n)]

    keywords += extract_keywords_nlp(data)

    def get_title(phrase_counts, min_count=10):
        valid_phrases = {phrase: count for phrase, count in phrase_counts.items()
                         if count > min_count and phrase and not phrase.startswith("~~~") and len(phrase.split()) > 1}
        return max(valid_phrases.items(), key=lambda x: x[1])[0].capitalize() if valid_phrases else ''

    title += ' ' + get_title(phrase_counts)

    def get_description(phrase_counts, top_n=5):
        top_phrases = sorted(phrase_counts.items(), key=lambda x: x[1], reverse=True)[:top_n]
        relevant_phrases = [phrase for phrase, count in top_phrases
                            if any(kw in phrase for kw in keywords) or count > 20]
        themes = [phrase for phrase in relevant_phrases if len(phrase.split()) > 1]
        return description + ", ".join(themes[:3])

    description = get_description(phrase_counts)

    def get_uploader(phrase_counts):
        candidates = [phrase for phrase in phrase_counts.keys()
                      if phrase.startswith("@") or phrase.isupper()]
        return max(candidates, key=lambda x: phrase_counts[x]) if candidates else "Unknown"

    uploader = get_uploader(phrase_counts)

    return {"description": description, "uploader": uploader, "title": title, 'keywords': keywords}


def extract_subtitles(text_contents, total_frames, frequency_threshold=0.2, min_subtitle_count=1, max_subtitle_count=10):
    """
    Extract subtitles from video text data, filtering out static text like watermarks.

    Args:
        text_contents (dict): Dictionary of text and their frame positions/counts.
        total_frames (int): Total number of frames in the video.
        frequency_threshold (float): Threshold to identify static text (default: 0.2).
        min_subtitle_count (int): Minimum occurrences for a subtitle (default: 1).
        max_subtitle_count (int): Maximum occurrences for a subtitle (default: 10).

    Returns:
        tuple: (formatted_subtitles, static_texts)
    """
    subtitles = []
    static_texts = set()

    for text, data in text_contents.items():
        frame_count = data["count"]
        positions = data["positions"]

        if not text.strip() or frame_count > total_frames * frequency_threshold:
            static_texts.add(text)
            continue

        position_counts = set(pos["count"] for pos in positions)
        if len(position_counts) == 1 and frame_count > total_frames * 0.1:
            static_texts.add(text)
            continue

        if min_subtitle_count <= frame_count <= max_subtitle_count:
            subtitles.append({
                "text": text,
                "frames": sorted([pos["frame"] for pos in positions]),
                "count": frame_count
            })

    subtitle_timeline = {}
    for subtitle in subtitles:
        frames = subtitle["frames"]
        text = subtitle["text"]
        start_frame = frames[0]
        for i in range(1, len(frames)):
            if frames[i] > frames[i - 1] + 1:
                subtitle_timeline.setdefault((start_frame, frames[i - 1]), []).append(text)
                start_frame = frames[i]
        subtitle_timeline.setdefault((start_frame, frames[-1]), []).append(text)

    formatted_subtitles = [
        {"start_frame": start, "end_frame": end, "text": " ".join(texts)}
        for (start, end), texts in sorted(subtitle_timeline.items())
    ]

    return formatted_subtitles, static_texts


def derive_all_video_meta(video_path, output_dir=None, video_text_path=None, keywords=None, description=None, title=None):
    """Derive all metadata for a video including subtitles and text analysis."""
    video_dir = os.path.dirname(video_path)
    info_path = os.path.join(video_dir, 'info.json')
    if os.path.isfile(info_path):
        info_data = safe_read_from_json(info_path)
        keywords = keywords or info_data.get('context', {}).get('keywords', [])
        description = description or info_data.get('context', {}).get('description', '')
        title = title or info_data.get('context', {}).get('title', '')

    if isinstance(keywords, str):
        keywords = [eatAll(keyword, [' ', '#', ',', '\t']) for keyword in keywords.split(',') if keyword]

    text_dir = os.path.join(video_dir, 'video_text')
    os.makedirs(text_dir, exist_ok=True)
    video_text_path = video_text_path or os.path.join(text_dir, 'video_text.json')

    video_text = analyze_video_text(video_path, output_dir=output_dir)
    text_constants = get_text_constants(video_text)
    thumbnail_texts = get_thumbnail_texts(video_dir)
    video_info = derive_video_info(text_constants, keywords, description, title)

    description = video_info.get('description', '') or video_info.get('context', {}).get('description', '')
    title = video_info.get('title', '') or video_info.get('context', {}).get('title', '')
    keywords = video_info.get('keywords', []) or video_info.get('context', {}).get('keywords', '')

    if thumbnail_texts:
        description = description or thumbnail_texts[0]
        title = title or thumbnail_texts[0]

    if isinstance(keywords, str):
        keywords = keywords.split(',')

    subtitles = extract_subtitles(text_constants, len(video_text))
    keywords = [eatAll(keyword, [' ', '\t', '\n', '#', ',']) for keyword in keywords
                if eatAll(keyword, [' ', '\t', '\n', '#', ',']) and
                eatAll(keyword, [' ', '\t', '\n', '#', ',']) not in ["bolshevid", "clownworld"]]
    
    # Assuming video_id is defined somewhere; otherwise, this will raise an error
    try:
        title = title.replace(str(video_id), '').split('reactions | ')[-1]
    except NameError:
        pass

    title, keywords_spl = extract_hash_tags(title or '')
    keywords += keywords_spl
    title, description_spl = get_title_description(title)
    description, keywords_spl = extract_hash_tags(description or '')
    keywords += keywords_spl
    keywords = list(set(keywords))
    keywords_str = ','.join(keywords)
    description = description + ' ' + description_spl

    video_info['keywords'] = keywords
    video_info['title'] = title
    video_info['description'] = description

    video_json = {
        "video_file_path": video_path,
        'thumbnail_texts': thumbnail_texts,
        "video_info": video_info,
        "video_text": video_text,
        "text_constants": text_constants,
        "subtitles": subtitles
    }
    safe_dump_to_file(data=video_json, file_path=video_text_path)
    return video_json
def generate_video_metadata(info):
    """
    Generate comprehensive HTML metadata for a video page based on a context dictionary.
    
    Args:
        context (dict): The 'context' object containing video metadata.
    
    Returns:
        str: A string of HTML <meta> and <link> tags.
    """
    
    # Extract fields from context with defaults for missing values
    original_url = context.get("original_url", "")
    video_id = context.get("video_id", "")
    share_url = context.get("share_url", "")
    video_url = context.get("video_url", "")
    file_name = context.get("file_name", "video.mp4")
    title = context.get("title", "Untitled Video")
    thumbnail = context.get("thumbnail", "")
    description = context.get("description", "Check out this video")
    uploader = context.get("uploader", "Unknown")
    keywords_str = context.get("keywords_str", "")
    uploader = context.get('uploader', "")
    # Clean up views and reactions for display

    # Mobile alternate URL (assuming 'm.' subdomain for mobile)
    mobile_url = share_url.replace("https://", "https://m.")
    
    # oEmbed URL (assuming an oEmbed endpoint at /oembed)
    oembed_url = f"https://clownworld.biz/oembed?url={share_url}"
    
    # Construct the metadata HTML
    metadata = [
        f'<title>{title}</title>'
        f'<meta name="title" content="{title}">',
        f'<meta name="description" content="{description}">',
        f'<meta name="keywords" content="{keywords_str}">',
        f'<link rel="image_src" href="{thumbnail}">',
        f'<link rel="icon" type="image/png" href="{thumbnail}">',
        # Prevent caching by certain bots
        '<meta name="bingbot" content="noarchive">',
        '<meta http-equiv="Content-Type" content="text/html ; charset=utf-8">',
        # Viewport for responsive design
        '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2, shrink-to-fit=no">',
        
        # General description
        f'<meta name="description" content="{description}">',
        
        # Canonical URL
        f'<link rel="canonical" href="{share_url}">',
        
        # Alternate URLs for mobile/handheld devices
        f'<link rel="alternate" media="only screen and (max-width: 640px)" href="{mobile_url}">',
        f'<link rel="alternate" media="handheld" href="{mobile_url}">',
        
        # Open Graph (OG) Tags
        '<meta property="og:type" content="video.other">',
        f'<meta property="og:title" content="{title} | Clown World">',
        f'<meta property="og:description" content="{description}">',
        f'<meta property="og:url" content="{share_url}">',
        f'<meta property="og:image" content="{thumbnail}">',
        f'<meta property="og:image:alt" content="{title} | Clown World">',
        '<meta property="og:locale" content="en_US">',
        '<meta property="fb:app_id" content="427305388009806">'
        # oEmbed Endpoint
        f'<link rel="alternate" type="application/json+oembed" href="{oembed_url}" title="{title} | Clown World">',
        
        # Referrer Policy
        '<meta name="referrer" content="origin-when-crossorigin" id="meta_referrer">',
        
        # Twitter Card Tags
        '<meta name="twitter:card" content="summary">',
        f'<meta name="twitter:title" content="{title}...">',
        f'<meta name="twitter:description" content="{description}">',
        f'<meta name="twitter:creator" content="@{uploader}">',
        f'<meta name="twitter:image" content="{thumbnail}">',
        f'<meta name="twitter:image:alt" content="{title} | Clown World">',
        '<meta name="twitter:site" content="@clownworldbiz">',  # Replace with your Twitter handle
        
        # Web App Manifest (optional, adjust path as needed)
        '<link rel="manifest" href="/data/manifest/" crossorigin="use-credentials" id="MANIFEST_LINK">',
        
        # Color Scheme and Theme
        '<meta name="color-scheme" content="light">',
        '<meta name="theme-color" content="#FFFFFF">'
    ]
    
    # Optional: Add deep linking if you have an app
    if "app_package" in context:  # Example extension for app support
        app_name = context.get("app_name", "Clown World App")
        app_package = context.get("app_package", "com.clownworld.app")
        app_store_id = context.get("app_store_id", "123456789")
        app_scheme = "clownworld"
        app_url = f"{app_scheme}://videos/{video_id}"
        
        metadata.extend([
            f'<meta property="al:android:app_name" content="{app_name}">',
            f'<meta property="al:android:package" content="{app_package}">',
            f'<meta property="al:android:url" content="{app_url}">',
            f'<meta property="al:ios:app_name" content="{app_name}">',
            f'<meta property="al:ios:app_store_id" content="{app_store_id}">',
            f'<meta property="al:ios:url" content="{app_url}">',
            f'<meta name="apple-itunes-app" content="app-id={app_store_id}, app-argument={app_url}">'
        ])
    
    # Join all tags into a single string with newlines
    return "\n".join(metadata)

# Main execution
videos_dir = '/run/user/1000/gvfs/sftp:host=192.168.0.100,user=solcatcher/var/www/clownworld/data/downloads/videos/videos'
for video_id in os.listdir(videos_dir):
    video_dir = os.path.join(videos_dir, video_id)
    video_file = get_file(video_id, video_dir)
    video_file_path = os.path.join(video_dir, video_file)
    info_path = os.path.join(video_dir, 'info.json')
    info_data = safe_read_from_json(info_path)
    metadata=generate_video_metadata(info_data['context'])
    input(metadata)
