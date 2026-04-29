import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

import google.generativeai as genai

api_key = os.getenv("GOOGLE_API_KEY")
print(f"API key loaded: {bool(api_key)}")

genai.configure(api_key=api_key)

try:
    model = genai.ImageGenerationModel("imagen-3.0-generate-002")
    print("Model created successfully")
    
    response = model.generate_images(
        prompt="test image",
        number_of_images=1,
        safety_filter_level="block_none",
    )
    print("SUCCESS: Generated image")
    print(f"Images: {len(response.generated_images)}")
except Exception as e:
    import traceback
    print(f"ERROR: {type(e).__name__}: {e}")
    print(traceback.format_exc())
