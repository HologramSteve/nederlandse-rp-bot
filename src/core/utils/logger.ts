type Level = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: Level;
  message: string;
  timestamp: string;
}

export const logger = {
  debug(message: string, ...args: unknown[]): void {
    this.write("debug", message, args);
  },
  info(message: string, ...args: unknown[]): void {
    this.write("info", message, args);
  },
  warn(message: string, ...args: unknown[]): void {
    this.write("warn", message, args);
  },
  error(message: string, ...args: unknown[]): void {
    this.write("error", message, args);
  },

  write(level: Level, message: string, args: unknown[]): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };
    const suffix = args.length > 0 ? ` ${args.map(formatArg).join(" ")}` : "";
    const line = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${suffix}`;
    if (level === "error" || level === "warn") {
      console.error(line);
    } else {
      console.log(line);
    }
  },
};

function formatArg(arg: unknown): string {
  if (arg instanceof Error) {
    return arg.stack ?? arg.message;
  }
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}
