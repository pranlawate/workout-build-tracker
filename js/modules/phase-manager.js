/**
 * PhaseManager - Centralized coordinator for training phase behavior
 * Read-only module that provides phase-aware recommendations
 *
 * Phases:
 * - building: Progressive overload, all unlocks, 6-8 week deloads
 * - maintenance: Tempo focus, bodyweight priority, 4-6 week deloads
 * - recovery: (Future) Safety-first, frequent deloads
 */
export class PhaseManager {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  /**
   * Get current training phase
   * @returns {string} 'building' | 'maintenance' | 'recovery'
   */
  getPhase() {
    return this.storage.getTrainingPhase();
  }

  /**
   * Get progression behavior for current phase
   * @returns {Object} { allowWeightIncrease, allowWeightDecrease, tempoFocus }
   */
  getProgressionBehavior() {
    const phase = this.getPhase();

    switch (phase) {
      case 'building':
        return {
          allowWeightIncrease: true,
          allowWeightDecrease: false,
          tempoFocus: false
        };

      case 'maintenance':
        return {
          allowWeightIncrease: false,
          allowWeightDecrease: false,
          tempoFocus: true
        };

      case 'recovery':
        // Future implementation
        return {
          allowWeightIncrease: false,
          allowWeightDecrease: true,
          tempoFocus: false
        };

      default:
        // Fallback to building if phase unknown
        return {
          allowWeightIncrease: true,
          allowWeightDecrease: false,
          tempoFocus: false
        };
    }
  }

  /**
   * Get deload sensitivity for current phase
   * @returns {string} 'normal' | 'high' | 'very_high'
   */
  getDeloadSensitivity() {
    const phase = this.getPhase();

    switch (phase) {
      case 'building':
        return 'normal';      // 6-8 weeks
      case 'maintenance':
        return 'high';        // 4-6 weeks
      case 'recovery':
        return 'very_high';   // 2-3 weeks (future)
      default:
        return 'normal';
    }
  }

  /**
   * Get unlock priority for current phase
   * @returns {string} 'all' | 'bodyweight_priority' | 'safety_first'
   */
  getUnlockPriority() {
    const phase = this.getPhase();

    switch (phase) {
      case 'building':
        return 'all';                 // All exercise types equal priority
      case 'maintenance':
        return 'bodyweight_priority';  // Prioritize bodyweight/traditional
      case 'recovery':
        return 'safety_first';        // Only bodyweight (future)
      default:
        return 'all';
    }
  }
}
