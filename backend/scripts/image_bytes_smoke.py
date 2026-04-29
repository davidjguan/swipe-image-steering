import google.genai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up client
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment")

client = genai.Client(api_key=api_key)

# Generate a test image
print("Generating test image...")
response = client.models.generate_images(
    model="models/imagen-4.0-generate-001",
    prompt="A beautiful sunset",
    config={"number_of_images": 1}
)

# Inspect the Image object
print(f"\nResponse type: {type(response)}")
print(f"Response attributes: {[x for x in dir(response) if not x.startswith('_')]}")

if hasattr(response, 'generated_images'):
    img_obj = response.generated_images[0]
    print(f"\n\nGenerated Image type: {type(img_obj)}")
    print(f"Generated Image dir: {[x for x in dir(img_obj) if not x.startswith('_')][:20]}")
    
    if hasattr(img_obj, 'image'):
        img = img_obj.image
        print(f"\n\n.image property type: {type(img)}")
        print(f".image property dir: {[x for x in dir(img) if not x.startswith('_')]}")
        
        # Try different ways to get bytes
        print(f"\n\nTrying to extract bytes from .image:")
        print(f"  isinstance(img, bytes): {isinstance(img, bytes)}")
        print(f"  isinstance(img, str): {isinstance(img, str)}")
        print(f"  hasattr(img, 'data'): {hasattr(img, 'data')}")
        print(f"  hasattr(img, '__bytes__'): {hasattr(img, '__bytes__')}")
        
        if hasattr(img, '__dict__'):
            print(f"  img.__dict__.keys(): {list(img.__dict__.keys())}")
        
        # Try to get raw bytes/data
        try:
            if hasattr(img, 'model_dump'):
                md = img.model_dump()
                print(f"  model_dump() keys: {list(md.keys())}")
                if 'data' in md:
                    data = md['data']
                    print(f"    data type: {type(data)}, first 30 chars: {str(data)[:30]}")
        except Exception as e:
            print(f"  model_dump() error: {e}")
        
        # Try to convert to bytes
        try:
            if hasattr(img, 'model_dump_json'):
                print(f"  Has model_dump_json")
        except Exception as e:
            print(f"  model_dump_json error: {e}")

print("\nDone!")
