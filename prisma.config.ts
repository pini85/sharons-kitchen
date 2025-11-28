// @ts-ignore - prisma/config types may not be available
import { defineConfig } from "prisma/config";

export default defineConfig({
  database: {
    adapter: "postgresql",
    url: process.env.DATABASE_URL!,
  },
});

