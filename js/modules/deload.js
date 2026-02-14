/**
 * Manages deload system state and triggers
 */
export class DeloadManager {
  constructor(storage, phaseManager) {
    this.storage = storage;
    this.phaseManager = phaseManager;
  }

  /**
   * Checks if deload should be triggered based on time, performance, or fatigue
   * Uses phase-aware sensitivity for time-based triggers
   * @returns {Object} Object with trigger status and reason
   */
  shouldTriggerDeload() {
    const deloadState = this.storage.getDeloadState();

    // Don't trigger if already in deload
    if (deloadState.active) return { trigger: false };

    // Get phase-aware base threshold
    const sensitivity = this.phaseManager.getDeloadSensitivity();
    const baseWeeks = {
      normal: 6,      // Building: 6-8 weeks
      high: 4,        // Maintenance: 4-6 weeks
      very_high: 2    // Recovery: 2-3 weeks (future)
    }[sensitivity];

    // Check time-based trigger (dynamic threshold)
    const weeksSinceDeload = this.calculateWeeksSinceDeload(deloadState.lastDeloadDate);
    if (weeksSinceDeload >= baseWeeks) {
      return { trigger: true, reason: 'time', weeks: weeksSinceDeload };
    }

    // Check performance-based trigger (regression on 2+ exercises)
    const regressionCount = this.detectRegressions();
    if (regressionCount >= 2) {
      return { trigger: true, reason: 'performance', regressions: regressionCount };
    }

    // Check fatigue-based trigger (score ≥8 for 2 consecutive workouts)
    const fatigueAlert = this.checkFatigueScore();
    if (fatigueAlert) {
      return { trigger: true, reason: 'fatigue', score: fatigueAlert.score };
    }

    return { trigger: false };
  }

  /**
   * Calculates weeks since last deload
   * @param {string|null} lastDeloadDate - ISO date string of last deload
   * @returns {number} Number of weeks since last deload
   */
  calculateWeeksSinceDeload(lastDeloadDate) {
    if (!lastDeloadDate) return 0;

    const lastDate = new Date(lastDeloadDate);
    const now = new Date();
    const diffMs = now - lastDate;
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

    return diffWeeks;
  }

  /**
   * Detects performance regressions across recent workouts
   * @returns {number} Number of exercises showing regression
   * @description To be implemented in Task 29
   */
  detectRegressions() {
    // Check last 2 workouts for weight/rep decreases
    // This would need access to exercise history
    // For now, return 0 (implement in next task)
    return 0;
  }

  /**
   * Checks fatigue score for recent workouts
   * @returns {Object|null} Fatigue alert object or null
   * @description To be implemented in Task 29
   */
  checkFatigueScore() {
    // Check if last 2 workouts had fatigue score ≥8
    // This would need session metrics tracking
    // For now, return null (implement in next task)
    return null;
  }

  /**
   * Starts a deload period
   * @param {string} deloadType - Type of deload ('standard' | 'light' | 'active_recovery')
   */
  startDeload(deloadType = 'standard') {
    const deloadState = this.storage.getDeloadState();
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    deloadState.active = true;
    deloadState.deloadType = deloadType;
    deloadState.startDate = now.toISOString();
    deloadState.endDate = endDate.toISOString();

    this.storage.saveDeloadState(deloadState);
  }

  /**
   * Ends the current deload period
   */
  endDeload() {
    const deloadState = this.storage.getDeloadState();

    deloadState.active = false;
    deloadState.lastDeloadDate = deloadState.startDate;
    deloadState.deloadType = null;
    deloadState.startDate = null;
    deloadState.endDate = null;

    this.storage.saveDeloadState(deloadState);
  }

  /**
   * Postpones deload suggestion (increments dismiss count)
   */
  postponeDeload() {
    const deloadState = this.storage.getDeloadState();
    deloadState.dismissedCount = (deloadState.dismissedCount || 0) + 1;
    this.storage.saveDeloadState(deloadState);
  }

  /**
   * Calculates remaining days in current deload period
   * @returns {number} Days remaining (0 if not in deload or past end date)
   */
  getDaysRemaining() {
    const deloadState = this.storage.getDeloadState();
    if (!deloadState.active || !deloadState.endDate) return 0;

    const endDate = new Date(deloadState.endDate);
    const now = new Date();
    const diffMs = endDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }
}
