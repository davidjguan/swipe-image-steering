import google.genai as genai
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))

print("Available Models:")
models = client.models.list()
count = 0
for model in models:
    if count < 10:  # Print first 10
        name = None
        if hasattr(model, 'name'):
            name = model.name
        elif hasattr(model, 'model'):
            name = model.model
        print(f"Model: {name}")
        count += 1
        
print("\n\nImagenModels:")
count = 0
for model in models:
    name = model.name if hasattr(model, 'name') else str(model)
    if 'imagen' in name.lower():
        print(f"Found: {name}")
        count += 1
print(f"Total imagen models: {count}")
