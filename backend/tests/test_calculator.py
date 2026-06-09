from services.calculator import calculate_footprint
from schemas import UserCreate

def test_calculate_footprint():
    user = UserCreate(
        name="Test User",
        age_group="20-30",
        city="Test City",
        household_size=2,
        transportation_habits="car",
        weekly_travel_distance=50,
        electricity_consumption=100,
        diet_type="vegan"
    )
    
    footprint = calculate_footprint(user)
    
    assert footprint.transport_emissions == 0.192 * 50 * 4
    assert footprint.energy_emissions == 100 * 0.4
    assert footprint.food_emissions == 60.0
    assert footprint.waste_emissions == 40.0
    assert footprint.total_emissions == round(
        (0.192 * 50 * 4) + (100 * 0.4) + 60.0 + 40.0, 2
    )
