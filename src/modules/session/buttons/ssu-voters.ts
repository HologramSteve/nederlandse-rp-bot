import type { ClientContext } from "../../../core/client/ClientContext.js";
import { buildVotersEmbed } from "../../../embeds.js";
import type { Button } from "../../../types/Button.js";
import { SessionRepository } from "../repositories/SessionRepository.js";

/** Stemmers-knop: toont wie er allemaal gestemd hebben. */
export const ssuVoters: Button = {
  customId: "ssu-voters",
  async execute(interaction, ctx: ClientContext) {
    const repo = new SessionRepository(ctx.db);
    const voters = repo.getVoters();
    await interaction.reply({
      embeds: [buildVotersEmbed(voters)],
      ephemeral: true,
    });
  },
};

export default ssuVoters;
