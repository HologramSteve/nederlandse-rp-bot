import {
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import type { Command } from "../../../types/Command.js";
import { TicketRepository } from "../repositories/TicketRepository.js";
import { TICKET_TYPES } from "../selects/ticket-select.js";

const BLUE = 0x0099ff;

const data = new SlashCommandBuilder()
  .setName("ticket")
  .setDescription("Ticket commando's")
  .addSubcommand((s) =>
    s
      .setName("panel")
      .setDescription("Plaats het ticket-dashboard in het ingestelde kanaal"),
  )
  .addSubcommand((s) => s.setName("claim").setDescription("Claim dit ticket"))
  .addSubcommand((s) => s.setName("close").setDescription("Sluit dit ticket"));

export const ticket: Command = {
  data,
  guildOnly: true,
  permissionLevel: "moderator",
  toJSON() {
    return data.toJSON();
  },

  async execute(interaction: ChatInputCommandInteraction, ctx: ClientContext) {
    const sub = interaction.options.getSubcommand();
    const repo = new TicketRepository(ctx.db);

    if (sub === "panel") {
      const channelId = ctx.botConfig.channels.ticketPanel;
      if (!channelId) {
        await interaction.reply({
          content: "Geen ticket-paneel-kanaal ingesteld (config.json).",
          ephemeral: true,
        });
        return;
      }
      const target = ctx.client.channels.cache.get(channelId);
      if (!target || !("send" in target) || typeof target.send !== "function") {
        await interaction.reply({
          content: "Het ticket-paneel-kanaal is niet gevonden.",
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(BLUE)
        .setTitle("🎫 Ticket-dashboard")
        .setDescription(
          "Kies hieronder een optie om een ticket te openen. " +
            "Een stafflid helpt je zo snel mogelijk verder.",
        )
        .setFooter({ text: "Kies één optie uit het menu" })
        .setTimestamp();

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("ticket-select")
          .setPlaceholder("Kies een optie...")
          .addOptions(
            ...Object.entries(TICKET_TYPES).map(([value, info]) => ({
              label: `${info.emoji} ${info.label}`,
              value,
              description: `Open een ${info.label.toLowerCase()}-ticket`,
            })),
          ),
      );

      await target.send({ embeds: [embed], components: [row] });
      await interaction.reply({
        content: `Ticket-dashboard geplaatst in <#${channelId}>.`,
        ephemeral: true,
      });
      return;
    }

    if (sub === "close") {
      const ticketRec = repo.findByChannel(interaction.channelId);
      if (!ticketRec) {
        await interaction.reply({
          content: "Dit is geen ticket-kanaal.",
          ephemeral: true,
        });
        return;
      }
      repo.close(interaction.channelId);
      await interaction.reply({ content: "Ticket sluiten...", ephemeral: false });
      setTimeout(() => interaction.channel?.delete().catch(() => undefined), 1500);
      logger.info(
        `Ticket ${ticketRec.ticket_id} gesloten via /ticket door ${interaction.user.tag}`,
      );
      return;
    }

    if (sub === "claim") {
      const ticketRec = repo.findByChannel(interaction.channelId);
      if (!ticketRec) {
        await interaction.reply({
          content: "Dit is geen ticket-kanaal.",
          ephemeral: true,
        });
        return;
      }
      repo.claim(interaction.channelId, interaction.user.id);
      await interaction.reply({
        content: `Ticket geclaimd door <@${interaction.user.id}>.`,
        ephemeral: false,
      });
      logger.info(`Ticket ${ticketRec.ticket_id} geclaimd door ${interaction.user.tag}`);
      return;
    }
  },
};

export default ticket;
