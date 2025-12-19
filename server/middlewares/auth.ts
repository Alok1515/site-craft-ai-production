import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";

export async function protect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as HeadersInit, // ✅ FIX
    });

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to request
    (req as any).user = session.user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
