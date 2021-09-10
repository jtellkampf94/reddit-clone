import { Request, Response } from "express";
import { Session } from "express-session";

export type SessionWithUserId = Session & { userId: string | {} };

export type MyContext = {
  req: Request & {
    session?: SessionWithUserId;
  };
  res: Response;
};
