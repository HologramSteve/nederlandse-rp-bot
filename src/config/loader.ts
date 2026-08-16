import { readFileSync } from "node:fs";
import { join } from "node:path";
import { logger } from "../core/utils/logger.js";
import type { BotConfig } from "./botConfig.js";

const CONFIG_PATH = join(import.meta.dir, "..", "..", "config.json");

const DEFAULTS: BotConfig = {
  guilds: [],
  roleArrays: { moderator: [], admin: [] },
  channels: {
    welcome: "",
    leave: "",
    sessions: "",
    ticketPanel: "",
    stashLog: "",
    modLog: "",
    changelog: "",
  },
  images: { banner: "", welcome: "" },
  autorole: "",
  memberGoal: 100,
  stats: { members: "", goal: "" },
  ticketCategory: "",
  session: { voteQuorum: 6 },
};

/** Laad en type-verifieer config.json eenmalig; vult ontbrekende velden met defaults. */
export function loadBotConfig(): BotConfig {
  try {
    const raw: Partial<BotConfig> = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
    return deepMerge(DEFAULTS, raw);
  } catch (error) {
    logger.warn("Kon config.json niet laden; gebruik defaults.", error);
    return structuredClone(DEFAULTS);
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isRecord(base) || !isRecord(override)) {
    return (override ?? base) as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    const bv = out[key];
    const ov = (override as Record<string, unknown>)[key];
    out[key] = deepMerge(bv as unknown, ov);
  }
  return out as T;
}
