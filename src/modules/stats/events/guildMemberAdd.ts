import { Events, type GuildMember } from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import { buildWelcomeEmbed } from "../../../embeds.js";
import type { Event } from "../../../types/Event.js";

export const onGuildMemberAdd: Event<typeof Events.GuildMemberAdd> = {
  name: Events.GuildMemberAdd,
  async execute(ctx: ClientContext, member: GuildMember) {
    const config = ctx.botConfig;

    if (config.autorole) {
      try {
        await member.roles.add(config.autorole);
      } catch (error) {
        logger.warn(`Kon autorole niet toekennen aan ${member.user.tag}`, error);
      }
    }

    const welcomeId = config.channels.welcome;
    if (!welcomeId) return;
    const channel = ctx.client.channels.cache.get(welcomeId);
    if (!channel || !("send" in channel) || typeof channel.send !== "function") return;

    const embed = buildWelcomeEmbed({
      memberId: member.id,
      memberCount: member.guild.memberCount,
    });

    await channel.send({ embeds: [embed] });
    logger.info(`Nieuw lid: ${member.user.tag}`);
  },
};

export default onGuildMemberAdd;
