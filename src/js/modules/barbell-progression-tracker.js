/**
 * Analyzes barbell readiness based on strength, mobility, weeks, and pain data
 * Read-only analysis module - does not modify any state
 */
export class BarbellProgressionTracker {
  // Strength progress calculation weights
  static WEIGHT_CONTRIBUTION_PERCENT = 80;
  static REP_RIR_CONTRIBUTION_PERCENT = 20;

  // Percentage formula weights
  static STRENGTH_WEIGHT = 0.4;
  static WEEKS_WEIGHT = 0.2;
  static MOBILITY_WEIGHT = 0.3;
  static PAIN_WEIGHT = 0.1;

  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Check readiness for Barbell Bench Press
   * @returns {Object} Readiness analysis with percentage, criteria status, blockers
   */
  getBarbellBenchReadiness() {
    const exerciseKey = 'UPPER_A - DB Flat Bench Press';

    // Strength check: 20kg × 3×12 @ RIR 2-3
    const strengthProgress = this._calculateStrengthProgress(exerciseKey, 20, 12, 3, 2);
    const strengthMet = strengthProgress >= 100;

    // Weeks check: 12+ weeks
    const weeksProgress = this._calculateWeeksProgress(exerciseKey, 12);
    const weeksMet = weeksProgress >= 100;

    // Mobility check: overhead without arch (5+ confirmations)
    const mobilityProgress = this._calculateMobilityProgress('bench_overhead_mobility', 5);
    const mobilityMet = mobilityProgress >= 100;

    // Pain check: no shoulder/elbow pain in last 5 workouts
    const painFree = this._isPainFree([exerciseKey], ['shoulder', 'elbow'], 5);

    // Calculate overall percentage
    const percentage = this._calculateOverallPercentage({
      strengthMet, strengthProgress,
      weeksMet, weeksProgress,
      mobilityMet, mobilityProgress,
      painFree
    });

    // Build blockers array
    const blockers = [];
    if (!strengthMet) {
      blockers.push(`DB Flat Bench: Need 20kg × 3×12 @ RIR 2-3`);
    }
    if (!weeksMet) {
      const currentWeeks = Math.floor(weeksProgress * 12 / 100);
      const remainingWeeks = 12 - currentWeeks;
      blockers.push(`Need ${remainingWeeks} more weeks of training`);
    }
    if (!mobilityMet) {
      const currentConfirmations = Math.floor(mobilityProgress * 5 / 100);
      blockers.push(`Overhead mobility: ${currentConfirmations}/5 confirmations`);
    }
    if (!painFree) {
      blockers.push(`Resolve recurring shoulder/elbow pain in DB Flat Bench`);
    }

    return {
      percentage,
      strengthMet,
      weeksMet,
      mobilityMet,
      painFree,
      blockers,
      strengthProgress,
      weeksProgress,
      mobilityProgress
    };
  }

  /**
   * Check readiness for Barbell Back Squat
   * @returns {Object} Readiness analysis with percentage, criteria status, blockers
   */
  getBarbellSquatReadiness() {
    const exerciseKey = 'LOWER_B - DB Goblet Squat';

    // Strength check: 20kg × 3×12 @ RIR 2-3
    const strengthProgress = this._calculateStrengthProgress(exerciseKey, 20, 12, 3, 2);
    const strengthMet = strengthProgress >= 100;

    // Weeks check: 16+ weeks
    const weeksProgress = this._calculateWeeksProgress(exerciseKey, 16);
    const weeksMet = weeksProgress >= 100;

    // Mobility check: heels flat (5+ confirmations)
    const mobilityProgress = this._calculateMobilityProgress('squat_heel_flat', 5);
    const mobilityMet = mobilityProgress >= 100;

    // Pain check: no knee/lower_back pain in last 5 workouts
    const painFree = this._isPainFree([exerciseKey], ['knee', 'lower_back'], 5);

    // Calculate overall percentage
    const percentage = this._calculateOverallPercentage({
      strengthMet, strengthProgress,
      weeksMet, weeksProgress,
      mobilityMet, mobilityProgress,
      painFree
    });

    // Build blockers array
    const blockers = [];
    if (!strengthMet) {
      blockers.push(`DB Goblet Squat: Need 20kg × 3×12 @ RIR 2-3`);
    }
    if (!weeksMet) {
      const currentWeeks = Math.floor(weeksProgress * 16 / 100);
      const remainingWeeks = 16 - currentWeeks;
      blockers.push(`Need ${remainingWeeks} more weeks of training`);
    }
    if (!mobilityMet) {
      const currentConfirmations = Math.floor(mobilityProgress * 5 / 100);
      blockers.push(`Heels flat mobility: ${currentConfirmations}/5 confirmations`);
    }
    if (!painFree) {
      blockers.push(`Resolve recurring knee/lower back pain in Goblet Squat`);
    }

    return {
      percentage,
      strengthMet,
      weeksMet,
      mobilityMet,
      painFree,
      blockers,
      strengthProgress,
      weeksProgress,
      mobilityProgress
    };
  }

