import type { ReactNode } from "react";
import "./EmptyState.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="gh-empty-state">
    {icon && <div className="gh-empty-icon">{icon}</div>}
    <strong>{title}</strong>
    {description && <p>{description}</p>}
    {action && <div className="gh-empty-action">{action}</div>}
  </div>
);

export default EmptyState;
