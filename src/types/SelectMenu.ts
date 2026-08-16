import type { StringSelectMenuInteraction } from "discord.js";
import type { ClientContext } from "../core/client/ClientContext.js";

export interface SelectMenu {
  customId: string;

  execute(
    interaction: StringSelectMenuInteraction,
    ctx: ClientContext,
  ): Promise<void> | void;
}
