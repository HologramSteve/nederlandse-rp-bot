import { describe, expect, test } from "bun:test";
import { loadCommands } from "./loadCommands.js";

describe("loadCommands", () => {
  test("laadt het ping-commando", async () => {
    const commands = await loadCommands();
    const ping = commands.get("ping");
    expect(ping).toBeDefined();
    expect(ping?.data.name).toBe("ping");
  });
});
