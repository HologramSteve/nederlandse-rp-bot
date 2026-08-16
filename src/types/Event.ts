import type { ClientEvents } from "discord.js";
import type { ClientContext } from "../core/client/ClientContext.js";

export interface Event<Key extends keyof ClientEvents = keyof ClientEvents> {
  name: Key;

  once?: boolean;

  execute(ctx: ClientContext, ...args: ClientEvents[Key]): Promise<void> | void;
}
