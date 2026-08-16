import {
  type ChatInputCommandInteraction,
  type GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import {
  buildErrorEmbed,
  buildInfractionEmbed,
  buildKickSuccessEmbed,
  buildWarnDmEmbed,
  buildWarnSuccessEmbed,
} from "../../../embeds.js";
import type { Command } from "../../../types/Command.js";
import { hasPermissionLevel } from "../guards.js";
import { InfractionRepository } from "../repositories/InfractionRepository.js";

const data = new SlashCommandBuilder()
  .setName("mod")
  .setDescription("Moderatie commando's")
  .addSubcommand((s) =>
    s
      .setName("kick")
      .setDescription("Verwijder een lid uit de server")
      .addUserOption((o) =>
        o.setName("target").setDescription("Het lid").setRequired(true),
      )
      .addStringOption((o) =>
        o.setName("reason").setDescription("Reden").setRequired(false),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName("warn")
      .setDescription("Warn een lid (infractie-log)")
      .addUserOption((o) =>
        o.setName("target").setDescription("Het lid").setRequired(true),
      )
      .addStringOption((o) =>
        o.setName("reason").setDescription("Reden").setRequired(true),
      ),
  );

export const mod: Command = {
  data,
  guildOnly: true,
  permissionLevel: "moderator",
  toJSON() {
    return data.toJSON();
  },

  async execute(interaction: ChatInputCommandInteraction, ctx: ClientContext) {
    const sub = interaction.options.getSubcommand();
    const member = interaction.member;
    if (!member || !("guild" in member)) {
      await interaction.reply({
        embeds: [buildErrorEmbed("Je wordt niet herkend.")],
        ephemeral: true,
      });
      return;
    }

    // Rol-array check (moderator/admin).
    if (
      !hasPermissionLevel(
        member as import("discord.js").GuildMember,
        "moderator",
        ctx.botConfig,
      )
    ) {
      await interaction.reply({
        embeds: [buildErrorEmbed("Je hebt niet genoeg rechten.")],
        ephemeral: true,
      });
      return;
    }

    const resolved = interaction.options.getMember("target");
    // Nieuwe interacties leveren een volwaardige GuildMember op in een guild;
    // via "kickable" in resolved onderscheiden we die van de minimale variant.
    const target: GuildMember | null =
      resolved && "kickable" in resolved ? (resolved as GuildMember) : null;

    if (sub === "kick") {
      // Vereist ECHTE Discord KickMembers-permissie, niet alleen een rol.
      const hasDiscordPerm = member.permissions?.has(PermissionFlagsBits.KickMembers);
      if (!hasDiscordPerm) {
        await interaction.reply({
          embeds: [
            buildErrorEmbed(
              "Je hebt de Discord-permissie KICK_MEMBERS niet; kick geweigerd.",
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      if (!target) {
        await interaction.reply({
          embeds: [buildErrorEmbed("Doel niet gevonden.")],
          ephemeral: true,
        });
        return;
      }
      if (!target.kickable) {
        await interaction.reply({
          embeds: [buildErrorEmbed("Dit lid kan niet gekickt worden (rol-hiërarchie).")],
          ephemeral: true,
        });
        return;
      }

      const reason = interaction.options.getString("reason") ?? "Geen reden";
      const infraction = new InfractionRepository(ctx.db).add({
        type: "termination",
        userId: target.id,
        moderatorId: interaction.user.id,
        reason,
      });

      await logToModChannel(ctx, buildInfractionEmbed(infraction));
      await target.kick(reason);
      await interaction.reply({
        embeds: [
          buildKickSuccessEmbed({
            userTag: target.user.tag,
            caseNo: infraction.case_no,
          }),
        ],
        ephemeral: false,
      });
      logger.info(`${interaction.user.tag} kickte ${target.user.tag}: ${reason}`);
      return;
    }

    if (sub === "warn") {
      if (!target) {
        await interaction.reply({
          embeds: [buildErrorEmbed("Doel niet gevonden.")],
          ephemeral: true,
        });
        return;
      }
      const reason = interaction.options.getString("reason") ?? "Geen reden";
      const infraction = new InfractionRepository(ctx.db).add({
        type: "warning",
        userId: target.id,
        moderatorId: interaction.user.id,
        reason,
      });

      await logToModChannel(ctx, buildInfractionEmbed(infraction));
      await interaction.reply({
        embeds: [
          buildWarnSuccessEmbed({
            userTag: target.user.tag,
            caseNo: infraction.case_no,
          }),
        ],
        ephemeral: false,
      });

      try {
        await target.send({
          embeds: [
            buildWarnDmEmbed({
              guildName: interaction.guild?.name ?? "de server",
              reason,
            }),
          ],
        });
      } catch {
        /* DM gefaald; infractie is al gelogd */
      }
      logger.info(`${interaction.user.tag} waarschuwde ${target.user.tag}: ${reason}`);
      return;
    }
  },
};

async function logToModChannel(
  ctx: ClientContext,
  embed: import("discord.js").EmbedBuilder,
): Promise<void> {
  const modLogId = ctx.botConfig.channels.modLog;
  if (!modLogId) return;
  const channel = ctx.client.channels.cache.get(modLogId);
  if (channel && "send" in channel && typeof channel.send === "function") {
    await channel.send({ embeds: [embed] });
  }
}

export default mod;
