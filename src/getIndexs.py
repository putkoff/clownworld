from abstract_paths import *
from abstract_utilities import eatAll
PARENT_DIR= "/var/www/html/clownworld/bolshevid_now/src/components"
files=[]
pattern = os.path.join(PARENT_DIR, "**/*")  # include all files recursively\n
dirs = glob.glob(pattern, recursive=True)
files += [file for file in dirs  if os.path.isfile(file) and ((not file.endswith('index.ts') and not file.endswith('index.ts')) and  (file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.jsx')))]
TSVARS = {'CustomContent': ['./src/components/CustomContent/CustomContent.tsx'], 'Modal': ['./src/components/Props/Modal/Modal.tsx'], 'CropButtons': ['./src/components/Props/CropButtons/CropButtons.tsx'], 'VideoPlayer': ['./src/components/Sections/Players/VideoPlayer/VideoPlayer.tsx'], 'VideoCropper': ['./src/components/Sections/VideoCropper/VideoCropper.tsx'], 'DownloadedVideos': ['./src/components/Sections/DownloadedVideos/DownloadedVideos.tsx'], 'Sharing': ['./src/components/Sections/Sharing/SocialSharing.tsx'], 'VideoHeader': ['./src/components/Sections/Headers/VideoHeader/VideoHeader.jsx'], 'VideoFooter': ['./src/components/Sections/Footers/VideoFooter/VideoFooter.jsx'], 'TrackPlays': ['./src/components/Meta/Trackers/TrackPlays/TrackPlays.tsx'], 'UrlCheckbox': ['./src/components/Meta/UrlCheckbox/UrlCheckbox.tsx'], 'VideoDetails': ['./src/components/Meta/Details/VideoDetails/VideoDetails.tsx'], 'VideoSubmit': ['./src/components/Handles/VideoSubmit/VideoSubmit.tsx'], 'VideoUrl': ['./src/components/Forms/VideoUrl/VideoUrl.tsx']}
tspaths = {}
def fix_imports(filepath):
    content = read_from_file(filepath)
    lines = content.split('\n')
    for i,line in enumerate(lines):
        nuline = eatAll(line,[' ','\n','\t',';'])
        if nuline.startswith('import'):
            imp = nuline.split(' ')[-1]
            imp = eatAll(imp,[' ','\n','\t',';','@',"'",'"'])
            imp_lower = imp.lower()
            for key,value in TSVARS.items():
                lower_key = key.lower()
                
                if lower_key == imp_lower:
                    print(f"{lower_key} == {imp_lower}")
                    imps_pc = line.split('import ')[1].split(' from ')
                    imps = eatAll(imps_pc[0],['{','}'])
                    line = "import {"+imps+"}"+f" from {imps_pc[1]}"
                    break
        lines[i] = line
    lines = '\n'.join(lines)
    write_to_file(contents=lines,file_path=filepath)
def clean_index(index_path):
    index_data = read_from_file(index_path)
    index_data = index_data.split('\n')
    index_data = [item for item in index_data if item != "export * from './index';" and item != "export * from './index.ts';" and not item.startswith('export {default as function} ') and not item.startswith('export {default as async} ')]
    index_data= '\n'.join(list(set(index_data)))
    write_to_file(contents=index_data,file_path=index_path)
def create_index(directory):
    if os.path.isfile(directory):
        directory = os.path.dirname(directory)
    index_file_path = os.path.join(directory,'index.ts')
    if not os.path.isfile(index_file_path):
        index_data = []
        for each in os.listdir(directory):
            filename,ext = os.path.splitext(each)
            index_data.append(f"export * from './{filename}';")
        index_data= '\n'.join(list(set(index_data)))
        write_to_file(contents=index_data,file_path=index_file_path)
    clean_index(index_file_path)
def create_all_index(directory,parent_dir):
    if os.path.isfile(directory):
        directory = os.path.dirname(directory)
    while True:
        if directory == parent_dir:
            return
        create_index(directory)
        directory = os.path.dirname(directory)
for file in files:
    data = read_from_file(file)
    dirname = os.path.dirname(file)
    dirbase = os.path.basename(dirname)
    basename = os.path.basename(file)
    if tspaths.get(dirbase) == None:
        tspath = file.replace('/var/www/html/clownworld/bolshevid_now','.')
        tspaths[dirbase]=[tspath]
    filename,ext = os.path.splitext(basename)
    index_path = os.path.join(dirname,'index.ts')
    nuindex_data = [f"export * from './{filename}';"]
    index_data = []
    nuindex_b=False
    if os.path.isfile(index_path):
        index_data = read_from_file(index_path)
        index_data = index_data.split('\n')
    
    for line in data.split('\n'):
        nuline = eatAll(line,['\n','\t',' '])
        
        if 'export ' in nuline:
            if 'export default ' in nuline:
                if 'export default async function ' in nuline:
                    export = eatAll(nuline.split('export default async function ' )[1].split(' ')[0].split('(')[0],';')
                elif 'export default function ' in nuline:
                    export = eatAll(nuline.split('export default function ' )[1].split(' ')[0].split('(')[0],';')
                elif 'export default ' in nuline:
                    export = eatAll(nuline.split('export default ' )[1].split(' ')[0],';')
              
                nuindex = f"export {{default as {export}}} from './{filename}';"
                index_data.append(nuindex)
            elif nuindex_b == False:
                index_data = [f"export * from './{filename}';"]+index_data
                nuindex_b=True
    index_data = [item for item in index_data if item != "export * from './index';" and item != "export * from './index.ts';" and not item.startswith('export {default as function} ') and not item.startswith('export {default as async} ')]
    index_data= '\n'.join(list(set(index_data)))
    
    write_to_file(contents=index_data,file_path=index_path)
    clean_index(index_path)
    fix_imports(file)
    create_all_index(dirname,PARENT_DIR)
input(tspaths)

