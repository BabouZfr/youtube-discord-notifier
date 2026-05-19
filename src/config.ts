import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  discordWebhookUrl: requireEnv('DISCORD_WEBHOOK_URL'),
  discordRoleId: requireEnv('DISCORD_ROLE_ID'),
  youtubeApiKey: requireEnv('YOUTUBE_API_KEY'),
  youtubeChannelId: requireEnv('YOUTUBE_CHANNEL_ID'),
  pollCron: process.env.POLL_CRON ?? '*/3 * * * *',
  databasePath: process.env.DATABASE_PATH ?? './data/bot.sqlite',
};
