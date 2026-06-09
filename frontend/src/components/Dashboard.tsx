import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Leaf, Zap, Car, Trash2, ArrowDown } from 'lucide-react';
import Chatbot from './Chatbot';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

interface Footprint {
  id: number;
  transport_emissions: number;
  energy_emissions: number;
  food_emissions: number;
  waste_emissions: number;
  total_emissions: number;
  timestamp: string;
}

interface Recommendation {
  id: number;
  title: str;
  description: string;
  category: string;
  difficulty: string;
  impact_score: number;
  estimated_savings: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      navigate('/onboarding');
      return;
    }

    const fetchData = async () => {
      try {
        const [fpRes, recRes] = await Promise.all([
          axios.get(`https://piyush6363-ecoguide-backend.hf.space/users/${userId}/footprints`),
          axios.get(`https://piyush6363-ecoguide-backend.hf.space/users/${userId}/recommendations`)
        ]);
        setFootprints(fpRes.data);
        setRecommendations(recRes.data);
      } catch (error) {
        console.warn("Backend unavailable, using mock data for trial");
        const userData = JSON.parse(localStorage.getItem('mock_user_data') || '{}');
        
        const mockFp = {
          id: 1,
          transport_emissions: userData.weekly_travel_distance ? userData.weekly_travel_distance * 4 * 0.192 : 150,
          energy_emissions: userData.electricity_consumption ? userData.electricity_consumption * 0.4 : 100,
          food_emissions: userData.diet_type === 'vegan' ? 60 : 150,
          waste_emissions: 40,
          total_emissions: 0,
          timestamp: new Date().toISOString()
        };
        mockFp.total_emissions = mockFp.transport_emissions + mockFp.energy_emissions + mockFp.food_emissions + mockFp.waste_emissions;
        
        setFootprints([mockFp]);
        setRecommendations([
          { id: 1, title: "Switch to Public Transport", description: "Using buses or metro can significantly reduce your travel footprint.", category: "Transport", difficulty: "Medium", impact_score: 80, estimated_savings: 50.0 },
          { id: 2, title: "Meat-Free Days", description: "Introducing 2 meat-free days a week can drastically lower your food footprint.", category: "Diet", difficulty: "Medium", impact_score: 85, estimated_savings: 40.0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div></div>;

  const currentFootprint = footprints[footprints.length - 1];

  if (!currentFootprint) return <div>No data available. Please complete onboarding.</div>;

  const pieData = [
    { name: 'Transport', value: currentFootprint.transport_emissions },
    { name: 'Energy', value: currentFootprint.energy_emissions },
    { name: 'Food', value: currentFootprint.food_emissions },
    { name: 'Waste', value: currentFootprint.waste_emissions },
  ];

  const barData = footprints.map((f, i) => ({
    name: `Month ${i+1}`,
    total: f.total_emissions
  }));

  // Calculate Sustainability Score (0-100), simple mock calculation
  const score = Math.max(0, 100 - (currentFootprint.total_emissions / 10));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Your Impact Dashboard</h2>
        <div className="bg-emerald-900/50 border border-emerald-500/30 px-6 py-3 rounded-xl flex items-center gap-3">
          <Leaf className="text-emerald-400" />
          <div>
            <div className="text-xs text-emerald-300/70">Sustainability Score</div>
            <div className="text-2xl font-bold text-emerald-400">{score.toFixed(0)} <span className="text-sm">/ 100</span></div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Total Footprint</div>
            <div className="text-2xl font-bold">{currentFootprint.total_emissions.toFixed(1)} <span className="text-sm font-normal text-slate-500">kg CO₂</span></div>
          </div>
          <Leaf className="h-10 w-10 text-emerald-500 opacity-50" />
        </div>
        <div className="card border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Transport</div>
            <div className="text-2xl font-bold">{currentFootprint.transport_emissions.toFixed(1)} <span className="text-sm font-normal text-slate-500">kg CO₂</span></div>
          </div>
          <Car className="h-10 w-10 text-blue-500 opacity-50" />
        </div>
        <div className="card border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Energy</div>
            <div className="text-2xl font-bold">{currentFootprint.energy_emissions.toFixed(1)} <span className="text-sm font-normal text-slate-500">kg CO₂</span></div>
          </div>
          <Zap className="h-10 w-10 text-amber-500 opacity-50" />
        </div>
        <div className="card border-l-4 border-l-red-500 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Waste & Food</div>
            <div className="text-2xl font-bold">{(currentFootprint.food_emissions + currentFootprint.waste_emissions).toFixed(1)} <span className="text-sm font-normal text-slate-500">kg CO₂</span></div>
          </div>
          <Trash2 className="h-10 w-10 text-red-500 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Emissions Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} itemStyle={{ color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Historical Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-6">Personalized Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(rec => (
            <div key={rec.id} className="card hover:border-emerald-500/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-medium text-slate-300">{rec.category}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${rec.difficulty === 'Easy' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>
                  {rec.difficulty}
                </span>
              </div>
              <h4 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">{rec.title}</h4>
              <p className="text-sm text-slate-400 mb-6">{rec.description}</p>
              
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <ArrowDown size={16} />
                <span>Save ~{rec.estimated_savings.toFixed(1)} kg CO₂ / mo</span>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && (
            <div className="col-span-full card text-center py-12 text-slate-400">
              You're doing great! We'll keep analyzing your data to find new ways to reduce your footprint.
            </div>
          )}
        </div>
      </div>

      {/* Floating Chatbot Toggle */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-105 z-50 focus:outline-none"
      >
        <Leaf className="text-white" />
      </button>

      {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default Dashboard;
