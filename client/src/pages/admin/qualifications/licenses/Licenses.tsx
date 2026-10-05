import { BadgeCheck } from "lucide-react";
import CatalogPage from "../../../../components/admin/CatalogPage";
import { licenseApi } from "../../../../services/catalogService";
import type { NamedItem } from "../../../../services/catalogService";

const fields = [
  { name: "name", label: "License", required: true, maxLength: 120, placeholder: "e.g. PMP Certification" },
  { name: "description", label: "Description", type: "textarea" as const, maxLength: 500 },
];

const columns = [
  { header: "License", render: (row: NamedItem) => row.name },
  { header: "Description", wrap: true, render: (row: NamedItem) => row.description || "-" },
];

const searchKeys = ["name", "description"];

const Licenses = () => (
  <CatalogPage<NamedItem>
    section="Qualifications"
    title="Licenses"
    description="Professional licenses and certifications"
    singular="License"
    plural="licenses"
    icon={<BadgeCheck size={16} />}
    api={licenseApi}
    fields={fields}
    columns={columns}
    searchKeys={searchKeys}
    starterDataLabel="Load common licenses"
  />
);

export default Licenses;
