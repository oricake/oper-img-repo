import json

# Load the JSON file
with open('operators.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Add module4 to each operator
for operator in data:
    operator['module4'] = ""  
    
# Save the updated JSON file
with open('operators_updated.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print("updated successfully!")
