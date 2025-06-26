import React, { useState } from "react";

const UnitCard = ({ unit }) => {
  const [openSections, setOpenSections] = useState({
    systemsCheck: true,
    fluidLevels: true,
    damageReports: true,
    equipment: true,
    tireHealth: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

const renderObject = (obj) => {
  if (!obj || typeof obj !== "object") return null;

  return Object.entries(obj).map(([key, value]) => (
    <div key={key}>
      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
      {typeof value === "object" && value !== null
        ? Array.isArray(value)
          ? value.join(", ")
          : Object.entries(value)
              .map(([k, v]) => `${k}: ${String(v)}`)
              .join(", ")
        : String(value)}
    </div>
  ));
};


  return (
    <div className="p-4 border rounded shadow bg-white transition duration-200 hover:shadow-md">
      <h3 className="text-xl font-bold mb-2 text-blue-800">{unit.unitNumber}</h3>
      <p className="text-sm text-gray-600 mb-1">Mileage: {unit.mileage} miles</p>

      {unit.oilChangeDueAt && (
        <p className="text-sm text-red-600 mb-1">
          Oil change due at: {unit.oilChangeDueAt} miles
        </p>
      )}

      <p className="text-sm mb-2">
        Status:{" "}
        <span className={unit.isOperational ? "text-green-600" : "text-red-600"}>
          {unit.isOperational ? "Operational" : "Non-Operational"}
        </span>
      </p>

      {/* Section map */}
      {[
        { id: "systemsCheck", label: "Systems Check", content: unit.systemsCheck },
        { id: "fluidLevels", label: "Fluid Levels", content: unit.fluidLevels },
        {
          id: "damageReports",
          label: "Damage Reports",
          content: unit.damageReports.length > 0 ? (
            <ul className="list-disc ml-5">
              {unit.damageReports.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">None reported</p>
          ),
        },
        {
          id: "equipment",
          label: "Equipment",
          content: unit.equipment.length > 0 ? (
            <ul className="list-disc ml-5">
              {unit.equipment.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No expiring equipment</p>
          ),
        },
        { id: "tireHealth", label: "Tire Health", content: unit.tireHealth },
      ].map((section) => (
        <div key={section.id} id={section.id} className="mt-4">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex justify-between items-center text-left text-gray-800 font-semibold mb-1 hover:text-blue-600"
          >
            {section.label}
            <span>{openSections[section.id] ? "▲" : "▼"}</span>
          </button>

          {openSections[section.id] && (
            <div className="pl-2 text-sm text-gray-600 space-y-1">
              {typeof section.content === "object" && !Array.isArray(section.content)
                ? renderObject(section.content)
                : section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UnitCard;
