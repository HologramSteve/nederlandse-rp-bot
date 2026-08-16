import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import type { Button } from "../../../types/Button.js";
import { TicketRepository } from "../repositories/TicketRepository.js";

const BLUE = 0x0099ff;

/** Opent een support-ticket: maakt een privékanaal onder de ticket-categorie. */
export const ticketOpen: Button = {
  customId: "ticket-open",
  async execute(interaction, ctx: ClientContext) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "Groep-tickets werken alleen binnen een server.",
        ephemeral: true,
      });
      return;
    }

    const repo = new TicketRepository(ctx.db);
    const existing = repo.findOpenByOwner(interaction.user.id);
    if (existing) {
      await interaction.reply({
        content: `Je hebt al een open ticket: <#${existing.channel_id}>`,
        ephemeral: true,
      });
      return;
    }

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "Server niet gevonden.", ephemeral: true });
      return;
    }
    const categoryId = ctx.botConfig.ticketCategory;
    if (!categoryId) {
      await interaction.reply({
        content: "Ticket-categorie is niet geconfigureerd (config.json).",
        ephemeral: true,
      });
      return;
    }

    const channel = await guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      topic: `ticket voor <@${interaction.user.id}> (unpaid)`,
    });

    // Permission overwrites: ontken @everyone, geef owner + bot toegang.
    await channel.permissionOverwrites.set([
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
      {
        id: ctx.client.user?.id ?? "",
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
    ]);

    repo.create({
      ownerId: interaction.user.id,
      channelId: channel.id,
      category: "general",
    });

    const embed = new EmbedBuilder()
      .setColor(BLUE)
      .setTitle("Ticket geopend")
      .setDescription(
        `Hallo <@${interaction.user.id}>, omschrijf hier je vraag of klacht.`,
      )
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Sluiten")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("ticket-close"),
    );

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({
      content: `Je ticket is geopend: <#${channel.id}>`,
      ephemeral: true,
    });
    logger.info(`Ticket geopend door ${interaction.user.tag}`);
  },
};

export default ticketOpen;
