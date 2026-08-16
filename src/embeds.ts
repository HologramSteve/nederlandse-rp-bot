import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import type {
  Infraction,
  InfractionType,
} from "./modules/moderation/repositories/InfractionRepository.js";

export const EMBED_COLOR = 0x00ff6f;

export const SUCCESS_COLOR = 0x00ff6f;

export const WARNING_COLOR = 0xffcc00;

export const ERROR_COLOR = 0xf11313;

export const INFO_COLOR = 0x0099ff;

export const STRIKE_COLOR = 0xffa500;

export const BANNER_URL = "";

export const WELCOME_IMAGE_URL = "";

export const FOOTER_TEXT = "Dutch RP";

export function buildErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ERROR_COLOR)
    .setDescription(message)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildWarningEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(WARNING_COLOR)
    .setDescription(message)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildSuccessEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(SUCCESS_COLOR)
    .setDescription(message)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildInfoEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(INFO_COLOR)
    .setDescription(message)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildPingEmbed(latencyMs: number): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle("🏓 Pong!")
    .setDescription(`Latency: **${latencyMs} ms**`)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildWelcomeEmbed(opts: {
  memberId: string;
  memberCount: number;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle("Welkom!")
    .setDescription(`Welkom <@${opts.memberId}> in de community! 🇳🇱`)
    .setImage(WELCOME_IMAGE_URL || null)
    .setFooter({ text: `Lid #${opts.memberCount}` })
    .setTimestamp();
}

export function buildLeaveEmbed(opts: { memberId: string }): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ERROR_COLOR)
    .setTitle("Afwezig")
    .setDescription(`<@${opts.memberId}> heeft de server verlaten.`)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildStartEmbed(opts: {
  joinCode: string;
  hostName: string;
  hostId: string;
  at: number;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle("🟢 Sessie gestart")
    .setImage(BANNER_URL || null)
    .setDescription(
      `Een sessie is gestart! Join met code \`${opts.joinCode}\`.\nHost: <@${opts.hostId}>`,
    )
    .addFields(
      { name: "Join-code", value: `\`${opts.joinCode}\``, inline: true },
      { name: "Host", value: opts.hostName, inline: true },
      { name: "Gestart", value: `<t:${Math.floor(opts.at / 1000)}:R>`, inline: true },
    )
    .setFooter({ text: `Host: ${opts.hostName}` })
    .setTimestamp();
}

export function buildJoinRow(joinCode: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Join server")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://policeroleplay.community/join/${joinCode}`),
  );
}

export function buildVoteEmbed(opts: {
  hostName: string;
  hostId: string;
  quorum: number;
  voters: number;
  at: number;
}): { embed: EmbedBuilder; row: ActionRowBuilder<ButtonBuilder> } {
  const embed = new EmbedBuilder()
    .setColor(INFO_COLOR)
    .setTitle("🗳️ SSU-vote")
    .setImage(BANNER_URL || null)
    .setDescription(
      `Er staat een vote open om een sessie te starten. Druk op ✅ om te stemmen!\nHost: <@${opts.hostId}>\nStemmen: **${opts.voters}** / ${opts.quorum}`,
    )
    .addFields(
      { name: "Host", value: opts.hostName, inline: true },
      { name: "Tijd", value: `<t:${Math.floor(opts.at / 1000)}:t>`, inline: true },
      {
        name: "Info",
        value: "Je moet binnen 15 minuten joinen en 25 minuten blijven.",
        inline: false,
      },
    )
    .setFooter({ text: `${opts.voters} stemmen` })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel(`✅ Stem (${opts.voters})`)
      .setStyle(ButtonStyle.Success)
      .setCustomId("ssu-vote"),
    new ButtonBuilder()
      .setLabel("Stemmers")
      .setStyle(ButtonStyle.Secondary)
      .setCustomId("ssu-voters"),
  );

  return { embed, row };
}