  /**
   * Check readiness for Barbell Deadlift
   * @returns {Object} Readiness analysis with percentage, criteria status, blockers
   */
  getBarbellDeadliftReadiness() {
    const exerciseKey = 'LOWER_B - DB Romanian Deadlift';

    // Strength check: 25kg × 3×12 @ RIR 2-3
    const strengthProgress = this._calculateStrengthProgress(exerciseKey, 25, 12, 3, 2);
    const strengthMet = strengthProgress >= 100;

    // Weeks check: 20+ weeks
    const weeksProgress = this._calculateWeeksProgress(exerciseKey, 20);
    const weeksMet = weeksProgress >= 100;

    // Mobility check: toe touch (5+ confirmations)
    const mobilityProgress = this._calculateMobilityProgress('deadlift_toe_touch', 5);
    const mobilityMet = mobilityProgress >= 100;

    // Pain check: no lower_back pain in last 5 workouts
    const painFree = this._isPainFree([exerciseKey], ['lower_back'], 5);

    // Calculate overall percentage
    const percentage = this._calculateOverallPercentage({
      strengthMet, strengthProgress,
      weeksMet, weeksProgress,
      mobilityMet, mobilityProgress,
      painFree
    });

    // Build blockers array
    const blockers = [];
    if (!strengthMet) {
      blockers.push(`DB Romanian Deadlift: Need 25kg × 3×12 @ RIR 2-3`);
    }
    if (!weeksMet) {
      const currentWeeks = Math.floor(weeksProgress * 20 / 100);
      const remainingWeeks = 20 - currentWeeks;
      blockers.push(`Need ${remainingWeeks} more weeks of training`);
    }
    if (!mobilityMet) {
      const currentConfirmations = Math.floor(mobilityProgress * 5 / 100);
      blockers.push(`Toe touch mobility: ${currentConfirmations}/5 confirmations`);
    }
    if (!painFree) {
      blockers.push(`Resolve recurring lower back pain in Romanian Deadlift`);
    }

    return {
      percentage,
      strengthMet,
      weeksMet,
      mobilityMet,
      painFree,
      blockers,
      strengthProgress,
      weeksProgress,
      mobilityProgress
    };
  }

  /**
   * Calculate strength progress toward target
   * @param {string} exerciseKey - Exercise identifier
   * @param {number} targetWeight - Target weight per hand
   * @param {number} targetReps - Target reps per set
   * @param {number} targetSets - Target number of sets
   * @param {number} minRIR - Minimum RIR required
   * @returns {number} Progress from 0-100
   * @private
   */
  _calculateStrengthProgress(exerciseKey, targetWeight, targetReps, targetSets, minRIR) {
    const history = this.storage.getExerciseHistory(exerciseKey);
    if (!history || history.length === 0) return 0;

    const recent = history[history.length - 1];
    const currentWeight = recent.sets[0]?.weight || 0;

    // Weight progress (0-80%)
    const weightProgress = Math.min(currentWeight / targetWeight, 1.0)
      * BarbellProgressionTracker.WEIGHT_CONTRIBUTION_PERCENT;

    // Rep/RIR progress (0-20%)
    const allSetsHitReps = recent.sets.every(set => set.reps >= targetReps);
    const avgRIR = recent.sets.reduce((sum, set) => sum + set.rir, 0) / recent.sets.length;
    const repProgress = (allSetsHitReps && avgRIR >= minRIR)
      ? BarbellProgressionTracker.REP_RIR_CONTRIBUTION_PERCENT
      : 0;

    return Math.min(weightProgress + repProgress, 100);
  }

