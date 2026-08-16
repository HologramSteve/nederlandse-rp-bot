import { describe, expect, test } from "bun:test";
import { loadEvents } from "./loadEvents.js";

describe("loadEvents", () => {
  test("laadt het clientReady-event met once: true", async () => {
    const events = await loadEvents();
    const ready = events.find((e) => e.name === "clientReady");
    expect(ready).toBeDefined();
    expect(ready?.once).toBe(true);
  });
});
