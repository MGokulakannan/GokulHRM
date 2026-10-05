import { Wallet } from "lucide-react";
import CatalogPage from "../../../../components/admin/CatalogPage";
import { costCenterApi } from "../../../../services/catalogService";
import type { CostCenter } from "../../../../services/catalogService";

const fields = [
  { name: "code", label: "Code", required: true, maxLength: 20, placeholder: "e.g. CC-100" },
  { name: "name", label: "Cost center name", required: true, maxLength: 120 },
  { name: "description", label: "Description", type: "textarea" as const, maxLength: 500 },
];

const columns = [
  { header: "Code", render: (row: CostCenter) => <span className="adm-code">{row.code}</span> },
  { header: "Cost center", render: (row: CostCenter) => row.name },
  { header: "Description", wrap: true, render: (row: CostCenter) => row.description || "-" },
];

const searchKeys = ["code", "name", "description"];

const CostCenters = () => (
  <CatalogPage<CostCenter>
    section="Organization"
    title="Cost Centers"
    description="Budget codes used to track spend by team or function"
    singular="Cost center"
    plural="cost centers"
    icon={<Wallet size={16} />}
    api={costCenterApi}
    fields={fields}
    columns={columns}
    searchKeys={searchKeys}
  />
);

export default CostCenters;
