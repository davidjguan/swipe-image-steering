# Swipe Image Steering

A local creative direction tool for iterative AI image generation with visual preference learning.

Write a creative brief, generate images, swipe through them (like/dislike), and the system uses your feedback to steer the next batch closer to what you actually want.

## Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **API Keys**:
  - Google Gemini API key (for Imagen 3 image generation)
  - OpenAI API key (for GPT-4o preference analysis)

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys:
# GEMINI_API_KEY=your_gemini_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here

# Run the server
uvicorn main:app --reload
```

Server runs on `http://localhost:8000`

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## How to Use It

1. **Start the backend** (see Backend Setup above)
2. **Start the frontend** (see Frontend Setup above)
3. Open `http://localhost:5173` in your browser
4. **Write your brief**: Describe the style, mood, and subject you want to explore (e.g., "A serene mountain landscape with warm sunset lighting, impressionist style")
5. **Generate images**: Click "Generate Images" — the system creates 4 initial images
6. **Swipe through images**: For each image, decide if you like it or not
   - Click "← Dislike" (or press Left Arrow)
   - Click "Like →" (or press Right Arrow)
7. **Review preferences**: After all 4 swipes, the system analyzes your choices and shows you what visual attributes it thinks you prefer
8. **Generate next batch**: Click "Generate Next Batch →" to refine and try again
9. **Iterate**: Repeat steps 6–8 to steer the images closer to your ideal

## How It Works

- **Image Generation**: Uses Google Imagen 3 via the Gemini API
- **Preference Analysis**: GPT-4o analyzes the images you liked vs. disliked to extract visual attributes and generate a refined prompt modifier
- **Iterative Steering**: Each new round uses the accumulated preference profile to guide the next batch
- **Storage**: All data is stored in-memory — no database. Session history is preserved during your session

## Architecture

```
/backend           → FastAPI server with image generation and preference analysis
/frontend          → React 18 + TypeScript + Vite SPA
models.py          → Pydantic data models (Session, Round, ImageRecord)
session_store.py   → In-memory session storage
imagen_client.py   → Google Imagen 3 image generation
gpt_client.py      → GPT-4o preference summarization
prompt_engine.py   → Dynamic prompt building
```

## Tech Stack

- **Backend**: Python 3.11+ with FastAPI, Pydantic, python-dotenv
- **Frontend**: React 18, TypeScript, Vite
- **Image Generation**: Google Gemini API (Imagen 3)
- **Preference Analysis**: OpenAI GPT-4o with vision
- **Storage**: In-memory dicts (no database)
- **Styling**: Plain CSS, dark theme (#0f0f0f), accent color #6c63ff

---

Enjoy steering your creative direction! 🎨
