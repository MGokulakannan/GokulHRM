import type { ReactNode } from "react";
import "./PageHeader.css";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

const PageHeader = ({ title, description, actions, meta }: PageHeaderProps) => (
  <div className="gh-page-header">
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {meta && <div className="gh-page-header-meta">{meta}</div>}
    </div>
    {actions && <div className="gh-page-header-actions">{actions}</div>}
  </div>
);

export default PageHeader;
