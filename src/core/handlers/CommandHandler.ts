import { Events } from "discord.js";
import type { ClientContext } from "../client/ClientContext.js";
import { logger } from "../utils/logger.js";

/**
 * Beheert de interactie-dispatch en registreert de InteractionCreate-handler
 * op de client. Inclusief een eenvoudige in-memory cooldown.
 */
export function setupCommandHandler(ctx: ClientContext): void {
  const cooldowns = new Map<string, Map<string, number>>();

  ctx.client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = ctx.commands.get(interaction.commandName);
    if (!command) return;

    if (command.guildOnly && !interaction.inGuild()) {
      await interaction.reply({
        content: "Dit commando werkt alleen binnen een server.",
        ephemeral: true,
      });
      return;
    }

    if (command.cooldown) {
      const userId = interaction.user.id;
      const now = Date.now();
      const map = cooldowns.get(userId) ?? new Map<string, number>();
      const last = map.get(command.data.name) ?? 0;
      const wait = command.cooldown * 1000 - (now - last);
      if (wait > 0) {
        await interaction.reply({
          content: `Rustig aan! Wacht nog ${Math.ceil(wait / 1000)} seconde(n) voordat je dit commando opnieuw gebruikt.`,
          ephemeral: true,
        });
        return;
      }
      map.set(command.data.name, now);
      cooldowns.set(userId, map);
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Fout bij commando: ${interaction.commandName}`, error);
      const message = "Er ging iets mis bij het uitvoeren van dit commando.";
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: message, ephemeral: true });
      } else {
        await interaction.reply({ content: message, ephemeral: true });
      }
    }
  });
}
