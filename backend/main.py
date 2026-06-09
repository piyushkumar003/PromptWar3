from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import logging
import models, schemas, crud
from services.calculator import calculate_footprint, generate_recommendations
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoGuide AI API")

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000", "https://prompt-war3.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to EcoGuide AI API"}

@app.post("/users/onboard", response_model=schemas.User)
def onboard_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Onboarding new user: {user.name}")
    return crud.create_user_with_footprint(db, user)

@app.get("/users/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        logger.warning(f"User {user_id} not found")
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/users/{user_id}/footprints", response_model=list[schemas.Footprint])
def get_user_footprints(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user_footprints(db, user_id)

@app.get("/users/{user_id}/recommendations", response_model=list[schemas.Recommendation])
def get_user_recommendations(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    latest_footprint = db.query(models.FootprintRecord).filter(models.FootprintRecord.user_id == user_id).order_by(models.FootprintRecord.timestamp.desc()).first()
    if not latest_footprint:
        return []
        
    # Convert ORM to Pydantic for calculator
    user_schema = schemas.UserCreate(
        name=user.name,
        age_group=user.age_group,
        city=user.city,
        household_size=user.household_size,
        transportation_habits=user.transportation_habits,
        weekly_travel_distance=user.weekly_travel_distance,
        electricity_consumption=user.electricity_consumption,
        diet_type=user.diet_type
    )
    
    footprint_schema = schemas.FootprintCreate(
        transport_emissions=latest_footprint.transport_emissions,
        energy_emissions=latest_footprint.energy_emissions,
        food_emissions=latest_footprint.food_emissions,
        waste_emissions=latest_footprint.waste_emissions,
        total_emissions=latest_footprint.total_emissions
    )
    
    recs = generate_recommendations(user_schema, footprint_schema)
    return [schemas.Recommendation(**r) for r in recs]

class ChatMessage(BaseModel):
    message: str

@app.post("/users/{user_id}/chat")
def chatbot_message(user_id: int, chat: ChatMessage, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    logger.info(f"Chatbot interaction for user {user_id}: {chat.message}")
    msg = chat.message.lower()
    latest_footprint = db.query(models.FootprintRecord).filter(models.FootprintRecord.user_id == user_id).order_by(models.FootprintRecord.timestamp.desc()).first()
    
    response = "I am your Carbon Coach! "
    
    if latest_footprint:
        # Context-aware analysis
        emissions = {
            "transport": latest_footprint.transport_emissions,
            "energy": latest_footprint.energy_emissions,
            "food": latest_footprint.food_emissions,
            "waste": latest_footprint.waste_emissions
        }
        highest_category = max(emissions, key=emissions.get)
        highest_val = emissions[highest_category]
        
        response += f"I see your highest emission category is currently {highest_category} at {highest_val:.1f} kg CO2. "
        
        if "reduce" in msg or "tips" in msg:
            if highest_category == "transport":
                response += "Consider carpooling, biking, or taking public transit to significantly cut down your transport emissions!"
            elif highest_category == "energy":
                response += "Switching to LED bulbs or adjusting your thermostat by 2 degrees can greatly reduce your energy footprint."
            elif highest_category == "food":
                response += "Try incorporating a few plant-based meals each week to lower your food-related emissions."
            else:
                response += "Composting and recycling can drastically reduce your waste footprint."
        elif "score" in msg or "footprint" in msg:
            response += f"Your total footprint is currently {latest_footprint.total_emissions:.1f} kg CO2. You're doing great!"
        else:
            response += "Based on your profile, focusing on your highest emission category will give you the fastest results."
    else:
        if "reduce" in msg or "tips" in msg:
            response += "To reduce emissions, consider public transport, eating less meat, and saving electricity at home."
        else:
            response += "Let's focus on simple daily actions to lower your carbon footprint!"
            
    return {"reply": response}

@app.post("/users/{user_id}/simulate", response_model=schemas.SimulationResponse)
def simulate_user_footprint(user_id: int, simulation: schemas.SimulationRequest, db: Session = Depends(get_db)):
    """Calculate the estimated carbon savings for a hypothetical scenario."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_schema = schemas.UserCreate(
        name=user.name,
        age_group=user.age_group,
        city=user.city,
        household_size=user.household_size,
        transportation_habits=user.transportation_habits,
        weekly_travel_distance=user.weekly_travel_distance,
        electricity_consumption=user.electricity_consumption,
        diet_type=user.diet_type
    )
    
    from services.calculator import simulate_footprint
    return simulate_footprint(user_schema, simulation)
