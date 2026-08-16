import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  Events,
  type StringSelectMenuInteraction,
} from "discord.js";
import { buildErrorEmbed, buildWarningEmbed } from "../../embeds.js";
import { hasPermissionLevel } from "../../modules/moderation/guards.js";
import type { ClientContext } from "../client/ClientContext.js";
import { logger } from "../utils/logger.js";

/**
 * Beheert de interactie-dispatch (slash-commands + buttons) en registreert de
 * InteractionCreate-handler op de client.
 */
export function setupCommandHandler(ctx: ClientContext): void {
  const cooldowns = new Map<string, Map<string, number>>();

  ctx.client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction, ctx, cooldowns);
    } else if (interaction.isButton()) {
      await handleButton(interaction, ctx);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction, ctx);
    }
  });
}

async function handleCommand(
  interaction: ChatInputCommandInteraction,
  ctx: ClientContext,
  cooldowns: Map<string, Map<string, number>>,
): Promise<void> {
  const command = ctx.commands.get(interaction.commandName);
  if (!command) return;

  if (command.guildOnly && !interaction.inGuild()) {
    await interaction.reply({
      embeds: [buildErrorEmbed("Dit commando werkt alleen binnen een server.")],
      ephemeral: true,
    });
    return;
  }

  // Permission-gating op basis van rol-arrays (moderator/admin).
  if (command.permissionLevel) {
    const member = interaction.member;
    if (!member || "user" in member === false) {
      await interaction.reply({
        embeds: [buildErrorEmbed("Je wordt niet herkend als lid van deze server.")],
        ephemeral: true,
      });
      return;
    }
    const guildMember =
      interaction.member && "guild" in interaction.member
        ? (interaction.member as import("discord.js").GuildMember)
        : null;
    if (
      !guildMember ||
      !hasPermissionLevel(guildMember, command.permissionLevel, ctx.botConfig)
    ) {
      await interaction.reply({
        embeds: [
          buildErrorEmbed("Je hebt niet genoeg rechten om dit commando te gebruiken."),
        ],
        ephemeral: true,
      });
      return;
    }
  }

  if (command.cooldown) {
    const userId = interaction.user.id;
    const now = Date.now();
    const map = cooldowns.get(userId) ?? new Map<string, number>();
    const last = map.get(command.data.name) ?? 0;
    const wait = command.cooldown * 1000 - (now - last);
    if (wait > 0) {
      await interaction.reply({
        embeds: [
          buildWarningEmbed(
            `Rustig aan! Wacht nog ${Math.ceil(wait / 1000)} seconde(n) voordat je dit commando opnieuw gebruikt.`,
          ),
        ],
        ephemeral: true,
      });
      return;
    }
    map.set(command.data.name, now);
    cooldowns.set(userId, map);
  }

  try {
    await command.execute(interaction, ctx);
  } catch (error) {
    logger.error(`Fout bij commando: ${interaction.commandName}`, error);
    const embed = buildErrorEmbed("Er ging iets mis bij het uitvoeren van dit commando.");
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}

async function handleSelectMenu(
  interaction: StringSelectMenuInteraction,
  ctx: ClientContext,
): Promise<void> {
  const selectMenu = ctx.selectMenus.get(interaction.customId);
  if (!selectMenu) {
    await interaction.reply({
      embeds: [buildErrorEmbed("Dit selectmenu is verlopen of niet meer actief.")],
      ephemeral: true,
    });
    return;
  }
  try {
    await selectMenu.execute(interaction, ctx);
  } catch (error) {
    logger.error(`Fout bij selectmenu: ${interaction.customId}`, error);
    await interaction
      .reply({ embeds: [buildErrorEmbed("Er ging iets mis.")], ephemeral: true })
      .catch(() => undefined);
  }
}

async function handleButton(
  interaction: ButtonInteraction,
  ctx: ClientContext,
): Promise<void> {
  const button = ctx.buttons.get(interaction.customId);
  if (!button) {
    await interaction.reply({
      embeds: [buildErrorEmbed("Deze knop is verlopen of niet meer actief.")],
      ephemeral: true,
    });
    return;
  }
  try {
    await button.execute(interaction, ctx);
  } catch (error) {
    logger.error(`Fout bij knop: ${interaction.customId}`, error);
    await interaction
      .reply({ embeds: [buildErrorEmbed("Er ging iets mis.")], ephemeral: true })
      .catch(() => undefined);
  }
}
