import mongoose, { Document, Schema } from "mongoose";

// Singleton: the company's own profile (Organization → General Information).
export interface IOrganizationProfile extends Document {
  name: string;
  registrationNumber?: string;
  taxId?: string;
  industry?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
}

const text = (max: number) => ({ type: String, default: "", trim: true, maxlength: max });

const organizationProfileSchema = new Schema<IOrganizationProfile>(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    registrationNumber: text(60),
    taxId: text(60),
    industry: text(80),
    phone: text(30),
    fax: text(30),
    email: text(120),
    website: text(150),
    address: text(250),
    city: text(80),
    state: text(80),
    zipCode: text(20),
    country: text(80),
    notes: text(1000),
  },
  { timestamps: true }
);

const OrganizationProfile = mongoose.model<IOrganizationProfile>(
  "OrganizationProfile",
  organizationProfileSchema
);

export default OrganizationProfile;
