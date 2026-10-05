import express from "express";
import mongoose from "mongoose";

import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";

import { createCatalogController } from "../controllers/catalogController";
import {
  CatalogError,
  CatalogOptions,
  createCatalogService,
} from "../services/catalogService";

import {
  CostCenter,
  Education,
  JobCategory,
  Language,
  License,
  Location,
  Membership,
  Nationality,
  OrgUnit,
  Skill,
  WorkShift,
} from "../models/OrgCatalogs";

import {
  educationDefaults,
  jobCategoryDefaults,
  languageDefaults,
  licenseDefaults,
  membershipDefaults,
  nationalityDefaults,
  skillDefaults,
} from "../config/catalogDefaults";

// Same access rules as job titles: any signed-in user can read, only Admins write.
const buildRouter = (
  model: Parameters<typeof createCatalogService>[0],
  options: CatalogOptions
) => {
  const controller = createCatalogController(
    createCatalogService(model, options),
    options.label
  );
  const router = express.Router();

  router.get("/", authMiddleware, controller.list);

  if (options.defaults) {
    // Declared before "/:id" so "seed-defaults" is not read as an id.
    router.post("/seed-defaults", authMiddleware, roleMiddleware("Admin"), controller.seedDefaults);
  }

  router.get("/:id", authMiddleware, controller.getById);
  router.post("/", authMiddleware, roleMiddleware("Admin"), controller.create);
  router.put("/:id", authMiddleware, roleMiddleware("Admin"), controller.update);
  router.delete("/:id", authMiddleware, roleMiddleware("Admin"), controller.remove);

  return router;
};

const namedFields = ["name", "description", "status"];

/* ---------- Organization structure: keep the tree valid ---------- */

const assertValidParent = async (id: string | null, data: Record<string, unknown>) => {
  const parent = data.parent;

  if (parent === undefined || parent === null || parent === "") {
    data.parent = null;
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(String(parent))) {
    throw new CatalogError(400, "Invalid parent unit");
  }

  if (!(await OrgUnit.exists({ _id: parent }))) {
    throw new CatalogError(400, "Parent unit does not exist");
  }

  if (!id) return;

  // Walk up from the proposed parent; hitting this unit means a cycle.
  let cursor: string | null = String(parent);
  const seen = new Set<string>();

  while (cursor && !seen.has(cursor)) {
    if (cursor === id) {
      throw new CatalogError(400, "A unit cannot be placed under itself or its own sub-units");
    }
    seen.add(cursor);
    const node = (await OrgUnit.findById(cursor, { parent: 1 }).lean()) as { parent?: unknown } | null;
    cursor = node?.parent ? String(node.parent) : null;
  }
};

const router = express.Router();

router.use(
  "/job-categories",
  buildRouter(JobCategory, {
    label: "Job category",
    fields: namedFields,
    required: ["name"],
    sort: { name: 1 },
    defaults: jobCategoryDefaults,
  })
);

router.use(
  "/work-shifts",
  buildRouter(WorkShift, {
    label: "Work shift",
    fields: ["name", "startTime", "endTime", "breakMinutes", "description", "status"],
    required: ["name", "startTime", "endTime"],
    sort: { startTime: 1, name: 1 },
  })
);

router.use(
  "/locations",
  buildRouter(Location, {
    label: "Location",
    fields: ["name", "address", "city", "state", "country", "zipCode", "phone", "status"],
    required: ["name", "country"],
    sort: { name: 1 },
  })
);

router.use(
  "/cost-centers",
  buildRouter(CostCenter, {
    label: "Cost center",
    fields: ["code", "name", "description", "status"],
    required: ["code", "name"],
    sort: { code: 1 },
    uniqueKey: "code",
  })
);

router.use(
  "/org-units",
  buildRouter(OrgUnit, {
    label: "Organization unit",
    fields: ["name", "unitType", "parent", "description", "status"],
    required: ["name"],
    sort: { createdAt: 1 },
    beforeSave: assertValidParent,
    beforeDelete: async (id) => {
      if (await OrgUnit.exists({ parent: id })) {
        throw new CatalogError(409, "Remove or move this unit's sub-units before deleting it");
      }
    },
  })
);

router.use(
  "/skills",
  buildRouter(Skill, {
    label: "Skill",
    fields: namedFields,
    required: ["name"],
    sort: { name: 1 },
    defaults: skillDefaults,
  })
);

router.use(
  "/education",
  buildRouter(Education, {
    label: "Education level",
    fields: namedFields,
    required: ["name"],
    sort: { name: 1 },
    defaults: educationDefaults,
  })
);

router.use(
  "/licenses",
  buildRouter(License, {
    label: "License",
    fields: namedFields,
    required: ["name"],
    sort: { name: 1 },
    defaults: licenseDefaults,
  })
);

router.use(
  "/languages",
  buildRouter(Language, {
    label: "Language",
    fields: namedFields,
    required: ["name"],
    sort: { name: 1 },
    defaults: languageDefaults,
  })
);

router.use(
  "/memberships",
  buildRouter(Membership, {
    label: "Membership",
    fields: namedFields,
    required: ["name"],
    sort: { name: 1 },
    defaults: membershipDefaults,
  })
);

router.use(
  "/nationalities",
  buildRouter(Nationality, {
    label: "Nationality",
    fields: namedFields,
    required: ["name"],
    sort: { name: 1 },
    defaults: nationalityDefaults,
  })
);

export default router;
