# Bug Rotation Slack Bot

A simple Node.js TypeScript server that pings your Slack channel daily with bug status updates from your Linear board.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual API keys and configuration.

3. **Development:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

- `SLACK_BOT_TOKEN`: Your Slack bot token (starts with `xoxb-`)
- `SLACK_CHANNEL_ID`: The channel ID where updates will be posted
- `LINEAR_API_KEY`: Your Linear API key
- `LINEAR_TEAM_ID`: Your Linear team ID
- `PORT`: Server port (default: 3000)

## Endpoints

- `GET /health` - Health check endpoint
- `POST /api/update-bug-status` - Trigger bug status update (used by cron)

## Deployment

This server is configured to deploy to Vercel with a daily cron job that runs at 9 AM on weekdays (Monday-Friday).

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy - the cron job will automatically trigger daily

## Next Steps

- Integrate with Linear API to fetch bug data
- Integrate with Slack API to send formatted messages
- Add bug status analysis and reporting logic
