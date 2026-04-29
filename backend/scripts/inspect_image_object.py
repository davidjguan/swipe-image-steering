from dotenv import load_dotenv
import os
import base64

load_dotenv()
import google.genai as genai

api_key = os.getenv('GOOGLE_API_KEY')
client = genai.Client(api_key=api_key)
print("Generating image...")
response = client.models.generate_images(
    model='models/imagen-4.0-generate-001',
    prompt='test',
    config={'number_of_images': 1}
)
img = response.generated_images[0]
print(f'Image type: {type(img.image)}')
attrs = [x for x in dir(img.image) if not x.startswith('_')]
print(f'Image attributes: {attrs}')

# Check common attributes
if hasattr(img.image, 'data'):
    print(f'Image.data type: {type(img.image.data)}')
if hasattr(img.image, 'bytes'):
    print(f'Image.bytes type: {type(img.image.bytes)}')
if hasattr(img.image, 'mime_type'):
    print(f'Image.mime_type: {img.image.mime_type}')
    
# Try accessing as dict
print(f'\nTrying dict access: {img.image.model_dump() if hasattr(img.image, "model_dump") else "no model_dump"}')
