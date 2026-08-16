import type { GuildMember } from "discord.js";
import type { BotConfig, PermissionLevel } from "../../config/botConfig.js";

export function hasPermissionLevel(
  member: GuildMember,
  required: PermissionLevel,
  config: BotConfig,
): boolean {
  const roles = new Set(member.roles.cache.keys());
  const adminRoles = config.roleArrays.admin;
  const modRoles = config.roleArrays.moderator;

  const isAdmin = adminRoles.some((r) => roles.has(r));
  const isMod = modRoles.some((r) => roles.has(r)) || isAdmin;

  if (required === "admin") return isAdmin;
  if (required === "moderator") return isMod;
  return false;
}
