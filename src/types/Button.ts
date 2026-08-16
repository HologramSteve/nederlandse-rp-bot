import type { ButtonInteraction } from "discord.js";
import type { ClientContext } from "../core/client/ClientContext.js";

export interface Button {
  customId: string;

  execute(interaction: ButtonInteraction, ctx: ClientContext): Promise<void> | void;
}
