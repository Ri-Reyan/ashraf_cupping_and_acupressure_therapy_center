// Creates the initial admin account for database-backed login.
// Run once from a trusted terminal after the schema migration is applied.
import "dotenv/config";
import "temporal-polyfill/full/global";
import { randomUUID } from "node:crypto";
import { stdout } from "node:process";
import argon2 from "argon2";
import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "../src/prisma/contract.json" with { type: "json" };

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const mobile = process.env.SEED_ADMIN_MOBILE?.trim();
  const name = process.env.SEED_ADMIN_NAME?.trim();

  if (!email || !password || !mobile) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, and SEED_ADMIN_MOBILE in .env.",
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Provide a valid email address.");
  }
  if (!/^01[3-9]\d{8}$/.test(mobile)) {
    throw new Error("Mobile must use the normalized 01XXXXXXXXX format.");
  }
  if (password.length < 12 || password.length > 256) {
    throw new Error("SEED_ADMIN_PASSWORD must contain 12 to 256 characters.");
  }

  const db = postgres({
    contractJson,
    url: process.env.DATABASE_URL,
  });

  try {
    const admins = await db.orm.public.User.where({ role: "ADMIN" }).all();
    if (admins.length > 0) {
      stdout.write("Admin seed skipped; an ADMIN account already exists.\n");
      return;
    }

    const user = await db.orm.public.User.create({
      id: randomUUID(),
      name: name || email.split("@")[0],
      email,
      passwordHash: await argon2.hash(password),
      mobile,
      role: "ADMIN",
    });

    stdout.write(`Created initial admin ${user.email} (${user.id}).\n`);
  } finally {
    await db.close();
  }
}

main().catch((error) => {
  stdout.write(
    `${error instanceof Error ? error.message : "Admin bootstrap failed."}\n`,
  );
  process.exitCode = 1;
});
