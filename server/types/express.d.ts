import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      name?: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
