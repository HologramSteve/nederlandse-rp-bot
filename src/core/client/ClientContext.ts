import type { Database } from "bun:sqlite";
import type { Client } from "discord.js";
import type { BotConfig } from "../../config/botConfig.js";
import type { Env } from "../../config/env.js";
import type { Button } from "../../types/Button.js";
import type { Command } from "../../types/Command.js";
import type { ServiceRegistry } from "./ServiceRegistry.js";

/**
 * Bevat de gedeelde afhankelijkheden van de bot en wordt aan handlers
 * doorgegeven. Modules importeren deze nooit als singleton; ze ontvangen de
 * context via de handlers.
 */
export interface ClientContext {
  /** Noodzakelijke secrets (token, ids). */
  env: Env;
  /** Niet-geheime instellingen (rollen, kanalen, images). */
  botConfig: BotConfig;
  client: Client;
  db: Database;
  commands: Map<string, Command>;
  buttons: Map<string, Button>;
  services: ServiceRegistry;
}
