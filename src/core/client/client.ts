import { Client, type ClientOptions, Events, GatewayIntentBits } from "discord.js";
import type { BotConfig } from "../../config/botConfig.js";
import type { Env } from "../../config/env.js";
import { StatsService } from "../../modules/stats/services/StatsService.js";
import { openDatabase } from "../db/db.js";
import { setupCommandHandler } from "../handlers/CommandHandler.js";
import { registerEvents } from "../handlers/EventHandler.js";
import { loadButtons } from "../loaders/loadButtons.js";
import { loadCommands } from "../loaders/loadCommands.js";
import { loadEvents } from "../loaders/loadEvents.js";
import { loadSelectMenus } from "../loaders/loadSelectMenus.js";
import type { ClientContext } from "./ClientContext.js";

export function createClient(): Client {
  const options: ClientOptions = {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  };
  return new Client(options);
}

export async function bootstrap(env: Env, botConfig: BotConfig): Promise<ClientContext> {
  const client = createClient();
  const db = openDatabase();
  const [commands, buttons, selectMenus, events] = await Promise.all([
    loadCommands(),
    loadButtons(),
    loadSelectMenus(),
    loadEvents(),
  ]);

  const ctx: ClientContext = {
    env,
    botConfig,
    client,
    db,
    commands,
    buttons,
    selectMenus,
    services: { stopAll() {} },
  };

  registerEvents(ctx, events);
  setupCommandHandler(ctx);

  const statsService = new StatsService(ctx);
  client.once(Events.ClientReady, () => {
    statsService.start();
  });
  ctx.services.stopAll = () => {
    statsService.stop();
  };

  return ctx;
}
