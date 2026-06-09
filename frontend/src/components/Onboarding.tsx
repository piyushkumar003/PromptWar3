import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Onboarding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age_group: '20-30',
    city: '',
    household_size: 1,
    transportation_habits: 'car',
    weekly_travel_distance: 0,
    electricity_consumption: 0,
    diet_type: 'mixed'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'household_size' || name === 'weekly_travel_distance' || name === 'electricity_consumption' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://piyush6363-ecoguide-backend.hf.space/users/onboard', formData);
      localStorage.setItem('user_id', response.data.id);
      navigate('/');
    } catch (error) {
      console.warn('Backend unavailable, using local mock data for trial');
      localStorage.setItem('user_id', 'mock-user-1');
      localStorage.setItem('mock_user_data', JSON.stringify(formData));
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Welcome to EcoGuide AI</h2>
        <p className="text-slate-400 mb-8">Tell us a bit about your lifestyle to calculate your initial carbon footprint.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="John Doe" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Age Group</label>
              <select name="age_group" value={formData.age_group} onChange={handleChange} className="input-field">
                <option value="under-20">Under 20</option>
                <option value="20-30">20 - 30</option>
                <option value="31-40">31 - 40</option>
                <option value="41-50">41 - 50</option>
                <option value="over-50">Over 50</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input required type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="New York" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Household Size</label>
              <input required type="number" min="1" name="household_size" value={formData.household_size} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Diet Type</label>
              <select name="diet_type" value={formData.diet_type} onChange={handleChange} className="input-field">
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="mixed">Mixed</option>
                <option value="heavy_meat">Heavy Meat</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Transportation & Energy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Transport</label>
                <select name="transportation_habits" value={formData.transportation_habits} onChange={handleChange} className="input-field">
                  <option value="car">Car</option>
                  <option value="bike">Motorbike</option>
                  <option value="bus">Bus</option>
                  <option value="metro">Metro / Train</option>
                  <option value="cycling">Cycling</option>
                  <option value="walking">Walking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Weekly Travel Distance (km)</label>
                <input required type="number" min="0" name="weekly_travel_distance" value={formData.weekly_travel_distance} onChange={handleChange} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Monthly Electricity Consumption (kWh)</label>
                <input required type="number" min="0" name="electricity_consumption" value={formData.electricity_consumption} onChange={handleChange} className="input-field" />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 mt-8 text-lg">
            Calculate My Footprint
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
