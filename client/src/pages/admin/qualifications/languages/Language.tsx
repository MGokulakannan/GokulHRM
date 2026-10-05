import { Languages } from "lucide-react";
import CatalogPage from "../../../../components/admin/CatalogPage";
import { languageApi } from "../../../../services/catalogService";
import type { NamedItem } from "../../../../services/catalogService";

const fields = [
  { name: "name", label: "Language", required: true, maxLength: 120, placeholder: "e.g. English" },
  { name: "description", label: "Description", type: "textarea" as const, maxLength: 500 },
];

const columns = [
  { header: "Language", render: (row: NamedItem) => row.name },
  { header: "Description", wrap: true, render: (row: NamedItem) => row.description || "-" },
];

const searchKeys = ["name", "description"];

const Language = () => (
  <CatalogPage<NamedItem>
    section="Qualifications"
    title="Languages"
    description="Languages employees can speak, read or write"
    singular="Language"
    plural="languages"
    icon={<Languages size={16} />}
    api={languageApi}
    fields={fields}
    columns={columns}
    searchKeys={searchKeys}
    starterDataLabel="Load common languages"
  />
);

export default Language;
