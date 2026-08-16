export interface BotConfig {
  guilds: string[];
  roleArrays: {
    moderator: string[];

    admin: string[];
  };
  channels: {
    welcome: string;
    leave: string;
    sessions: string;
    ticketPanel: string;
    stashLog: string;
    modLog: string;

    changelog: string;
  };

  autorole: string;

  memberGoal: number;
  stats: {
    members: string;

    goal: string;
  };
  ticketCategory: string;
  session: {
    voteQuorum: number;
  };
}

export type PermissionLevel = "moderator" | "admin";
