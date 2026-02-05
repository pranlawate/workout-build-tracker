// src/js/modules/performance-analyzer.js

/**
 * Analyzes exercise performance history to detect regression and form breakdown
 * Read-only module - never modifies localStorage
 */
export class PerformanceAnalyzer {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  /**
   * Check if weight decreased compared to 2 sessions ago
   * @param {Array} history - Exercise history array (sorted oldest to newest)
   * @returns {Object|null} Alert object if regression detected, null otherwise
   */
  detectWeightRegression(history) {
    if (!history || history.length < 2) return null;

    const twoSessionsAgo = history[history.length - 2];
    const lastSession = history[history.length - 1];

    // Guard against missing sets
    if (!twoSessionsAgo?.sets?.length || !lastSession?.sets?.length) {
      return null;
    }

    const oldWeight = twoSessionsAgo.sets[0]?.weight;
    const newWeight = lastSession.sets[0]?.weight;

    // Only flag if we have valid weight data
    if (oldWeight === undefined || newWeight === undefined) {
      return null;
    }

    if (newWeight < oldWeight) {
      return {
        status: 'alert',
        message: `⚠️ Weight regressed from ${oldWeight}kg to ${newWeight}kg - check if recovering from illness/deload`,
        pattern: 'regression'
      };
    }

    return null;
  }

  /**
   * Check if average reps dropped 25%+ compared to 2 sessions ago
   * @param {Array} history - Exercise history array
   * @returns {Object|null} Alert object if rep drop detected, null otherwise
   */
  detectRepDrop(history) {
    if (!history || history.length < 2) return null;

    const twoSessionsAgo = history[history.length - 2];
    const lastSession = history[history.length - 1];

    if (!twoSessionsAgo?.sets?.length || !lastSession?.sets?.length) {
      return null;
    }

    // Calculate average reps per session
    const avgRepsOld = twoSessionsAgo.sets.reduce((sum, set) => sum + (set.reps || 0), 0) / twoSessionsAgo.sets.length;
    const avgRepsNew = lastSession.sets.reduce((sum, set) => sum + (set.reps || 0), 0) / lastSession.sets.length;

    // Avoid division by zero
    if (avgRepsOld === 0) return null;

    // Check if reps dropped by 25% or more
    const dropPercentage = (avgRepsOld - avgRepsNew) / avgRepsOld;

    if (dropPercentage >= 0.25) {
      return {
        status: 'alert',
        message: `⚠️ Rep performance dropped ${Math.round(dropPercentage * 100)}% - possible overtraining`,
        pattern: 'regression'
      };
    }

    return null;
  }

  /**
   * Analyze exercise performance and return warnings if issues detected
   * @param {string} exerciseKey - Exercise identifier (e.g., "UPPER_A - Dumbbell Bench Press")
   * @param {Array} currentSets - Current session sets being logged (optional, for real-time analysis)
   * @returns {Object} { status: 'good'|'warning'|'alert', message: string|null, pattern: string|null }
   */
  analyzeExercisePerformance(exerciseKey, currentSets = []) {
    const history = this.storage.getExerciseHistory(exerciseKey);

    // Minimum data requirement: need at least 2 previous workouts
    if (history.length < 2) {
      return {
        status: 'good',
        message: null,
        pattern: null
      };
    }

    // Check for regression patterns (red alerts)
    const weightRegression = this.detectWeightRegression(history);
    if (weightRegression) return weightRegression;

    const repDrop = this.detectRepDrop(history);
    if (repDrop) return repDrop;

    // No issues detected
    return {
      status: 'good',
      message: null,
      pattern: null
    };
  }
}
