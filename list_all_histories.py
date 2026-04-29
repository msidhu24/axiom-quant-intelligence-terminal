import os
import json

base_dirs = [
    os.path.expanduser("~/Library/Application Support/Code/User/History"),
    os.path.expanduser("~/Library/Application Support/Cursor/User/History"),
    os.path.expanduser("~/Library/Application Support/Antigravity/User/History"),
    os.path.expanduser("~/Library/Application Support/VSCodium/User/History")
]

for history_dir in base_dirs:
    if not os.path.exists(history_dir): continue
    for folder in os.listdir(history_dir):
        folder_path = os.path.join(history_dir, folder)
        if not os.path.isdir(folder_path): continue
        
        entries_file = os.path.join(folder_path, "entries.json")
        if not os.path.exists(entries_file): continue
            
        try:
            with open(entries_file, "r") as f:
                data = json.load(f)
            resource = data.get("resource", "")
            if "antigravity" in resource:
                print(f"Found in {history_dir}: {resource}")
        except Exception as e:
            pass
