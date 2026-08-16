import { config } from "./config/index.js";
import { bootstrap } from "./core/client/client.js";
import { logger } from "./core/utils/logger.js";

async function main(): Promise<void> {
  const ctx = await bootstrap(config);
  await ctx.client.login(config.token);
}

main().catch((error) => {
  logger.error("Fout bij het opstarten van de bot:", error);
  process.exit(1);
});
