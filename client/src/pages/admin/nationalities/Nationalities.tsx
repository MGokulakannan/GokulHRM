import { Flag } from "lucide-react";
import CatalogPage from "../../../components/admin/CatalogPage";
import { nationalityApi } from "../../../services/catalogService";
import type { NamedItem } from "../../../services/catalogService";

const fields = [
  { name: "name", label: "Nationality", required: true, maxLength: 120, placeholder: "e.g. Indian" },
  { name: "description", label: "Description", type: "textarea" as const, maxLength: 500 },
];

const columns = [
  { header: "Nationality", render: (row: NamedItem) => row.name },
  { header: "Description", wrap: true, render: (row: NamedItem) => row.description || "-" },
];

const searchKeys = ["name", "description"];

const Nationalities = () => (
  <CatalogPage<NamedItem>
    section="Nationalities"
    title="Nationalities"
    description="Nationalities available when recording employee details"
    singular="Nationality"
    plural="nationalities"
    icon={<Flag size={16} />}
    api={nationalityApi}
    fields={fields}
    columns={columns}
    searchKeys={searchKeys}
    starterDataLabel="Load common nationalities"
  />
);

export default Nationalities;
