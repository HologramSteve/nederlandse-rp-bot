import { Client, type ClientOptions, GatewayIntentBits } from "discord.js";
import type { Env } from "../../config/env.js";
import { openDatabase } from "../db/db.js";
import { setupCommandHandler } from "../handlers/CommandHandler.js";
import { registerEvents } from "../handlers/EventHandler.js";
import { loadCommands } from "../loaders/loadCommands.js";
import { loadEvents } from "../loaders/loadEvents.js";
import type { ClientContext } from "./ClientContext.js";

/** Maak de Discord-client aan met de benodigde intents. */
export function createClient(): Client {
  const options: ClientOptions = {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  };
  return new Client(options);
}

/** Rijg config, db, loaders en handlers aan elkaar en retourneer de context. */
export async function bootstrap(config: Env): Promise<ClientContext> {
  const client = createClient();
  const db = openDatabase();
  const [commands, events] = await Promise.all([loadCommands(), loadEvents()]);

  registerEvents(client, events);
  setupCommandHandler({ config, client, db, commands });

  return { config, client, db, commands };
}
