from schemas import UserCreate, FootprintCreate

# Emission factors (kg CO2 per unit)
# These are rough estimates for MVP purposes
TRANSPORT_EMISSIONS = {
    "car": 0.192, # per km
    "bike": 0.05,
    "bus": 0.089,
    "metro": 0.028,
    "walking": 0.0,
    "cycling": 0.0
}

ELECTRICITY_EMISSION_FACTOR = 0.4 # kg CO2 per kWh (approx average)

DIET_EMISSIONS_MONTHLY = {
    "vegan": 60.0,
    "vegetarian": 80.0,
    "mixed": 150.0,
    "heavy_meat": 250.0
}

def calculate_footprint(user: UserCreate) -> FootprintCreate:
    # 1. Transportation
    habit = user.transportation_habits.lower()
    factor = TRANSPORT_EMISSIONS.get(habit, 0.1)
    # weekly -> monthly
    transport_emissions = factor * user.weekly_travel_distance * 4
    
    # 2. Energy
    # Assume electricity_consumption is in kWh per month
    # We could factor in renewable %, but we don't have it in UserCreate yet. 
    # Let's assume standard emission factor for now.
    energy_emissions = user.electricity_consumption * ELECTRICITY_EMISSION_FACTOR
    
    # 3. Food
    diet = user.diet_type.lower()
    food_emissions = DIET_EMISSIONS_MONTHLY.get(diet, 150.0)
    
    # 4. Waste
    # Simplistic waste assumption: 20kg base per person per month.
    waste_emissions = 20.0 * user.household_size
    
    total = transport_emissions + energy_emissions + food_emissions + waste_emissions
    
    return FootprintCreate(
        transport_emissions=round(transport_emissions, 2),
        energy_emissions=round(energy_emissions, 2),
        food_emissions=round(food_emissions, 2),
        waste_emissions=round(waste_emissions, 2),
        total_emissions=round(total, 2)
    )

def generate_recommendations(user: UserCreate, footprint: FootprintCreate):
    recs = []
    
    if footprint.transport_emissions > 100:
        recs.append({
            "id": 1,
            "title": "Switch to Public Transport",
            "description": "Using buses or metro can significantly reduce your travel footprint.",
            "category": "Transport",
            "difficulty": "Medium",
            "impact_score": 80,
            "estimated_savings": 50.0
        })
    if footprint.energy_emissions > 150:
        recs.append({
            "id": 2,
            "title": "Use LED Lighting & Unplug Devices",
            "description": "Switching to LEDs and reducing standby power cuts electricity usage.",
            "category": "Energy",
            "difficulty": "Easy",
            "impact_score": 60,
            "estimated_savings": 25.0
        })
    if user.diet_type.lower() in ["mixed", "heavy_meat"]:
        recs.append({
            "id": 3,
            "title": "Meat-Free Days",
            "description": "Introducing 2 meat-free days a week can drastically lower your food footprint.",
            "category": "Diet",
            "difficulty": "Medium",
            "impact_score": 85,
            "estimated_savings": 40.0
        })
        
    return recs

def simulate_footprint(user: schemas.UserCreate, simulation: schemas.SimulationRequest) -> schemas.SimulationResponse:
    """Simulate carbon footprint based on scenario changes."""
    # Base calculation
    base_fp = calculate_footprint(user)
    
    # Create simulated user profile
    sim_user = schemas.UserCreate(
        name=user.name,
        age_group=user.age_group,
        city=user.city,
        household_size=user.household_size,
        transportation_habits="public_transport" if simulation.public_transport_days >= 3 else user.transportation_habits,
        weekly_travel_distance=user.weekly_travel_distance,
        electricity_consumption=user.electricity_consumption * (1 - (simulation.electricity_reduction_percent / 100.0)),
        diet_type="vegetarian" if simulation.meat_reduction_percent >= 80 else user.diet_type
    )
    
    # Calculate simulated footprint
    sim_fp = calculate_footprint(sim_user)
    
    # Fine-tune based on exact meat reduction if not fully vegetarian
    if simulation.meat_reduction_percent > 0 and simulation.meat_reduction_percent < 80:
        reduction_factor = simulation.meat_reduction_percent / 100.0
        sim_fp.food_emissions = base_fp.food_emissions * (1 - reduction_factor * 0.5) # Meat is roughly 50% of diet impact
        sim_fp.total_emissions = sim_fp.transport_emissions + sim_fp.energy_emissions + sim_fp.food_emissions + sim_fp.waste_emissions
        
    savings = base_fp.total_emissions - sim_fp.total_emissions
    
    return schemas.SimulationResponse(
        current_emissions=base_fp,
        simulated_emissions=sim_fp,
        estimated_savings=savings if savings > 0 else 0
    )
