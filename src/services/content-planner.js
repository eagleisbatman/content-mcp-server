/**
 * Content Planner Service
 * 
 * Analyzes trends and creates generation jobs for weekly content
 */

import { query } from '../db/config.js';

export class ContentPlanner {
  constructor(geminiClient, backendApiUrl) {
    this.gemini = geminiClient;
    this.backendApiUrl = backendApiUrl;
  }

  /**
   * Plan weekly content (runs every Sunday)
   */
  async planWeeklyContent() {
    try {
      // 1. Analyze trends from last week
      const trends = await this.analyzeTrends();

      // 2. Map region-crop-stages for current week
      const mappings = await this.getRegionCropStageMappings();

      // 3. Create generation jobs
      const jobs = await this.createGenerationJobs(trends, mappings);

      return {
        success: true,
        jobs_created: jobs.length,
        jobs
      };
    } catch (error) {
      console.error('[ContentPlanner] Error:', error);
      throw error;
    }
  }

  /**
   * Analyze trends from conversations and intent analytics
   */
  async analyzeTrends() {
    // TODO: Query backend API for conversation trends and intent analytics
    // This will be implemented when backend API endpoints are available
    
    return {
      top_crops: [],
      top_practices: [],
      top_regions: []
    };
  }

  /**
   * Get region-crop-stage mappings for current week
   */
  async getRegionCropStageMappings() {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentWeek = Math.ceil(new Date().getDate() / 7); // 1-4

    const result = await query(
      `SELECT rcs.*, vr.region_name_vi, vr.region_name_en
       FROM region_crop_stages rcs
       JOIN vietnam_regions vr ON rcs.region_code = vr.region_code
       WHERE ($1 BETWEEN rcs.stage_start_month AND rcs.stage_end_month)
         AND (rcs.stage_start_week IS NULL OR $2 >= rcs.stage_start_week)
         AND (rcs.stage_end_week IS NULL OR $2 <= rcs.stage_end_week)`,
      [currentMonth, currentWeek]
    );

    return result.rows;
  }

  /**
   * Create generation jobs based on trends and mappings
   */
  async createGenerationJobs(trends, mappings) {
    const jobs = [];

    // TODO: Implement job creation logic
    // For each crop-region-stage combination, create podcast + image_article jobs

    return jobs;
  }
}

