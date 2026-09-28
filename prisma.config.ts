import "dotenv/config";
import { definePrismaConfig } from "@prisma/cli-engine";
import {
  defineConfig as ormConfig,
  prisma7Schema,
} from "@prisma/orm-postgres/config";

export default definePrismaConfig({
  orm: ormConfig({
    contract: prisma7Schema("prisma/schemas"),
    output: "src/prisma",
    db: {
      connection: process.env["DATABASE_URL"]!,
    },
  }),
});
