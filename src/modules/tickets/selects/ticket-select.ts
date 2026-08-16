import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  type StringSelectMenuInteraction,
} from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import type { SelectMenu } from "../../../types/SelectMenu.js";
import { TicketRepository } from "../repositories/TicketRepository.js";

const BLUE = 0x0099ff;

/** De beschikbare ticket-typen uit het ticket-dashboard. */
export const TICKET_TYPES = {
  management: { emoji: "📋", label: "Management" },
  application: { emoji: "📝", label: "Sollicitatie" },
  support: { emoji: "🆘", label: "Support" },
  klacht: { emoji: "📢", label: "Klacht" },
} as const;

export type TicketType = keyof typeof TICKET_TYPES;

/** Geef het leesbare Nederlandse label (met emoji) bij een ticket-type. */
export function ticketTypeLabel(type: string): string {
  const entry = TICKET_TYPES[type as TicketType];
  return entry ? `${entry.emoji} ${entry.label}` : type;
}

/**
 * Opent een ticket op basis van de keuze uit het ticket-dashboard:
 * maakt een privékanaal onder de ticket-categorie.
 */
export const ticketSelect: SelectMenu = {
  customId: "ticket-select",
  async execute(interaction: StringSelectMenuInteraction, ctx: ClientContext) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "Tickets werken alleen binnen een server.",
        ephemeral: true,
      });
      return;
    }

    const type = interaction.values[0] ?? "support";
    if (!(type in TICKET_TYPES)) {
      await interaction.reply({
        content: "Ongeldige ticket-optie gekozen.",
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

    const safeName =
      interaction.user.username
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 24) || "lid";

    const channel = await guild.channels.create({
      name: `ticket-${type}-${safeName}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      topic: `${ticketTypeLabel(type)} ticket van <@${interaction.user.id}>`,
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
      category: type,
    });

    const embed = new EmbedBuilder()
      .setColor(BLUE)
      .setTitle(`Ticket geopend — ${ticketTypeLabel(type)}`)
      .setDescription(
        "Hallo <@" +
          interaction.user.id +
          ">,\nomschrijf hieronder je vraag of opmerking. " +
          "Een stafflid neemt je ticket zo snel mogelijk over.",
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
      content: `Je ${ticketTypeLabel(type)}-ticket is geopend: <#${channel.id}>`,
      ephemeral: true,
    });
    logger.info(`Ticket (${type}) geopend door ${interaction.user.tag}`);
  },
};

export default ticketSelect;
