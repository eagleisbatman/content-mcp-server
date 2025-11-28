/**
 * Content MCP Server
 * 
 * Generates weekly podcasts and image articles for Vietnamese farmers
 * Uses Gemini 2.5 Flash for text/images and Gemini TTS for audio
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { query, testConnection } from './db/config.js';
import runMigrations from './db/migrate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Gemini client
let gemini = null;
if (process.env.GEMINI_API_KEY) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn('⚠️  GEMINI_API_KEY not set - content generation will not work');
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    
    res.json({
      status: 'ok',
      service: 'content-mcp-server',
      database: dbStatus.connected ? 'connected' : 'disconnected',
      gemini: gemini ? 'configured' : 'not configured',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'content-mcp-server',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ============================================================================
// MCP TOOLS
// ============================================================================

/**
 * POST /mcp/plan_weekly_content
 * Plans content for the upcoming week
 */
app.post('/mcp/plan_weekly_content', async (req, res) => {
  try {
    if (!gemini) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

    // TODO: Implement planning logic
    // 1. Analyze trends from conversations/intent analytics
    // 2. Map region-crop-stages for current week
    // 3. Create generation jobs

    res.json({
      success: true,
      message: 'Planning not yet implemented',
      jobs_created: 0
    });
  } catch (error) {
    console.error('[Plan Weekly Content] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /mcp/generate_content
 * Generates content for a specific job
 */
app.post('/mcp/generate_content', async (req, res) => {
  try {
    if (!gemini) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({
        success: false,
        error: 'job_id is required'
      });
    }

    // TODO: Implement generation logic
    // 1. Fetch job details
    // 2. Generate content (text/images/audio)
    // 3. Upload to Cloudinary
    // 4. Save to content_feed_items

    res.json({
      success: true,
      message: 'Generation not yet implemented',
      job_id,
      content_id: null
    });
  } catch (error) {
    console.error('[Generate Content] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * GET /api/feed
 * Get personalized content feed for user
 */
app.get('/api/feed', async (req, res) => {
  try {
    const { user_id, limit = 10 } = req.query;

    // TODO: Implement feed personalization
    // 1. Get user profile (crops, region)
    // 2. Filter content by user profile
    // 3. Rank by relevance
    // 4. Return top N items

    const result = await query(
      `SELECT * FROM content_feed_items
       WHERE is_published = true
         AND language = 'vi'
         AND valid_from <= NOW()
         AND (valid_to IS NULL OR valid_to >= NOW())
       ORDER BY created_at DESC
       LIMIT $1`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('[Feed API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/content/:id
 * Get specific content item
 */
app.get('/api/content/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM content_feed_items WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Content API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function start() {
  try {
    // Run database migrations
    console.log('Running database migrations...');
    await runMigrations();
    console.log('✅ Database migrations completed');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Content MCP Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

