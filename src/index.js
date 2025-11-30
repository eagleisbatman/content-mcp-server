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
 * Query params:
 *   - language: 'en' or 'vi' (default: 'en')
 *   - limit: number of items to return (default: 10)
 *   - user_id: optional user ID for future personalization
 */
app.get('/api/feed', async (req, res) => {
  try {
    const { user_id, limit = 10, language = 'en' } = req.query;

    // Map language codes to database format
    const langCode = language === 'vi' ? 'vi' : 'en';

    const result = await query(
      `SELECT id, content_type, title, summary, language,
              audio_url, video_url, image_url, article_body,
              tags, crop_tags, region_tags, crop_stage,
              starter_questions, valid_from, valid_to
       FROM content_feed_items
       WHERE is_published = true
         AND language = $1
         AND valid_from <= NOW()
         AND (valid_to IS NULL OR valid_to >= NOW())
       ORDER BY created_at DESC
       LIMIT $2`,
      [langCode, parseInt(limit)]
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

/**
 * POST /api/seed-test-content
 * Seed test content for development/testing
 */
app.post('/api/seed-test-content', async (req, res) => {
  try {
    // Sample Vietnamese agricultural content
    const testContent = [
      {
        content_type: 'podcast',
        title: 'Cách phòng trừ sâu bệnh cho lúa mùa mưa',
        summary: 'Hướng dẫn chi tiết cách nhận biết và xử lý các loại sâu bệnh phổ biến trên lúa trong mùa mưa.',
        language: 'vi',
        audio_url: 'https://example.com/audio/lua-sau-benh.mp3',
        image_url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
        tags: ['lúa', 'sâu bệnh', 'mùa mưa'],
        crop_tags: ['rice'],
        region_tags: ['mekong-delta'],
        crop_stage: 'growing',
        starter_questions: ['Làm sao nhận biết sâu đục thân?', 'Thuốc nào hiệu quả nhất?'],
        valid_from: new Date().toISOString(),
        is_published: true
      },
      {
        content_type: 'podcast',
        title: 'Kỹ thuật bón phân cho cà phê vào mùa khô',
        summary: 'Chia sẻ kinh nghiệm bón phân đúng cách để cây cà phê phát triển tốt trong mùa khô.',
        language: 'vi',
        audio_url: 'https://example.com/audio/caphe-bon-phan.mp3',
        image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
        tags: ['cà phê', 'bón phân', 'mùa khô'],
        crop_tags: ['coffee'],
        region_tags: ['central-highlands'],
        crop_stage: 'maintenance',
        starter_questions: ['Bón phân lúc nào tốt nhất?', 'Lượng phân bao nhiêu?'],
        valid_from: new Date().toISOString(),
        is_published: true
      },
      {
        content_type: 'image_article',
        title: 'Nhận biết bệnh vàng lá trên cây ăn trái',
        summary: 'Hình ảnh minh họa các dấu hiệu bệnh vàng lá và cách phòng trị hiệu quả.',
        language: 'vi',
        image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
        article_body: JSON.stringify({
          sections: [
            { heading: 'Triệu chứng', content: 'Lá chuyển vàng từ mép vào trong, cuống lá héo dần.', image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
            { heading: 'Nguyên nhân', content: 'Thiếu dinh dưỡng hoặc nấm bệnh tấn công rễ cây.' },
            { heading: 'Cách xử lý', content: 'Bổ sung phân vi lượng, phun thuốc trừ nấm gốc đồng.' }
          ]
        }),
        tags: ['bệnh cây', 'vàng lá', 'cây ăn trái'],
        crop_tags: ['fruit-trees'],
        region_tags: ['mekong-delta', 'southeast'],
        starter_questions: ['Phân biệt vàng lá do thiếu chất và do bệnh?'],
        valid_from: new Date().toISOString(),
        is_published: true
      },
      {
        content_type: 'podcast',
        title: 'Mẹo chăm sóc gà trong mùa nóng',
        summary: 'Các biện pháp giữ mát chuồng trại và bổ sung dinh dưỡng cho gà khi thời tiết nóng.',
        language: 'vi',
        audio_url: 'https://example.com/audio/ga-mua-nong.mp3',
        image_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400',
        tags: ['chăn nuôi', 'gà', 'mùa nóng'],
        crop_tags: [],
        region_tags: ['all'],
        starter_questions: ['Nhiệt độ lý tưởng cho gà?', 'Gà bị say nóng thì làm sao?'],
        valid_from: new Date().toISOString(),
        is_published: true
      }
    ];

    // Insert test content
    const insertedIds = [];
    for (const item of testContent) {
      const result = await query(
        `INSERT INTO content_feed_items (
          content_type, title, summary, language, audio_url, image_url,
          article_body, tags, crop_tags, region_tags, crop_stage,
          starter_questions, valid_from, is_published
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          item.content_type,
          item.title,
          item.summary,
          item.language,
          item.audio_url || null,
          item.image_url || null,
          item.article_body || null,
          item.tags,
          item.crop_tags,
          item.region_tags,
          item.crop_stage || null,
          JSON.stringify(item.starter_questions || []),
          item.valid_from,
          item.is_published
        ]
      );
      insertedIds.push(result.rows[0].id);
    }

    res.json({
      success: true,
      message: `Inserted ${insertedIds.length} test content items`,
      ids: insertedIds
    });
  } catch (error) {
    console.error('[Seed Test Content] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seed-english-content
 * Seed English test content for development/testing
 */
app.post('/api/seed-english-content', async (req, res) => {
  try {
    const englishContent = [
      {
        content_type: 'podcast',
        title: 'Preventing Rice Pests During Rainy Season',
        summary: 'A detailed guide on identifying and treating common rice pests during the rainy season.',
        language: 'en',
        audio_url: 'https://example.com/audio/rice-pests-en.mp3',
        image_url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
        tags: ['rice', 'pests', 'rainy season'],
        crop_tags: ['rice'],
        region_tags: ['mekong-delta'],
        crop_stage: 'growing',
        starter_questions: ['How to identify stem borers?', 'Which pesticide is most effective?', 'When is the best time to spray?'],
        valid_from: new Date().toISOString(),
        is_published: true
      },
      {
        content_type: 'podcast',
        title: 'Coffee Fertilization Tips for Dry Season',
        summary: 'Expert advice on proper fertilization techniques to help coffee plants thrive during dry season.',
        language: 'en',
        audio_url: 'https://example.com/audio/coffee-fertilizer-en.mp3',
        image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
        tags: ['coffee', 'fertilization', 'dry season'],
        crop_tags: ['coffee'],
        region_tags: ['central-highlands'],
        crop_stage: 'maintenance',
        starter_questions: ['When is the best time to fertilize?', 'How much fertilizer per tree?', 'What nutrients does coffee need?'],
        valid_from: new Date().toISOString(),
        is_published: true
      },
      {
        content_type: 'image_article',
        title: 'Identifying Yellow Leaf Disease in Fruit Trees',
        summary: 'Visual guide to recognizing yellow leaf disease symptoms and effective treatment methods.',
        language: 'en',
        image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
        article_body: JSON.stringify({
          sections: [
            { heading: 'Symptoms', content: 'Leaves turn yellow from edges inward, stems begin to wilt gradually.', image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
            { heading: 'Causes', content: 'Nutrient deficiency or fungal infection attacking tree roots.' },
            { heading: 'Treatment', content: 'Add micronutrients, spray copper-based fungicide.' }
          ]
        }),
        tags: ['disease', 'yellow leaf', 'fruit trees'],
        crop_tags: ['fruit-trees'],
        region_tags: ['mekong-delta', 'southeast'],
        starter_questions: ['How to distinguish nutrient deficiency from disease?', 'What are the early warning signs?'],
        valid_from: new Date().toISOString(),
        is_published: true
      },
      {
        content_type: 'podcast',
        title: 'Keeping Chickens Healthy in Hot Weather',
        summary: 'Essential tips for cooling poultry houses and providing proper nutrition during hot weather.',
        language: 'en',
        audio_url: 'https://example.com/audio/chickens-hot-weather-en.mp3',
        image_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400',
        tags: ['poultry', 'chickens', 'hot weather'],
        crop_tags: [],
        region_tags: ['all'],
        starter_questions: ['What is the ideal temperature for chickens?', 'How to treat heat stress in chickens?', 'Best cooling methods for poultry houses?'],
        valid_from: new Date().toISOString(),
        is_published: true
      },
      {
        content_type: 'podcast',
        title: 'Modern Irrigation Techniques for Small Farms',
        summary: 'Learn about drip irrigation and efficient water management for better crop yields.',
        language: 'en',
        audio_url: 'https://example.com/audio/irrigation-en.mp3',
        video_url: 'https://example.com/video/irrigation-demo.mp4',
        image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
        tags: ['irrigation', 'water management', 'farming tips'],
        crop_tags: ['vegetables', 'rice'],
        region_tags: ['all'],
        crop_stage: 'planting',
        starter_questions: ['How to set up drip irrigation?', 'How much water do crops need daily?', 'Is drip irrigation cost-effective?'],
        valid_from: new Date().toISOString(),
        is_published: true
      }
    ];

    const insertedIds = [];
    for (const item of englishContent) {
      const result = await query(
        `INSERT INTO content_feed_items (
          content_type, title, summary, language, audio_url, video_url, image_url,
          article_body, tags, crop_tags, region_tags, crop_stage,
          starter_questions, valid_from, is_published
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          item.content_type,
          item.title,
          item.summary,
          item.language,
          item.audio_url || null,
          item.video_url || null,
          item.image_url || null,
          item.article_body || null,
          item.tags,
          item.crop_tags,
          item.region_tags,
          item.crop_stage || null,
          JSON.stringify(item.starter_questions || []),
          item.valid_from,
          item.is_published
        ]
      );
      insertedIds.push(result.rows[0].id);
    }

    res.json({
      success: true,
      message: `Inserted ${insertedIds.length} English content items`,
      ids: insertedIds
    });
  } catch (error) {
    console.error('[Seed English Content] Error:', error);
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

