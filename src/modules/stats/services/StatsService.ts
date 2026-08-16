import type { Guild, VoiceBasedChannel } from "discord.js";
import type { ClientContext } from "../../../core/client/ClientContext.js";
import { logger } from "../../../core/utils/logger.js";

const REFRESH_MS = 60_000; // elke minuut

/**
 * Werkt de stats-voicechannels bij: ledental (live) en leden-doel (config).
 * Als er geen channel-ID in config staat, zoekt de service automatisch naar
 * voicechannels met "members" / "goal" in de naam.
 */
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
    if (!guild) return;

    const membersChannel = this.resolveChannel(config.stats.members, guild, /members/i);
    if (membersChannel) {
      await this.setChannelName(membersChannel, `👤 | Members: ${guild.memberCount}`);
    }

    const goalChannel = this.resolveChannel(config.stats.goal, guild, /goal/i);
    if (goalChannel) {
      await this.setChannelName(goalChannel, `🌟 | Goal: ${config.memberGoal}`);
    }
  }

  /**
   * Gebruikt de geconfigureerde channel-ID als die er is; anders zoekt hij in
   * de guild naar een voicechannel waarvan de naam aan het patroon voldoet.
   */
  private resolveChannel(
    configId: string,
    guild: Guild,
    pattern: RegExp,
  ): VoiceBasedChannel | null {
    if (configId) {
      const ch = this.ctx.client.channels.cache.get(configId);
      if (ch && ch.isVoiceBased()) return ch;
      logger.warn(`Stats-channel ${configId} niet gevonden; val terug op auto-detect.`);
    }
    const found = guild.channels.cache.find(
      (ch) => ch.isVoiceBased() && pattern.test(ch.name),
    );
    if (found && found.isVoiceBased()) return found;
    logger.debug(`Geen stats-channel gevonden voor patroon: ${pattern}`);
    return null;
  }

  private async setChannelName(channel: VoiceBasedChannel, name: string): Promise<void> {
    if (channel.name === name) return;
    try {
      await channel.setName(name);
    } catch (error) {
      logger.error(`Kon stats-channel naam niet updaten: ${channel.id}`, error);
    }
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
