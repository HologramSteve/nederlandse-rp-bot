import {
  Client,
  Events,
  GatewayIntentBits,
  type ClientOptions,
} from "discord.js";
import { commands } from "./commands/index.js";

/** Maak een Discord-client aan met de benodigde intents. */
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

/** Log de bot in en registreer alle event-handlers. */
export async function startBot(): Promise<Client> {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error(
      "Geen DISCORD_TOKEN gevonden. Controleer je .env bestand."
    );
  }

  const client = createClient();

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ingelogd als ${readyClient.user.tag}! ✅`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    const command = commands.get(commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Fout bij commando ${commandName}:`, error);
      const message = "Er ging iets mis bij het uitvoeren van dit commando.";
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: message, ephemeral: true });
      } else {
        await interaction.reply({ content: message, ephemeral: true });
      }
    }
  });

  await client.login(token);
  return client;
}
