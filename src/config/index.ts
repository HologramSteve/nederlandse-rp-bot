import type { BotConfig } from "./botConfig.js";
import type { Env } from "./env.js";
import { loadEnv } from "./env.js";
import { loadBotConfig } from "./loader.js";

export const env: Env = loadEnv();

export const botConfig: BotConfig = loadBotConfig();

export type { BotConfig, PermissionLevel } from "./botConfig.js";
export type { Env } from "./env.js";
