from pydantic import BaseModel, Field
from typing import List, Optional
import datetime

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    age_group: str = Field(..., max_length=50)
    city: str = Field(..., max_length=100)
    household_size: int = Field(..., ge=1, le=20)
    transportation_habits: str = Field(..., max_length=50)
    weekly_travel_distance: float = Field(..., ge=0, le=10000)
    electricity_consumption: float = Field(..., ge=0, le=100000)
    diet_type: str = Field(..., max_length=50)

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

class SimulationRequest(BaseModel):
    electricity_reduction_percent: float = Field(default=0, ge=0, le=100)
    public_transport_days: int = Field(default=0, ge=0, le=7)
    meat_reduction_percent: float = Field(default=0, ge=0, le=100)

class SimulationResponse(BaseModel):
    current_emissions: FootprintBase
    simulated_emissions: FootprintBase
    estimated_savings: float
