import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

import { MyContext } from "./types";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { PostResolver } from "./resolvers/Post";
import { UserResolver } from "./resolvers/User";

dotenv.config();

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    database: "reddit-clone",
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    // logging: true,
    synchronize: true,
    entities: [Post, User],
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      secret: String(process.env.REDIS_SECRET),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax",
      },
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, path: "/" });

  app.listen(4000, () => {
    console.log("Server starting on port 4000");
  });
};

main();
