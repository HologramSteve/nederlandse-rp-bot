import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error(
    "DISCORD_TOKEN, CLIENT_ID en GUILD_ID zijn vereist in het .env bestand."
  );
  process.exit(1);
}

// Omzetten naar de JSON-vorm die de Discord API verwacht.
const commandJson = [...commands.values()].map((command) => command.toJSON());

const rest = new REST().setToken(token);

try {
  console.log(
    `Registreer ${commandJson.length} slash-commando's voor guild ${guildId}...`
  );

  // Guild-commando's verschijnen direct (ideaal voor development);
  // vervang "guild" met de globale Route voor een wereldwijde registratie.
  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commandJson }
  );

  console.log("Slash-commando's succesvol geregistreerd! ✅");
} catch (error) {
  console.error("Fout bij het registreren van commando's:", error);
  process.exit(1);
}
