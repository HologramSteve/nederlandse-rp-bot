import { REST, Routes } from "discord.js";
import { config } from "./config/index.js";
import { loadCommands } from "./core/loaders/loadCommands.js";
import { logger } from "./core/utils/logger.js";

async function deploy(): Promise<void> {
  const commands = await loadCommands();
  const commandJson = [...commands.values()].map((command) => command.toJSON());

  logger.info(
    "Registreer " +
      commandJson.length +
      " slash-commando's voor guild " +
      config.guildId +
      "...",
  );

  const rest = new REST().setToken(config.token);
  await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
    body: commandJson,
  });

  logger.info("Slash-commando's succesvol geregistreerd! ✅");
}

deploy().catch((error) => {
  logger.error("Fout bij het registreren van commando's:", error);
  process.exit(1);
});
