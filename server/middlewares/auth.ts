import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";

export async function protect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = session.user; // ✅ typed now
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
