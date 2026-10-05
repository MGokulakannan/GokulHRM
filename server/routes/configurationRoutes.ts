import express, { Request, Response } from "express";

import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";

import { CatalogError } from "../services/catalogService";
import {
  getOrganizationService,
  saveOrganizationService,
} from "../services/organizationService";
import {
  getSettingService,
  resetSettingService,
  updateSettingService,
} from "../services/systemSettingService";

const respond =
  (work: (req: Request) => Promise<unknown>, message?: string) =>
  async (req: Request, res: Response) => {
    try {
      const data = await work(req);
      return res.status(200).json({ success: true, ...(message ? { message } : {}), data });
    } catch (error) {
      const status = error instanceof CatalogError ? error.status : 500;
      if (status >= 500) console.error("CONFIGURATION ERROR:", error);

      return res.status(status).json({
        success: false,
        message: error instanceof Error ? error.message : "Request failed",
      });
    }
  };

/* ---------- Organization → General Information (singleton) ---------- */

export const organizationRouter = express.Router();

organizationRouter.get("/", authMiddleware, respond(() => getOrganizationService()));

organizationRouter.put(
  "/",
  authMiddleware,
  roleMiddleware("Admin"),
  respond((req) => saveOrganizationService(req.body || {}), "Organization details saved")
);

/* ---------- Configuration → Email / Localization / Modules ---------- */

// Reads are open to signed-in users (the app shell needs the enabled modules);
// changes are Admin-only.
export const systemSettingsRouter = express.Router();

systemSettingsRouter.get(
  "/:key",
  authMiddleware,
  respond((req) => getSettingService(String(req.params.key)))
);

systemSettingsRouter.put(
  "/:key",
  authMiddleware,
  roleMiddleware("Admin"),
  respond((req) => updateSettingService(String(req.params.key), req.body), "Settings saved")
);

systemSettingsRouter.delete(
  "/:key",
  authMiddleware,
  roleMiddleware("Admin"),
  respond((req) => resetSettingService(String(req.params.key)), "Settings reset to defaults")
);
