import { GraduationCap } from "lucide-react";
import CatalogPage from "../../../../components/admin/CatalogPage";
import { educationApi } from "../../../../services/catalogService";
import type { NamedItem } from "../../../../services/catalogService";

const fields = [
  { name: "name", label: "Education level", required: true, maxLength: 120, placeholder: "e.g. Master's Degree" },
  { name: "description", label: "Description", type: "textarea" as const, maxLength: 500 },
];

const columns = [
  { header: "Education level", render: (row: NamedItem) => row.name },
  { header: "Description", wrap: true, render: (row: NamedItem) => row.description || "-" },
];

const searchKeys = ["name", "description"];

const Education = () => (
  <CatalogPage<NamedItem>
    section="Qualifications"
    title="Education"
    description="Education levels and degrees recognised by your company"
    singular="Education level"
    plural="education levels"
    icon={<GraduationCap size={16} />}
    api={educationApi}
    fields={fields}
    columns={columns}
    searchKeys={searchKeys}
    starterDataLabel="Load standard levels"
  />
);

export default Education;
