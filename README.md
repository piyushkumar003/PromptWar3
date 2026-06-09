# EcoGuide AI - Carbon Footprint Reduction Assistant

EcoGuide AI is a smart web application that helps individuals track their carbon footprint, receive personalized recommendations, and reduce their environmental impact through simple daily actions.

## Features

- **User Onboarding:** Collects lifestyle data (transport, energy, food, waste) to build a baseline profile.
- **Carbon Calculator:** Accurately estimates monthly carbon emissions based on user inputs.
- **Smart Dashboard:** Visualizes emissions with charts (Recharts) and provides a Sustainability Score.
- **Recommendation Engine:** Rule-based recommendation engine offering personalized, actionable advice with estimated CO₂ savings.
- **Carbon Coach Chatbot:** An interactive AI assistant to answer questions about sustainability and footprint reduction.

## Architecture

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, Recharts
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Infrastructure:** Docker, Docker Compose

## Security Features

- CORS configuration in FastAPI
- SQL Injection prevention using SQLAlchemy ORM
- Input validation via Pydantic models
- Safe React rendering avoiding direct innerHTML injection (XSS protection)

## Accessibility Features

- High contrast Tailwind color palette (WCAG compliant)
- Semantic HTML elements
- Screen reader friendly labels and focus indicators (Tailwind focus rings)
- Keyboard navigable interactive elements

## Installation and Running Locally

### Using Docker (Recommended)

1. Ensure Docker and Docker Compose are installed.
2. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Access the frontend at `http://localhost:5173`
4. Access the backend API docs at `http://localhost:8000/docs`

### Manual Setup

**Backend:**
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload`

**Frontend:**
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Testing Instructions

**Backend:**
Navigate to the `backend` folder and run `pytest`:
```bash
cd backend
pytest tests/
```

## Future Improvements

- Integrate an LLM (e.g. OpenAI GPT-4, Google Gemini) for the Carbon Coach for more dynamic, context-aware conversational AI.
- Gamification with Badges and Leaderboards.
- Expand emission factors database by region for higher accuracy.
