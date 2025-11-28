# Content MCP Server

AI-powered content generation service for Nông Trí. Generates weekly podcasts and image articles for Vietnamese farmers based on crop stages, regions, and seasonal practices.

## Features

- **Weekly Content Planning**: Analyzes trends and creates generation jobs every Sunday
- **Batch Content Generation**: Uses Gemini 2.5 Flash for text and images
- **Vietnamese TTS**: Gemini TTS with Vietnamese accent for podcasts
- **Automated Publishing**: Content goes live every Monday at 12:01 AM VN time
- **Personalized Feeds**: Content filtered by user profile, region, crop stage

## Tech Stack

- Node.js/Express
- PostgreSQL
- Google Gemini 2.5 Flash (text + images)
- Google Gemini TTS (Vietnamese)
- Cloudinary (storage)

## Environment Variables

```bash
# Server
PORT=3004
CORS_ORIGIN=*

# Database
DATABASE_URL=postgresql://...

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Backend API (for fetching user data)
BACKEND_API_URL=https://nong-tri.up.railway.app
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run database migrations:
```bash
npm run db:migrate
```

3. Seed Vietnamese regions and crop-stage mappings:
```bash
npm run db:seed
```

4. Start server:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /
```

### MCP Tools
```
POST /mcp/plan_weekly_content
POST /mcp/generate_content
```

### Public API
```
GET /api/feed?user_id=123&limit=10
GET /api/content/:id
```

## Weekly Schedule

- **Sunday**: Planning + Generation (all day)
- **Monday 12:01 AM**: Content goes live

## Content Types

- **Podcasts**: 2-5 minute audio episodes (MP3, 44.1kHz, 128kbps)
- **Image Articles**: Multi-image guides with Vietnamese text

## License

MIT

