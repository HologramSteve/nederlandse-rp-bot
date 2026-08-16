import type { ButtonInteraction } from "discord.js";
import type { ClientContext } from "../core/client/ClientContext.js";

/** Een knop-handler, gekoppeld via zijn customId. */
export interface Button {
  /** De customId van de knop die deze handler activeert. */
  customId: string;
  /** De handler-functie. */
  execute(interaction: ButtonInteraction, ctx: ClientContext): Promise<void> | void;
}
