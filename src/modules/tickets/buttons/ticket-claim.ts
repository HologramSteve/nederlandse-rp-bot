import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import {
  buildErrorEmbed,
  buildSuccessEmbed,
  buildTicketOpenedEmbed,
} from "../../../embeds.js";
import type { Button } from "../../../types/Button.js";
import { hasPermissionLevel } from "../../moderation/guards.js";
import { TicketRepository } from "../repositories/TicketRepository.js";
import { ticketTypeLabel } from "../selects/ticket-select.js";

export const ticketClaim: Button = {
  customId: "ticket-claim",
  async execute(interaction, ctx: ClientContext) {
    const member = interaction.member;
    const isStaff =
      member && "guild" in member
        ? hasPermissionLevel(member, "moderator", ctx.botConfig)
        : false;
    if (!isStaff) {
      await interaction.reply({
        embeds: [buildErrorEmbed("Alleen staff kan een ticket claimen.")],
        ephemeral: true,
      });
      return;
    }

    const repo = new TicketRepository(ctx.db);
    const ticket = repo.findByChannel(interaction.channelId);
    if (!ticket) {
      await interaction.reply({
        embeds: [buildErrorEmbed("Dit is geen ticket-kanaal.")],
        ephemeral: true,
      });
      return;
    }

    if (ticket.status === "closed") {
      await interaction.reply({
        embeds: [buildErrorEmbed("Dit ticket is al gesloten.")],
        ephemeral: true,
      });
      return;
    }

    if (ticket.status === "claimed") {
      await interaction.reply({
        embeds: [
          buildErrorEmbed(
            ticket.claimed_by === interaction.user.id
              ? "Je hebt dit ticket al geclaimd."
              : `Dit ticket is al geclaimd door <@${ticket.claimed_by}>.`,
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    const now = Date.now();
    repo.claim(interaction.channelId, interaction.user.id);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Geclaimd")
        .setStyle(ButtonStyle.Success)
        .setCustomId("ticket-claim")
        .setDisabled(true),
      new ButtonBuilder()
        .setLabel("Sluiten")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("ticket-close"),
    );

    await interaction.update({
      embeds: [
        buildTicketOpenedEmbed({
          typeLabel: ticketTypeLabel(ticket.category),
          ownerId: ticket.owner_id,
          claimedBy: interaction.user.id,
          claimedAt: now,
        }),
      ],
      components: [row],
    });

    await interaction.followUp({
      embeds: [buildSuccessEmbed(`Ticket geclaimd door <@${interaction.user.id}>`)],
      ephemeral: true,
    });
    logger.info(`Ticket ${ticket.ticket_id} geclaimd door ${interaction.user.tag}`);
  },
};

export default ticketClaim;
