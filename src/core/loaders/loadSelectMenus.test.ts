import { describe, expect, test } from "bun:test";
import { loadSelectMenus } from "./loadSelectMenus.js";

describe("loadSelectMenus", () => {
  test("laadt het ticket-selectmenu", async () => {
    const selectMenus = await loadSelectMenus();
    const ticketSelect = selectMenus.get("ticket-select");
    expect(ticketSelect).toBeDefined();
  });
});
