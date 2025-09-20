import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  priorityLevels,
  severityLevels,
  statusOptions,
} from "../constants/damageReportOptions";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const PAGE_SIZE = 10;

const formatDateTime = (value) => {
  if (!value) {
    return "â€”";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const DamageReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setPage((prev) => (prev === 1 ? prev : 1));
  }, [searchTerm, severityFilter, statusFilter, priorityFilter, dateFrom, dateTo]);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
        };

        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        if (severityFilter) {
          params.severity = severityFilter;
        }
        if (statusFilter) {
          params.status = statusFilter;
        }
        if (priorityFilter) {
          params.priority = priorityFilter;
        }
        if (dateFrom) {
          params.dateFrom = dateFrom;
        }
        if (dateTo) {
          params.dateTo = dateTo;
        }

        const res = await axios.get(`${API_BASE_URL}/api/damage-reports`, { params });

        setReports(res.data.reports || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalReports(res.data.totalReports || 0);
      } catch (err) {
        console.error("Failed to load damage reports:", err);
        const message = err.response?.data?.message || "Unable to load damage reports right now.";
        setError(message);
        setReports([]);
        setTotalReports(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [page, searchTerm, severityFilter, statusFilter, priorityFilter, dateFrom, dateTo]);

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSeverityFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const filtersActive =
    Boolean(searchTerm.trim()) ||
    Boolean(severityFilter) ||
    Boolean(statusFilter) ||
    Boolean(priorityFilter) ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Damage Reports</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Review, triage, and follow up on reported vehicle damage across the fleet.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by unit, severity, or status"
              className="w-full sm:w-72 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search damage reports"
            />
            <Link
              to="/report-damage"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Report New Damage
            </Link>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <select
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by severity"
          >
            <option value="">All severities</option>
            {severityLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by damage status"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by priority"
          >
            <option value="">All priorities</option>
            {priorityLevels.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter from date"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter to date"
          />

          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Clear filters
          </button>
        </div>

        {error && (
          <div className="mb-4 border-l-4 border-red-400 bg-red-50 px-4 py-3 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Unit
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Severity
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Damage Area
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Priority
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Reported By
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Incident Time
                  </th>
                  <th scope="col" className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                      Loading damage reports...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                      {filtersActive
                        ? "No damage reports match the current filters. Adjust them and try again."
                        : "No damage reports found yet."}
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="font-semibold text-gray-800">{report.unitId || 'â€”'}</div>
                        <div className="text-xs text-gray-500">{report.licensePlate || 'No plate on file'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {report.severity || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{report.damageArea || 'â€”'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{report.damageStatus || 'Reported'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{report.priority || 'Moderate'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{report.reportedBy || 'â€”'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(report.incidentDateTime)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <Link
                          to={`/damage-reports/${report._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            Showing {reports.length} of {totalReports} matching report(s).
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={page <= 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={page >= totalPages}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700">Severity reference</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {severityLevels.map((level) => (
                <li key={level}>{level}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700">Status reference</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {statusOptions.map((status) => (
                <li key={status}>{status}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700">Priority levels</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {priorityLevels.map((priority) => (
                <li key={priority}>{priority}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages || 1));
  }, [totalPages]);
};

export default DamageReportsPage;
