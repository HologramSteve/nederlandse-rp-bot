import type { Database } from "bun:sqlite";
import type { Client } from "discord.js";
import type { BotConfig } from "../../config/botConfig.js";
import type { Env } from "../../config/env.js";
import type { Button } from "../../types/Button.js";
import type { Command } from "../../types/Command.js";
import type { SelectMenu } from "../../types/SelectMenu.js";
import type { ServiceRegistry } from "./ServiceRegistry.js";

export interface ClientContext {
  env: Env;

  botConfig: BotConfig;
  client: Client;
  db: Database;
  commands: Map<string, Command>;
  buttons: Map<string, Button>;
  selectMenus: Map<string, SelectMenu>;
  services: ServiceRegistry;
}
