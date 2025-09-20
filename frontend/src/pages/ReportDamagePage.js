import React, { useState } from "react";
import axios from "axios";
import {
  damageAreas,
  severityLevels,
  damageCauses,
  immediateActions,
  statusOptions,
  supervisorStatuses,
  priorityLevels,
} from "../constants/damageReportOptions";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const createInitialFormData = () => ({
  unitId: "",
  licensePlate: "",
  incidentDateTime: "",
  location: "",
  crew: "",
  shift: "",
  damageArea: "",
  severity: "",
  damageCause: "",
  description: "",
  weather: "",
  thirdParties: "",
  policeReportNumber: "",
  witnesses: "",
  immediateAction: "",
  damageStatus: statusOptions[0],
  repairCost: "",
  assignedVendor: "",
  repairDate: "",
  insuranceClaimFiled: false,
  insuranceClaimNumber: "",
  reportedBy: "",
  supervisorStatus: supervisorStatuses[0],
  priority: priorityLevels[1],
  managerNotes: "",
  notifyTeam: true,
});

const ReportDamagePage = () => {
  const [formData, setFormData] = useState(createInitialFormData);
  const [attachments, setAttachments] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const getFieldClasses = (field, extra = "") => {
    const baseClasses = "mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2";
    const stateClasses = errors[field]
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";

    return [baseClasses, stateClasses, extra].filter(Boolean).join(" ");
  };

  const messageClassName =
    submitStatus.type === "success"
      ? "border-green-400 bg-green-50 text-green-700"
      : submitStatus.type === "error"
      ? "border-red-400 bg-red-50 text-red-700"
      : "border-blue-400 bg-blue-50 text-blue-700";

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.unitId.trim()) {
      nextErrors.unitId = "Unit ID is required.";
    }

    if (!formData.incidentDateTime) {
      nextErrors.incidentDateTime = "Date and time of the incident is required.";
    }

    if (!formData.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!formData.damageArea) {
      nextErrors.damageArea = "Select the damaged area.";
    }

    if (!formData.severity) {
      nextErrors.severity = "Select the damage severity.";
    }

    if (!formData.damageCause) {
      nextErrors.damageCause = "Select the damage cause.";
    }

    if (!formData.description.trim()) {
      nextErrors.description = "Add a brief description of the incident.";
    }

    if (!formData.reportedBy.trim()) {
      nextErrors.reportedBy = "Reporter name or ID is required.";
    }

    if (formData.repairCost && Number(formData.repairCost) < 0) {
      nextErrors.repairCost = "Repair cost cannot be negative.";
    }

    if (formData.insuranceClaimFiled && !formData.insuranceClaimNumber.trim()) {
      nextErrors.insuranceClaimNumber = "Add the insurance claim number or uncheck the box.";
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => {
      const nextValue = type === "checkbox" ? checked : value;
      const updated = { ...prev, [name]: nextValue };

      if (name === "insuranceClaimFiled" && !checked) {
        updated.insuranceClaimNumber = "";
      }

      return updated;
    });

    setErrors((prev) => {
      const shouldClearClaimNumber = name === "insuranceClaimFiled" && !checked && prev.insuranceClaimNumber;

      if (!prev[name] && !shouldClearClaimNumber) {
        return prev;
      }

      const next = { ...prev };
      delete next[name];

      if (shouldClearClaimNumber) {
        delete next.insuranceClaimNumber;
      }

      return next;
    });
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setAttachments(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      setSubmitStatus({
        type: "error",
        message: "Please fix the highlighted fields before submitting.",
      });
      return;
    }

    setErrors({});

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          payload.append(key, value ? "true" : "false");
          return;
        }

        if (value === undefined || value === null) {
          return;
        }

        if (value === "") {
          return;
        }

        payload.append(key, value);
      });

      if (!formData.insuranceClaimFiled) {
        payload.set("insuranceClaimFiled", "false");
        payload.delete("insuranceClaimNumber");
      } else if (formData.insuranceClaimNumber.trim() === "") {
        payload.delete("insuranceClaimNumber");
      }

      if (formData.repairCost === "") {
        payload.delete("repairCost");
      }

      attachments.forEach((file) => {
        payload.append("attachments", file);
      });

      await axios.post(`${API_BASE_URL}/api/damage-reports`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitStatus({
        type: "success",
        message: "Damage report submitted successfully.",
      });
      setFormData(createInitialFormData());
      setAttachments([]);
      formElement.reset();
    } catch (error) {
      console.error("Failed to submit damage report:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong while saving the report. Please try again.";

      setSubmitStatus({ type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Report Vehicle Damage</h1>
          <p className="mt-2 text-gray-600">
            Capture critical details about the incident to support maintenance, insurance, and operational follow-up.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Unit & Incident Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="unitId" className="block text-sm font-medium text-gray-700">
                  Unit ID / Vehicle Number
                </label>
                <input
                  id="unitId"
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleChange}
                  type="text"
                  placeholder="UMC-012"
                  className={getFieldClasses("unitId")}
                  aria-invalid={Boolean(errors.unitId)}
                  aria-describedby={errors.unitId ? "unitId-error" : undefined}
                />
                {errors.unitId && (
                  <p id="unitId-error" className="mt-1 text-sm text-red-600">
                    {errors.unitId}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
                  License Plate / VIN
                </label>
                <input
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  type="text"
                  placeholder="ABC-1234"
                  className={getFieldClasses("licensePlate")}
                />
              </div>
              <div>
                <label htmlFor="incidentDateTime" className="block text-sm font-medium text-gray-700">
                  Date &amp; Time of Incident
                </label>
                <input
                  id="incidentDateTime"
                  name="incidentDateTime"
                  value={formData.incidentDateTime}
                  onChange={handleChange}
                  type="datetime-local"
                  className={getFieldClasses("incidentDateTime")}
                  aria-invalid={Boolean(errors.incidentDateTime)}
                  aria-describedby={errors.incidentDateTime ? "incidentDateTime-error" : undefined}
                />
                {errors.incidentDateTime && (
                  <p id="incidentDateTime-error" className="mt-1 text-sm text-red-600">
                    {errors.incidentDateTime}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location of Incident
                </label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  type="text"
                  placeholder="123 Main St, El Paso, TX"
                  className={getFieldClasses("location")}
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={errors.location ? "location-error" : undefined}
                />
                {errors.location && (
                  <p id="location-error" className="mt-1 text-sm text-red-600">
                    {errors.location}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="crew" className="block text-sm font-medium text-gray-700">
                  Crew Assigned
                </label>
                <input
                  id="crew"
                  name="crew"
                  value={formData.crew}
                  onChange={handleChange}
                  type="text"
                  placeholder="A. Flores, M. Garcia"
                  className={getFieldClasses("crew")}
                />
              </div>
              <div>
                <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
                  Shift
                </label>
                <input
                  id="shift"
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  type="text"
                  placeholder="Night Shift"
                  className={getFieldClasses("shift")}
                />
              </div>
            </div>
          </section>

          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Damage Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="damageArea" className="block text-sm font-medium text-gray-700">
                  Part / Area Damaged
                </label>
                <select
                  id="damageArea"
                  name="damageArea"
                  value={formData.damageArea}
                  onChange={handleChange}
                  className={getFieldClasses("damageArea", "bg-white")}
                  aria-invalid={Boolean(errors.damageArea)}
                  aria-describedby={errors.damageArea ? "damageArea-error" : undefined}
                >
                  <option value="">Select an area</option>
                  {damageAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                {errors.damageArea && (
                  <p id="damageArea-error" className="mt-1 text-sm text-red-600">
                    {errors.damageArea}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                  Severity of Damage
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className={getFieldClasses("severity", "bg-white")}
                  aria-invalid={Boolean(errors.severity)}
                  aria-describedby={errors.severity ? "severity-error" : undefined}
                >
                  <option value="">Select severity</option>
                  {severityLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.severity && (
                  <p id="severity-error" className="mt-1 text-sm text-red-600">
                    {errors.severity}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="damageCause" className="block text-sm font-medium text-gray-700">
                  Cause of Damage
                </label>
                <select
                  id="damageCause"
                  name="damageCause"
                  value={formData.damageCause}
                  onChange={handleChange}
                  className={getFieldClasses("damageCause", "bg-white")}
                  aria-invalid={Boolean(errors.damageCause)}
                  aria-describedby={errors.damageCause ? "damageCause-error" : undefined}
                >
                  <option value="">Select a cause</option>
                  {damageCauses.map((cause) => (
                    <option key={cause} value={cause}>
                      {cause}
                    </option>
                  ))}
                </select>
                {errors.damageCause && (
                  <p id="damageCause-error" className="mt-1 text-sm text-red-600">
                    {errors.damageCause}
                  </p>
                )}
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
                  className={getFieldClasses("immediateAction", "bg-white")}
                >
                  <option value="">Select an action</option>
                  {immediateActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Detailed Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Provide a detailed account of the damage and incident circumstances."
                className={getFieldClasses("description")}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "description-error" : undefined}
              />
              {errors.description && (
                <p id="description-error" className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>
            <div className="mt-4">
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
                Upload Photos / Documents
              </label>
              <input
                id="attachments"
                name="attachments"
                onChange={handleFileChange}
                type="file"
                multiple
                className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
              />
              {attachments.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">{attachments.length} file(s) selected</p>
              )}
            </div>
          </section>

          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Incident Circumstances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="weather" className="block text-sm font-medium text-gray-700">
                  Weather / Road Conditions
                </label>
                <input
                  id="weather"
                  name="weather"
                  value={formData.weather}
                  onChange={handleChange}
                  type="text"
                  placeholder="Rainy, slick roads"
                  className={getFieldClasses("weather")}
                />
              </div>
              <div>
                <label htmlFor="policeReportNumber" className="block text-sm font-medium text-gray-700">
                  Police / Incident Report Number
                </label>
                <input
                  id="policeReportNumber"
                  name="policeReportNumber"
                  value={formData.policeReportNumber}
                  onChange={handleChange}
                  type="text"
                  placeholder="TX-45873"
                  className={getFieldClasses("policeReportNumber")}
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="thirdParties" className="block text-sm font-medium text-gray-700">
                Third Parties Involved (names, contact info)
              </label>
              <textarea
                id="thirdParties"
                name="thirdParties"
                value={formData.thirdParties}
                onChange={handleChange}
                rows={3}
                placeholder="Include other drivers, property owners, or agencies involved."
                className={getFieldClasses("thirdParties")}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="witnesses" className="block text-sm font-medium text-gray-700">
                Witness Information
              </label>
              <textarea
                id="witnesses"
                name="witnesses"
                value={formData.witnesses}
                onChange={handleChange}
                rows={3}
                placeholder="Include names, phone numbers, and statements."
                className={getFieldClasses("witnesses")}
              />
            </div>
          </section>

          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Repair &amp; Follow-Up</h2>
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
                  className={getFieldClasses("damageStatus", "bg-white")}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="repairCost" className="block text-sm font-medium text-gray-700">
                  Estimated Repair Cost
                </label>
                <input
                  id="repairCost"
                  name="repairCost"
                  value={formData.repairCost}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1500"
                  className={getFieldClasses("repairCost")}
                  aria-invalid={Boolean(errors.repairCost)}
                  aria-describedby={errors.repairCost ? "repairCost-error" : undefined}
                />
                {errors.repairCost && (
                  <p id="repairCost-error" className="mt-1 text-sm text-red-600">
                    {errors.repairCost}
                  </p>
                )}
              </div>
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
                  placeholder="City Fleet Services"
                  className={getFieldClasses("assignedVendor")}
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
                  className={getFieldClasses("repairDate")}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="insuranceClaimFiled"
                  checked={formData.insuranceClaimFiled}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Insurance claim filed?</span>
              </label>
              <input
                id="insuranceClaimNumber"
                name="insuranceClaimNumber"
                value={formData.insuranceClaimFiled ? formData.insuranceClaimNumber : ""}
                onChange={handleChange}
                type="text"
                placeholder="Claim #"
                className={getFieldClasses("insuranceClaimNumber")}
                disabled={!formData.insuranceClaimFiled}
                aria-invalid={Boolean(errors.insuranceClaimNumber)}
                aria-describedby={errors.insuranceClaimNumber ? "insuranceClaimNumber-error" : undefined}
              />
            </div>
            {errors.insuranceClaimNumber && (
              <p id="insuranceClaimNumber-error" className="mt-1 text-sm text-red-600">
                {errors.insuranceClaimNumber}
              </p>
            )}
          </section>

          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Administrative Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reportedBy" className="block text-sm font-medium text-gray-700">
                  Reported By
                </label>
                <input
                  id="reportedBy"
                  name="reportedBy"
                  value={formData.reportedBy}
                  onChange={handleChange}
                  type="text"
                  placeholder="Driver ID or name"
                  className={getFieldClasses("reportedBy")}
                  aria-invalid={Boolean(errors.reportedBy)}
                  aria-describedby={errors.reportedBy ? "reportedBy-error" : undefined}
                />
                {errors.reportedBy && (
                  <p id="reportedBy-error" className="mt-1 text-sm text-red-600">
                    {errors.reportedBy}
                  </p>
                )}
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
                  className={getFieldClasses("supervisorStatus", "bg-white")}
                >
                  {supervisorStatuses.map((status) => (
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
                  className={getFieldClasses("priority", "bg-white")}
                >
                  {priorityLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="managerNotes" className="block text-sm font-medium text-gray-700">
                Fleet Manager Notes
              </label>
              <textarea
                id="managerNotes"
                name="managerNotes"
                value={formData.managerNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Internal remarks or follow-up reminders."
                className={getFieldClasses("managerNotes")}
              />
            </div>
            <div className="mt-4">
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
            </div>
          </section>

          {submitStatus.message && (
            <div
              className={`${messageClassName} border-l-4 rounded-md p-4`}
              role="alert"
            >
              {submitStatus.message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Submit Damage Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportDamagePage;
