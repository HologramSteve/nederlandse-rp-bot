import { EmbedBuilder } from "discord.js";
import type { Infraction, InfractionType } from "../repositories/InfractionRepository.js";

const typeColor: Record<InfractionType, number> = {
  strike: 0xffa500, // oranje
  warning: 0xffcc00, // geel
  termination: 0xf11313, // rood
};

export const typeLabel: Record<InfractionType, string> = {
  strike: "Strike",
  warning: "Warning",
  termination: "Termination",
};

/** Bouwt de mod-log embed voor een infractie/kick. */
export function buildInfractionEmbed(infraction: Infraction): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(typeColor[infraction.type])
    .setTitle(`Case ${infraction.case_no} — ${typeLabel[infraction.type]}`)
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
