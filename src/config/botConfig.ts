/** De niet-geheime botconfiguratie uit config.json (geen secrets). */
export interface BotConfig {
  guilds: string[];
  roleArrays: {
    /** Rollen die mogen kicken (niveau 1). */
    moderator: string[];
    /** Rollen die alles mogen (niveau 2; impliceren moderator). */
    admin: string[];
  };
  channels: {
    welcome: string;
    leave: string;
    sessions: string;
    ticketPanel: string;
    stashLog: string;
    modLog: string;
    /** Kanaal waar /changelog de update-embeds plaatst. */
    changelog: string;
  };
  images: {
    banner: string;
    welcome: string;
  };
  /** Rol die nieuwkomers automatisch krijgen. */
  autorole: string;
  /** Het leden-doel dat de "Goal"-teller toont. */
  memberGoal: number;
  stats: {
    /** Voicechannel waarvan de naam het (totale) ledenaantal toont. */
    members: string;
    /** Voicechannel waarvan de naam het leden-doel toont. */
    goal: string;
  };
  ticketCategory: string;
  session: {
    /** Aantal stemmen nodig om een sessie automatisch te starten. */
    voteQuorum: number;
  };
}

/** Rol-niveau voor permission-gating. */
export type PermissionLevel = "moderator" | "admin";
