import { Wrench } from "lucide-react";
import CatalogPage from "../../../../components/admin/CatalogPage";
import { skillApi } from "../../../../services/catalogService";
import type { NamedItem } from "../../../../services/catalogService";

const fields = [
  { name: "name", label: "Skill", required: true, maxLength: 120, placeholder: "e.g. Project Management" },
  { name: "description", label: "Description", type: "textarea" as const, maxLength: 500 },
];

const columns = [
  { header: "Skill", render: (row: NamedItem) => row.name },
  { header: "Description", wrap: true, render: (row: NamedItem) => row.description || "-" },
];

const searchKeys = ["name", "description"];

const Skills = () => (
  <CatalogPage<NamedItem>
    section="Qualifications"
    title="Skills"
    description="Skills and competencies your employees can hold"
    singular="Skill"
    plural="skills"
    icon={<Wrench size={16} />}
    api={skillApi}
    fields={fields}
    columns={columns}
    searchKeys={searchKeys}
    starterDataLabel="Load common skills"
  />
);

export default Skills;
