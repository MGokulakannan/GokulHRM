import SystemSetting from "../models/SystemSetting";
import { CatalogError } from "./catalogService";

type Settings = Record<string, unknown>;

// Every configurable key, its defaults, and (via the defaults' types) the only
// shape the API will accept. Unknown keys are dropped; wrong types are rejected.
const DEFAULTS: Record<string, Settings> = {
  notifications: {
    enabled: true,
    senderName: "Gokul HRM",
    senderEmail: "",
    replyTo: "",
    events: {
      leaveApplied: true,
      leaveDecision: true,
      newEmployee: true,
      vacancyPosted: false,
      performanceReview: true,
      passwordChanged: true,
    },
  },
  localization: {
    language: "en",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    timezone: "Asia/Kolkata",
    currency: "INR",
    weekStart: "Monday",
  },
  modules: {
    attendance: true,
    leave: true,
    recruitment: true,
    performance: true,
    reports: true,
  },
};

const ENUMS: Record<string, Record<string, string[]>> = {
  localization: {
    language: ["en", "ta", "hi", "es", "fr", "de"],
    dateFormat: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD MMM YYYY"],
    timeFormat: ["12h", "24h"],
    weekStart: ["Monday", "Sunday", "Saturday"],
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isPlainObject = (value: unknown): value is Settings =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Merges `input` over `base`, keeping only keys that exist in `shape` with a matching type.
const sanitize = (shape: Settings, base: Settings, input: Settings, path: string): Settings => {
  const result: Settings = {};

  for (const [field, template] of Object.entries(shape)) {
    const incoming = input[field];

    if (incoming === undefined) {
      result[field] = base[field] ?? template;
      continue;
    }

    if (isPlainObject(template)) {
      if (!isPlainObject(incoming)) {
        throw new CatalogError(400, `${path}${field} must be an object`);
      }
      result[field] = sanitize(
        template,
        isPlainObject(base[field]) ? (base[field] as Settings) : {},
        incoming,
        `${path}${field}.`
      );
      continue;
    }

    if (typeof incoming !== typeof template) {
      throw new CatalogError(400, `${path}${field} must be a ${typeof template}`);
    }

    result[field] = typeof incoming === "string" ? incoming.trim() : incoming;
  }

  return result;
};

const validateRules = (key: string, value: Settings) => {
  for (const [field, allowed] of Object.entries(ENUMS[key] || {})) {
    if (!allowed.includes(String(value[field]))) {
      throw new CatalogError(400, `${field} must be one of: ${allowed.join(", ")}`);
    }
  }

  if (key === "notifications") {
    for (const field of ["senderEmail", "replyTo"]) {
      const email = String(value[field] || "");
      if (email && !EMAIL_PATTERN.test(email)) {
        throw new CatalogError(400, `${field} must be a valid email address`);
      }
    }
  }

  if (key === "localization") {
    try {
      new Intl.DateTimeFormat("en", { timeZone: String(value.timezone) });
    } catch {
      throw new CatalogError(400, "timezone is not a valid IANA time zone");
    }
    if (!/^[A-Z]{3}$/.test(String(value.currency))) {
      throw new CatalogError(400, "currency must be a 3-letter ISO code such as INR or USD");
    }
  }
};

const assertKnownKey = (key: string) => {
  if (!DEFAULTS[key]) {
    throw new CatalogError(404, `Unknown setting group "${key}"`);
  }
};

export const getSettingService = async (key: string) => {
  assertKnownKey(key);

  const stored = await SystemSetting.findOne({ key }).lean();
  const storedValue = isPlainObject(stored?.value) ? (stored!.value as Settings) : {};

  // Re-sanitize on read so settings saved by an older version still return every field.
  try {
    return sanitize(DEFAULTS[key], {}, storedValue, "");
  } catch {
    return DEFAULTS[key];
  }
};

export const updateSettingService = async (key: string, input: unknown) => {
  assertKnownKey(key);

  if (!isPlainObject(input)) {
    throw new CatalogError(400, "Request body must be an object");
  }

  const current = await getSettingService(key);
  const value = sanitize(DEFAULTS[key], current, input, "");
  validateRules(key, value);

  await SystemSetting.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, returnDocument: "after", runValidators: true }
  );

  return value;
};

export const resetSettingService = async (key: string) => {
  assertKnownKey(key);
  await SystemSetting.deleteOne({ key });
  return DEFAULTS[key];
};
