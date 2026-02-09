export class AnalyticsCalculator {
  constructor(storage) {
    this.storage = storage;
  }

  calculateVolume(days = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      // Get all exercise keys
      const storage = globalThis.localStorage;
      const allKeys = (storage.data ? Object.keys(storage.data) : Object.keys(storage))
        .filter(key => key.startsWith('build_exercise_'));

      let total = 0;
      const byWorkoutType = {};
      const dailyMap = new Map();

      // Process each exercise
      allKeys.forEach(key => {
        const exerciseKey = key.replace('build_exercise_', '');
        const history = this.storage.getExerciseHistory(exerciseKey);
        const [workoutType] = exerciseKey.split(' - ');

        history.forEach(entry => {
          if (entry.date >= cutoffStr) {
            // Calculate volume for this entry
            const entryVolume = entry.sets.reduce((sum, set) => {
              return sum + (set.weight * set.reps);
            }, 0);

            total += entryVolume;

            // Track by workout type
            if (!byWorkoutType[workoutType]) {
              byWorkoutType[workoutType] = { volume: 0, sessions: 0 };
            }
            byWorkoutType[workoutType].volume += entryVolume;

            // Track daily volume
            if (!dailyMap.has(entry.date)) {
              dailyMap.set(entry.date, 0);
            }
            dailyMap.set(entry.date, dailyMap.get(entry.date) + entryVolume);
          }
        });
      });

      // Count sessions per workout type
      const rotation = this.storage.getRotation();
      if (rotation && rotation.sequence) {
        rotation.sequence.forEach(entry => {
          if (entry.date >= cutoffStr && entry.completed) {
            const workoutType = entry.workout;
            if (byWorkoutType[workoutType]) {
              byWorkoutType[workoutType].sessions++;
            }
          }
        });
      }

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

  calculatePreviousPeriodVolume(days) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days * 2));
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - days);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const storage = globalThis.localStorage;
      const allKeys = (storage.data ? Object.keys(storage.data) : Object.keys(storage))
        .filter(key => key.startsWith('build_exercise_'));

      let total = 0;

      allKeys.forEach(key => {
        const exerciseKey = key.replace('build_exercise_', '');
        const history = this.storage.getExerciseHistory(exerciseKey);
        history.forEach(entry => {
          if (entry.date >= startStr && entry.date < endStr) {
            const entryVolume = entry.sets.reduce((sum, set) => {
              return sum + (set.weight * set.reps);
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
