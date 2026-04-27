import google.genai as genai
import base64
import asyncio
from typing import List
import io
import os

# Model to use (Imagen 4.0 is available)
MODEL_NAME = "models/imagen-4.0-generate-001"


async def generate_images(prompt: str, count: int = 4) -> List[str]:
    """
    Generate images using Google Gemini API (Imagen 4.0).
    Returns a list of base64-encoded PNG strings.
    """
    
    def generate_batch_sync():
        try:
            # Create client with API key
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY not set")
                
            client = genai.Client(api_key=api_key)
            
            print(f"[IMAGEN] Generating {count} images with prompt: {prompt[:50]}...")
            
            # Generate images using Imagen 4.0
            response = client.models.generate_images(
                model=MODEL_NAME,
                prompt=prompt,
                config={
                    "number_of_images": count,
                }
            )
            
            base64_images = []
            if hasattr(response, 'generated_images') and response.generated_images:
                print(f"[IMAGEN] Got {len(response.generated_images)} images")
                for idx, generated_img in enumerate(response.generated_images):
                    # The generated image has .image property which is a google.genai.types.Image
                    image_bytes = None
                    
                    if hasattr(generated_img, 'image') and hasattr(generated_img.image, 'image_bytes'):
                        image_bytes = generated_img.image.image_bytes
                        
                        if image_bytes:
                            # Ensure it's bytes
                            if isinstance(image_bytes, str):
                                image_bytes = image_bytes.encode('latin1')
                            base64_str = base64.b64encode(image_bytes).decode("utf-8")
                            base64_images.append(base64_str)
                            print(f"[IMAGEN] Encoded image {len(base64_images)} ({len(image_bytes)} bytes)")
                        else:
                            print(f"[IMAGEN] Image[{idx}].image.image_bytes is None")
                    else:
                        print(f"[IMAGEN] Image[{idx}] does not have .image.image_bytes property")
            
            print(f"[IMAGEN] Successfully encoded {len(base64_images)} images to base64")
            return base64_images
            
        except Exception as e:
            print(f"[IMAGEN] Error generating images: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    # Generate images in thread pool to avoid blocking
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(None, generate_batch_sync)
    
    return results
