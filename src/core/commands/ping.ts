import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { buildPingEmbed } from "../../embeds.js";
import type { Command } from "../../types/Command.js";
import type { ClientContext } from "../client/ClientContext.js";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Antwoord met pong en toont de latency."),

  async execute(interaction: ChatInputCommandInteraction, _ctx: ClientContext) {
    const sent = await interaction.reply({
      embeds: [buildPingEmbed(0)],
      fetchReply: true,
    });
    await interaction.editReply({
      embeds: [buildPingEmbed(sent.createdTimestamp - interaction.createdTimestamp)],
    });
  },

  toJSON() {
    return this.data.toJSON();
  },
};

export default ping;
