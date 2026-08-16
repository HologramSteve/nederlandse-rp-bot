# Nederlandse RP Bot

Een Discord-bot voor de Nederlandse rolspel-gemeenschap. 🇳🇱

> Gebouwd met [Bun](https://bun.sh) en [TypeScript](https://www.typescriptlang.org/).

## Vereisten

- [Bun](https://bun.sh/) 1.x of hoger
- Een Discord bot applicatie ([Discord Developer Portal](https://discord.com/developers/applications))
- De bot toegevoegd aan een server

## Setup

1. **Installeer dependencies**

   ```bash
   bun install
   ```

2. **Configuratie**

   Kopieer het voorbeeld configuratiebestand en vul je eigen waarden in:

   ```bash
   cp .env.example .env
   ```

   Vergeet niet je bot token, application ID en server ID in `.env` te zetten.

3. **Registreer slash-commando's** (eerst eenmalig)

   ```bash
   bun run deploy-commands
   ```

4. **Start de bot**

   ```bash
   bun run dev
   ```

   Of in productie:

   ```bash
   bun start
   ```

## Scripts

| Commando                     | Beschrijving                        |
|-------------------------------|-------------------------------------|
| `bun run dev`                | Start de bot met hot-reload         |
| `bun run typecheck`          | Controleer de TypeScript types      |
| `bun run deploy-commands`   | Registreer slash-commando's         |

## Structuur

```
.
├── src/
│   ├── index.ts           # Entrypoint
│   ├── client.ts          # Discord client setup + event-hanlers
│   ├── deploy-commands.ts # Registreert slash-commando's
│   ├── types.ts           # Gedeelde TypeScript types
│   └── commands/          # Slash-commando's
│       ├── index.ts       # Command-registry
│       └── ping.ts        # Voorbeeldcommando
├── index.html             # (optioneel, Bun frontend template)
├── tsconfig.json
└── .env.example           # Configuratie voorbeeld
```

## Een nieuw commando toevoegen

1. Maak een nieuw bestand in `src/commands/`, bijv. `src/commands/hello.ts`:

   ```ts
   import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
   import type { Command } from "../types.js";

   export const hello: Command = {
     data: new SlashCommandBuilder()
       .setName("hello")
       .setDescription("Groet de gebruiker."),
     async execute(interaction: ChatInputCommandInteraction) {
       await interaction.reply("Hallo daar! 👋");
     },
     toJSON() {
       return this.data.toJSON();
     },
   };
   ```

2. Registreer het commando in `src/commands/index.ts`:

   ```ts
   import { hello } from "./hello.js";

   export const commands: Map<string, Command> = new Map([
     [ping.data.name, ping],
     [hello.data.name, hello],
   ]);
   ```

3. Rerun `bun run deploy-commands` om het naar Discord te sturen.

## Omgevingsvariabelen

| Variabele        | Beschrijving                                   |
|-------------------|------------------------------------------------|
| `DISCORD_TOKEN` | Het token van je bot                            |
| `CLIENT_ID`     | De Application ID van je bot                    |
| `GUILD_ID`      | De server ID waar je de bot test (development)  |
