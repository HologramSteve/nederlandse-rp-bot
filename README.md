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

   Kopieer het voorbeeld en vul je eigen waarden in:

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

| Commando                    | Beschrijving                                  |
|------------------------------|-----------------------------------------------|
| `bun run dev`               | Start de bot met hot-reload                   |
| `bun run typecheck`         | Controleer de TypeScript types                |
| `bun run test`              | Draai de unit-tests                           |
| `bun run lint`              | Lint het project (Biome)                      |
| `bun run format`            | Formateer het project (Biome)                 |
| `bun run deploy-commands`  | Registreer slash-commando's                   |

## Structuur

Het project is opgebouwd uit een schaalbare, op folders leunende architectuur.
Gebruik de **core-lagen** voor infra en maak daarbovenop modules/features aan.

```
src/
├── index.ts                  # Bootstrapper: laadt config, start de bot
├── deploy-commands.ts        # Registreert slash-commando's (losstaand script)
├── config/                   # Gecentraliseerde configuratie uit omgevingsvariabelen
│   ├── env.ts
│   └── index.ts
├── types/                    # Gedeelde TypeScript-types
│   ├── Command.ts            # Interface voor slash-commando's
│   └── Event.ts              # Interface voor events
└── core/                     # Fundamentele infra (maak hier geen features)
    ├── client/
    │   ├── client.ts         # createClient + bootstrap (rijgt alles aan elkaar)
    │   └── ClientContext.ts  # DI-context: { config, client, db, commands }
    ├── handlers/
    │   ├── CommandHandler.ts # Interactie-dispatch + foutafhandeling + cooldown
    │   └── EventHandler.ts   # Registreert events op de client
    ├── loaders/
    │   ├── loadCommands.ts   # Folder-scan → automatisch commando's laden
    │   └── loadEvents.ts     # Folder-scan → automatisch events laden
    ├── db/
    │   ├── db.ts             # bun:sqlite + migratierunner
    │   ├── repository.ts     # Abstracte repository-base (CRUD)
    │   └── migrations/       # SQL-migraties (001_*.sql, ...)
    ├── events/
    │   └── ready.ts          # Voorbeeldevent (clientReady → login-log)
    ├── commands/
    │   └── ping.ts           # Voorbeeldcommando (/ping)
    └── utils/
        └── logger.ts         # Log-werapper met timestamp en levels
```

## Een nieuw commando toevoegen

1. Maak een bestand in een `commands/`-map, bijv. `src/core/commands/hello.ts`:

   ```ts
   import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
   import type { Command } from "../../types/Command.js";

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

2. **Geen registry-update nodig** — `loadCommands()` scan alle `**/commands/*.ts`
   automatisch en registreert het commando op `data.name`.

3. Rerun `bun run deploy-commands` om het naar Discord te sturen.

## Een nieuw event toevoegen

Maak een bestand in een `events/`-map, bijv. `src/core/events/messageCreate.ts`:

```ts
import { Events, type Message } from "discord.js";
import type { Event } from "../../types/Event.js";

export const onMessageCreate: Event<typeof Events.MessageCreate> = {
  name: Events.MessageCreate,
  execute(message: Message) {
    // ...
  },
};
```

Ook hiervoor geldt: gewoon bestand droppen, `loadEvents()` registreert het
automatisch.

## Database

De bot gebruikt `bun:sqlite` (ingebouwd in Bun). De database wordt geopend in
`src/core/db/db.ts` en geeft toegang via een abstracte repository-base, zodat
je later zonder API-wijzigingen naar Postgres kunt migreren.

- **Migraties**: plaats `.sql`-bestanden in `src/core/db/migrations/`. Ze
  worden in bestandsnaamvolgorde toegepast en bijgehouden in de tabel
  `_migrations`.
- **Locatie**: standaard `./data/rpbot.db`, overschrijfbaar via `DB_PATH`.

## Omgevingsvariabelen

| Variabele        | Beschrijving                                    |
|-------------------|-------------------------------------------------|
| `DISCORD_TOKEN` | Het token van je bot                             |
| `CLIENT_ID`     | De Application ID van je bot                     |
| `GUILD_ID`      | De server ID waar je de bot test (development)   |
| `DB_PATH`       | (Optioneel) Pad naar de SQLite-database          |
