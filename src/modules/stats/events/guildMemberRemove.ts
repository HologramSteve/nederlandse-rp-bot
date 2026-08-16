import { Events, type GuildMember } from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { buildLeaveEmbed } from "../../../embeds.js";
import type { Event } from "../../../types/Event.js";

/** Vertrek-embed wanneer een lid de server verlaat. */
export const onGuildMemberRemove: Event<typeof Events.GuildMemberRemove> = {
  name: Events.GuildMemberRemove,
  async execute(ctx: ClientContext, member: GuildMember) {
    const leaveId = ctx.botConfig.channels.leave;
    if (!leaveId) return;
    const channel = ctx.client.channels.cache.get(leaveId);
    if (!channel || !("send" in channel) || typeof channel.send !== "function") return;

    await channel.send({ embeds: [buildLeaveEmbed({ memberId: member.id })] });
  },
};

export default onGuildMemberRemove;
