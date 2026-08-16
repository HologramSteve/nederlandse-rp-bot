import { EmbedBuilder, Events, type GuildMember } from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import type { Event } from "../../../types/Event.js";

/** Vertrek-embed wanneer een lid de server verlaat. */
export const onGuildMemberRemove: Event<typeof Events.GuildMemberRemove> = {
  name: Events.GuildMemberRemove,
  async execute(ctx: ClientContext, member: GuildMember) {
    const leaveId = ctx.botConfig.channels.leave;
    if (!leaveId) return;
    const channel = ctx.client.channels.cache.get(leaveId);
    if (!channel || !("send" in channel) || typeof channel.send !== "function") return;

    const embed = new EmbedBuilder()
      .setColor(0xf11313)
      .setTitle("Afwezig")
      .setDescription(`<@${member.id}> heeft de server verlaten.`)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
};

export default onGuildMemberRemove;
