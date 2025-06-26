import React from 'react';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-primary text-white p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">UMC Fleet Dashboard</h1>
        </div>
      </header>

      <DashboardPage />
    </div>
  );
}

export default App;
