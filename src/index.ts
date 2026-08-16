import { startBot } from "./client.js";

startBot().catch((error) => {
  console.error("Fout bij het opstarten van de bot:", error);
  process.exit(1);
});
