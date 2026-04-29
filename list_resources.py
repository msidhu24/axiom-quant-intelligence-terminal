import os
import json

history_dir = os.path.expanduser("~/Library/Application Support/Antigravity/User/History")

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
        if "antigravity" in resource:
            print(resource)
    except Exception as e:
        pass
