import pytest
from fastapi.testclient import TestClient
from main import app, get_db
from database import Base, engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to EcoGuide AI API"}

def test_onboard_user():
    response = client.post(
        "/users/onboard",
        json={
            "name": "Test User",
            "age_group": "20-30",
            "city": "Test City",
            "household_size": 2,
            "transportation_habits": "bus",
            "weekly_travel_distance": 50,
            "electricity_consumption": 200,
            "diet_type": "vegan"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test User"
    assert "id" in data

def test_get_user_footprints():
    # First onboard a user
    user_res = client.post(
        "/users/onboard",
        json={
            "name": "Test User",
            "age_group": "20-30",
            "city": "Test City",
            "household_size": 2,
            "transportation_habits": "bus",
            "weekly_travel_distance": 50,
            "electricity_consumption": 200,
            "diet_type": "vegan"
        }
    )
    user_id = user_res.json()["id"]

    response = client.get(f"/users/{user_id}/footprints")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["user_id"] == user_id

def test_chatbot():
    # First onboard a user
    user_res = client.post(
        "/users/onboard",
        json={
            "name": "Test User",
            "age_group": "20-30",
            "city": "Test City",
            "household_size": 2,
            "transportation_habits": "bus",
            "weekly_travel_distance": 50,
            "electricity_consumption": 200,
            "diet_type": "vegan"
        }
    )
    user_id = user_res.json()["id"]

    response = client.post(
        f"/users/{user_id}/chat",
        json={"message": "how do I reduce my emissions?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "reduce" in data["reply"].lower()

def test_simulator():
    # First onboard a user
    user_res = client.post(
        "/users/onboard",
        json={
            "name": "Test User",
            "age_group": "20-30",
            "city": "Test City",
            "household_size": 2,
            "transportation_habits": "bus",
            "weekly_travel_distance": 50,
            "electricity_consumption": 200,
            "diet_type": "vegan"
        }
    )
    user_id = user_res.json()["id"]

    response = client.post(
        f"/users/{user_id}/simulate",
        json={
            "electricity_reduction_percent": 50,
            "public_transport_days": 5,
            "meat_reduction_percent": 100
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "simulated_emissions" in data
    assert data["estimated_savings"] >= 0
