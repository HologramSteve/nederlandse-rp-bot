import { Client, Events, GatewayIntentBits } from "discord.js";

export function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  return client;
}

export async function startBot() {
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
    const handler = client.commands?.get(commandName);

    if (handler) {
      try {
        await handler(interaction);
      } catch (error) {
        console.error(`Fout bij commando ${commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "Er ging iets mis bij het uitvoeren van dit commando.",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "Er ging iets mis bij het uitvoeren van dit commando.",
            ephemeral: true,
          });
        }
      }
    }
  });

  await client.login(token);
  return client;
}
