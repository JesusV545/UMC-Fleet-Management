import React, { useEffect, useState } from "react";
import axios from "axios";
import UnitCard from "../components/UnitCard";
import HeroSection from "../components/HeroSection";

const DashboardPage = () => {
  const [units, setUnits] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/units?page=${page}`);
        setUnits(res.data.units);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("Error fetching units:", err);
      }
    };

    fetchUnits();
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="fleet">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Ambulance Units</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map((unit) => (
            <UnitCard key={unit._id} unit={unit} />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center mt-10 gap-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
