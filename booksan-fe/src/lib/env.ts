import { z } from "zod";

const envSchema = z.object({
  // App
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:8081"),

  // API
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_BASE_API: z.string().url().default("http://localhost:8000/v1"),
  API_SECRET_KEY: z.string().optional(),

  // Auth
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Database
  DATABASE_URL: z.string().optional(),

  // External Services
  NEXT_PUBLIC_LOCATIONIQ_TOKEN: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_CHAT: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  NEXT_PUBLIC_ENABLE_WALLET: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => err.path.join("."))
        .join(", ");
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}`
      );
    }
    throw error;
  }
}

export const env = validateEnv();

// Type for client-safe environment variables
export type ClientEnv = Pick<
  typeof env,
  keyof typeof env & `NEXT_PUBLIC_${string}`
>;

// Helper to get client-safe env vars
export function getClientEnv(): ClientEnv {
  return Object.fromEntries(
    Object.entries(env).filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
  ) as ClientEnv;
}
