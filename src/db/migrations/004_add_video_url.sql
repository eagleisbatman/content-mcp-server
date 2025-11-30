-- Add video_url field to content_feed_items table
ALTER TABLE content_feed_items ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create index for video content queries
CREATE INDEX IF NOT EXISTS idx_content_feed_items_video_url ON content_feed_items(video_url) WHERE video_url IS NOT NULL;
