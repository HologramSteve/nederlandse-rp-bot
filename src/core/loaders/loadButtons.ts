import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Button } from "../../types/Button.js";
import { logger } from "../utils/logger.js";

const ROOT = join(import.meta.dir, "..", "..");

/** Laadt alle button-handlers uit de buttons-mappen in een Map (keyed customId). */
export async function loadButtons(): Promise<Map<string, Button>> {
  const buttons = new Map<string, Button>();
  const pattern = "**/buttons/*.ts";

  const files = new Bun.Glob(pattern).scanSync({ cwd: ROOT, onlyFiles: true });
  const paths = [...files].filter((f) => !f.includes("/__tests__/"));

  logger.debug("Button-bestanden gevonden: " + paths.length);
  for (const rel of paths) {
    const abs = join(ROOT, rel);
    try {
      const mod = await import(pathToFileURL(abs).href);
      const button: Button | undefined = mod.default ?? mod.button;
      if (!button?.customId || !button.execute) {
        logger.warn("Overgeslagen button zonder customId/execute: " + rel);
        continue;
      }
      if (buttons.has(button.customId)) {
        logger.warn("Dubbele button customId, laatste wint: " + button.customId);
      }
      buttons.set(button.customId, button);
    } catch (error) {
      logger.error("Kon button niet laden: " + rel, error);
    }
  }
  return buttons;
}
