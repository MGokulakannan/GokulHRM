import { Request, Response } from "express";

import { CatalogError, CatalogService } from "../services/catalogService";

const fail = (res: Response, error: unknown) => {
  const status = error instanceof CatalogError ? error.status : 500;

  if (status >= 500) {
    console.error("CATALOG ERROR:", error);
  }

  return res.status(status).json({
    success: false,
    message: error instanceof Error ? error.message : "Request failed",
  });
};

export const createCatalogController = (service: CatalogService, label: string) => ({
  list: async (_req: Request, res: Response) => {
    try {
      const data = await service.list();
      return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
      return fail(res, error);
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const data = await service.getById(req.params.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const data = await service.create(req.body || {});
      return res.status(201).json({
        success: true,
        message: `${label} created successfully`,
        data,
      });
    } catch (error) {
      return fail(res, error);
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const data = await service.update(req.params.id, req.body || {});
      return res.status(200).json({
        success: true,
        message: `${label} updated successfully`,
        data,
      });
    } catch (error) {
      return fail(res, error);
    }
  },

  remove: async (req: Request<{ id: string }>, res: Response) => {
    try {
      await service.remove(req.params.id);
      return res.status(200).json({
        success: true,
        message: `${label} deleted successfully`,
      });
    } catch (error) {
      return fail(res, error);
    }
  },

  seedDefaults: async (_req: Request, res: Response) => {
    try {
      const result = await service.seedDefaults();
      return res.status(200).json({
        success: true,
        message:
          result.added > 0
            ? `Added ${result.added} default ${label.toLowerCase()} entries`
            : "All default entries already exist",
        data: result,
      });
    } catch (error) {
      return fail(res, error);
    }
  },
});
