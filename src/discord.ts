import axios from 'axios';
import { config } from './config';

export async function sendDiscordNotification(videoId: string, _title: string): Promise<void> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const content =
    `<@&${config.discordRoleId}>\n` +
    `**🍓 Babou vient de sortir un nouveau Short !**\n` +
    `**(Pour le visionner sur TikTok, rends-toi sur b9bou.com)**\n` +
    videoUrl;

  await axios.post(config.discordWebhookUrl, {
    content,
    allowed_mentions: {
      roles: [config.discordRoleId],
    },
  });
}
