import { Request, Response } from "express";
import Vacancy from "../models/Vacancy";
import Candidate from "../models/Candidate";

/* =========================================================
   VACANCIES
========================================================= */

export const getVacancies = async (req: Request, res: Response) => {
  try {
    const vacancies = await Vacancy.find()
      .populate("department", "name")
      .populate("designation", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: vacancies });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch vacancies",
    });
  }
};

export const createVacancy = async (req: Request, res: Response) => {
  try {
    const { title, department, designation, location, status, description } = req.body;

    if (!title || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: "Title, department and designation are required",
      });
    }

    const vacancy = await Vacancy.create({
      title,
      department,
      designation,
      location,
      status,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Vacancy created successfully",
      data: vacancy,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create vacancy",
    });
  }
};

export const updateVacancy = async (req: Request, res: Response) => {
  try {
    const vacancy = await Vacancy.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!vacancy) {
      return res.status(404).json({ success: false, message: "Vacancy not found" });
    }

    res.status(200).json({
      success: true,
      message: "Vacancy updated successfully",
      data: vacancy,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update vacancy",
    });
  }
};

export const deleteVacancy = async (req: Request, res: Response) => {
  try {
    const vacancy = await Vacancy.findByIdAndDelete(req.params.id);

    if (!vacancy) {
      return res.status(404).json({ success: false, message: "Vacancy not found" });
    }

    await Candidate.deleteMany({ vacancy: req.params.id });

    res.status(200).json({ success: true, message: "Vacancy deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete vacancy",
    });
  }
};

/* =========================================================
   CANDIDATES
========================================================= */

export const getCandidates = async (req: Request, res: Response) => {
  try {
    const { vacancy } = req.query;
    const filter: Record<string, any> = {};
    if (vacancy) filter.vacancy = vacancy;

    const candidates = await Candidate.find(filter)
      .populate("vacancy", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch candidates",
    });
  }
};

export const createCandidate = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, vacancy, notes } = req.body;

    if (!name || !email || !vacancy) {
      return res.status(400).json({
        success: false,
        message: "Name, email and vacancy are required",
      });
    }

    const candidate = await Candidate.create({ name, email, phone, vacancy, notes });

    res.status(201).json({
      success: true,
      message: "Candidate added successfully",
      data: candidate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to add candidate",
    });
  }
};

export const updateCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    res.status(200).json({
      success: true,
      message: "Candidate updated successfully",
      data: candidate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update candidate",
    });
  }
};

export const deleteCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    res.status(200).json({ success: true, message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete candidate",
    });
  }
};
