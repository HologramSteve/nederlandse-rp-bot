import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import { buildErrorEmbed, buildTicketClosingEmbed } from "../../../embeds.js";
import type { Button } from "../../../types/Button.js";
import { TicketRepository } from "../repositories/TicketRepository.js";

export const ticketClose: Button = {
  customId: "ticket-close",
  async execute(interaction, ctx: ClientContext) {
    const repo = new TicketRepository(ctx.db);
    const ticket = repo.findByChannel(interaction.channelId);
    if (!ticket) {
      await interaction.reply({
        embeds: [buildErrorEmbed("Dit is geen ticket-kanaal.")],
        ephemeral: true,
      });
      return;
    }

    repo.close(interaction.channelId);
    await interaction.reply({
      embeds: [buildTicketClosingEmbed()],
      ephemeral: false,
    });

    setTimeout(() => {
      interaction.channel?.delete().catch(() => undefined);
    }, 1500);
    logger.info(`Ticket ${ticket.ticket_id} gesloten door ${interaction.user.tag}`);
  },
};

export default ticketClose;
