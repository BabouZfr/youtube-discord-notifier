import http from 'http';
import cron from 'node-cron';
import { config } from './config';
import { initDb } from './db';
import { runNotifier } from './notifier';

async function main(): Promise<void> {
  console.log('[Bot] Starting YouTube-to-Discord notifier...');
  console.log(`[Bot] Channel ID : ${config.youtubeChannelId}`);
  console.log(`[Bot] Cron       : ${config.pollCron}`);

  initDb();

  // Minimal HTTP server so Render detects an open port
  const port = process.env.PORT ?? '3000';
  http.createServer((_, res) => {
    res.writeHead(200);
    res.end('OK');
  }).listen(port, () => {
    console.log(`[Bot] Health check listening on port ${port}`);
  });

  await runNotifier();

  const task = cron.schedule(config.pollCron, async () => {
    await runNotifier();
  });

  console.log('[Bot] Scheduler started.');

  function shutdown(signal: string): void {
    console.log(`\n[Bot] Received ${signal}. Shutting down...`);
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
