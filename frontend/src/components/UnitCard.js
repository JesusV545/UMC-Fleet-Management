import React, { useState } from "react";

const UnitCard = ({ unit }) => {
  const [openSections, setOpenSections] = useState({
    systemsCheck: true,
    fluidLevels: true,
    damageReports: true,
    equipment: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sectionButton = (sectionKey) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="text-sm ml-2 focus:outline-none"
      aria-label={`Toggle ${sectionKey}`}
    >
      {openSections[sectionKey] ? "▲" : "▼"}
    </button>
  );

  const statusColor =
    unit.isOperational === true ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full sm:w-80 border border-gray-200">
      <h2 className="text-xl font-bold text-blue-800">{unit.unitNumber}</h2>
      <p>Mileage: {unit.mileage.toLocaleString()} miles</p>
      {unit.oilChangeDueAt && (
        <p>
          Oil change due at{" "}
          <span className="text-red-500 font-medium">{unit.oilChangeDueAt.toLocaleString()} miles</span>
        </p>
      )}
      <p className={`font-medium ${statusColor}`}>
        Status: {unit.isOperational ? "Operational" : "Out of Service"}
      </p>

      {/* Systems Check */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold flex justify-between items-center">
          Systems Check {sectionButton("systemsCheck")}
        </h3>
        {openSections.systemsCheck && (
          <ul className="text-sm text-gray-700 mt-1 space-y-1">
            {Object.entries(unit.systemsCheck || {}).map(([key, val]) => (
              <li key={key}>
                <strong>{key}:</strong> {val}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Fluid Levels */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold flex justify-between items-center">
          Fluid Levels {sectionButton("fluidLevels")}
        </h3>
        {openSections.fluidLevels && (
          <ul className="text-sm text-gray-700 mt-1 space-y-1">
            {Object.entries(unit.fluidLevels || {}).map(([key, val]) => (
              <li key={key}>
                <strong>{key}:</strong> {val}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Damage Reports */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold flex justify-between items-center">
          Damage Reports {sectionButton("damageReports")}
        </h3>
        {openSections.damageReports && (
          <div className="text-sm text-gray-700 mt-1">
            {unit.damageReports && unit.damageReports.length > 0 ? (
              <ul className="list-disc ml-4">
                {unit.damageReports.map((report, index) => (
                  <li key={index}>{report}</li>
                ))}
              </ul>
            ) : (
              <p>None reported</p>
            )}
          </div>
        )}
      </div>

      {/* Equipment */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold flex justify-between items-center">
          Expiring Equipment {sectionButton("equipment")}
        </h3>
        {openSections.equipment && (
          <div className="text-sm text-gray-700 mt-1">
            {unit.equipment && unit.equipment.length > 0 ? (
              <ul className="list-disc ml-4">
                {unit.equipment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No expiring equipment</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitCard;
