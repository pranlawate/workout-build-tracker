// src/js/modules/performance-analyzer.js

/**
 * PerformanceAnalyzer - Automated form quality and regression detection
 *
 * DESIGN PHILOSOPHY:
 * - Read-only: Never modifies localStorage
 * - Conservative: High thresholds to avoid false positives
 * - Context-aware: Skips analysis during deload
 * - Real-time: Works with incomplete session data
 *
 * DETECTION RULES:
 * - Red Alert (regression): Weight dropped OR reps dropped 25%+
 * - Yellow Warning (form breakdown): Reps vary 50%+ OR all sets RIR 0-1
 * - Requires 2+ previous workouts for regression detection
 * - Can detect form breakdown with just current session data
 *
 * @example
 * const analyzer = new PerformanceAnalyzer(storageManager);
 * const result = analyzer.analyzeExercisePerformance('UPPER_A - Bench Press', currentSets);
 * if (result.status === 'alert') {
 *   console.log(result.message); // Show warning to user
 * }
 */
export class PerformanceAnalyzer {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  /**
   * CONSERVATIVE DETECTION PHILOSOPHY
   *
   * This analyzer uses high thresholds to avoid false positives:
   * - Requires 2+ previous workouts before flagging regression
   * - Weight regression: Must decrease vs 2 sessions ago (not just 1)
   * - Rep drop: Must be 25%+ decline (not minor fluctuation)
   * - Intra-set variance: Must be 50%+ difference (allows normal fatigue)
   * - Low RIR: Must be ALL sets at 0-1 (not just one hard set)
   * - Skips analysis during deload (prevents false alarms)
   *
   * Design goal: Warn only on clear patterns, not normal variation.
   */

  /**
   * Check if user is currently in deload mode
   * Prevents false positives during intentional performance reduction
   * @returns {boolean} True if in deload mode
   */
  isInDeload() {
    // Check deload state from storage
    const deloadState = this.storage.getDeloadState?.() || { active: false };
    return deloadState.active === true;
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
   * Check if reps vary 50%+ within same session (form breakdown indicator)
   * @param {Array} history - Exercise history array
   * @param {Array} currentSets - Current session sets (optional)
   * @returns {Object|null} Warning object if variance detected, null otherwise
   */
  detectIntraSetVariance(history, currentSets = []) {
    // Use current session if logging in progress, otherwise use last completed session
    const setsToAnalyze = currentSets.length > 0 ? currentSets : history[history.length - 1]?.sets || [];

    if (!Array.isArray(setsToAnalyze) || setsToAnalyze.length < 2) {
      return null;
    }

    const reps = setsToAnalyze.map(set => set.reps || 0).filter(r => r > 0);
    if (reps.length < 2) return null;

    const maxReps = Math.max(...reps);
    const minReps = Math.min(...reps);

    // Check if difference is 50% or more of max
    const variance = (maxReps - minReps) / maxReps;

    if (variance >= 0.5) {
      return {
        status: 'warning',
        message: `⚠️ Reps inconsistent within session (${reps.join('/')}) - form may be breaking down`,
        pattern: 'form_breakdown'
      };
    }

    return null;
  }

  /**
   * Check if RIR is consistently 0-1 (training too close to failure)
   * @param {Array} history - Exercise history array
   * @param {Array} currentSets - Current session sets (optional)
   * @returns {Object|null} Warning object if low RIR detected, null otherwise
   */
  detectLowRIR(history, currentSets = []) {
    // Use current session if logging in progress, otherwise use last completed session
    const setsToAnalyze = currentSets.length > 0 ? currentSets : history[history.length - 1]?.sets || [];

    if (!Array.isArray(setsToAnalyze) || setsToAnalyze.length === 0) {
      return null;
    }

    // Check if ALL sets have RIR 0 or 1
    const allLowRIR = setsToAnalyze.every(set => {
      const rir = set.rir !== undefined ? set.rir : 999; // Default high if missing
      return rir <= 1;
    });

    if (allLowRIR && setsToAnalyze.length > 0) {
      return {
        status: 'warning',
        message: '⚠️ Training too close to failure - leave 2-3 reps in reserve',
        pattern: 'form_breakdown'
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
    try {
      const history = this.storage.getExerciseHistory(exerciseKey);

      // Skip analysis if in deload mode (intentional performance reduction)
      if (this.isInDeload()) {
        return {
          status: 'good',
          message: null,
          pattern: null
        };
      }

      // Minimum data requirement: need at least 2 previous workouts for regression
      // But can still check form breakdown on current session with just 1 workout in history
      if (history.length < 1) {
        return {
          status: 'good',
          message: null,
          pattern: null
        };
      }

      // Check for regression patterns first (red alerts) - requires 2+ sessions
      if (history.length >= 2) {
        const weightRegression = this.detectWeightRegression(history);
        if (weightRegression) return weightRegression;

        const repDrop = this.detectRepDrop(history);
        if (repDrop) return repDrop;
      }

      // Check for form breakdown (yellow warnings) - works with current session
      const variance = this.detectIntraSetVariance(history, currentSets);
      if (variance) return variance;

      const lowRIR = this.detectLowRIR(history, currentSets);
      if (lowRIR) return lowRIR;

      // No issues detected
      return {
        status: 'good',
        message: null,
        pattern: null
      };

    } catch (error) {
      // Log error but don't crash the app
      console.error('[PerformanceAnalyzer] Analysis failed:', error);
      return {
        status: 'good',
        message: null,
        pattern: null
      };
    }
  }
}
