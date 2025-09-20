const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const DamageReport = require('../models/DamageReport');
const AmbulanceUnit = require('../models/AmbulanceUnit');

const router = express.Router();

const uploadsRoot = path.join(__dirname, '..', 'uploads', 'damage_reports');
fs.mkdirSync(uploadsRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsRoot);
  },
  filename: (_req, file, callback) => {
    const safeName = file.originalname ? file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_') : 'attachment';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(safeName);
    callback(null, `${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024,
  },
});

const HIGH_SEVERITY = new Set(['Major', 'Critical']);

const toArray = (value) => {
  if (!value && value !== 0) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value];
};

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return defaultValue;
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normaliseString = (value) => (typeof value === 'string' ? value.trim() : value);

const getAttachmentPaths = (files) =>
  (files || []).map((file) => path.posix.join('uploads/damage_reports', file.filename));

const buildReportPayload = (body, files, options = {}) => {
  const { useDefaults = true } = options;
  const payload = {};

  const withDefault = (value, fallback) => {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
    return useDefaults ? fallback : undefined;
  };

  const assignIfPresent = (key, rawValue, { allowEmpty = false } = {}) => {
    const value = normaliseString(rawValue);
    if (value || allowEmpty) {
      payload[key] = allowEmpty ? value ?? '' : value;
    }
  };

  assignIfPresent('unitId', body.unitId);
  assignIfPresent('licensePlate', body.licensePlate);

  const incidentDate = parseDate(body.incidentDateTime);
  if (incidentDate) {
    payload.incidentDateTime = incidentDate;
  } else if (useDefaults && body.incidentDateTime) {
    payload.incidentDateTime = body.incidentDateTime;
  }

  assignIfPresent('location', body.location);
  assignIfPresent('crew', body.crew);
  assignIfPresent('shift', body.shift);
  assignIfPresent('damageArea', body.damageArea);
  assignIfPresent('severity', body.severity);
  assignIfPresent('damageCause', body.damageCause);
  assignIfPresent('description', body.description);
  assignIfPresent('weather', body.weather);
  assignIfPresent('thirdParties', body.thirdParties);
  assignIfPresent('policeReportNumber', body.policeReportNumber);
  assignIfPresent('witnesses', body.witnesses);
  assignIfPresent('immediateAction', body.immediateAction);

  const damageStatus = withDefault(normaliseString(body.damageStatus), 'Reported');
  if (damageStatus !== undefined) {
    payload.damageStatus = damageStatus;
  }

  const supervisorStatus = withDefault(normaliseString(body.supervisorStatus), 'Pending review');
  if (supervisorStatus !== undefined) {
    payload.supervisorStatus = supervisorStatus;
  }

  const priority = withDefault(normaliseString(body.priority), 'Moderate');
  if (priority !== undefined) {
    payload.priority = priority;
  }

  const repairCost = parseNumber(body.repairCost);
  if (repairCost !== null) {
    payload.repairCost = repairCost;
  }

  const repairDate = parseDate(body.repairDate);
  if (repairDate) {
    payload.repairDate = repairDate;
  }

  assignIfPresent('assignedVendor', body.assignedVendor);
  assignIfPresent('managerNotes', body.managerNotes, { allowEmpty: true });

  const insuranceClaimFiled = withDefault(parseBoolean(body.insuranceClaimFiled, false), false);
  if (insuranceClaimFiled !== undefined) {
    payload.insuranceClaimFiled = insuranceClaimFiled;
  }

  if (insuranceClaimFiled) {
    assignIfPresent('insuranceClaimNumber', body.insuranceClaimNumber);
  }

  assignIfPresent('reportedBy', body.reportedBy);

  if (Object.prototype.hasOwnProperty.call(body, 'notifyTeam') || useDefaults) {
    payload.notifyTeam = parseBoolean(body.notifyTeam, true);
  }

  const attachmentsFromFiles = getAttachmentPaths(files);
  if (attachmentsFromFiles.length) {
    payload.attachments = attachmentsFromFiles;
  } else if (body.attachments) {
    try {
      const parsedAttachments = JSON.parse(body.attachments);
      if (Array.isArray(parsedAttachments)) {
        payload.attachments = parsedAttachments;
      } else {
        payload.attachments = toArray(body.attachments);
      }
    } catch (_) {
      payload.attachments = toArray(body.attachments);
    }
  }

  if (!payload.repairDate && !Object.prototype.hasOwnProperty.call(body, 'repairDate')) {
    delete payload.repairDate;
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === '') {
      delete payload[key];
    }
  });

  return payload;
};

const shouldMarkOutOfService = (report, forceFlag) => {
  if (forceFlag) {
    return true;
  }

  if (!report) {
    return false;
  }

  return (
    HIGH_SEVERITY.has(report.severity) ||
    report.damageStatus === 'In repair' ||
    report.damageStatus === 'Under inspection' ||
    report.immediateAction === 'Removed from service'
  );
};

const pruneEmptyOperators = (operators) =>
  Object.entries(operators).reduce((acc, [operator, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const entries = Object.entries(value).filter(([_, inner]) => {
        if (inner === undefined || inner === null) {
          return false;
        }

        if (typeof inner === 'string') {
          return inner.trim().length > 0;
        }

        if (Array.isArray(inner)) {
          return inner.length > 0;
        }

        if (typeof inner === 'object') {
          return Object.keys(inner).length > 0;
        }

        return true;
      });

      if (entries.length > 0) {
        acc[operator] = Object.fromEntries(entries);
      }

      return acc;
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return acc;
    }

    if (Array.isArray(value) && value.length === 0) {
      return acc;
    }

    acc[operator] = value;
    return acc;
  }, {});

const buildUnitUpdate = (report, options = {}) => {
  if (!report || !report._id) {
    return {};
  }

  const update = {
    $addToSet: { damageReports: report._id.toString() },
  };

  if (options.summary) {
    update.$push = { issues: options.summary };
  }

  if (options.restoreOperation) {
    update.$set = { ...update.$set, isOperational: true };
  } else if (shouldMarkOutOfService(report, options.forceOutOfService)) {
    update.$set = { ...update.$set, isOperational: false };
  }

  return pruneEmptyOperators(update);
};

const buildListFilter = (query) => {
  const clauses = [];

  const severity = toArray(query.severity);
  if (severity.length) {
    clauses.push({ severity: { $in: severity } });
  }

  const status = toArray(query.status || query.damageStatus);
  if (status.length) {
    clauses.push({ damageStatus: { $in: status } });
  }

  const priority = toArray(query.priority);
  if (priority.length) {
    clauses.push({ priority: { $in: priority } });
  }

  const unitId = normaliseString(query.unitId);
  if (unitId) {
    clauses.push({ unitId });
  }

  const reportedBy = normaliseString(query.reportedBy);
  if (reportedBy) {
    clauses.push({ reportedBy });
  }

  const dateRange = {};
  const fromDate = parseDate(query.dateFrom);
  if (fromDate) {
    dateRange.$gte = fromDate;
  }
  const toDate = parseDate(query.dateTo);
  if (toDate) {
    dateRange.$lte = toDate;
  }
  if (Object.keys(dateRange).length) {
    clauses.push({ incidentDateTime: dateRange });
  }

  const searchTerm = normaliseString(query.search);
  if (searchTerm) {
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    clauses.push({
      $or: [
        { unitId: regex },
        { licensePlate: regex },
        { damageArea: regex },
        { damageStatus: regex },
        { priority: regex },
        { severity: regex },
        { reportedBy: regex },
        { immediateAction: regex },
      ],
    });
  }

  return clauses.length ? { $and: clauses } : {};
};

// @route   POST /api/damage-reports
// @desc    Create a new damage report
router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    const payload = buildReportPayload(req.body, req.files);

    const report = await DamageReport.create(payload);

    if (report.unitId) {
      const summary = `New damage report recorded (${report.severity}) for unit ${report.unitId}`;
      const unitUpdate = buildUnitUpdate(report, { summary });

      if (Object.keys(unitUpdate).length > 0) {
        try {
          await AmbulanceUnit.findOneAndUpdate({ unitNumber: report.unitId }, unitUpdate);
        } catch (unitError) {
          console.error(`Failed to sync damage report ${report._id} to unit ${report.unitId}:`, unitError.message);
        }
      }
    }

    console.info(`Damage report ${report._id} recorded for unit ${report.unitId || 'unknown'}.`);

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: 'Error creating damage report', error: error.message });
  }
});

// @route   GET /api/damage-reports
// @desc    List damage reports (most recent first)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = buildListFilter(req.query);

    const [reports, total] = await Promise.all([
      DamageReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DamageReport.countDocuments(filter),
    ]);

    res.json({
      reports,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      totalReports: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching damage reports', error: error.message });
  }
});

// @route   GET /api/damage-reports/:id
// @desc    Fetch a specific damage report
router.get('/:id', async (req, res) => {
  try {
    const report = await DamageReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Damage report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching damage report', error: error.message });
  }
});

// @route   PATCH /api/damage-reports/:id
// @desc    Update a damage report (status, follow-up details, etc.)
router.patch('/:id', upload.array('attachments'), async (req, res) => {
  try {
    const report = await DamageReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Damage report not found' });
    }

    const previousState = {
      damageStatus: report.damageStatus,
      supervisorStatus: report.supervisorStatus,
      priority: report.priority,
    };

    if (Object.prototype.hasOwnProperty.call(req.body, 'damageStatus')) {
      const value = normaliseString(req.body.damageStatus);
      if (value) {
        report.damageStatus = value;
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'supervisorStatus')) {
      const value = normaliseString(req.body.supervisorStatus);
      if (value) {
        report.supervisorStatus = value;
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'priority')) {
      const value = normaliseString(req.body.priority);
      if (value) {
        report.priority = value;
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'managerNotes')) {
      const value = normaliseString(req.body.managerNotes);
      report.managerNotes = value || undefined;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'notifyTeam')) {
      report.notifyTeam = parseBoolean(req.body.notifyTeam, report.notifyTeam);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'repairDate')) {
      const parsed = parseDate(req.body.repairDate);
      report.repairDate = parsed || null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'repairCost')) {
      const parsed = parseNumber(req.body.repairCost);
      if (parsed === null) {
        report.repairCost = undefined;
      } else {
        report.repairCost = parsed;
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'assignedVendor')) {
      const value = normaliseString(req.body.assignedVendor);
      report.assignedVendor = value || undefined;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'immediateAction')) {
      const value = normaliseString(req.body.immediateAction);
      report.immediateAction = value || undefined;
    }

    const newAttachments = getAttachmentPaths(req.files);
    if (newAttachments.length) {
      report.attachments = [...(report.attachments || []), ...newAttachments];
    }

    await report.save();

    if (report.unitId) {
      const summaryParts = [];

      if (previousState.damageStatus !== report.damageStatus) {
        summaryParts.push(`status -> ${report.damageStatus}`);
      }
      if (previousState.supervisorStatus !== report.supervisorStatus) {
        summaryParts.push(`supervisor review -> ${report.supervisorStatus}`);
      }
      if (previousState.priority !== report.priority) {
        summaryParts.push(`priority -> ${report.priority}`);
      }

      const summary = summaryParts.length > 0
        ? `Damage report ${report._id} updated (${summaryParts.join(', ')})`
        : undefined;

      const unitUpdateOptions = { summary };

      if (previousState.damageStatus !== report.damageStatus) {
        if (report.damageStatus === 'Resolved') {
          unitUpdateOptions.restoreOperation = true;
        } else {
          unitUpdateOptions.forceOutOfService = true;
        }
      }

      const unitUpdate = buildUnitUpdate(report, unitUpdateOptions);

      if (Object.keys(unitUpdate).length > 0) {
        try {
          await AmbulanceUnit.findOneAndUpdate({ unitNumber: report.unitId }, unitUpdate);
        } catch (unitError) {
          console.error(`Failed to update unit ${report.unitId} for damage report ${report._id}:`, unitError.message);
        }
      }
    }

    res.json(report);
  } catch (error) {
    res.status(400).json({ message: 'Error updating damage report', error: error.message });
  }
});

module.exports = router;
