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
    if (!storageManager) {
      throw new Error('PhaseManager requires a StorageManager instance');
    }
    this.storage = storageManager;
  }

  /**
   * Get current training phase
   * @returns {string} 'building' | 'maintenance' | 'recovery'
   */
  getPhase() {
    const phase = this.storage.getTrainingPhase();
    const validPhases = ['building', 'maintenance', 'recovery'];
    return validPhases.includes(phase) ? phase : 'building';
  }

  /**
   * Get progression behavior for current phase
   * @returns {Object} { allowWeightIncrease, allowWeightDecrease, tempoFocus }
   * Returns building phase defaults on error
   */
  getProgressionBehavior() {
    try {
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
    } catch (error) {
      console.error('[PhaseManager] Error getting progression behavior:', error);
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
   * Returns 'normal' (building phase default) on error
   */
  getDeloadSensitivity() {
    try {
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
    } catch (error) {
      console.error('[PhaseManager] Error getting deload sensitivity:', error);
      return 'normal';
    }
  }

  /**
   * Get unlock priority for current phase
   * @returns {string} 'all' | 'bodyweight_priority' | 'safety_first'
   * Returns 'all' (building phase default) on error
   */
  getUnlockPriority() {
    try {
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
    } catch (error) {
      console.error('[PhaseManager] Error getting unlock priority:', error);
      return 'all';
    }
  }
}
