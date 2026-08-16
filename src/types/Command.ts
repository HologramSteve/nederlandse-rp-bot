import type {
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import type { PermissionLevel } from "../config/botConfig.js";
import type { ClientContext } from "../core/client/ClientContext.js";

/** Keuzemogelijkheid voor een slash-commando (incl. gegroepeerde subcommands). */
export interface Command {
  /** De slash-command metadata (naam, beschrijving, opties/subcommands). */
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  /** De handler, uitgevoerd met de interactie en de gedeelde context. */
  execute(
    interaction: ChatInputCommandInteraction,
    ctx: ClientContext,
  ): Promise<void> | void;
  /** De JSON-variant die naar de Discord API gestuurd wordt bij registratie. */
  toJSON(): RESTPostAPIApplicationCommandsJSONBody;
  /** Optionele cooldown in seconden per gebruiker. */
  cooldown?: number;
  /** Alleen beschikbaar binnen een guild (server). */
  guildOnly?: boolean;
  /** Minimaal rol-niveau (uit config.roleArrays) nodig om dit commando te runnen. */
  permissionLevel?: PermissionLevel;
}
