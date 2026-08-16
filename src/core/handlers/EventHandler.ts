import type { Client } from "discord.js";
import type { Event } from "../../types/Event.js";
import { logger } from "../utils/logger.js";

/** Registreert alle geladen events op de client. */
export function registerEvents(client: Client, events: Event[]): void {
  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => {
        Promise.resolve()
          .then(() => event.execute(...args))
          .catch((error: unknown) => {
            logger.error(`Fout in eenmalig event: ${event.name}`, error);
          });
      });
    } else {
      client.on(event.name, (...args) => {
        Promise.resolve()
          .then(() => event.execute(...args))
          .catch((error: unknown) => {
            logger.error(`Fout in event: ${event.name}`, error);
          });
      });
    }
    logger.debug(`Event geregistreerd: ${event.name}`);
  }
}
