import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";
import {
  getVacancies,
  createVacancy,
  updateVacancy,
  deleteVacancy,
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../controllers/recruitmentController";

const router = express.Router();

// Vacancies - everyone authenticated can view open roles, only Admin manages them
router.get("/vacancies", authMiddleware, getVacancies);
router.post("/vacancies", authMiddleware, roleMiddleware("Admin"), createVacancy);
router.put("/vacancies/:id", authMiddleware, roleMiddleware("Admin"), updateVacancy);
router.delete("/vacancies/:id", authMiddleware, roleMiddleware("Admin"), deleteVacancy);

// Candidates - Admin only
router.get("/candidates", authMiddleware, roleMiddleware("Admin"), getCandidates);
router.post("/candidates", authMiddleware, roleMiddleware("Admin"), createCandidate);
router.put("/candidates/:id", authMiddleware, roleMiddleware("Admin"), updateCandidate);
router.delete("/candidates/:id", authMiddleware, roleMiddleware("Admin"), deleteCandidate);

export default router;
