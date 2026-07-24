import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AppError } from "../utils/AppError";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new AppError("Missing token", 401));
  }

  try {
  console.log("VERIFY SECRET:", process.env.JWT_SECRET);
  console.log("TOKEN:", token);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    req.user = user;

    next();
  } catch {
    next(new AppError("Invalid token", 401));
  }
}