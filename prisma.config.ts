// Prisma Configuration for NewsLingua
// PostgreSQL (Neon) connection settings
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // マイグレーション時はDIRECT_URLを優先（Neon poolerをバイパス）
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"]!,
  },
});
