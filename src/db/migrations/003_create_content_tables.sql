-- Create content generation jobs table
CREATE TABLE IF NOT EXISTS content_generation_jobs (
  id SERIAL PRIMARY KEY,
  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('podcast', 'image_article')),
  target_region VARCHAR(100),
  target_crop TEXT,
  target_segment JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  prompt_template TEXT,
  generated_content_ids INTEGER[] DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_generation_jobs_status ON content_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_content_generation_jobs_job_type ON content_generation_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_content_generation_jobs_target_region ON content_generation_jobs(target_region);
CREATE INDEX IF NOT EXISTS idx_content_generation_jobs_created_at ON content_generation_jobs(created_at);

-- Create content feed items table (if not exists from backend migration)
CREATE TABLE IF NOT EXISTS content_feed_items (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('podcast', 'image_article')),
  title TEXT NOT NULL,
  summary TEXT,
  language VARCHAR(5) NOT NULL DEFAULT 'vi',
  audio_url TEXT,
  image_url TEXT,
  article_body_ref TEXT,
  article_body JSONB,
  tags TEXT[] DEFAULT '{}',
  crop_tags TEXT[] DEFAULT '{}',
  region_tags TEXT[] DEFAULT '{}',
  crop_stage VARCHAR(50),
  region_code VARCHAR(50),
  province_codes TEXT[] DEFAULT '{}',
  starter_questions JSONB DEFAULT '[]',
  geography_info JSONB DEFAULT '{}',
  content_cohort VARCHAR(50),
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  generation_metadata JSONB DEFAULT '{}',
  engagement_stats JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_feed_items_content_type ON content_feed_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_feed_items_language ON content_feed_items(language);
CREATE INDEX IF NOT EXISTS idx_content_feed_items_valid_from ON content_feed_items(valid_from);
CREATE INDEX IF NOT EXISTS idx_content_feed_items_valid_to ON content_feed_items(valid_to);
CREATE INDEX IF NOT EXISTS idx_content_feed_items_is_published ON content_feed_items(is_published);
CREATE INDEX IF NOT EXISTS idx_content_feed_items_tags ON content_feed_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_feed_items_crop_tags ON content_feed_items USING GIN(crop_tags);
CREATE INDEX IF NOT EXISTS idx_content_feed_items_region_tags ON content_feed_items USING GIN(region_tags);
CREATE INDEX IF NOT EXISTS idx_content_feed_items_crop_stage ON content_feed_items(crop_stage);
CREATE INDEX IF NOT EXISTS idx_content_feed_items_region_code ON content_feed_items(region_code);
CREATE INDEX IF NOT EXISTS idx_content_feed_items_content_cohort ON content_feed_items(content_cohort);

