import cron from 'node-cron';
import { config } from './config';
import { initDb } from './db';
import { runNotifier } from './notifier';

async function main(): Promise<void> {
  console.log('[Bot] Starting YouTube-to-Discord notifier...');

  // Validate config (throws if any required env var is missing)
  console.log(`[Bot] Channel ID : ${config.youtubeChannelId}`);
  console.log(`[Bot] Cron       : ${config.pollCron}`);

  initDb();

  // Run immediately on startup
  await runNotifier();

  // Schedule recurring polls
  const task = cron.schedule(config.pollCron, async () => {
    await runNotifier();
  });

  console.log('[Bot] Scheduler started. Press Ctrl+C to stop.');

  // Graceful shutdown
  function shutdown(signal: string): void {
    console.log(`\n[Bot] Received ${signal}. Shutting down gracefully...`);
    task.stop();
    process.exit(0);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[Bot] Fatal error:', err);
  process.exit(1);
});
