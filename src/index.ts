import express from 'express';
import dotenv from 'dotenv';
import { getBugRotationRoundup } from './linear';
import { sendBugRotationRoundup } from './slack';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main cron endpoint for bug status updates
app.get('/api/bugs', async (req, res) => {
  try {
    const roundup = await getBugRotationRoundup();
    await sendBugRotationRoundup(roundup);
    // Set content type and pretty print JSON
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ roundup }, null, 2));

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bug status' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bug rotation server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
console.log(`🐛 Bug update endpoint: http://localhost:${PORT}/api/bugs`);
});

export default app;
