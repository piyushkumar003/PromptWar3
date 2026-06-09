from sqlalchemy.orm import Session
import models, schemas
from services.calculator import calculate_footprint

def create_user_with_footprint(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    footprint_data = calculate_footprint(user)
    db_footprint = models.FootprintRecord(**footprint_data.dict(), user_id=db_user.id)
    db.add(db_footprint)
    db.commit()
    
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_footprints(db: Session, user_id: int):
    return db.query(models.FootprintRecord).filter(models.FootprintRecord.user_id == user_id).order_by(models.FootprintRecord.timestamp.asc()).all()
