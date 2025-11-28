-- Create region-crop-stage mapping table
CREATE TABLE IF NOT EXISTS region_crop_stages (
  id SERIAL PRIMARY KEY,
  region_code VARCHAR(50) NOT NULL REFERENCES vietnam_regions(region_code) ON DELETE CASCADE,
  crop_id INTEGER NOT NULL,
  crop_name_vi VARCHAR(255) NOT NULL,
  crop_name_en VARCHAR(255),
  crop_stage VARCHAR(50) NOT NULL,
  stage_start_month INTEGER NOT NULL CHECK (stage_start_month >= 1 AND stage_start_month <= 12),
  stage_end_month INTEGER NOT NULL CHECK (stage_end_month >= 1 AND stage_end_month <= 12),
  stage_start_week INTEGER CHECK (stage_start_week >= 1 AND stage_start_week <= 4),
  stage_end_week INTEGER CHECK (stage_end_week >= 1 AND stage_end_week <= 4),
  notes_vi TEXT,
  notes_en TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(region_code, crop_id, crop_stage, stage_start_month)
);

CREATE INDEX IF NOT EXISTS idx_region_crop_stages_region ON region_crop_stages(region_code);
CREATE INDEX IF NOT EXISTS idx_region_crop_stages_crop ON region_crop_stages(crop_id);
CREATE INDEX IF NOT EXISTS idx_region_crop_stages_stage ON region_crop_stages(crop_stage);
CREATE INDEX IF NOT EXISTS idx_region_crop_stages_month ON region_crop_stages(stage_start_month, stage_end_month);

