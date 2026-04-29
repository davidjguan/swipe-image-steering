# Scripts

One-off scripts used while integrating the Google image API. They are not
part of the app or its test suite, and each one makes real (billed) API calls.

Run from `backend/` with the virtual environment active, after setting
`GOOGLE_API_KEY` in `backend/.env`:

```bash
python scripts/list_models.py
```

| Script | Purpose |
|---|---|
| `list_models.py` | List available models and any Imagen models |
| `genai_smoke.py` | Generate one image with Imagen 4 to confirm the key and SDK work |
| `image_bytes_smoke.py` | Generate an image and check how its bytes are exposed |
| `inspect_image_object.py` | Print the attributes of a generated image object |
| `imagen3_legacy_smoke.py` | Earlier Imagen 3 test using the old `google-generativeai` SDK. Kept for reference; that SDK is no longer in `requirements.txt` |
