import "./StatusBadge.css";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneByStatus: Record<string, StatusTone> = {
  active: "success",
  approved: "success",
  present: "success",
  completed: "success",
  open: "success",
  hired: "success",
  pending: "warning",
  "on hold": "warning",
  "in progress": "warning",
  "interview scheduled": "warning",
  shortlisted: "info",
  applied: "info",
  interviewed: "info",
  inactive: "danger",
  rejected: "danger",
  absent: "danger",
  closed: "danger",
  leave: "neutral",
  "not started": "neutral",
  "not marked": "neutral",
};

interface StatusBadgeProps {
  status: string;
  tone?: StatusTone;
}

const StatusBadge = ({ status, tone }: StatusBadgeProps) => {
  const resolvedTone = tone || toneByStatus[status.toLowerCase()] || "neutral";

  return <span className={`gh-status-badge gh-status-${resolvedTone}`}>{status}</span>;
};

export default StatusBadge;
