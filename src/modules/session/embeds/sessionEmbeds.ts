import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import type { BotConfig } from "../../../config/botConfig.js";

const GREEN = 0x00ff6f;
const RED = 0xf11313;
const BLUE = 0x0099ff;

/** Bouwt de "session-start" embed volgens de standaard (§2.2). */
export function buildStartEmbed(opts: {
  joinCode: string;
  hostName: string;
  hostId: string;
  at: number;
  config: BotConfig;
}): EmbedBuilder {
  const desc =
    `A session has started! Join using code \`${opts.joinCode}\` to join!\n` +
    `Host: <@${opts.hostId}>\nStarted <t:${Math.floor(opts.at / 1000)}:R>`;

  return new EmbedBuilder()
    .setColor(GREEN)
    .setTitle("Session started")
    .setImage(opts.config.images.banner || null)
    .setDescription(desc)
    .addFields(
      { name: "Join code", value: `\`${opts.joinCode}\``, inline: true },
      { name: "Host", value: opts.hostName, inline: true },
      { name: "Started", value: `<t:${Math.floor(opts.at / 1000)}:R>`, inline: true },
    )
    .setFooter({ text: `Host: ${opts.hostName}` })
    .setTimestamp();
}

/** Bouwt een join-knoprij (LINK naar de officiële join-pagina). */
export function buildJoinRow(joinCode: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Join server")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://policeroleplay.community/join/${joinCode}`),
  );
}

/** Bouwt de "ssu-vote" embed met Vote- en Voters-knoppen. */
export function buildVoteEmbed(opts: {
  hostName: string;
  hostId: string;
  quorum: number;
  voters: number;
  at: number;
  config: BotConfig;
}): { embed: EmbedBuilder; row: ActionRowBuilder<ButtonBuilder> } {
  const embed = new EmbedBuilder()
    .setColor(BLUE)
    .setTitle("SSU Vote")
    .setImage(opts.config.images.banner || null)
    .setDescription(
      `A vote is open to start a session. Hit the ✅ button to vote!\nHost: <@${opts.hostId}>\nVote count: **${opts.voters}** / ${opts.quorum}`,
    )
    .addFields(
      { name: "Host", value: opts.hostName, inline: true },
      { name: "Time", value: `<t:${Math.floor(opts.at / 1000)}:t>`, inline: true },
      {
        name: "Info",
        value: "You are required to join within 15 minutes and stay for 25 minutes.",
        inline: false,
      },
    )
    .setFooter({ text: `${opts.voters} total vote(s)` })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel(`✅ Vote (${opts.voters})`)
      .setStyle(ButtonStyle.Success)
      .setCustomId("ssu-vote"),
    new ButtonBuilder()
      .setLabel("Voters")
      .setStyle(ButtonStyle.Secondary)
      .setCustomId("ssu-voters"),
  );

  return { embed, row };
}

/** Bouwt de "session-stop" (SSD) embed. */
export function buildStopEmbed(opts: { hostName: string; at: number }): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(RED)
    .setTitle("Session stopped")
    .setDescription(
      `The server is shutting down. Joining during a shutdown may result in moderation.\nStopped <t:${Math.floor(opts.at / 1000)}:R>`,
    )
    .addFields({ name: "Host", value: opts.hostName, inline: true })
    .setTimestamp();
}
