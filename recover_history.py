import os
import json
import shutil

history_dir = os.path.expanduser("~/Library/Application Support/Antigravity/User/History")
target_dir = "/Users/mehtabhsidhu/.gemini/antigravity/scratch/antigravity"

recovered_count = 0

for folder in os.listdir(history_dir):
    folder_path = os.path.join(history_dir, folder)
    if not os.path.isdir(folder_path):
        continue
    
    entries_file = os.path.join(folder_path, "entries.json")
    if not os.path.exists(entries_file):
        continue
        
    try:
        with open(entries_file, "r") as f:
            data = json.load(f)
            
        resource = data.get("resource", "")
        # Check if the file belongs to our project
        if not resource.startswith(f"file://{target_dir}"):
            continue
            
        target_file_path = resource.replace("file://", "")
        if not target_file_path.endswith((".py", ".jsx", ".js")):
            continue
            
        entries = data.get("entries", [])
        if not entries:
            continue
            
        # Iterate backwards to find the latest non-empty version
        best_backup = None
        for entry in reversed(entries):
            backup_id = entry.get("id")
            backup_path = os.path.join(folder_path, backup_id)
            if os.path.exists(backup_path) and os.path.getsize(backup_path) > 0:
                best_backup = backup_path
                break
                
        if best_backup:
            print(f"Recovering {target_file_path} from {best_backup}...")
            os.makedirs(os.path.dirname(target_file_path), exist_ok=True)
            shutil.copy2(best_backup, target_file_path)
            recovered_count += 1
            
    except Exception as e:
        print(f"Error processing {folder}: {e}")

print(f"Successfully recovered {recovered_count} files.")
