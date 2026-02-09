/**
 * Analytics calculation module for workout volume, trends, and performance metrics.
 * Uses dependency injection to access StorageManager for all data operations.
 * @module AnalyticsCalculator
 */
export class AnalyticsCalculator {
  /**
   * Creates an AnalyticsCalculator instance
   * @param {StorageManager} storage - StorageManager instance for data access
   */
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Calculates total training volume and trends over a specified period
   * @param {number} [days=7] - Number of days to include in calculation
   * @returns {Object} Volume analytics with total, byWorkoutType, trend, and daily data
   * @returns {number} returns.total - Total volume (weight × reps) across all exercises
   * @returns {Object} returns.byWorkoutType - Volume and session count grouped by workout type
   * @returns {number} returns.trend - Percentage change vs previous period (positive = increase)
   * @returns {Array<{date: string, volume: number}>} returns.daily - Daily volume breakdown, sorted by date
   */
  calculateVolume(days = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      // Get all exercise keys using StorageManager API
      const allKeys = this.storage.getAllExerciseKeys();

      let total = 0;
      const byWorkoutType = {};
      const dailyMap = new Map();
      const sessionDates = new Set(); // Track unique workout dates per workout type

      // Process each exercise
      allKeys.forEach(exerciseKey => {
        const history = this.storage.getExerciseHistory(exerciseKey);
        if (!history || history.length === 0) {
          return; // Skip if no history
        }

        const [workoutType] = exerciseKey.split(' - ');
        if (!workoutType) {
          return; // Skip if invalid format
        }

        history.forEach(entry => {
          if (!entry || !entry.date || !Array.isArray(entry.sets)) {
            return; // Skip malformed entries
          }

          if (entry.date >= cutoffStr) {
            // Calculate volume for this entry
            const entryVolume = entry.sets.reduce((sum, set) => {
              if (set && typeof set.weight === 'number' && typeof set.reps === 'number') {
                return sum + (set.weight * set.reps);
              }
              return sum;
            }, 0);

            total += entryVolume;

            // Track by workout type
            if (!byWorkoutType[workoutType]) {
              byWorkoutType[workoutType] = { volume: 0, sessions: 0 };
            }
            byWorkoutType[workoutType].volume += entryVolume;

            // Track session dates for counting unique workouts
            const sessionKey = `${workoutType}_${entry.date}`;
            if (!sessionDates.has(sessionKey)) {
              sessionDates.add(sessionKey);
              byWorkoutType[workoutType].sessions++;
            }

            // Track daily volume
            if (!dailyMap.has(entry.date)) {
              dailyMap.set(entry.date, 0);
            }
            dailyMap.set(entry.date, dailyMap.get(entry.date) + entryVolume);
          }
        });
      });

      // Convert daily map to array
      const daily = Array.from(dailyMap.entries())
        .map(([date, volume]) => ({ date, volume }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate trend (compare to previous period)
      const previousPeriodVolume = this.calculatePreviousPeriodVolume(days);
      const trend = previousPeriodVolume === 0
        ? 0
        : ((total - previousPeriodVolume) / previousPeriodVolume) * 100;

      return { total, byWorkoutType, trend, daily };
    } catch (error) {
      console.error('[AnalyticsCalculator] Volume calculation error:', error);
      return { total: 0, byWorkoutType: {}, trend: 0, daily: [] };
    }
  }

  /**
   * Calculates total volume for the previous period (used for trend calculation)
   * @private
   * @param {number} days - Number of days in the period
   * @returns {number} Total volume for the previous period
   */
  calculatePreviousPeriodVolume(days) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days * 2));
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - days);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      // Get all exercise keys using StorageManager API
      const allKeys = this.storage.getAllExerciseKeys();

      let total = 0;

      allKeys.forEach(exerciseKey => {
        const history = this.storage.getExerciseHistory(exerciseKey);
        if (!history || history.length === 0) {
          return; // Skip if no history
        }

        history.forEach(entry => {
          if (!entry || !entry.date || !Array.isArray(entry.sets)) {
            return; // Skip malformed entries
          }

          if (entry.date >= startStr && entry.date < endStr) {
            const entryVolume = entry.sets.reduce((sum, set) => {
              if (set && typeof set.weight === 'number' && typeof set.reps === 'number') {
                return sum + (set.weight * set.reps);
              }
              return sum;
            }, 0);
            total += entryVolume;
          }
        });
      });

      return total;
    } catch (error) {
      console.error('[AnalyticsCalculator] Previous period calculation error:', error);
      return 0;
    }
  }
}
