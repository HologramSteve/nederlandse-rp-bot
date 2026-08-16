import type { GuildMember } from "discord.js";
import type { BotConfig, PermissionLevel } from "../../config/botConfig.js";

/**
 * Controleert of een lid het gevraagde niveau heeft op basis van
 * (a) de Discord-permissies en (b) de rol-arrays uit config.json.
 * Admin impliceert moderator; moderator kan kick, admin kan alles.
 *
 * @param member  Het lid dat de actie probeert.
 * @param required Het gevraagde niveau ("moderator" of "admin").
 * @param config  De botconfiguratie met roleArrays.
 */
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
