import { MapPin } from "lucide-react";
import CatalogPage from "../../../../components/admin/CatalogPage";
import { locationApi } from "../../../../services/catalogService";
import type { Location } from "../../../../services/catalogService";

const fields = [
  { name: "name", label: "Location name", required: true, maxLength: 120, full: true, placeholder: "e.g. Chennai Head Office" },
  { name: "address", label: "Address", maxLength: 250, full: true },
  { name: "city", label: "City", maxLength: 80 },
  { name: "state", label: "State / Province", maxLength: 80 },
  { name: "country", label: "Country", required: true, maxLength: 80 },
  { name: "zipCode", label: "Zip / Postal code", maxLength: 20 },
  { name: "phone", label: "Phone", maxLength: 30 },
];

const columns = [
  { header: "Location", render: (row: Location) => row.name },
  { header: "City", render: (row: Location) => row.city || "-" },
  { header: "State", render: (row: Location) => row.state || "-" },
  { header: "Country", render: (row: Location) => row.country },
  { header: "Phone", render: (row: Location) => row.phone || "-" },
];

const searchKeys = ["name", "city", "state", "country", "address"];

const Locations = () => (
  <CatalogPage<Location>
    section="Organization"
    title="Locations"
    description="Offices, branches and sites where your company operates"
    singular="Location"
    plural="locations"
    icon={<MapPin size={16} />}
    api={locationApi}
    fields={fields}
    columns={columns}
    searchKeys={searchKeys}
  />
);

export default Locations;
