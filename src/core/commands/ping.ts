import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command.js";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Antwoord met pong en toont de latency."),

  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({
      content: "🏓 Pong!",
      fetchReply: true,
    });
    await interaction.editReply(
      "🏓 Pong! (Latency: " +
        (sent.createdTimestamp - interaction.createdTimestamp) +
        "ms)",
    );
  },

  toJSON() {
    return this.data.toJSON();
  },
};

export default ping;
