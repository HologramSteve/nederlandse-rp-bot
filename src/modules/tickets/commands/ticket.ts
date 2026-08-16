import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import type { Command } from "../../../types/Command.js";
import { TicketRepository } from "../repositories/TicketRepository.js";

const data = new SlashCommandBuilder()
  .setName("ticket")
  .setDescription("Ticket commando's")
  .addSubcommand((s) => s.setName("claim").setDescription("Claim dit ticket"))
  .addSubcommand((s) => s.setName("close").setDescription("Sluit dit ticket"))
  .addSubcommand((s) => s.setName("open").setDescription("Open een ticket"));

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

    if (sub === "open") {
      const existing = repo.findOpenByOwner(interaction.user.id);
      if (existing) {
        await interaction.reply({
          content: `Je hebt al een open ticket: <#${existing.channel_id}>`,
          ephemeral: true,
        });
        return;
      }
      await interaction.reply({
        content: "Gebruik de ticket-knop in het ticket-paneel om een ticket te openen.",
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
