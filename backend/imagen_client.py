from google import genai
import base64
import asyncio
from typing import List, Optional
import io
import os

client = None

def _get_client():
    global client
    if client is None:
        API_KEY = os.environ.get("GOOGLE_API_KEY")
        if API_KEY:
            client = genai.Client(api_key=API_KEY)
        else:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
    return client


def _extract_bytes(image_item) -> bytes:
    if hasattr(image_item, "image"):
        img = image_item.image
        if hasattr(img, "image_bytes"):
            return img.image_bytes
        if hasattr(img, "bytes"):
            return img.bytes
        if hasattr(img, "data") and isinstance(img.data, (bytes, bytearray)):
            return bytes(img.data)
        if hasattr(img, "data") and isinstance(img.data, str):
            return base64.b64decode(img.data)
    if hasattr(image_item, "bytes"):
        return image_item.bytes
    if hasattr(image_item, "data") and isinstance(image_item.data, (bytes, bytearray)):
        return bytes(image_item.data)
    if hasattr(image_item, "b64_json"):
        return base64.b64decode(image_item.b64_json)
    raise ValueError("Unable to extract image bytes from generated image response")


async def generate_images(prompt: str, count: int = 4, aspect_ratio: str = "1:1", output_mime_type: str = "image/jpeg", output_compression_quality: int = 95, seed: Optional[int] = None) -> List[str]:
    loop = asyncio.get_running_loop()

    def sync_generate() -> list:
        client = _get_client()
        config = {"number_of_images": count, "aspect_ratio": aspect_ratio, "output_mime_type": output_mime_type}
        if output_mime_type == "image/jpeg":
            config["output_compression_quality"] = output_compression_quality
        if seed is not None:
            config["seed"] = seed
        response = client.models.generate_images(
            model="models/imagen-4.0-generate-001",
            prompt=prompt,
            config=config
        )
        if not hasattr(response, "generated_images"):
            raise RuntimeError("Invalid image generation response from Google Gemini Imagen")
        return list(response.generated_images)

    image_items = await loop.run_in_executor(None, sync_generate)
    base64_images: List[str] = []

    for image_item in image_items[:count]:
        raw_bytes = _extract_bytes(image_item)
        encoded = base64.b64encode(raw_bytes).decode("utf-8")
        base64_images.append(encoded)

    if len(base64_images) != count:
        raise RuntimeError("Google Imagen did not return the expected number of images")

    return base64_images
