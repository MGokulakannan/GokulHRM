import type { ReactNode } from "react";
import "./Tooltip.css";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

// Lightweight CSS-only tooltip for icon-only buttons (row actions, etc).
const Tooltip = ({ label, children }: TooltipProps) => (
  <span className="gh-tooltip" data-tooltip={label}>
    {children}
  </span>
);

export default Tooltip;
