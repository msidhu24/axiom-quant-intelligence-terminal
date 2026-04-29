import json
import os

files = {}

def apply_replacement(content, target, replacement):
    if target in content:
        return content.replace(target, replacement)
    return content

def process_log(log_path):
    with open(log_path, 'r') as f:
        for line in f:
            if not line.startswith('{"step_index"'): continue
            try:
                data = json.loads(line)
            except:
                continue
            
            if "tool_calls" not in data: continue
            for call in data["tool_calls"]:
                name = call.get("name")
                args = call.get("args", {})
                
                if name == "write_to_file":
                    path = args.get("TargetFile", "").strip('"')
                    code = args.get("CodeContent", "")
                    if type(code) == str and code.startswith('"') and code.endswith('"'):
                        # json encode string inside string? usually not needed since it's already a dict value
                        pass
                    if path.endswith(".py") or path.endswith(".js") or path.endswith(".jsx"):
                        files[path] = code
                        
                elif name in ["replace_file_content", "multi_replace_file_content"]:
                    path = args.get("TargetFile", "").strip('"')
                    if path not in files: continue
                    
                    if name == "replace_file_content":
                        target = args.get("TargetContent", "")
                        repl = args.get("ReplacementContent", "")
                        files[path] = apply_replacement(files[path], target, repl)
                        
                    elif name == "multi_replace_file_content":
                        chunks = args.get("ReplacementChunks", [])
                        if type(chunks) == str:
                            try: chunks = json.loads(chunks)
                            except: chunks = []
                        for c in chunks:
                            target = c.get("TargetContent", "")
                            repl = c.get("ReplacementContent", "")
                            files[path] = apply_replacement(files[path], target, repl)

process_log("/Users/mehtabhsidhu/.gemini/antigravity/brain/54102bbb-3c42-463e-bb08-88bb2babb5f0/.system_generated/logs/overview.txt")
process_log("/Users/mehtabhsidhu/.gemini/antigravity/brain/0c70d284-8534-4d89-aa75-49b836820330/.system_generated/logs/overview.txt")

for path, content in files.items():
    if not path.startswith("/Users/"): continue
    print(f"Recovered: {path} ({len(content)} bytes)")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
