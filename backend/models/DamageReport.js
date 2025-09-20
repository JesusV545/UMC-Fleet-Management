const mongoose = require('mongoose');

const damageReportSchema = new mongoose.Schema(
  {
    unitId: { type: String, required: true, trim: true },
    licensePlate: { type: String, trim: true },
    incidentDateTime: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    crew: { type: String, trim: true },
    shift: { type: String, trim: true },
    damageArea: { type: String, required: true },
    severity: { type: String, required: true },
    damageCause: { type: String, required: true },
    description: { type: String, required: true },
    weather: { type: String, trim: true },
    thirdParties: { type: String, trim: true },
    policeReportNumber: { type: String, trim: true },
    witnesses: { type: String, trim: true },
    immediateAction: { type: String, trim: true },
    damageStatus: { type: String, default: 'Reported' },
    repairCost: { type: Number, min: 0 },
    assignedVendor: { type: String, trim: true },
    repairDate: { type: Date },
    insuranceClaimFiled: { type: Boolean, default: false },
    insuranceClaimNumber: { type: String, trim: true },
    reportedBy: { type: String, required: true, trim: true },
    supervisorStatus: { type: String, default: 'Pending review' },
    priority: { type: String, default: 'Moderate' },
    managerNotes: { type: String, trim: true },
    notifyTeam: { type: Boolean, default: true },
    attachments: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('DamageReport', damageReportSchema);
