import mongoose, { Schema, SchemaDefinition, SchemaDefinitionProperty } from "mongoose";

// Simple admin-managed lookup lists (Job, Organization, Qualifications,
// Nationalities). They share the same name/description/status shape and are
// served through the generic catalog router (routes/catalogRoutes.ts).

const statusField = {
  type: String,
  enum: ["Active", "Inactive"],
  default: "Active",
};

const buildModel = (
  modelName: string,
  definition: SchemaDefinition,
  configure?: (schema: Schema) => void
) => {
  const schema = new Schema(definition, { timestamps: true });
  configure?.(schema);
  return mongoose.model(modelName, schema);
};

const namedDefinition = (extra: SchemaDefinition = {}): SchemaDefinition => ({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
  description: { type: String, default: "", trim: true, maxlength: 500 },
  status: statusField,
  ...extra,
});

const timeField: SchemaDefinitionProperty<string> = {
  type: String,
  required: true,
  match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM (24h) format"],
};

/* ---------- Job ---------- */

export const JobCategory = buildModel("JobCategory", namedDefinition());

export const WorkShift = buildModel("WorkShift", {
  name: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
  startTime: timeField,
  endTime: timeField,
  breakMinutes: { type: Number, default: 60, min: 0, max: 480 },
  description: { type: String, default: "", trim: true, maxlength: 500 },
  status: statusField,
});

/* ---------- Organization ---------- */

export const Location = buildModel("Location", {
  name: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
  address: { type: String, default: "", trim: true, maxlength: 250 },
  city: { type: String, default: "", trim: true, maxlength: 80 },
  state: { type: String, default: "", trim: true, maxlength: 80 },
  country: { type: String, required: true, trim: true, maxlength: 80 },
  zipCode: { type: String, default: "", trim: true, maxlength: 20 },
  phone: { type: String, default: "", trim: true, maxlength: 30 },
  status: statusField,
});

export const CostCenter = buildModel("CostCenter", {
  code: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 20 },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: "", trim: true, maxlength: 500 },
  status: statusField,
});

export const OrgUnit = buildModel(
  "OrgUnit",
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    unitType: {
      type: String,
      enum: ["Company", "Division", "Department", "Team", "Branch"],
      default: "Department",
    },
    parent: { type: Schema.Types.ObjectId, ref: "OrgUnit", default: null },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    status: statusField,
  },
  (schema) => schema.index({ name: 1, parent: 1 }, { unique: true })
);

/* ---------- Qualifications ---------- */

export const Skill = buildModel("Skill", namedDefinition());
export const Education = buildModel("Education", namedDefinition());
export const License = buildModel("License", namedDefinition());
export const Language = buildModel("Language", namedDefinition());
export const Membership = buildModel("Membership", namedDefinition());

/* ---------- Nationalities ---------- */

export const Nationality = buildModel(
  "Nationality",
  namedDefinition({ description: { type: String, default: "", trim: true } })
);
