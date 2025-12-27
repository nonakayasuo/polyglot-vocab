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
    // アプリケーション用 (pooler経由)
    url: process.env["DATABASE_URL"]!,
    // マイグレーション用 (直接接続)
    directUrl: process.env["DIRECT_URL"],
  },
});
