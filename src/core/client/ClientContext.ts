import type { Database } from "bun:sqlite";
import type { Client } from "discord.js";
import type { Env } from "../../config/env.js";
import type { Command } from "../../types/Command.js";

/**
 * Bevat de gedeelde afhankelijkheden van de bot en wordt aan handlers
 * doorgegeven. Modules importeren deze nooit als singleton; ze ontvangen de
 * context via de handlers.
 */
export interface ClientContext {
  config: Env;
  client: Client;
  db: Database;
  commands: Map<string, Command>;
}
