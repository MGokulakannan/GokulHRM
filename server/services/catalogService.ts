import mongoose, { Model } from "mongoose";

// Generic CRUD used by every simple admin lookup list (job categories, skills,
// nationalities, ...). Each list passes its own model and rules.

export class CatalogError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface CatalogOptions {
  label: string; // singular, e.g. "Skill"
  fields: string[]; // body fields that may be written
  required: string[]; // body fields that must be non-empty on create
  sort?: Record<string, 1 | -1>;
  defaults?: Array<Record<string, unknown>>; // optional starter data
  uniqueKey?: string; // field used to match starter data (default "name")
  beforeDelete?: (id: string) => Promise<void>;
  beforeSave?: (id: string | null, data: Record<string, unknown>) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModel = Model<any>;

const toCatalogError = (error: unknown, label: string): CatalogError => {
  if (error instanceof CatalogError) return error;

  const err = error as {
    code?: number;
    keyPattern?: Record<string, unknown>;
    name?: string;
    message?: string;
    errors?: Record<string, { message: string }>;
  };

  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "name";
    return new CatalogError(409, `${label} with this ${field} already exists`);
  }

  if (err?.name === "ValidationError" && err.errors) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return new CatalogError(400, message);
  }

  if (err?.name === "CastError") {
    return new CatalogError(400, `Invalid ${label.toLowerCase()} value`);
  }

  return new CatalogError(500, err?.message || `Failed to process ${label.toLowerCase()}`);
};

const assertValidId = (id: string, label: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CatalogError(400, `Invalid ${label.toLowerCase()} ID`);
  }
};

const pickFields = (body: Record<string, unknown>, fields: string[]) => {
  const data: Record<string, unknown> = {};

  for (const field of fields) {
    if (body[field] !== undefined) {
      data[field] = typeof body[field] === "string" ? (body[field] as string).trim() : body[field];
    }
  }

  return data;
};

export const createCatalogService = (model: AnyModel, options: CatalogOptions) => {
  const { label } = options;
  const unique = options.uniqueKey || "name";

  const run = async <T>(work: () => Promise<T>): Promise<T> => {
    try {
      return await work();
    } catch (error) {
      throw toCatalogError(error, label);
    }
  };

  return {
    list: () => run(() => model.find().sort(options.sort || { createdAt: -1 })),

    getById: (id: string) =>
      run(async () => {
        assertValidId(id, label);
        const doc = await model.findById(id);
        if (!doc) throw new CatalogError(404, `${label} not found`);
        return doc;
      }),

    create: (body: Record<string, unknown>) =>
      run(async () => {
        const data = pickFields(body, options.fields);

        for (const field of options.required) {
          const value = data[field];
          if (value === undefined || value === null || value === "") {
            throw new CatalogError(400, `${field} is required`);
          }
        }

        await options.beforeSave?.(null, data);
        return model.create(data);
      }),

    update: (id: string, body: Record<string, unknown>) =>
      run(async () => {
        assertValidId(id, label);
        const data = pickFields(body, options.fields);

        for (const field of options.required) {
          if (data[field] === "" || data[field] === null) {
            throw new CatalogError(400, `${field} cannot be empty`);
          }
        }

        await options.beforeSave?.(id, data);

        const doc = await model.findByIdAndUpdate(id, data, {
          returnDocument: "after",
          runValidators: true,
        });
        if (!doc) throw new CatalogError(404, `${label} not found`);
        return doc;
      }),

    remove: (id: string) =>
      run(async () => {
        assertValidId(id, label);
        await options.beforeDelete?.(id);
        const doc = await model.findByIdAndDelete(id);
        if (!doc) throw new CatalogError(404, `${label} not found`);
        return doc;
      }),

    // Inserts the starter entries that don't exist yet; never touches existing rows.
    seedDefaults: () =>
      run(async () => {
        const defaults = options.defaults || [];
        const existing = await model.find({}, { [unique]: 1 }).lean();
        const taken = new Set(existing.map((doc) => String(doc[unique]).toLowerCase()));
        const missing = defaults.filter((entry) => !taken.has(String(entry[unique]).toLowerCase()));

        if (missing.length) await model.insertMany(missing);
        return { added: missing.length, total: defaults.length };
      }),
  };
};

export type CatalogService = ReturnType<typeof createCatalogService>;
