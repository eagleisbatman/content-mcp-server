/**
 * Content Scheduler Service
 * 
 * Schedules weekly planning and generation tasks
 */

export class ContentScheduler {
  constructor(contentPlanner, contentGenerator) {
    this.planner = contentPlanner;
    this.generator = contentGenerator;
    this.planningInterval = null;
    this.publishingInterval = null;
  }

  /**
   * Start weekly scheduler
   * - Sunday: Planning + Generation
   * - Monday 12:01 AM: Publishing
   */
  start() {
    console.log('[ContentScheduler] Starting weekly scheduler...');

    // Schedule planning for every Sunday at 00:00 AM VN time
    this.schedulePlanning();

    // Schedule publishing for every Monday at 12:01 AM VN time
    this.schedulePublishing();

    console.log('✅ Content scheduler started');
  }

  /**
   * Schedule weekly planning (Sunday 00:00 AM VN time)
   */
  schedulePlanning() {
    // TODO: Implement cron-like scheduling for Sunday
    // For now, run immediately for testing
    this.runPlanning();
  }

  /**
   * Schedule weekly publishing (Monday 12:01 AM VN time)
   */
  schedulePublishing() {
    // TODO: Implement cron-like scheduling for Monday 12:01 AM
    // For now, run immediately for testing
    this.runPublishing();
  }

  /**
   * Run planning process
   */
  async runPlanning() {
    try {
      console.log('[ContentScheduler] Running weekly planning...');
      const result = await this.planner.planWeeklyContent();
      console.log(`✅ Planning completed: ${result.jobs_created} jobs created`);
    } catch (error) {
      console.error('[ContentScheduler] Planning error:', error);
    }
  }

  /**
   * Run publishing process
   */
  async runPublishing() {
    try {
      console.log('[ContentScheduler] Publishing content...');
      // TODO: Implement publishing logic
      // Mark content as published, expire old content
      console.log('✅ Publishing completed');
    } catch (error) {
      console.error('[ContentScheduler] Publishing error:', error);
    }
  }

  /**
   * Stop scheduler
   */
  stop() {
    if (this.planningInterval) {
      clearInterval(this.planningInterval);
    }
    if (this.publishingInterval) {
      clearInterval(this.publishingInterval);
    }
    console.log('Content scheduler stopped');
  }
}

