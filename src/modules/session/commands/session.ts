import {
  ChannelType,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import {
  buildErrorEmbed,
  buildInfoEmbed,
  buildJoinRow,
  buildStartEmbed,
  buildStopEmbed,
  buildSuccessEmbed,
  buildVoteEmbed,
} from "../../../embeds.js";
import type { Command } from "../../../types/Command.js";
import { SessionRepository } from "../repositories/SessionRepository.js";

const data = new SlashCommandBuilder()
  .setName("session")
  .setDescription("Sessie commando's (SSU)")
  .addSubcommand((s) => s.setName("vote").setDescription("Zet een sessie-vote open"))
  .addSubcommand((s) => s.setName("start").setDescription("Start een sessie"))
  .addSubcommand((s) => s.setName("stop").setDescription("Stop een sessie"));

export const session: Command = {
  data,
  guildOnly: true,
  permissionLevel: "moderator",
  toJSON() {
    return data.toJSON();
  },

  async execute(interaction: ChatInputCommandInteraction, ctx: ClientContext) {
    const sub = interaction.options.getSubcommand();
    const repo = new SessionRepository(ctx.db);
    const host = interaction.user;
    const now = Date.now();

    const sessionChannel = () => {
      const target = ctx.botConfig.channels.sessions
        ? ctx.client.channels.cache.get(ctx.botConfig.channels.sessions)
        : interaction.channel;
      if (!target || target.type !== ChannelType.GuildText) return null;
      return target;
    };

    if (sub === "vote") {
      const target = sessionChannel();
      if (!target) {
        await interaction.reply({
          embeds: [buildErrorEmbed("Het sessiekanaal uit config.json is ongeldig.")],
          ephemeral: true,
        });
        return;
      }

      repo.updateState({
        status: "vote_active",
        host_id: host.id,
        vote_message_id: null,
      });
      const votersCount = repo.getVoters().length;
      const { embed, row } = buildVoteEmbed({
        hostName: host.username,
        hostId: host.id,
        quorum: ctx.botConfig.session.voteQuorum,
        voters: votersCount,
        at: now,
      });

      const msg = await target.send({ embeds: [embed], components: [row] });
      repo.updateState({ status: "vote_active", vote_message_id: msg.id });
      await interaction.reply({
        embeds: [buildSuccessEmbed("Vote geopend! 🗳️")],
        ephemeral: true,
      });
      return;
    }

    if (sub === "start") {
      const state = repo.getState();
      const joinCode = state?.join_code ?? "12345";
      const target = sessionChannel();
      if (!target) {
        await interaction.reply({
          embeds: [buildErrorEmbed("Het sessiekanaal uit config.json is ongeldig.")],
          ephemeral: true,
        });
        return;
      }

      // Verwijder de eventueel open vote-embed.
      if (state?.vote_message_id) {
        try {
          const m = await target.messages.fetch(state.vote_message_id);
          await m.delete();
        } catch {
          /* negeren */
        }
      }

      repo.updateState({
        status: "active",
        host_id: host.id,
        started_at: now,
        join_code: joinCode,
      });
      repo.clearVoters();

      const embed = buildStartEmbed({
        joinCode,
        hostName: host.username,
        hostId: host.id,
        at: now,
      });
      await target.send({ embeds: [embed], components: [buildJoinRow(joinCode)] });
      await interaction.reply({
        embeds: [buildSuccessEmbed("Sessie gestart! 🟢")],
        ephemeral: true,
      });
      return;
    }

    if (sub === "stop") {
      repo.updateState({ status: "idle", started_at: null, vote_message_id: null });
      repo.clearVoters();
      const embed = buildStopEmbed({ hostName: host.username, at: now });
      const target = sessionChannel();
      if (target) {
        await target.send({ embeds: [embed] });
      }
      await interaction.reply({
        embeds: [buildInfoEmbed("Sessie gestopt. 🔴")],
        ephemeral: true,
      });
      return;
    }
  },
};

export default session;
