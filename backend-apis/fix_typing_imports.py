import os
import re

def fix_typing_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Fix 'from typing import Optional, List, etc.' to 'import typing'
    if re.search(r'from typing import', content):
        # First, store all the imports from typing
        imports_from_typing = re.findall(r'from typing import (.*?)(?:\n|$)', content)
        imported_types = []
        for imports in imports_from_typing:
            imported_types.extend([t.strip() for t in imports.split(',')])
        
        # Replace the import statement
        content = re.sub(r'from typing import .*?(?:\n|$)', 'import typing\n', content)
        
        # Now replace each standalone type with typing.Type
        for type_name in imported_types:
            if type_name == 'Optional':
                content = re.sub(r'(?<!\w)Optional\[', r'typing.Optional[', content)
            elif type_name == 'List':
                content = re.sub(r'(?<!\w)List\[', r'typing.List[', content)
            elif type_name == 'Dict':
                content = re.sub(r'(?<!\w)Dict\[', r'typing.Dict[', content)
            elif type_name == 'Any':
                content = re.sub(r'(?<!\w)Any(?!\w)', r'typing.Any', content)
            elif type_name == 'Union':
                content = re.sub(r'(?<!\w)Union\[', r'typing.Union[', content)
            elif type_name == 'Generator':
                content = re.sub(r'(?<!\w)Generator\[', r'typing.Generator[', content)
            elif type_name == 'TypeVar':
                content = re.sub(r'(?<!\w)TypeVar\(', r'typing.TypeVar(', content)
            elif type_name == 'Type':
                content = re.sub(r'(?<!\w)Type\[', r'typing.Type[', content)
            elif type_name == 'Generic':
                content = re.sub(r'(?<!\w)Generic\[', r'typing.Generic[', content)
            # Add more types as needed
    
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def process_directory(directory):
    print(f"Processing directory: {directory}")
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                print(f"Fixing imports in: {file_path}")
                fix_typing_imports(file_path)

# Fix files in app directory
process_directory('app') 