import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Command } from "../../types/Command.js";
import { logger } from "../utils/logger.js";

const ROOT = join(import.meta.dir, "..", "..");

export async function loadCommands(): Promise<Map<string, Command>> {
  const commands = new Map<string, Command>();
  const pattern = "**/commands/*.ts";

  const files = new Bun.Glob(pattern).scanSync({ cwd: ROOT, onlyFiles: true });
  const paths = [...files].filter((f) => !f.includes("/__tests__/"));

  logger.debug(`Commando-bestanden gevonden: ${paths.length}`);
  for (const rel of paths) {
    const abs = join(ROOT, rel);
    try {
      const mod = await import(pathToFileURL(abs).href);
      const cmd: Command | undefined = mod.default ?? mod.command;
      if (!cmd?.data?.name) {
        logger.warn(`Overgeslagen commando zonder data.name: ${rel}`);
        continue;
      }
      if (commands.has(cmd.data.name)) {
        logger.warn(`Dubbele commandonaam, laatste wint: "${cmd.data.name}"`);
      }
      commands.set(cmd.data.name, cmd);
    } catch (error) {
      logger.error(`Kon commando niet laden: ${rel}`, error);
    }
  }
  return commands;
}
