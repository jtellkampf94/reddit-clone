import { Request, Response } from "express";
import { Session } from "express-session";
import { Redis } from "ioredis";

import { createUserLoader } from "./utils/createUserLoader";

export type SessionWithUserId = Session & { userId: string | {} };

export type MyContext = {
  req: Request & {
    session?: SessionWithUserId;
  };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
};
