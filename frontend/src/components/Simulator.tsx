import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';

const Simulator = () => {
  const [electricityReduction, setElectricityReduction] = useState(0);
  const [publicTransportDays, setPublicTransportDays] = useState(0);
  const [meatReduction, setMeatReduction] = useState(0);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    const userId = localStorage.getItem('user_id');
    try {
      if (userId) {
        const response = await axios.post(`https://piyush6363-ecoguide-backend.hf.space/users/${userId}/simulate`, {
          electricity_reduction_percent: electricityReduction,
          public_transport_days: publicTransportDays,
          meat_reduction_percent: meatReduction
        });
        setSimulationData(response.data);
      } else {
        // Mock offline simulation
        setSimulationData({
          current_emissions: { total_emissions: 500 },
          simulated_emissions: { total_emissions: 500 - (electricityReduction * 1.5) - (publicTransportDays * 10) - (meatReduction * 2) },
          estimated_savings: (electricityReduction * 1.5) + (publicTransportDays * 10) + (meatReduction * 2)
        });
      }
    } catch (error) {
      console.warn("Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  const chartData = simulationData ? [
    { name: 'Current', emissions: simulationData.current_emissions.total_emissions },
    { name: 'Simulated', emissions: simulationData.simulated_emissions.total_emissions }
  ] : [];

  return (
    <div className="card mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-emerald-500" />
        <h3 className="text-xl font-bold">Carbon Reduction Simulator</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reduce Electricity Usage ({electricityReduction}%)
            </label>
            <input 
              type="range" 
              min="0" max="100" 
              value={electricityReduction} 
              onChange={(e) => setElectricityReduction(Number(e.target.value))}
              className="w-full accent-emerald-500"
              aria-label="Electricity reduction percentage"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Public Transport Days per Week ({publicTransportDays} days)
            </label>
            <input 
              type="range" 
              min="0" max="7" 
              value={publicTransportDays} 
              onChange={(e) => setPublicTransportDays(Number(e.target.value))}
              className="w-full accent-emerald-500"
              aria-label="Public transport days"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reduce Meat Consumption ({meatReduction}%)
            </label>
            <input 
              type="range" 
              min="0" max="100" 
              value={meatReduction} 
              onChange={(e) => setMeatReduction(Number(e.target.value))}
              className="w-full accent-emerald-500"
              aria-label="Meat reduction percentage"
            />
          </div>

          <button 
            onClick={handleSimulate}
            disabled={loading}
            className="w-full btn-primary py-3 flex justify-center items-center"
            aria-label="Run carbon simulation"
          >
            {loading ? "Simulating..." : "Run Simulation"}
          </button>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 flex flex-col justify-center min-h-[300px]">
          {simulationData ? (
            <>
              <div className="text-center mb-6">
                <div className="text-sm text-slate-400">Estimated Savings</div>
                <div className="text-3xl font-bold text-emerald-400">
                  -{simulationData.estimated_savings.toFixed(1)} <span className="text-sm">kg CO₂</span>
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                    <Legend />
                    <Bar dataKey="emissions" fill="#10b981" radius={[4, 4, 0, 0]} name="Emissions (kg CO₂)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500">
              Adjust the sliders and run the simulation to see your potential impact!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulator;
