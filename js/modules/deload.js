/**
 * Manages deload system state and triggers
 */
export class DeloadManager {
  constructor(storage, phaseManager) {
    if (!phaseManager) {
      throw new Error('DeloadManager requires a PhaseManager instance');
    }
    this.storage = storage;
    this.phaseManager = phaseManager;
  }

  /**
   * Check if deload is currently active, auto-ending expired deloads
   * @returns {boolean} True if deload is active and not expired
   */
  isDeloadActive() {
    const deloadState = this.storage.getDeloadState();
    if (!deloadState.active) return false;

    if (deloadState.endDate) {
      const endDate = new Date(deloadState.endDate);
      if (!isNaN(endDate.getTime()) && new Date() > endDate) {
        this.endDeload();
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if deload should be triggered based on time, performance, or fatigue
   * Uses phase-aware sensitivity for time-based triggers
   * @returns {Object} Object with trigger status and reason
   */
  shouldTriggerDeload() {
    try {
      // Don't trigger if already in deload (auto-ends expired ones)
      if (this.isDeloadActive()) return { trigger: false };

      const deloadState = this.storage.getDeloadState();

      // Get phase-aware base threshold
      const sensitivity = this.phaseManager.getDeloadSensitivity();
      const baseWeeks = {
        normal: 6,      // Building: 6-8 weeks
        high: 4,        // Maintenance: 4-6 weeks
        very_high: 2    // Recovery: 2-3 weeks (future)
      }[sensitivity] || 6; // Fallback to 6 if sensitivity is undefined

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
    } catch (error) {
      console.error('[DeloadManager] Error checking deload trigger:', error);
      return { trigger: false }; // Safe default: don't trigger on error
    }
  }

  /**
   * Calculates weeks since last deload
   * @param {string|null} lastDeloadDate - ISO date string of last deload
   * @returns {number} Number of weeks since last deload
   */
  calculateWeeksSinceDeload(lastDeloadDate) {
    if (!lastDeloadDate) return 0; // Never had a deload = 0 weeks (don't trigger immediately)

    const lastDate = new Date(lastDeloadDate);

    // Check if date is valid
    if (isNaN(lastDate.getTime())) {
      console.warn('[DeloadManager] Invalid lastDeloadDate, treating as never had deload:', lastDeloadDate);
      return 0;
    }

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
    try {
      const ls = this.storage.storage;
      const prefix = 'build_exercise_';
      let count = 0;

      const bestSessionWeight = (session) => {
        if (!session?.sets || !Array.isArray(session.sets)) return null;
        let best = null;
        for (const set of session.sets) {
          if (!set) continue;
          const w = Number(set.weight);
          if (isNaN(w)) continue;
          if (best === null || w > best) best = w;
        }
        return best;
      };

      for (let i = 0; i < ls.length; i++) {
        const fullKey = ls.key(i);
        if (!fullKey || !fullKey.startsWith(prefix)) continue;
        const exerciseKey = fullKey.slice(prefix.length);
        if (!exerciseKey.includes(' - ')) continue;

        const history = this.storage.getExerciseHistory(exerciseKey);
        if (!history || history.length < 2) continue;

        const prev = bestSessionWeight(history[history.length - 2]);
        const latest = bestSessionWeight(history[history.length - 1]);
        if (prev === null || latest === null) continue;
        if (latest < prev) count += 1;
      }

      return count;
    } catch (error) {
      console.error('[DeloadManager] detectRegressions:', error);
      return 0;
    }
  }

  /**
   * Checks fatigue score for recent workouts
   * @returns {Object|null} Fatigue alert object or null
   * @description To be implemented in Task 29
   */
  checkFatigueScore() {
    try {
      const raw = this.storage.storage.getItem('build_recovery_metrics');
      if (!raw) return null;
      const entries = JSON.parse(raw);
      if (!Array.isArray(entries) || entries.length < 2) return null;

      const last = entries[entries.length - 1];
      const prev = entries[entries.length - 2];
      const a = Number(last.fatigueScore);
      const b = Number(prev.fatigueScore);
      const threshold = 8;
      if (!isNaN(a) && !isNaN(b) && a >= threshold && b >= threshold) {
        return { score: Math.max(a, b) };
      }
      return null;
    } catch (error) {
      console.error('[DeloadManager] checkFatigueScore:', error);
      return null;
    }
  }

  /**
   * Starts a deload period
   * @param {string} deloadType - Type of deload ('standard' | 'light' | 'active_recovery')
   */
  startDeload(deloadType = 'standard') {
    try {
      const deloadState = this.storage.getDeloadState();
      const now = new Date();
      const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      deloadState.active = true;
      deloadState.deloadType = deloadType;
      deloadState.startDate = now.toISOString();
      deloadState.endDate = endDate.toISOString();

      this.storage.saveDeloadState(deloadState);
    } catch (error) {
      console.error('[DeloadManager] Error starting deload:', error);
      // Don't throw - fail silently but log the error
    }
  }

  /** Alias for app flows that enable the standard deload window */
  enableDeload() {
    this.startDeload('standard');
  }

  /**
   * Ends the current deload period
   */
  endDeload() {
    try {
      const deloadState = this.storage.getDeloadState();

      deloadState.active = false;
      const endRef = deloadState.endDate ? new Date(deloadState.endDate) : null;
      if (endRef && !isNaN(endRef.getTime())) {
        deloadState.lastDeloadDate = deloadState.endDate;
      } else if (deloadState.startDate) {
        deloadState.lastDeloadDate = new Date().toISOString();
      }
      deloadState.deloadType = null;
      deloadState.startDate = null;
      deloadState.endDate = null;

      this.storage.saveDeloadState(deloadState);
    } catch (error) {
      console.error('[DeloadManager] Error ending deload:', error);
      // Don't throw - fail silently but log the error
    }
  }

  /**
   * Postpones deload suggestion (increments dismiss count)
   */
  postponeDeload() {
    try {
      const deloadState = this.storage.getDeloadState();
      deloadState.dismissedCount = (deloadState.dismissedCount || 0) + 1;
      this.storage.saveDeloadState(deloadState);
    } catch (error) {
      console.error('[DeloadManager] Error postponing deload:', error);
      // Don't throw - fail silently but log the error
    }
  }

  /**
   * Calculates remaining days in current deload period
   * @returns {number} Days remaining (0 if not in deload or past end date)
   */
  getDaysRemaining() {
    if (!this.isDeloadActive()) return 0;

    const deloadState = this.storage.getDeloadState();
    if (!deloadState.endDate) return 0;

    const endDate = new Date(deloadState.endDate);
    const now = new Date();
    const diffMs = endDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }
}
