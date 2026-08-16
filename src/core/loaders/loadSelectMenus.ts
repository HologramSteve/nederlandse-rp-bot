import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { SelectMenu } from "../../types/SelectMenu.js";
import { logger } from "../utils/logger.js";

const ROOT = join(import.meta.dir, "..", "..");

export async function loadSelectMenus(): Promise<Map<string, SelectMenu>> {
  const selectMenus = new Map<string, SelectMenu>();
  const pattern = "**/selects/*.ts";

  const files = new Bun.Glob(pattern).scanSync({ cwd: ROOT, onlyFiles: true });
  const paths = [...files].filter((f) => !f.includes("/__tests__/"));

  logger.debug(`Selectmenu-bestanden gevonden: ${paths.length}`);
  for (const rel of paths) {
    const abs = join(ROOT, rel);
    try {
      const mod = await import(pathToFileURL(abs).href);
      const selectMenu: SelectMenu | undefined = mod.default ?? mod.selectMenu;
      if (!selectMenu?.customId || !selectMenu.execute) {
        logger.warn(`Overgeslagen selectmenu zonder customId/execute: ${rel}`);
        continue;
      }
      if (selectMenus.has(selectMenu.customId)) {
        logger.warn(`Dubbele selectmenu customId, laatste wint: ${selectMenu.customId}`);
      }
      selectMenus.set(selectMenu.customId, selectMenu);
    } catch (error) {
      logger.error(`Kon selectmenu niet laden: ${rel}`, error);
    }
  }
  return selectMenus;
}
