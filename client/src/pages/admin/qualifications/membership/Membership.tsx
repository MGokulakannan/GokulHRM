import { Users } from "lucide-react";
import CatalogPage from "../../../../components/admin/CatalogPage";
import { membershipApi } from "../../../../services/catalogService";
import type { NamedItem } from "../../../../services/catalogService";

const fields = [
  { name: "name", label: "Membership", required: true, maxLength: 120, placeholder: "e.g. IEEE" },
  { name: "description", label: "Description", type: "textarea" as const, maxLength: 500 },
];

const columns = [
  { header: "Membership", render: (row: NamedItem) => row.name },
  { header: "Description", wrap: true, render: (row: NamedItem) => row.description || "-" },
];

const searchKeys = ["name", "description"];

const Membership = () => (
  <CatalogPage<NamedItem>
    section="Qualifications"
    title="Memberships"
    description="Professional bodies and associations"
    singular="Membership"
    plural="memberships"
    icon={<Users size={16} />}
    api={membershipApi}
    fields={fields}
    columns={columns}
    searchKeys={searchKeys}
    starterDataLabel="Load common memberships"
  />
);

export default Membership;
