import { fetchRecentUploads } from './youtube';
import { sendDiscordNotification } from './discord';
import { isVideoSeen, markVideoSeen, isFirstRun } from './db';

export async function runNotifier(): Promise<void> {
  console.log('[Notifier] Checking for new uploads...');

  let uploads;
  try {
    uploads = await fetchRecentUploads();
  } catch (err) {
    console.error('[Notifier] Failed to fetch YouTube uploads:', err);
    return;
  }

  if (uploads.length === 0) {
    console.log('[Notifier] No uploads found.');
    return;
  }

  const firstRun = isFirstRun();

  if (firstRun) {
    console.log('[Notifier] First run detected — seeding database without sending notifications.');
    for (const upload of uploads) {
      markVideoSeen(upload.videoId, upload.title, upload.publishedAt, false);
      console.log(`[Notifier] Seeded: "${upload.title}" (${upload.videoId})`);
    }
    return;
  }

  let notified = 0;

  for (const upload of uploads) {
    if (isVideoSeen(upload.videoId)) {
      continue;
    }

    console.log(`[Notifier] New video found: "${upload.title}" (${upload.videoId})`);

    try {
      await sendDiscordNotification(upload.videoId, upload.title);
      markVideoSeen(upload.videoId, upload.title, upload.publishedAt, true);
      console.log(`[Notifier] Notified Discord for: "${upload.title}"`);
      notified++;
    } catch (err) {
      console.error(`[Notifier] Failed to send Discord notification for "${upload.title}":`, err);
      // Do NOT mark as seen — will retry on next poll
    }
  }

  if (notified === 0) {
    console.log('[Notifier] No new videos to notify.');
  }
}
