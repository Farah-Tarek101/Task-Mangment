import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    const guestIdHeader = req.headers['x-guest-id'];
    const guestId = typeof guestIdHeader === 'string' ? guestIdHeader : '';

    if (/^[a-fA-F0-9]{24}$/.test(guestId)) {
      req.user = { _id: guestId } as any;
    } else {
      req.user = { _id: '000000000000000000000000' } as any;
    }

    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    req.user = {
      _id: decoded.id
    } as any;

    next();

  } catch {
    next(new AppError("Invalid token", 401));
  }
}