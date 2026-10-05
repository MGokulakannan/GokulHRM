import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHeader from "../layout/PageHeader";
import "./AdminPage.css";

interface AdminPageHeaderProps {
  section: string; // e.g. "Qualifications"
  title: string;
  description: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

// PageHeader for every Organization sub-page, with a way back to the hub.
const AdminPageHeader = ({ section, title, description, actions, meta }: AdminPageHeaderProps) => (
  <PageHeader
    title={title}
    description={description}
    actions={actions}
    meta={
      <span className="adm-meta">
        <Link to="/admin" className="adm-back-link">
          <ArrowLeft size={13} /> Organization
        </Link>
        <span className="adm-crumb-sep">/</span>
        <span>{section}</span>
        {meta}
      </span>
    }
  />
);

export default AdminPageHeader;
