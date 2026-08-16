import type { BotConfig } from "./botConfig.js";
import type { Env } from "./env.js";
import { loadEnv } from "./env.js";
import { loadBotConfig } from "./loader.js";

/** Geheime omgevingsvariabelen (token, clientId, guildId). */
export const env: Env = loadEnv();

/** Niet-geheime configuratie uit config.json. */
export const botConfig: BotConfig = loadBotConfig();

export type { BotConfig, PermissionLevel } from "./botConfig.js";
export type { Env } from "./env.js";
