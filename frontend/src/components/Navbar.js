// src/components/Navbar.js
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-md">
      <div className="text-2xl font-semibold mb-2 sm:mb-0">
        UMC Fleet Management
      </div>
      <div className="space-x-4 flex flex-wrap justify-center">
        <Link to="/" className="hover:text-gray-300 transition">Dashboard</Link>
        <Link to="/report-damage" className="hover:text-gray-300 transition">Report Damage</Link>
        <Link to="/maintenance-tracker" className="hover:text-gray-300 transition">Maintenance Tracker</Link>
        <Link to="/fleet-overview" className="hover:text-gray-300 transition">Fleet Overview</Link>
        <Link to="/inspection-log" className="hover:text-gray-300 transition">Inspection Log</Link>
        <Link to="/admin" className="hover:text-gray-300 transition">Admin Panel</Link>
      </div>
    </nav>
  );
};

export default Navbar;
