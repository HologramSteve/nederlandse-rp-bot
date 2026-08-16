import { logger } from "../core/utils/logger.js";

/** Eénmalig gelezen, gevalideerde omgevingsvariabelen. */
export interface Env {
  token: string;
  clientId: string;
  guildId: string;
  dbPath: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Ontbrekende omgevingsvariabele "${name}" in je .env bestand.`);
  }
  return value;
}

/** Lees en valideer de omgevingsvariabelen eenmalig. */
export function loadEnv(): Env {
  logger.debug("Omgevingsvariabelen laden...");
  return {
    token: requireEnv("DISCORD_TOKEN"),
    clientId: requireEnv("CLIENT_ID"),
    guildId: requireEnv("GUILD_ID"),
    dbPath: process.env.DB_PATH ?? "./data/rpbot.db",
  };
}
