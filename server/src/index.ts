import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import cors from "cors";
import path from "path";

import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import { PostResolver } from "./resolvers/Post";
import { UserResolver } from "./resolvers/User";
import { COOKIE_NAME } from "./constants";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

dotenv.config();

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    database: "reddit-clone",
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post, Updoot],
  });
  await connection.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    session({
      store: new RedisStore({
        client: redis,
      }),
      name: COOKIE_NAME,
      secret: String(process.env.REDIS_SECRET),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax",
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, path: "/", cors: false });

  app.listen(4000, () => {
    console.log("Server starting on port 4000");
  });
};

main().catch((error) => {
  console.log(error);
});
