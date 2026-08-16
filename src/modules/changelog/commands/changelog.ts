import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import type { Command } from "../../../types/Command.js";
import {
  ChangelogRepository,
  type ChangeType,
} from "../repositories/ChangelogRepository.js";

const data = new SlashCommandBuilder()
  .setName("changelog")
  .setDescription("Stash-changelog")
  .addSubcommand((s) =>
    s
      .setName("add")
      .setDescription("Voeg een item toe aan de stash")
      .addStringOption((o) =>
        o.setName("item").setDescription("Itemnaam").setRequired(true),
      )
      .addIntegerOption((o) =>
        o.setName("amount").setDescription("Aantal").setRequired(true),
      )
      .addStringOption((o) =>
        o.setName("note").setDescription("Notitie").setRequired(false),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName("remove")
      .setDescription("Verwijder een item uit de stash")
      .addStringOption((o) =>
        o.setName("item").setDescription("Itemnaam").setRequired(true),
      )
      .addIntegerOption((o) =>
        o.setName("amount").setDescription("Aantal").setRequired(true),
      )
      .addStringOption((o) =>
        o.setName("note").setDescription("Notitie").setRequired(false),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName("list")
      .setDescription("Toon recente changelog-entries")
      .addIntegerOption((o) =>
        o.setName("count").setDescription("Aantal (max 25)").setRequired(false),
      ),
  );

export const changelog: Command = {
  data,
  guildOnly: true,
  permissionLevel: "admin",
  toJSON() {
    return data.toJSON();
  },

  async execute(interaction: ChatInputCommandInteraction, ctx: ClientContext) {
    const sub = interaction.options.getSubcommand();
    const repo = new ChangelogRepository(ctx.db);

    if (sub === "add" || sub === "remove") {
      const item = interaction.options.getString("item", true);
      const amount = interaction.options.getInteger("amount", true);
      const note = interaction.options.getString("note") ?? undefined;
      const changeType: ChangeType = sub === "add" ? "add" : "remove";

      const entry = repo.add({
        itemName: item,
        changeType,
        amount,
        note,
        changedBy: interaction.user.id,
      });

      const embed = buildEntryEmbed(entry);
      const target = ctx.botConfig.channels.stashLog
        ? ctx.client.channels.cache.get(ctx.botConfig.channels.stashLog)
        : null;
      if (target && "send" in target && typeof target.send === "function") {
        await target.send({ embeds: [embed] });
      }
      await interaction.reply({
        content: `Changelog bijgewerkt (entry #${entry.id}).`,
        ephemeral: false,
      });
      return;
    }

    if (sub === "list") {
      const count = Math.min(interaction.options.getInteger("count") ?? 10, 25);
      const entries = repo.list(count);
      const lines =
        entries.length > 0
          ? entries
              .map(
                (e) =>
                  `#${e.id} · **[${emoji(e.change_type)}] ${e.item_name}** ×${e.amount}` +
                  (e.note ? ` — ${e.note}` : "") +
                  ` · <@${e.changed_by}>`,
              )
              .join("\n")
          : "Nog geen changelog-entries.";

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Stash changelog")
        .setDescription(lines)
        .setFooter({ text: `${entries.length} entries` })
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: false });
      return;
    }
  },
};

function emoji(t: ChangeType): string {
  if (t === "add") return "➕";
  if (t === "remove") return "➖";
  return "✏️";
}

function buildEntryEmbed(entry: ReturnType<ChangelogRepository["add"]>): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`Changelog: ${emoji(entry.change_type)} ${entry.item_name}`)
    .setDescription(
      `Aantal: **${entry.amount}**${entry.note ? `\nNotitie: ${entry.note}` : ""}`,
    )
    .addFields({ name: "Aangepast door", value: `<@${entry.changed_by}>`, inline: true })
    .setTimestamp();
}

export default changelog;
