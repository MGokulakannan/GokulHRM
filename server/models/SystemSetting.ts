import mongoose, { Document, Schema } from "mongoose";

// Key/value store for Configuration pages (email notifications, localization,
// modules). One document per key; the allowed shape of each value is defined
// and enforced in services/systemSettingService.ts.
export interface ISystemSetting extends Document {
  key: string;
  value: Record<string, unknown>;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

const SystemSetting = mongoose.model<ISystemSetting>("SystemSetting", systemSettingSchema);

export default SystemSetting;