export function buildStopEmbed(opts: { hostName: string; at: number }): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ERROR_COLOR)
    .setTitle("🔴 Sessie gestopt")
    .setDescription(
      `De server wordt afgesloten. Joinen tijdens een shutdown kan leiden tot moderatie.\nGestopt <t:${Math.floor(opts.at / 1000)}:R>`,
    )
    .addFields({ name: "Host", value: opts.hostName, inline: true })
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildVotersEmbed(voters: string[]): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(INFO_COLOR)
    .setTitle("Stemmers")
    .setDescription(
      voters.length > 0 ? voters.map((id) => `<@${id}>`).join(", ") : "Nog geen stemmen.",
    )
    .setFooter({ text: `${voters.length} stemmen` })
    .setTimestamp();
}

const infractionColor: Record<InfractionType, number> = {
  strike: STRIKE_COLOR,
  warning: WARNING_COLOR,
  termination: ERROR_COLOR,
};

export const infractionLabel: Record<InfractionType, string> = {
  strike: "Strike",
  warning: "Waarschuwing",
  termination: "Termination",
};

export function buildInfractionEmbed(infraction: Infraction): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(infractionColor[infraction.type])
    .setTitle(`Case ${infraction.case_no} — ${infractionLabel[infraction.type]}`)
    .setDescription(`<@${infraction.user_id}>`)
    .addFields(
      { name: "Gebruiker", value: `<@${infraction.user_id}>`, inline: true },
      { name: "Moderator", value: `<@${infraction.moderator_id}>`, inline: true },
      {
        name: "Reden",
        value: infraction.reason ?? "Geen reden opgegeven",
        inline: false,
      },
    )
    .setFooter({ text: `Case ${infraction.case_no}` })
    .setTimestamp();
}

export function buildWarnDmEmbed(opts: {
  guildName: string;
  reason: string;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(WARNING_COLOR)
    .setTitle("⚠️ Waarschuwing")
    .setDescription(`Je bent gewaarschuwd in **${opts.guildName}**.`)
    .addFields({ name: "Reden", value: opts.reason, inline: false })
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildKickSuccessEmbed(opts: {
  userTag: string;
  caseNo: number;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(SUCCESS_COLOR)
    .setTitle("✅ Lid gekickt")
    .setDescription(opts.userTag)
    .addFields({ name: "Case", value: `#${opts.caseNo}`, inline: true })
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildWarnSuccessEmbed(opts: {
  userTag: string;
  caseNo: number;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(WARNING_COLOR)
    .setTitle("⚠️ Lid gewaarschuwd")
    .setDescription(opts.userTag)
    .addFields({ name: "Case", value: `#${opts.caseNo}`, inline: true })
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildTicketPanelEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(INFO_COLOR)
    .setTitle("🎫 Ticket-dashboard")
    .setDescription(
      "Kies hieronder een optie om een ticket te openen. " +
        "Een stafflid helpt je zo snel mogelijk verder.",
    )
    .setFooter({ text: "Kies één optie uit het menu" })
    .setTimestamp();
}

export function buildTicketOpenedEmbed(opts: {
  typeLabel: string;
  ownerId: string;
  claimedBy?: string | null;
  claimedAt?: number | null;
}): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(`Ticket geopend — ${opts.typeLabel}`)
    .setDescription(
      `Hallo <@${opts.ownerId}>,\nomschrijf hieronder je vraag of opmerking. ` +
        "Een stafflid neemt je ticket zo snel mogelijk over.",
    )
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();

  if (opts.claimedBy) {
    embed.addFields({
      name: "Geclaimd door",
      value:
        `<@${opts.claimedBy}>` +
        (opts.claimedAt ? ` · <t:${Math.floor(opts.claimedAt / 1000)}:R>` : ""),
      inline: true,
    });
  }
  return embed;
}

export function buildTicketClaimedEmbed(opts: { claimedById: string }): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(INFO_COLOR)
    .setTitle("🎫 Ticket geclaimd")
    .setDescription(`Dit ticket is geclaimd door <@${opts.claimedById}>.`)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildTicketClosingEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ERROR_COLOR)
    .setTitle("🔒 Ticket sluiten")
    .setDescription("Dit ticket wordt gesloten...")
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

export function buildChangelogEmbed(opts: {
  titel: string;
  tekst: string;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(`📢 ${opts.titel}`)
    .setDescription(opts.tekst)
    .setFooter({ text: "Changelog" })
    .setTimestamp();
}
