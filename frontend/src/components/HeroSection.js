// src/components/HeroSection.js
import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-600 text-white py-16 px-6 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">UMC Fleet Management</h1>
      <p className="text-lg sm:text-xl mb-8">
        Track and manage the health of your ambulance fleet efficiently and professionally.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <a href="#systemsCheck" className="bg-white text-blue-700 px-5 py-2 rounded font-semibold hover:bg-gray-100 transition">
          Systems Check
        </a>
        <a href="#fluidLevels" className="bg-white text-blue-700 px-5 py-2 rounded font-semibold hover:bg-gray-100 transition">
          Fluid Levels
        </a>
        <a href="#damageReports" className="bg-white text-blue-700 px-5 py-2 rounded font-semibold hover:bg-gray-100 transition">
          Damage Reports
        </a>
        <a href="#equipment" className="bg-white text-blue-700 px-5 py-2 rounded font-semibold hover:bg-gray-100 transition">
          Equipment
        </a>
        <a href="#tireHealth" className="bg-white text-blue-700 px-5 py-2 rounded font-semibold hover:bg-gray-100 transition">
          Tire Health
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