  /**
   * Calculate weeks of training progress
   * @param {string} exerciseKey - Exercise identifier
   * @param {number} targetWeeks - Target number of weeks
   * @returns {number} Progress from 0-100
   * @private
   */
  _calculateWeeksProgress(exerciseKey, targetWeeks) {
    const history = this.storage.getExerciseHistory(exerciseKey);
    if (!history || history.length < 2) return 0;

    const firstDate = new Date(history[0].date);
    const latestDate = new Date(history[history.length - 1].date);
    const weeksTrained = Math.floor((latestDate - firstDate) / (7 * 24 * 60 * 60 * 1000));

    return Math.min((weeksTrained / targetWeeks) * 100, 100);
  }

  /**
   * Calculate mobility check progress
   * @param {string} criteriaKey - Mobility criteria identifier
   * @param {number} requiredConsecutive - Number of consecutive "yes" responses needed
   * @returns {number} Progress from 0-100
   * @private
   */
  _calculateMobilityProgress(criteriaKey, requiredConsecutive = 5) {
    const checks = this.storage.getMobilityChecks(criteriaKey);
    if (checks.length === 0) return 0;

    // Count consecutive "yes" from end
    let consecutiveYes = 0;
    for (let i = checks.length - 1; i >= 0; i--) {
      if (checks[i].response === 'yes') {
        consecutiveYes++;
      } else {
        break;
      }
    }

    return Math.min((consecutiveYes / requiredConsecutive) * 100, 100);
  }

  /**
   * Check if exercises are pain-free
   * @param {string[]} exerciseKeys - Exercise identifiers to check
   * @param {string[]} relevantLocations - Pain locations that matter for this progression
   * @param {number} requiredSessions - Number of recent sessions to check
   * @returns {boolean} True if pain-free, false if recurring pain
   * @private
   */
  _isPainFree(exerciseKeys, relevantLocations, requiredSessions = 5) {
    for (const exerciseKey of exerciseKeys) {
      const painHistory = this.storage.getPainHistory(exerciseKey);
      const recent = painHistory.slice(-requiredSessions);

      if (recent.length < requiredSessions) {
        continue; // Not enough data, don't block
      }

      const painfulSessions = recent.filter(entry =>
        entry.hadPain && entry.location && relevantLocations.includes(entry.location)
      ).length;

      // Allow max 1 painful session in last 5
      if (painfulSessions > 1) return false;
    }

    return true;
  }

  /**
   * Calculate overall percentage using weighted formula
   * Weights: Strength 40%, Weeks 20%, Mobility 30%, Pain 10%
   * @param {Object} criteria - Criteria met flags and progress values
   * @returns {number} Overall percentage (0-100)
   * @private
   */
  _calculateOverallPercentage(criteria) {
    let total = 0;
    total += criteria.strengthMet
      ? BarbellProgressionTracker.STRENGTH_WEIGHT * 100
      : criteria.strengthProgress * BarbellProgressionTracker.STRENGTH_WEIGHT;
    total += criteria.weeksMet
      ? BarbellProgressionTracker.WEEKS_WEIGHT * 100
      : criteria.weeksProgress * BarbellProgressionTracker.WEEKS_WEIGHT;
    total += criteria.mobilityMet
      ? BarbellProgressionTracker.MOBILITY_WEIGHT * 100
      : criteria.mobilityProgress * BarbellProgressionTracker.MOBILITY_WEIGHT;
    total += criteria.painFree
      ? BarbellProgressionTracker.PAIN_WEIGHT * 100
      : 0;

    return Math.floor(total);
  }
}
