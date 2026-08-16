import type {
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

/** Keuzemogelijkheid voor een slash-commando. */
export interface Command {
  /** De slash-command metadata (naam, beschrijving, opties). */
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  /** De handler die uitgevoerd wordt wanneer het commando aangeroepen wordt. */
  execute(interaction: ChatInputCommandInteraction): Promise<void> | void;
  /** De JSON-variant die naar de Discord API gestuurd wordt bij registratie. */
  toJSON(): RESTPostAPIApplicationCommandsJSONBody;
  /** Optionele cooldown in seconden per gebruiker. */
  cooldown?: number;
  /** Alleen beschikbaar binnen een guild (server). */
  guildOnly?: boolean;
}
