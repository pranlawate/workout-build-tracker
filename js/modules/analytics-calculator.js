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

  /**
   * Calculates performance metrics including RIR, compliance, and progression
   * @param {number} [days=28] - Number of days to include in calculation
   * @returns {Object} Performance metrics with avgRIR, rirTrend, compliance, progressedCount, and topProgressors
   * @returns {number} returns.avgRIR - Average RIR across all sets in the period
   * @returns {Array<{date: string, rir: number}>} returns.rirTrend - 7-day rolling average of RIR by workout date
   * @returns {number} returns.compliance - Workout compliance as percentage (actual vs expected 3/week)
   * @returns {number} returns.progressedCount - Number of exercises that increased weight
   * @returns {Array<{name: string, gain: number}>} returns.topProgressors - Top 5 exercises by weight gain
   */
  calculatePerformanceMetrics(days = 28) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      // Get all sets from period
      const allSets = [];
      const workoutDates = new Set();

      const allKeys = this.storage.getAllExerciseKeys();

      allKeys.forEach(key => {
        const history = this.storage.getExerciseHistory(key);
        if (!history || history.length === 0) {
          return;
        }

        history.forEach(entry => {
          if (!entry || !entry.date || !Array.isArray(entry.sets)) {
            return;
          }

          if (entry.date >= cutoffStr) {
            workoutDates.add(entry.date);
            entry.sets.forEach(set => {
              if (set && typeof set.rir === 'number') {
                allSets.push({ ...set, date: entry.date });
              }
            });
          }
        });
      });

      // Calculate average RIR
      const avgRIR = allSets.length > 0
        ? allSets.reduce((sum, set) => sum + set.rir, 0) / allSets.length
        : 0;

      // Calculate RIR trend (7-day rolling average)
      const rirTrend = this.calculateRIRTrend(days);

      // Calculate compliance (3 workouts/week expected)
      // Get actual workouts from rotation sequence
      const rotation = this.storage.getRotation();
      const actualWorkouts = rotation?.sequence?.filter(entry =>
        entry?.completed && entry?.date && entry.date >= cutoffStr
      ).length || 0;

      const expectedWorkouts = Math.floor(days / 7) * 3;
      const compliance = expectedWorkouts > 0
        ? (actualWorkouts / expectedWorkouts) * 100
        : 0;

      // Find progressed exercises
      const { progressedCount, topProgressors } = this.findProgressedExercises();

      return { avgRIR, rirTrend, compliance, progressedCount, topProgressors };
    } catch (error) {
      console.error('[AnalyticsCalculator] Performance metrics error:', error);
      return { avgRIR: 0, rirTrend: [], compliance: 0, progressedCount: 0, topProgressors: [] };
    }
  }

  /**
   * Calculates RIR trend as 7-day rolling average
   * @private
   * @param {number} days - Number of days to include in calculation
   * @returns {Array<{date: string, rir: number}>} Rolling average RIR by date
   */
  calculateRIRTrend(days) {
    try {
      const rotation = this.storage.getRotation();
      if (!rotation || !rotation.sequence) return [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      // Get workout dates
      const workoutDates = rotation.sequence
        .filter(entry => entry && entry.completed && entry.date && entry.date >= cutoffStr)
        .map(entry => entry.date)
        .sort();

      // Calculate RIR for each workout date
      const rirByDate = workoutDates.map(date => {
        const allKeys = this.storage.getAllExerciseKeys();

        let totalRIR = 0;
        let setCount = 0;

        allKeys.forEach(key => {
          const history = this.storage.getExerciseHistory(key);
          if (!history || history.length === 0) {
            return;
          }

          const entry = history.find(e => e && e.date === date);
          if (entry && Array.isArray(entry.sets)) {
            entry.sets.forEach(set => {
              if (set && typeof set.rir === 'number') {
                totalRIR += set.rir;
                setCount++;
              }
            });
          }
        });

        const avgRIR = setCount > 0 ? totalRIR / setCount : 0;
        return { date, rir: avgRIR };
      });

      // Apply 7-day rolling average
      return rirByDate.map((point, i) => {
        const start = Math.max(0, i - 6);
        const window = rirByDate.slice(start, i + 1);
        const rollingAvg = window.reduce((sum, p) => sum + p.rir, 0) / window.length;
        return { date: point.date, rir: rollingAvg };
      });
    } catch (error) {
      console.error('[AnalyticsCalculator] RIR trend error:', error);
      return [];
    }
  }

  /**
   * Finds exercises that have progressed in weight
   * @private
   * @returns {Object} Progression data with count and top 5 progressors
   * @returns {number} returns.progressedCount - Total number of exercises that increased weight
   * @returns {Array<{name: string, gain: number}>} returns.topProgressors - Top 5 exercises by weight gain
   */
  findProgressedExercises() {
    try {
      const allKeys = this.storage.getAllExerciseKeys();

      const progressed = [];

      allKeys.forEach(key => {
        const history = this.storage.getExerciseHistory(key);
        if (!history || history.length < 2) return;

        const recent = history.slice(-2);
        const oldEntry = recent[0];
        const newEntry = recent[1];

        // Check if weight increased
        if (!oldEntry || !newEntry || !Array.isArray(oldEntry.sets) || !Array.isArray(newEntry.sets)) {
          return;
        }

        if (oldEntry.sets.length === 0 || newEntry.sets.length === 0) {
          return;
        }

        const oldWeight = oldEntry.sets[0]?.weight || 0;
        const newWeight = newEntry.sets[0]?.weight || 0;

        if (newWeight > oldWeight) {
          const parts = key.replace('build_exercise_', '').split(' - ');
          const exerciseName = parts.length > 1 ? parts[1] : parts[0] || 'Unknown';
          const gain = newWeight - oldWeight;
          progressed.push({ name: exerciseName, gain });
        }
      });

      // Sort by gain descending
      progressed.sort((a, b) => b.gain - a.gain);

      return {
        progressedCount: progressed.length,
        topProgressors: progressed.slice(0, 5)
      };
    } catch (error) {
      console.error('[AnalyticsCalculator] Exercise progression error:', error);
      return { progressedCount: 0, topProgressors: [] };
    }
  }
}
