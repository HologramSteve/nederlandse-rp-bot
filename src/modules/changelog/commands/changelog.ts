import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import {
  buildChangelogEmbed,
  buildErrorEmbed,
  buildSuccessEmbed,
} from "../../../embeds.js";
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
        embeds: [
          buildErrorEmbed(
            "Geen changelog-kanaal ingesteld (config.json → channels.changelog).",
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    const target = ctx.client.channels.cache.get(channelId);
    if (!target || !("send" in target) || typeof target.send !== "function") {
      await interaction.reply({
        embeds: [
          buildErrorEmbed(
            "Het changelog-kanaal is niet gevonden. Controleer config.json.",
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    await target.send({ embeds: [buildChangelogEmbed({ titel, tekst })] });
    await interaction.reply({
      embeds: [buildSuccessEmbed(`Changelog geplaatst in <#${channelId}>.`)],
      ephemeral: true,
    });
  },
};

export default changelog;
