import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import {
  buildErrorEmbed,
  buildJoinRow,
  buildStartEmbed,
  buildSuccessEmbed,
  buildVoteEmbed,
  buildWarningEmbed,
} from "../../../embeds.js";
import type { Button } from "../../../types/Button.js";
import { SessionRepository } from "../repositories/SessionRepository.js";

export const ssuVote: Button = {
  customId: "ssu-vote",
  async execute(interaction, ctx: ClientContext) {
    const repo = new SessionRepository(ctx.db);
    const state = repo.getState();

    if (state?.status !== "vote_active") {
      await interaction.reply({
        embeds: [buildErrorEmbed("Er is geen actieve SSU-vote.")],
        ephemeral: true,
      });
      return;
    }

    if (repo.hasVoter(interaction.user.id)) {
      await interaction.reply({
        embeds: [buildWarningEmbed("Je hebt al gestemd.")],
        ephemeral: true,
      });
      return;
    }

    repo.addVoter(interaction.user.id);
    const voters = repo.getVoters();
    const quorum = ctx.botConfig.session.voteQuorum;
    const hostName = ctx.client.users.cache.get(state.host_id ?? "")?.username ?? "host";

    const { embed, row } = buildVoteEmbed({
      hostName,
      hostId: state.host_id ?? "",
      quorum,
      voters: voters.length,
      at: Date.now(),
    });
    await interaction.update({ embeds: [embed], components: [row] });

    if (voters.length >= quorum) {
      const now = Date.now();
      repo.updateState({
        status: "active",
        started_at: now,
        vote_message_id: null,
      });

      const startEmbed = buildStartEmbed({
        joinCode: state.join_code ?? "12345",
        hostName,
        hostId: state.host_id ?? "",
        at: now,
      });

      try {
        await interaction.message.delete();
      } catch {}

      const target =
        (ctx.botConfig.channels.sessions &&
          ctx.client.channels.cache.get(ctx.botConfig.channels.sessions)) ||
        interaction.channel;
      if (target && "send" in target && typeof target.send === "function") {
        await target.send({
          embeds: [startEmbed],
          components: [buildJoinRow(state.join_code ?? "12345")],
        });
      }
      await interaction.followUp({
        embeds: [buildSuccessEmbed("Quorum bereikt! Sessie gestart 🟢")],
        ephemeral: true,
      });
      logger.info("SSU-vote quorum bereikt; sessie gestart.");
    } else {
      await interaction.followUp({
        embeds: [buildSuccessEmbed("Bedankt voor je stem! 🗳️")],
        ephemeral: true,
      });
    }
  },
};

export default ssuVote;
