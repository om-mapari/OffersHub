import os
import re

def fix_module(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace 'from typing import X, Y, Z' with 'import typing'
    if 'from typing import' in content:
        content = re.sub(r'from typing import.*', 'import typing', content)
    
    # Fix the Optional references
    content = re.sub(r'(?<!\w|\.)Optional\[', r'typing.Optional[', content)
    content = re.sub(r'(?<!\w|\.)List\[', r'typing.List[', content)
    content = re.sub(r'(?<!\w|\.)Dict\[', r'typing.Dict[', content)
    content = re.sub(r'(?<!\w|\.)Union\[', r'typing.Union[', content)
    content = re.sub(r'(?<!\w|\.)Any(?!\w)', r'typing.Any', content)
    content = re.sub(r'(?<!\w|\.)Generator\[', r'typing.Generator[', content)
    content = re.sub(r'(?<!\w|\.)Type\[', r'typing.Type[', content)
    content = re.sub(r'(?<!\w|\.)TypeVar\(', r'typing.TypeVar(', content)
    content = re.sub(r'(?<!\w|\.)Generic\[', r'typing.Generic[', content)
    
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def process_directory(directory):
    print(f"Processing directory: {directory}")
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                print(f"Fixing imports in: {file_path}")
                fix_module(file_path)

# Process the app directory
process_directory('app') 