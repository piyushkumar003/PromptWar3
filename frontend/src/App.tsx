import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <header className="border-b border-slate-800 p-4 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            EcoGuide AI
          </h1>
        </header>
        <main className="container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
