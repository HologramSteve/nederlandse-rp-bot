import { type Client, Events } from "discord.js";
import type { Event } from "../../types/Event.js";
import { logger } from "../utils/logger.js";

/** Log de bot-bijnaam zodra hij online is. */
export const onReady: Event<typeof Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    const tag = client.user ? client.user.tag : "(onbekend)";
    logger.info(`Ingelogd als ${tag}! ✅`);
  },
};

export default onReady;
