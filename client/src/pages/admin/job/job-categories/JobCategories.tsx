import { Layers } from "lucide-react";
import CatalogPage from "../../../../components/admin/CatalogPage";
import { jobCategoryApi } from "../../../../services/catalogService";
import type { JobCategory } from "../../../../services/catalogService";

const fields = [
  { name: "name", label: "Category name", required: true, maxLength: 120, placeholder: "e.g. Professionals" },
  { name: "description", label: "Description", type: "textarea" as const, maxLength: 500 },
];

const columns = [
  { header: "Category", render: (row: JobCategory) => row.name },
  { header: "Description", wrap: true, render: (row: JobCategory) => row.description || "-" },
];

const searchKeys = ["name", "description"];

const JobCategories = () => (
  <CatalogPage<JobCategory>
    section="Job"
    title="Job Categories"
    description="Group job roles into broad categories used for reporting"
    singular="Job category"
    plural="job categories"
    icon={<Layers size={16} />}
    api={jobCategoryApi}
    fields={fields}
    columns={columns}
    searchKeys={searchKeys}
    starterDataLabel="Load standard categories"
  />
);

export default JobCategories;
