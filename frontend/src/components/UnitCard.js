import React, { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const formatNumber = (value) =>
  typeof value === "number" ? value.toLocaleString() : "--";

const SectionHeader = ({
  label,
  isOpen,
  onToggle,
  description,
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex w-full items-center justify-between text-left"
    aria-expanded={isOpen}
  >
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {description ? (
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      ) : null}
    </div>
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform duration-200 ease-in-out">
      <ChevronDownIcon
        className={`h-4 w-4 transform transition-transform duration-200 ${
          isOpen ? "rotate-180" : "rotate-0"
        }`}
      />
    </span>
  </button>
);

const CollapsibleSection = ({
  label,
  sectionKey,
  openSections,
  toggleSection,
  children,
  description,
}) => {
  const isOpen = openSections[sectionKey];

  return (
    <section className="border-t border-slate-200 pt-5">
      <SectionHeader
        label={label}
        description={description}
        isOpen={isOpen}
        onToggle={() => toggleSection(sectionKey)}
      />
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden pt-3 text-sm text-slate-600">
          {children}
        </div>
      </div>
    </section>
  );
};

const StatusBadge = ({ isOperational }) => {
  const style = isOperational
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
    : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}
    >
      {isOperational ? (
        <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
      )}
      {isOperational ? "Operational" : "Out of Service"}
    </span>
  );
};

const MaintenanceBadge = ({ oilChangeDueAt, mileage }) => {
  if (!oilChangeDueAt) {
    return null;
  }

  const milesRemaining = oilChangeDueAt - mileage;
  const isOverdue = milesRemaining <= 0;
  const label = isOverdue
    ? "Oil Change Due"
    : `${formatNumber(milesRemaining)} mi to oil change`;

  const style = isOverdue
    ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
    : "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}
    >
      <WrenchScrewdriverIcon className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
  );
};

const UnitCard = ({ unit, displayNumber }) => {
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

  const fluidEntries = useMemo(
    () => Object.entries(unit.fluidLevels || {}),
    [unit.fluidLevels]
  );

  const systemsEntries = useMemo(
    () => Object.entries(unit.systemsCheck || {}),
    [unit.systemsCheck]
  );

  const formattedUnitId = useMemo(
    () => displayNumber || unit.unitNumber || "Unassigned",
    [displayNumber, unit.unitNumber]
  );

  const secondaryId = useMemo(() => {
    if (!displayNumber || !unit.unitNumber || displayNumber === unit.unitNumber) {
      return null;
    }
    return unit.unitNumber;
  }, [displayNumber, unit.unitNumber]);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur transition-shadow duration-200 hover:shadow-md">
      <header>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Unit</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {formattedUnitId}
            </h2>
            {secondaryId ? (
              <p className="text-xs text-slate-400">Ref #{secondaryId}</p>
            ) : null}
            <p className="mt-2 text-sm text-slate-500">
              Mileage <span className="font-semibold text-slate-800">{formatNumber(unit.mileage)}</span> mi
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <StatusBadge isOperational={unit.isOperational} />
            <MaintenanceBadge
              oilChangeDueAt={unit.oilChangeDueAt}
              mileage={unit.mileage}
            />
          </div>
        </div>
      </header>

      <div className="mt-6 space-y-5">
        <CollapsibleSection
          label="Systems Check"
          sectionKey="systemsCheck"
          openSections={openSections}
          toggleSection={toggleSection}
        >
          {systemsEntries.length ? (
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {systemsEntries.map(([key, value]) => (
                <div key={key} className="rounded-md bg-slate-50 px-3 py-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </dt>
                  <dd className="mt-1 font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No system checks logged.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          label="Fluid Levels"
          sectionKey="fluidLevels"
          openSections={openSections}
          toggleSection={toggleSection}
        >
          {fluidEntries.length ? (
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {fluidEntries.map(([key, value]) => (
                <div key={key} className="rounded-md bg-slate-50 px-3 py-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </dt>
                  <dd className="mt-1 font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No fluid level data available.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          label="Damage Reports"
          description="Most recent issues reported by crews"
          sectionKey="damageReports"
          openSections={openSections}
          toggleSection={toggleSection}
        >
          {Array.isArray(unit.damageReports) && unit.damageReports.length ? (
            <ul className="space-y-2">
              {unit.damageReports.map((report, index) => (
                <li
                  key={`${report}-${index}`}
                  className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                >
                  {report}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No active damage reports.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          label="Expiring Equipment"
          description="Monitors supplies with upcoming expiration"
          sectionKey="equipment"
          openSections={openSections}
          toggleSection={toggleSection}
        >
          {Array.isArray(unit.equipment) && unit.equipment.length ? (
            <ul className="space-y-2">
              {unit.equipment.map((item, index) => {
                if (typeof item === "string") {
                  return (
                    <li
                      key={`${item}-${index}`}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {item}
                    </li>
                  );
                }

                const { name, expirationDate, isExpired } = item;

                return (
                  <li
                    key={`${name || "equipment"}-${index}`}
                    className="flex flex-col gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <span className="font-medium text-slate-900">{name || "Equipment"}</span>
                    <span className="text-xs text-slate-500">
                      Expires {expirationDate ? new Date(expirationDate).toLocaleDateString() : "N/A"}
                    </span>
                    {typeof isExpired === "boolean" ? (
                      <span
                        className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          isExpired
                            ? "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200"
                            : "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200"
                        }`}
                      >
                        {isExpired ? "Expired" : "In Date"}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No expiring equipment.</p>
          )}
        </CollapsibleSection>
      </div>
    </article>
  );
};

export default UnitCard;
