// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import ReportDamagePage from "./pages/ReportDamagePage";
import MaintenanceTrackerPage from "./pages/MaintenanceTrackerPage";
import FleetOverviewPage from "./pages/FleetOverviewPage";
import InspectionLogPage from "./pages/InspectionLogPage";
import AdminPanelPage from "./pages/AdminPanelPage";

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/report-damage" element={<ReportDamagePage />} />
        <Route path="/maintenance-tracker" element={<MaintenanceTrackerPage />} />
        <Route path="/fleet-overview" element={<FleetOverviewPage />} />
        <Route path="/inspection-log" element={<InspectionLogPage />} />
        <Route path="/admin" element={<AdminPanelPage />} />
      </Routes>
    </Router>
  );
}

export default App;
