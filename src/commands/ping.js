import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Antwoord met pong en toont de latency.");

export async function execute(interaction) {
  const sent = await interaction.reply({
    content: "🏓 Pong!",
    fetchReply: true,
  });

  await interaction.editReply(
    `🏓 Pong! (Latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms)`
  );
}
