from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models, schemas
from services.calculator import calculate_footprint, generate_recommendations
from pydantic import BaseModel

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
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Calculate initial footprint
    footprint_data = calculate_footprint(user)
    db_footprint = models.FootprintRecord(**footprint_data.dict(), user_id=db_user.id)
    db.add(db_footprint)
    db.commit()
    
    return db_user

@app.get("/users/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/users/{user_id}/footprints", response_model=list[schemas.Footprint])
def get_user_footprints(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.FootprintRecord).filter(models.FootprintRecord.user_id == user_id).all()

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
    user = db.query(models.User).filter(models.User.id == user_id).first()
    msg = chat.message.lower()
    
    response = "I am your Carbon Coach! "
    if "reduce" in msg or "tips" in msg:
        response += "To reduce emissions, consider public transport, eating less meat, and saving electricity at home."
    elif "score" in msg or "footprint" in msg:
        response += "You can see your detailed footprint in the dashboard."
    else:
        response += "That's an interesting question. Let's focus on simple daily actions to lower your carbon footprint!"
        
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
