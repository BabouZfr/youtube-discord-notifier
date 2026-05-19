# YouTube-to-Discord Notifier

Polls a YouTube channel every 3 minutes and sends a Discord webhook message when a new video or Short is uploaded.

## Stack

- Node.js + TypeScript
- YouTube Data API v3 (`activities.list`)
- Discord Webhooks
- SQLite (`better-sqlite3`)
- `node-cron`, `axios`, `dotenv`

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo>
cd youtube-discord-notifier
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with the values below.

---

## Getting the required credentials

### YouTube API Key

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/) and sign in.
2. Create a new project (or select an existing one).
3. In the left menu, go to **APIs & Services > Library**.
4. Search for **YouTube Data API v3** and click **Enable**.
5. Go to **APIs & Services > Credentials**.
6. Click **Create Credentials > API key**.
7. Copy the key and paste it into `YOUTUBE_API_KEY=` in your `.env`.

> **Tip:** Restrict the key to the YouTube Data API v3 to improve security.

---

### YouTube Channel ID

**Option A — From the channel URL:**
- If the URL is `https://www.youtube.com/@ChannelName`, go to the channel page.
- Right-click > **View page source** and search for `"channelId"` or `"externalId"`.
- It will look like `UCxxxxxxxxxxxxxxxxxxxxxxxxx`.

**Option B — Quick tool:**
- Go to [https://www.streamweasels.com/tools/youtube-channel-id-and-user-id-convertor/](https://www.streamweasels.com/tools/youtube-channel-id-and-user-id-convertor/)
- Paste the channel URL to get the channel ID instantly.

Paste the ID into `YOUTUBE_CHANNEL_ID=` in your `.env`.

---

### Discord Webhook URL

1. Open your Discord server.
2. Go to the channel where you want notifications.
3. Click the **gear icon** next to the channel name (Edit Channel).
4. Go to **Integrations > Webhooks**.
5. Click **New Webhook**.
6. Give it a name (e.g. `YouTube Bot`) and optionally an avatar.
7. Click **Copy Webhook URL**.
8. Paste it into `DISCORD_WEBHOOK_URL=` in your `.env`.

---

### Discord Role ID

1. In Discord, go to **Server Settings > Roles**.
2. Find the role you want to ping.
3. Enable **Developer Mode** if needed: **User Settings > Advanced > Developer Mode**.
4. Right-click the role in the roles list and click **Copy Role ID**.
5. Paste it into `DISCORD_ROLE_ID=` in your `.env`.

---

## Running locally

### Development (with ts-node, no build needed)

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

---

## Running with PM2 (VPS)

```bash
npm run build
pm2 start dist/index.js --name youtube-notifier
pm2 save
pm2 startup
```

---

## Environment variables reference

| Variable            | Description                                      | Default             |
|---------------------|--------------------------------------------------|---------------------|
| `DISCORD_WEBHOOK_URL` | Full Discord webhook URL                        | **required**        |
| `DISCORD_ROLE_ID`   | Discord role ID to ping                          | **required**        |
| `YOUTUBE_API_KEY`   | YouTube Data API v3 key                          | **required**        |
| `YOUTUBE_CHANNEL_ID`| Target YouTube channel ID (starts with `UC...`)  | **required**        |
| `POLL_CRON`         | Cron expression for polling interval             | `*/3 * * * *`       |
| `DATABASE_PATH`     | Path to the SQLite database file                 | `./data/bot.sqlite` |

---

## First run behavior

On the first run, the bot seeds the database with the latest videos **without sending any Discord notifications**. This prevents a spam of old videos on startup. From the second run onwards, only new uploads trigger a notification.

---

## Discord message format

```
@RoleName Nouvelle vidéo YouTube uploadée !

**Titre:** Video Title Here
**Lien:** https://www.youtube.com/watch?v=VIDEO_ID
```
