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

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Bug Rotation Server' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get's bugs without pinging slack
app.get('/api/bugs', async (req, res) => {
  try{ 
    const bugs = await getBugRotationRoundup();
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bug status' });
  }
});

// Main cron endpoint for bug status updates
app.get('/api/bugroundup', async (req, res) => {
  try {
    const roundup = await getBugRotationRoundup();
    if (roundup.length === 0) {
      res.json({ status: 'No bugs in the roundup', timestamp: new Date().toISOString() });
    } else {
      await sendBugRotationRoundup(roundup);
      // Set content type and pretty print JSON
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ roundup }, null, 2));
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bug status' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bug rotation server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
