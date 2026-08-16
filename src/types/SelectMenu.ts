import type { StringSelectMenuInteraction } from "discord.js";
import type { ClientContext } from "../core/client/ClientContext.js";

/** Een string-selectmenu-handler, gekoppeld via zijn customId. */
export interface SelectMenu {
  /** De customId van het selectmenu dat deze handler activeert. */
  customId: string;
  /** De handler-functie, uitgevoerd met de interactie en de gedeelde context. */
  execute(
    interaction: StringSelectMenuInteraction,
    ctx: ClientContext,
  ): Promise<void> | void;
}
