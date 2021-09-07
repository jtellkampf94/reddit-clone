import "reflect-metadata";
import { createConnection } from "typeorm";

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    database: "redit-clone",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
  });
};

main();
