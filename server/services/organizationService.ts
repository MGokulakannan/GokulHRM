import OrganizationProfile from "../models/OrganizationProfile";
import User from "../models/Users";
import { CatalogError } from "./catalogService";

const FIELDS = [
  "name",
  "registrationNumber",
  "taxId",
  "industry",
  "phone",
  "fax",
  "email",
  "website",
  "address",
  "city",
  "state",
  "zipCode",
  "country",
  "notes",
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const withEmployeeCount = async (profile: Record<string, unknown> | null) => ({
  ...(profile || { name: "" }),
  employeeCount: await User.countDocuments({ status: "Active" }),
});

export const getOrganizationService = async () => {
  const profile = await OrganizationProfile.findOne().lean();
  return withEmployeeCount(profile as Record<string, unknown> | null);
};

export const saveOrganizationService = async (body: Record<string, unknown>) => {
  const data: Record<string, string> = {};

  for (const field of FIELDS) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") {
        throw new CatalogError(400, `${field} must be text`);
      }
      data[field] = (body[field] as string).trim();
    }
  }

  const existing = await OrganizationProfile.findOne();

  if (!existing && !data.name) {
    throw new CatalogError(400, "Organization name is required");
  }

  if (data.name === "") {
    throw new CatalogError(400, "Organization name cannot be empty");
  }

  if (data.email && !EMAIL_PATTERN.test(data.email)) {
    throw new CatalogError(400, "Enter a valid organization email address");
  }

  const saved = existing
    ? await OrganizationProfile.findByIdAndUpdate(existing._id, data, {
        returnDocument: "after",
        runValidators: true,
      }).lean()
    : await OrganizationProfile.create(data).then((doc) => doc.toObject());

  return withEmployeeCount(saved as Record<string, unknown> | null);
};
