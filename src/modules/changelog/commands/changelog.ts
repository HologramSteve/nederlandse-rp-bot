import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import type { Command } from "../../../types/Command.js";

const data = new SlashCommandBuilder()
  .setName("changelog")
  .setDescription("Plaats een changelog-update als embed in het changelog-kanaal")
  .addStringOption((o) =>
    o.setName("titel").setDescription("Titel van de update").setRequired(true),
  )
  .addStringOption((o) =>
    o.setName("tekst").setDescription("Omschrijving van de update").setRequired(true),
  );

export const changelog: Command = {
  data,
  guildOnly: true,
  permissionLevel: "admin",
  toJSON() {
    return data.toJSON();
  },

  async execute(interaction: ChatInputCommandInteraction, ctx: ClientContext) {
    const titel = interaction.options.getString("titel", true);
    const tekst = interaction.options.getString("tekst", true);

    const channelId = ctx.botConfig.channels.changelog;
    if (!channelId) {
      await interaction.reply({
        content: "Geen changelog-kanaal ingesteld (config.json → channels.changelog).",
        ephemeral: true,
      });
      return;
    }

    const target = ctx.client.channels.cache.get(channelId);
    if (!target || !("send" in target) || typeof target.send !== "function") {
      await interaction.reply({
        content: "Het changelog-kanaal is niet gevonden. Controleer config.json.",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff6f)
      .setTitle(`📢 ${titel}`)
      .setDescription(tekst)
      .setFooter({ text: "Changelog" })
      .setTimestamp();

    await target.send({ embeds: [embed] });
    await interaction.reply({
      content: `Changelog geplaatst in <#${channelId}>.`,
      ephemeral: true,
    });
  },
};

export default changelog;
