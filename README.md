# Nederlandse RP Bot

Een Discord-bot voor de Nederlandse rolspel-gemeenschap. 🇳🇱

## Vereisten

- Node.js 18 of hoger
- Een Discord bot applicatie ([Discord Developer Portal](https://discord.com/developers/applications))
- De bot toegevoegd aan een server

## Setup

1. **Installeer dependencies**

   ```bash
   npm install
   ```

2. **Configuratie**

   Kopieer het voorbeeld configuratiebestand en vul je eigen waarden in:

   ```bash
   cp .env.example .env
   ```

   Vergeet niet je bot token en application ID in `.env` te zetten.

3. **Start de bot**

   ```bash
   npm run dev
   ```

   Of in productie:

   ```bash
   npm start
   ```

## Structuur

```
.
├── src/
│   ├── index.js      # Bot entrypoint
│   ├── client.js     # Discord client setup
│   └── commands/     # Slash commands
└── .env.example      # Configuratie voorbeeld
```

## Omgevingsvariabelen

| Variabele     | Beschrijving                                        |
|---------------|-----------------------------------------------------|
| `DISCORD_TOKEN` | Het token van je bot                                  |
| `CLIENT_ID`   | De Application ID van je bot                          |
| `GUILD_ID`    | De server ID waar je de bot test (development)        |
