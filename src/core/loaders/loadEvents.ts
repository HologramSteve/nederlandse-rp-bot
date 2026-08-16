import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Event } from "../../types/Event.js";
import { logger } from "../utils/logger.js";

const ROOT = join(import.meta.dir, "..", "..");

/** Laadt alle event-handlers uit de events-mappen in een lijst. */
export async function loadEvents(): Promise<Event[]> {
  const events: Event[] = [];
  const pattern = "**/events/*.ts";

  const files = new Bun.Glob(pattern).scanSync({ cwd: ROOT, onlyFiles: true });
  const paths = [...files].filter((f) => !f.includes("/__tests__/"));

  logger.debug(`Event-bestanden gevonden: ${paths.length}`);
  for (const rel of paths) {
    const abs = join(ROOT, rel);
    try {
      const mod = await import(pathToFileURL(abs).href);
      const event: Event | undefined = mod.default ?? mod.event;
      if (!event?.name || !event.execute) {
        logger.warn(`Overgeslagen event zonder name/execute: ${rel}`);
        continue;
      }
      events.push(event);
    } catch (error) {
      logger.error(`Kon event niet laden: ${rel}`, error);
    }
  }
  return events;
}
