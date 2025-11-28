-- Create Vietnamese regions reference table
CREATE TABLE IF NOT EXISTS vietnam_regions (
  id SERIAL PRIMARY KEY,
  region_code VARCHAR(50) UNIQUE NOT NULL,
  region_name_vi VARCHAR(255) NOT NULL,
  region_name_en VARCHAR(255),
  geo_level_2_codes TEXT[] DEFAULT '{}',
  climate_type VARCHAR(50),
  soil_type TEXT[] DEFAULT '{}',
  latitude_range NUMERIC(10,6)[],
  longitude_range NUMERIC(10,6)[],
  description_vi TEXT,
  description_en TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vietnam_regions_code ON vietnam_regions(region_code);
CREATE INDEX IF NOT EXISTS idx_vietnam_regions_name_vi ON vietnam_regions(region_name_vi);

