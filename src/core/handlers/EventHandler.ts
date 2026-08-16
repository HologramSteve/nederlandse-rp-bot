import type { Event } from "../../types/Event.js";
import type { ClientContext } from "../client/ClientContext.js";
import { logger } from "../utils/logger.js";

export function registerEvents(ctx: ClientContext, events: Event[]): void {
  const { client } = ctx;
  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => {
        Promise.resolve()
          .then(() => event.execute(ctx, ...args))
          .catch((error: unknown) => {
            logger.error(`Fout in eenmalig event: ${event.name}`, error);
          });
      });
    } else {
      client.on(event.name, (...args) => {
        Promise.resolve()
          .then(() => event.execute(ctx, ...args))
          .catch((error: unknown) => {
            logger.error(`Fout in event: ${event.name}`, error);
          });
      });
    }
    logger.debug(`Event geregistreerd: ${event.name}`);
  }
}
