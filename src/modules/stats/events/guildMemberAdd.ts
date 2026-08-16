import { EmbedBuilder, Events, type GuildMember } from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import type { Event } from "../../../types/Event.js";

/** Welkom-embed + autorole bij een nieuwe aanmelding. */
export const onGuildMemberAdd: Event<typeof Events.GuildMemberAdd> = {
  name: Events.GuildMemberAdd,
  async execute(ctx: ClientContext, member: GuildMember) {
    const config = ctx.botConfig;

    // Autorole.
    if (config.autorole) {
      try {
        await member.roles.add(config.autorole);
      } catch (error) {
        logger.warn(`Kon autorole niet toekennen aan ${member.user.tag}`, error);
      }
    }

    // Welkom-embed.
    const welcomeId = config.channels.welcome;
    if (!welcomeId) return;
    const channel = ctx.client.channels.cache.get(welcomeId);
    if (!channel || !("send" in channel) || typeof channel.send !== "function") return;

    const embed = new EmbedBuilder()
      .setColor(0x00ff6f)
      .setTitle("Welkom!")
      .setDescription(`Welkom <@${member.id}> in de community! 🇳🇱`)
      .setImage(config.images.welcome || null)
      .setFooter({ text: `Lid #${member.guild.memberCount}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    logger.info(`Nieuw lid: ${member.user.tag}`);
  },
};

export default onGuildMemberAdd;
