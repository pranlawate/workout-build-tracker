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

    // TODO: Implement detection logic
    return {
      status: 'good',
      message: null,
      pattern: null
    };
  }
}
