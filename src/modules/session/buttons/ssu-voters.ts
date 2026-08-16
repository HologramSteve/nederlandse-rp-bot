import { EmbedBuilder } from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import type { Button } from "../../../types/Button.js";
import { SessionRepository } from "../repositories/SessionRepository.js";

/** Voters-knop: toont wie er allemaal gestemd hebben. */
export const ssuVoters: Button = {
  customId: "ssu-voters",
  async execute(interaction, ctx: ClientContext) {
    const repo = new SessionRepository(ctx.db);
    const voters = repo.getVoters();

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Voters")
      .setDescription(
        voters.length > 0
          ? voters.map((id) => `<@${id}>`).join(", ")
          : "No IDs to display.",
      )
      .setFooter({ text: `${voters.length} total vote(s)` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

export default ssuVoters;
