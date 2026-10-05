import { Clock } from "lucide-react";
import CatalogPage from "../../../../components/admin/CatalogPage";
import { workShiftApi } from "../../../../services/catalogService";
import type { WorkShift } from "../../../../services/catalogService";

const fields = [
  { name: "name", label: "Shift name", required: true, maxLength: 120, full: true, placeholder: "e.g. General Shift" },
  { name: "startTime", label: "Start time", type: "time" as const, required: true, defaultValue: "09:00" },
  { name: "endTime", label: "End time", type: "time" as const, required: true, defaultValue: "18:00" },
  { name: "breakMinutes", label: "Unpaid break (minutes)", type: "number" as const, min: 0, max: 480, defaultValue: "60" },
  { name: "description", label: "Description", type: "textarea" as const, maxLength: 500 },
];

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Paid hours for the shift; an end time earlier than the start means it runs overnight.
const paidHours = (shift: WorkShift) => {
  let span = toMinutes(shift.endTime) - toMinutes(shift.startTime);
  if (span <= 0) span += 24 * 60;

  const minutes = Math.max(0, span - (shift.breakMinutes || 0));
  return `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`;
};

const columns = [
  { header: "Shift", render: (row: WorkShift) => row.name },
  { header: "Timing", render: (row: WorkShift) => `${row.startTime} – ${row.endTime}` },
  { header: "Break", render: (row: WorkShift) => `${row.breakMinutes ?? 0} min` },
  { header: "Paid hours", render: paidHours },
];

const searchKeys = ["name", "startTime", "endTime"];

const WorkShifts = () => (
  <CatalogPage<WorkShift>
    section="Job"
    title="Work Shifts"
    description="Define the working hours assigned to employees"
    singular="Work shift"
    plural="work shifts"
    icon={<Clock size={16} />}
    api={workShiftApi}
    fields={fields}
    columns={columns}
    searchKeys={searchKeys}
  />
);

export default WorkShifts;
