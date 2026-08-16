import type { ClientEvents } from "discord.js";

/** Een Discord-event-handler die op de client geregistreerd wordt. */
export interface Event<Key extends keyof ClientEvents = keyof ClientEvents> {
  /** De naam van het Discord-event (bijv. "ready", "messageCreate"). */
  name: Key;
  /** Registreer via client.once in plaats van client.on. */
  once?: boolean;
  /** De handler voor dit event. */
  execute(...args: ClientEvents[Key]): Promise<void> | void;
}
