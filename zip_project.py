import os
import zipfile
import datetime

def main():
    project_dir = os.path.abspath(os.path.dirname(__file__))
    project_name = os.path.basename(project_dir)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"{project_name}_backup_{timestamp}.zip"
    zip_filepath = os.path.join(project_dir, zip_filename)

    # Directories and files to exclude
    exclude_dirs = {
        'node_modules',
        '.git',
        'dist',
        '__pycache__',
        '.gemini'
    }

    print(f"Creating zip file: {zip_filename} ...\n")
    
    with zipfile.ZipFile(zip_filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_dir):
            # Prune excluded directories in-place so os.walk doesn't visit them
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Exclude existing zip files to prevent zip-ception
                if file.endswith('.zip'):
                    continue
                    
                file_path = os.path.join(root, file)
                
                # Make sure we don't zip the zip file we are currently creating
                if file_path == zip_filepath:
                    continue
                
                arcname = os.path.relpath(file_path, project_dir)
                zipf.write(file_path, arcname)

    print(f"Successfully created backup: {zip_filename}")

if __name__ == "__main__":
    main()
