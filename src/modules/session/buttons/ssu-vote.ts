import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import type { Button } from "../../../types/Button.js";
import { buildJoinRow, buildStartEmbed } from "../embeds/sessionEmbeds.js";
import { SessionRepository } from "../repositories/SessionRepository.js";

const BLUE = 0x0099ff;

/** ✅ knop: registreert een stem, telt bij en start bij quorum. */
export const ssuVote: Button = {
  customId: "ssu-vote",
  async execute(interaction, ctx: ClientContext) {
    const repo = new SessionRepository(ctx.db);
    const state = repo.getState();

    if (state?.status !== "vote_active") {
      await interaction.reply({
        content: "There is not an SSU vote active.",
        ephemeral: true,
      });
      return;
    }

    if (repo.hasVoter(interaction.user.id)) {
      await interaction.reply({
        content: "You have already voted.",
        ephemeral: true,
      });
      return;
    }

    repo.addVoter(interaction.user.id);
    const voters = repo.getVoters();
    const quorum = ctx.botConfig.session.voteQuorum;

    // Hijsbericht: edit de originele vote-embed live.
    const message = interaction.message;
    const oldEmbed = message.embeds[0];
    const newEmbed = oldEmbed
      ? EmbedBuilder.from(oldEmbed)
          .setDescription(
            `A vote is open to start a session. Hit the ✅ button to vote!\nHost: <@${state.host_id}>\nVote count: **${voters.length}** / ${quorum}`,
          )
          .setFooter({ text: `${voters.length} total vote(s)` })
      : new EmbedBuilder().setColor(BLUE).setTitle("SSU Vote");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel(`✅ Vote (${voters.length})`)
        .setStyle(ButtonStyle.Success)
        .setCustomId("ssu-vote"),
      new ButtonBuilder()
        .setLabel("Voters")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("ssu-voters"),
    );
    await interaction.update({ embeds: [newEmbed], components: [row] });

    if (voters.length >= quorum) {
      // Quorum bereikt: start de sessie.
      const now = Date.now();
      const hostName =
        ctx.client.users.cache.get(state.host_id ?? "")?.username ?? "host";
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
        config: ctx.botConfig,
      });

      try {
        await message.delete();
      } catch {
        /* negeren */
      }

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
        content: "Quorum bereikt! Sessie gestart 🟢",
        ephemeral: true,
      });
      logger.info("SSU-vote quorum bereikt; sessie gestart.");
    } else {
      await interaction.followUp({ content: "Thanks for voting!", ephemeral: true });
    }
  },
};

export default ssuVote;
