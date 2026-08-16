import { REST, Routes } from "discord.js";
import { env } from "./config/index.js";
import { loadCommands } from "./core/loaders/loadCommands.js";
import { logger } from "./core/utils/logger.js";

async function deploy(): Promise<void> {
  const commands = await loadCommands();
  const commandJson = [...commands.values()].map((command) => command.toJSON());

  logger.info(
    "Registreer " +
      commandJson.length +
      " slash-commando's voor guild " +
      env.guildId +
      "...",
  );

  const rest = new REST().setToken(env.token);
  await rest.put(Routes.applicationGuildCommands(env.clientId, env.guildId), {
    body: commandJson,
  });

  logger.info("Slash-commando's succesvol geregistreerd! ✅");
}

deploy().catch((error) => {
  logger.error("Fout bij het registreren van commando's:", error);
  process.exit(1);
});
