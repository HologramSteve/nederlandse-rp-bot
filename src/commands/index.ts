import type { Command } from "../types.js";
import { ping } from "./ping.js";

/** Register van alle commando's, keyed op commandonaam. */
export const commands: Map<string, Command> = new Map([
  [ping.data.name, ping],
]);

export { ping };
