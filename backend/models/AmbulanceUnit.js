const mongoose = require('mongoose');

const AmbulanceUnitSchema = new mongoose.Schema({
  unitNumber: { type: String, required: true, unique: true },
  mileage: { type: Number, required: true },
  oilChangeDueAt: { type: Number },
  inspectionDate: { type: Date },
  stretcherType: { type: String, enum: ['Stryker', 'Ferno', 'Power', 'Other'] },

  cleanliness: {
    interior: { type: String, enum: ['Clean', 'Dirty', 'Needs Attention'], default: 'Clean' },
    exterior: { type: String, enum: ['Clean', 'Dirty', 'Needs Attention'], default: 'Clean' },
  },

  lightsAndSirensStatus: { type: String, enum: ['Working', 'Needs Repair'], default: 'Working' },
  isOperational: { type: Boolean, default: true },

  // Functionality checks
  systemsCheck: {
    acHeater: { type: String, enum: ['Working', 'Needs Repair'], default: 'Working' },
    suction: { type: String, enum: ['Working', 'Needs Repair'], default: 'Working' },
    inverter: { type: String, enum: ['Working', 'Needs Repair'], default: 'Working' },
    oxygenTank: { type: String, enum: ['Working', 'Needs Repair'], default: 'Working' }
  },

  // Fluid levels
  fluidLevels: {
    engineOil: { type: String, enum: ['Full', 'Low', 'Empty', 'N/A'], default: 'Full' },
    coolant: { type: String, enum: ['Full', 'Low', 'Empty', 'N/A'], default: 'Full' },
    windshieldWiper: { type: String, enum: ['Full', 'Low', 'Empty', 'N/A'], default: 'Full' },
    dot: { type: String, enum: ['Full', 'Low', 'Empty', 'N/A'], default: 'Full' },
    powerSteering: { type: String, enum: ['Full', 'Low', 'Empty', 'N/A'], default: 'Full' },
    transmission: { type: String, enum: ['Full', 'Low', 'Empty', 'N/A'], default: 'N/A' } // Some units may not have a dipstick
  },

  tireHealth: {
    frontLeft: { type: String, enum: ['Good', 'Worn', 'Needs Replacement'], default: 'Good' },
    frontRight: { type: String, enum: ['Good', 'Worn', 'Needs Replacement'], default: 'Good' },
    rearLeft: { type: String, enum: ['Good', 'Worn', 'Needs Replacement'], default: 'Good' },
    rearRight: { type: String, enum: ['Good', 'Worn', 'Needs Replacement'], default: 'Good' },
    spare: { type: String, enum: ['Good', 'Worn', 'Needs Replacement', 'None'], default: 'Good' }
  },

  damageReports: [{ type: String }],
  issues: [{ type: String }],
  equipment: [{
    name: String,
    expirationDate: Date,
    isExpired: Boolean
  }]
}, { timestamps: true });

module.exports = mongoose.model('AmbulanceUnit', AmbulanceUnitSchema);
