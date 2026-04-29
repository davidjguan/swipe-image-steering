from dotenv import load_dotenv
import os

load_dotenv()

import google.genai as genai

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key loaded: {api_key[:20]}...")

try:
    client = genai.Client(api_key=api_key)
    print("Client created successfully")
    
    # Test with Imagen 4.0
    print("Attempting to generate images with Imagen 4.0...")
    response = client.models.generate_images(
        model="models/imagen-4.0-generate-001",
        prompt="a beautiful sunset over mountains",
        config={
            "number_of_images": 1,
        }
    )
    print("SUCCESS: Generated image")
    print(f"Response type: {type(response)}")
    print(f"Response attributes: {[x for x in dir(response) if not x.startswith('_')]}")
    if hasattr(response, 'generated_images'):
        print(f"Generated images count: {len(response.generated_images)}")
        if response.generated_images:
            img = response.generated_images[0]
            print(f"First image type: {type(img)}")
            print(f"First image attributes: {[x for x in dir(img) if not x.startswith('_')]}")
            if hasattr(img, 'image_bytes'):
                print(f"Image bytes length: {len(img.image_bytes)}")
except Exception as e:
    import traceback
    print(f"ERROR: {type(e).__name__}: {e}")
    print(traceback.format_exc())
