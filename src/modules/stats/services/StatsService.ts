import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";
import { MemberRepository } from "../repositories/MemberRepository.js";

const REFRESH_MS = 60_000; // elke minuut

/** Werkt live-tellers bij in "stats" voicechannels (Teller: {n} of rolnamen). */
export class StatsService {
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly members: MemberRepository;
  private readonly ctx: ClientContext;

  constructor(ctx: ClientContext) {
    this.ctx = ctx;
    this.members = new MemberRepository(ctx.db);
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
      await this.setChannelName(config.stats.members, `🟢 Leden: ${guild.memberCount}`);
    }
    if (config.stats.chosen) {
      const chosen = config.chosenRole
        ? this.countRole(guild)
        : this.members.countChosen();
      await this.setChannelName(config.stats.chosen, `⭐ Gekozen: ${chosen}`);
    }
  }

  private countRole(guild?: import("discord.js").Guild): number {
    if (!guild || !this.ctx.botConfig.chosenRole) return 0;
    const role = guild.roles.cache.get(this.ctx.botConfig.chosenRole);
    return role?.members.size ?? 0;
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
