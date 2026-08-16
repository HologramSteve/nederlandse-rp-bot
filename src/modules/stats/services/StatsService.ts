import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";

const REFRESH_MS = 60_000; // elke minuut

/** Werkt de stats-voicechannels bij: ledental (live) en leden-doel (config). */
export class StatsService {
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly ctx: ClientContext;

  constructor(ctx: ClientContext) {
    this.ctx = ctx;
  }

  start(): void {
    void this.refresh();
    this.timer = setInterval(() => void this.refresh(), REFRESH_MS);
    logger.debug("StatsService gestart (1-min refresh).");
  }

  async refresh(): Promise<void> {
    const config = this.ctx.botConfig;
    const guild = config.guilds[0]
      ? this.ctx.client.guilds.cache.get(config.guilds[0])
      : undefined;

    if (config.stats.members && guild) {
      await this.setChannelName(
        config.stats.members,
        `👤 | Members: ${guild.memberCount}`,
      );
    }
    if (config.stats.goal) {
      await this.setChannelName(config.stats.goal, `🌟 | Goal: ${config.memberGoal}`);
    }
  }

  private async setChannelName(channelId: string, name: string): Promise<void> {
    if (!channelId) return;
    const channel = this.ctx.client.channels.cache.get(channelId);
    if (!channel || !("setName" in channel) || typeof channel.setName !== "function")
      return;
    if (!channel.isVoiceBased()) return;
    if (channel.name === name) return;
    try {
      await channel.setName(name);
    } catch (error) {
      logger.error(`Kon stats-channel naam niet updaten: ${channelId}`, error);
    }
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
