from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age_group = Column(String)
    city = Column(String)
    household_size = Column(Integer)
    transportation_habits = Column(String)
    weekly_travel_distance = Column(Float)
    electricity_consumption = Column(Float)
    diet_type = Column(String)
    
    footprints = relationship("FootprintRecord", back_populates="owner")
    goals = relationship("Goal", back_populates="owner")

class FootprintRecord(Base):
    __tablename__ = "footprints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    transport_emissions = Column(Float)
    energy_emissions = Column(Float)
    food_emissions = Column(Float)
    waste_emissions = Column(Float)
    total_emissions = Column(Float)
    
    owner = relationship("User", back_populates="footprints")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    target_reduction_percentage = Column(Float)
    status = Column(String, default="active")
    
    owner = relationship("User", back_populates="goals")
