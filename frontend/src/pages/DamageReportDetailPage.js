import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  immediateActions,
  priorityLevels,
  statusOptions,
  supervisorStatuses,
} from "../constants/damageReportOptions";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const formatDateTime = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const mapReportToForm = (report) => ({
  damageStatus: report.damageStatus || statusOptions[0],
  supervisorStatus: report.supervisorStatus || supervisorStatuses[0],
  priority: report.priority || priorityLevels[1],
  managerNotes: report.managerNotes || "",
  notifyTeam: Boolean(report.notifyTeam),
  assignedVendor: report.assignedVendor || "",
  repairDate: report.repairDate ? report.repairDate.slice(0, 10) : "",
  repairCost:
    report.repairCost !== undefined && report.repairCost !== null
      ? String(report.repairCost)
      : "",
  immediateAction: report.immediateAction || "",
});

const DamageReportDetailPage = () => {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [formData, setFormData] = useState(mapReportToForm({}));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError("");

      try {
        const res = await axios.get(`${API_BASE_URL}/api/damage-reports/${reportId}`);
        setReport(res.data);
        setFormData(mapReportToForm(res.data));
      } catch (err) {
        console.error(`Failed to load damage report ${reportId}:`, err);
        const message = err.response?.data?.message || "Unable to load this damage report right now.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSubmitStatus({ type: "", message: "" });

    const payload = {
      damageStatus: formData.damageStatus,
      supervisorStatus: formData.supervisorStatus,
      priority: formData.priority,
      managerNotes: formData.managerNotes,
      notifyTeam: formData.notifyTeam,
      assignedVendor: formData.assignedVendor,
      repairDate: formData.repairDate || null,
      repairCost: formData.repairCost === "" ? "" : Number(formData.repairCost),
      immediateAction: formData.immediateAction,
    };

    try {
      const res = await axios.patch(`${API_BASE_URL}/api/damage-reports/${reportId}`, payload);
      setReport(res.data);
      setFormData(mapReportToForm(res.data));
      setSubmitStatus({ type: "success", message: "Updates saved successfully." });
    } catch (err) {
      console.error(`Failed to update damage report ${reportId}:`, err);
      const message = err.response?.data?.message || "Unable to save your changes. Please try again.";
      setSubmitStatus({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600">Loading damage report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 border-l-4 border-red-400 bg-red-50 px-4 py-3 text-red-700 rounded-md">
            {error}
          </div>
          <Link
            to="/damage-reports"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Back to damage reports
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const messageClassName =
    submitStatus.type === "success"
      ? "border-green-400 bg-green-50 text-green-700"
      : submitStatus.type === "error"
      ? "border-red-400 bg-red-50 text-red-700"
      : "border-blue-400 bg-blue-50 text-blue-700";

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Damage Report Detail</h1>
            <p className="mt-2 text-gray-600">
              Track remediation and close the loop on damage report {report._id}.
            </p>
          </div>
          <Link
            to="/damage-reports"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Back to list
          </Link>
        </div>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Report Overview</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
            <div>
              <dt className="font-medium text-gray-600">Unit</dt>
              <dd>{report.unitId || 'N/A'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">License Plate</dt>
              <dd>{report.licensePlate || 'N/A'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Severity</dt>
              <dd>{report.severity || 'Unknown'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Damage Area</dt>
              <dd>{report.damageArea || 'N/A'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Cause</dt>
              <dd>{report.damageCause || 'N/A'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Incident Time</dt>
              <dd>{formatDateTime(report.incidentDateTime)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Reported By</dt>
              <dd>{report.reportedBy || 'N/A'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Crew / Shift</dt>
              <dd>{report.crew ? `${report.crew} (${report.shift || 'Shift not noted'})` : report.shift || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-600">Description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-700">{report.description || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-600">Incident Circumstances</dt>
              <dd className="mt-1 text-gray-700">
                <span className="block">Weather / Road: {report.weather || 'N/A'}</span>
                <span className="block">Third Parties: {report.thirdParties || 'N/A'}</span>
                <span className="block">Witnesses: {report.witnesses || 'N/A'}</span>
                <span className="block">Police Report #: {report.policeReportNumber || 'N/A'}</span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-600">Attachments</dt>
              <dd className="mt-1 text-gray-700">
                {report.attachments && report.attachments.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {report.attachments.map((fileName) => {
                      const href = fileName.startsWith('http')
                        ? fileName
                        : `${API_BASE_URL}/${fileName}`.replace(/([^:]\/)\/+/g, '$1');
                      const label = fileName.split('/').pop();

                      return (
                        <li key={fileName}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {label || fileName}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span>No attachments uploaded.</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Follow-up &amp; Resolution</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="damageStatus" className="block text-sm font-medium text-gray-700">
                  Damage Status
                </label>
                <select
                  id="damageStatus"
                  name="damageStatus"
                  value={formData.damageStatus}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorityLevels.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="supervisorStatus" className="block text-sm font-medium text-gray-700">
                  Supervisor Review Status
                </label>
                <select
                  id="supervisorStatus"
                  name="supervisorStatus"
                  value={formData.supervisorStatus}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {supervisorStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="immediateAction" className="block text-sm font-medium text-gray-700">
                  Immediate Action Taken
                </label>
                <select
                  id="immediateAction"
                  name="immediateAction"
                  value={formData.immediateAction}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an action (optional)</option>
                  {immediateActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="assignedVendor" className="block text-sm font-medium text-gray-700">
                  Assigned Mechanic / Vendor
                </label>
                <input
                  id="assignedVendor"
                  name="assignedVendor"
                  value={formData.assignedVendor}
                  onChange={handleChange}
                  type="text"
                  placeholder="Vendor or shop handling repairs"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="repairDate" className="block text-sm font-medium text-gray-700">
                  Repair Completion Date
                </label>
                <input
                  id="repairDate"
                  name="repairDate"
                  value={formData.repairDate}
                  onChange={handleChange}
                  type="date"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="repairCost" className="block text-sm font-medium text-gray-700">
                  Repair Cost (USD)
                </label>
                <input
                  id="repairCost"
                  name="repairCost"
                  value={formData.repairCost}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter cost or leave blank"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="managerNotes" className="block text-sm font-medium text-gray-700">
                Fleet Manager Notes
              </label>
              <textarea
                id="managerNotes"
                name="managerNotes"
                value={formData.managerNotes}
                onChange={handleChange}
                rows={4}
                placeholder="Document approvals, vendor updates, or next steps."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="inline-flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                name="notifyTeam"
                checked={formData.notifyTeam}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Send notifications to fleet management team</span>
            </label>

            {submitStatus.message && (
              <div className={`${messageClassName} border-l-4 rounded-md p-4`}>{submitStatus.message}</div>
            )}

            <div className="flex justify-end gap-3">
              <Link
                to="/damage-reports"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default DamageReportDetailPage;
