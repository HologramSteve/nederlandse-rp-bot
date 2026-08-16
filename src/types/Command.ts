import type {
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import type { PermissionLevel } from "../config/botConfig.js";
import type { ClientContext } from "../core/client/ClientContext.js";

export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;

  execute(
    interaction: ChatInputCommandInteraction,
    ctx: ClientContext,
  ): Promise<void> | void;

  toJSON(): RESTPostAPIApplicationCommandsJSONBody;

  cooldown?: number;

  guildOnly?: boolean;

  permissionLevel?: PermissionLevel;
}
