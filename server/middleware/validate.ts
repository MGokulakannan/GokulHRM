import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

// Runs after a chain of express-validator checks. If any failed, responds
// with 400 and the first meaningful message per field instead of letting
// the request reach the controller/database.
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors
        .array({ onlyFirstError: true })
        .map((error) => error.msg)
        .join(", "),
    });
  }

  next();
};

export default validate;
