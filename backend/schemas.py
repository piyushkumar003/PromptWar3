from pydantic import BaseModel
from typing import List, Optional
import datetime

class UserBase(BaseModel):
    name: str
    age_group: str
    city: str
    household_size: int
    transportation_habits: str
    weekly_travel_distance: float
    electricity_consumption: float
    diet_type: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class FootprintBase(BaseModel):
    transport_emissions: float
    energy_emissions: float
    food_emissions: float
    waste_emissions: float
    total_emissions: float

class FootprintCreate(FootprintBase):
    pass

class Footprint(FootprintBase):
    id: int
    user_id: int
    timestamp: datetime.datetime
    class Config:
        from_attributes = True

class Recommendation(BaseModel):
    id: int
    title: str
    description: str
    category: str
    difficulty: str
    impact_score: int
    estimated_savings: float
