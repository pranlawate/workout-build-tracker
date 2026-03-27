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
 * - Regression compares the current session (in progress or last saved) to the previous session only
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
   * - Weight regression: vs previous session (or in-progress vs last saved), using best weight in session
   * - Rep drop: Must be 25%+ decline (not minor fluctuation)
   * - Intra-set variance: Must be 50%+ difference (allows normal fatigue)
   * - Low RIR: Must be ALL logged sets at 0-1 (RIR not recorded is ignored)
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
   * Max weight across sets (valid numeric weights only)
   * @param {Array} sets
   * @returns {number|undefined}
   */
  _bestWeight(sets) {
    if (!Array.isArray(sets) || sets.length === 0) return undefined;
    let max = undefined;
    for (const set of sets) {
      if (!set || typeof set.weight !== 'number' || !isFinite(set.weight)) continue;
      max = max === undefined ? set.weight : Math.max(max, set.weight);
    }
    return max;
  }

  /**
   * Average reps across sets with reps > 0
   * @param {Array} sets
   * @returns {number|undefined}
   */
  _avgReps(sets) {
    if (!Array.isArray(sets) || sets.length === 0) return undefined;
    const reps = sets.map(s => (s && typeof s.reps === 'number' ? s.reps : 0)).filter(r => r > 0);
    if (reps.length === 0) return undefined;
    return reps.reduce((a, b) => a + b, 0) / reps.length;
  }

  /**
   * Check if weight decreased vs previous session (not vs all-time best)
   * @param {Array} history - Exercise history array (sorted oldest to newest)
   * @param {Array} currentSets - In-progress sets for this session (optional)
   * @returns {Object|null} Alert object if regression detected, null otherwise
   */
  detectWeightRegression(history, currentSets = []) {
    if (!history || history.length < 1) return null;

    const hasCurrentWork = Array.isArray(currentSets) && currentSets.some(s => s && s.reps > 0);

    if (hasCurrentWork && history.length >= 1) {
      const previousSession = history[history.length - 1];
      if (!previousSession?.sets?.length) return null;

      const prevW = this._bestWeight(previousSession.sets);
      const curW = this._bestWeight(currentSets);
      if (prevW !== undefined && curW !== undefined && curW < prevW) {
        return {
          status: 'alert',
          message: `⚠️ Weight below last session (${prevW}kg → ${curW}kg) - check recovery or form`,
          pattern: 'regression'
        };
      }
      return null;
    }

    if (history.length < 2) return null;

    const previousSession = history[history.length - 2];
    const lastSession = history[history.length - 1];

    if (!previousSession?.sets?.length || !lastSession?.sets?.length) {
      return null;
    }

    const oldWeight = this._bestWeight(previousSession.sets);
    const newWeight = this._bestWeight(lastSession.sets);

    if (oldWeight === undefined || newWeight === undefined) {
      return null;
    }

    if (newWeight < oldWeight) {
      return {
        status: 'alert',
        message: `⚠️ Weight below previous session (${oldWeight}kg → ${newWeight}kg) - check if recovering from illness/deload`,
        pattern: 'regression'
      };
    }

    return null;
  }

  /**
   * Check if average reps dropped 25%+ vs previous session
   * @param {Array} history - Exercise history array
   * @param {Array} currentSets - In-progress sets (optional)
   * @returns {Object|null} Alert object if rep drop detected, null otherwise
   */
  detectRepDrop(history, currentSets = []) {
    if (!history || history.length < 1) return null;

    const hasCurrentWork = Array.isArray(currentSets) && currentSets.some(s => s && s.reps > 0);

    if (hasCurrentWork && history.length >= 1) {
      const previousSession = history[history.length - 1];
      if (!previousSession?.sets?.length) return null;

      const avgRepsOld = this._avgReps(previousSession.sets);
      const avgRepsNew = this._avgReps(currentSets);
      if (avgRepsOld === undefined || avgRepsNew === undefined) return null;
      if (avgRepsOld === 0) return null;

      const dropPercentage = (avgRepsOld - avgRepsNew) / avgRepsOld;
      if (dropPercentage >= 0.25) {
        return {
          status: 'alert',
          message: `⚠️ Rep performance dropped ${Math.round(dropPercentage * 100)}% vs last session - possible overtraining`,
          pattern: 'regression'
        };
      }
      return null;
    }

    if (history.length < 2) return null;

    const previousSession = history[history.length - 2];
    const lastSession = history[history.length - 1];

    if (!previousSession?.sets?.length || !lastSession?.sets?.length) {
      return null;
    }

    const avgRepsOld = this._avgReps(previousSession.sets);
    const avgRepsNew = this._avgReps(lastSession.sets);

    if (avgRepsOld === undefined || avgRepsNew === undefined) return null;
    if (avgRepsOld === 0) return null;

    const dropPercentage = (avgRepsOld - avgRepsNew) / avgRepsOld;

    if (dropPercentage >= 0.25) {
      return {
        status: 'alert',
        message: `⚠️ Rep performance dropped ${Math.round(dropPercentage * 100)}% vs previous session - possible overtraining`,
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

    const withRecordedRir = setsToAnalyze.filter(set => set && typeof set.rir === 'number');
    if (withRecordedRir.length === 0) {
      return null;
    }

    const allLowRIR = withRecordedRir.every(set => set.rir <= 1);

    if (allLowRIR) {
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

      // Minimum data requirement: need at least 1 previous workout for regression when in session
      if (history.length < 1) {
        return {
          status: 'good',
          message: null,
          pattern: null
        };
      }

      const hasCurrentWork = Array.isArray(currentSets) && currentSets.some(s => s && s.reps > 0);
      const canCompareRegression =
        hasCurrentWork || history.length >= 2;

      if (canCompareRegression) {
        const weightRegression = this.detectWeightRegression(history, currentSets);
        if (weightRegression) return weightRegression;

        const repDrop = this.detectRepDrop(history, currentSets);
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
