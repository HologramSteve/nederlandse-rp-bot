import type { Env } from "./env.js";
import { loadEnv } from "./env.js";

/** Gecentraliseerde applicatieconfiguratie. */
export const config: Env = loadEnv();

export type { Env } from "./env.js";
