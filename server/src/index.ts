import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { PostResolver } from "./resolvers/Post";

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

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver],
      validate: false,
    }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, path: "/" });

  app.listen(4000, () => {
    console.log("Server starting on port 4000");
  });
};

main();
