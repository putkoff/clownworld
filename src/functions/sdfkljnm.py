import logging
logging.basicConfig(level=logging.INFO)  # Set level to INFO or higher
from abstract_ocr import *
videos_dir = '/run/user/1000/gvfs/sftp:host=192.168.0.100,user=solcatcher/var/www/clownworld/data/downloads/videos/videos'
def split_it_out(obj1,obj2):
    obj_3=obj2
    if obj2 and obj1 and obj1.lower() in obj2.lower():
        start =0
        obj_3=''
        obj2_spl = obj2.lower().split(obj1.lower())
        len_obj1 = len(obj1)
        for each in obj2_spl:
            end = start+len(each)
            obj_3 += obj2[start:end]
            start +=len_obj1+len(each)
    return obj_3
def extract_hash_tags(strings):
    hash_tags = []
    hashtags = strings.split('#')
    for hashtag in hashtags:
        hashtag = f"#{hashtag.split(' ')[0]}"
        strings = split_it_out(hashtag,strings)
        hash_tags.append(hashtag[1:])
    return strings,hash_tags
def recreate_tags():
    
    for video_id in os.listdir(videos_dir):
        video_dir = os.path.join(videos_dir,video_id)
        video_file = get_file(video_id,video_dir)
        video_file_path = os.path.join(video_dir,video_file)
        video_json = derive_all_video_meta(video_file_path)
        
        info_path = os.path.join(video_dir,'info.json')
        info_data = safe_read_from_json(info_path)
        info_data['title'] = info_data['title'].replace(str(video_id),'')
        info_data['title'] = eatAll(info_data['title'],[' ','\t','\n'])
        if info_data['title'] == '' and video_json['video_info']['title']:
            info_data['title'] = video_json['video_info']['title']
            info_data["context"]['title'] = info_data['title'].replace(str(video_id),'').replace('\n',' ')
        keywords = info_data["context"]['keywords']
        if isinstance(keywords,str):
            keywords = [eatAll(keyword,[' ','\t','\n','#',',']) for keyword in keywords.split(',') if keyword]
        keywords = [eatAll(keyword,[' ','\t','\n','#',',']) for keyword in keywords if keyword and keyword not in ["bolshevid","clownworld"]]
        if keywords == [] and video_json['video_info']['keywords']:
            keywords = video_json['video_info']['keywords']
        if len(keywords) <5:
            for each in ["bolshevid","clownworld"]:
                if each not in keywords:
                    keywords.append(each)
        info_data['keywords'] = ','.join(keywords)
        info_data["context"]['keywords'] = ','.join(keywords)
        description = info_data.get('context',{}).get('description','')
        description = description.replace(str(video_id),'').replace('\n',' ')
        if not description and video_json['video_info']['description']:
            description = video_json['video_info']['description']
            info_data["context"]['description'] = description
            info_data['description'] = description
        safe_dump_to_file(data=info_data,file_path=info_path)
for video_id in os.listdir(videos_dir):
    video_dir = os.path.join(videos_dir,video_id)
    thumbnail_texts = get_thumbnail_texts(video_dir)
    info_path = os.path.join(video_dir,'info.json')
    info_data = safe_read_from_json(info_path)
    description = info_data.get('description','') or info_data.get('context',{}).get('description','')
    title = info_data.get('title','') or info_data.get('context',{}).get('title','')
    keywords = info_data.get('keywords','') or info_data.get('context',{}).get('keywords','')
    keywords = [eatAll(keyword,[' ','\t','\n','#',',']) for keyword in keywords.split(',') if eatAll(keyword,[' ','\t','\n','#',',']) and eatAll(keyword,[' ','\t','\n','#',',']) not in ["bolshevid","clownworld"]]
    title = title.replace(str(video_id),'').split('reactions | ')[-1]
    input(title)
    title , keywords_spl = extract_hash_tags(title or '')
    input(title)
    if '|' in title:
        title_spl = title.split('|')
        title , keywords_spl = extract_hash_tags(title_spl[0] or '')
        keywords+=keywords_spl or []
        creator = title_spl[1]
        if len(title_spl)>2:
            title = ' '.join(title_spl[2:])
        else:
            title = ''
    else:
        title , keywords = extract_hash_tags(title or '') or []
    title =  eatAll(title,[' ','\t','\n','#',','])
