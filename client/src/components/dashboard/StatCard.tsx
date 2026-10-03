import type { ReactNode } from "react";
import "./StatCard.css";

export type StatTone = "primary" | "success" | "warning" | "info" | "accent";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone?: StatTone;
  trend?: {
    direction: "up" | "down";
    label: string;
  };
}

const StatCard = ({ icon, label, value, tone = "primary", trend }: StatCardProps) => (
  <div className="gh-stat-card">
    <div className={`gh-stat-icon gh-stat-icon-${tone}`}>{icon}</div>
    <div className="gh-stat-body">
      <div className={`gh-stat-value ${typeof value === "string" ? "gh-stat-value-text" : ""}`}>{value}</div>
      <div className="gh-stat-label">{label}</div>
    </div>
    {trend && (
      <span className={`gh-stat-trend gh-stat-trend-${trend.direction}`}>
        {trend.direction === "up" ? "↑" : "↓"} {trend.label}
      </span>
    )}
  </div>
);

export default StatCard;
