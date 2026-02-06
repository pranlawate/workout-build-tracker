/**
 * Analyzes workout progress and calculates statistics
 */
export class ProgressAnalyzer {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Get date range for last 4 weeks
   * @returns {Object} { startDate, endDate }
   * @private
   */
  getLast4WeeksRange() {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 28); // 4 weeks
    return { startDate, endDate };
  }

  /**
   * Get unique workout dates from exercise history
   * @param {Date} startDate - Start of range
   * @param {Date} endDate - End of range
   * @returns {Set<string>} Set of date strings
   * @private
   */
  getWorkoutDates(startDate, endDate) {
    const workoutDates = new Set();

    // Iterate through localStorage using the standard API
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('build_exercise_')) continue;

      const exerciseKey = key.replace('build_exercise_', '');
      const history = this.storage.getExerciseHistory(exerciseKey);
      if (!history || history.length === 0) continue;

      history.forEach(session => {
        const sessionDate = new Date(session.date);
        if (sessionDate >= startDate && sessionDate <= endDate) {
          workoutDates.add(session.date);
        }
      });
    }

    return workoutDates;
  }

  /**
   * Calculate average session time across all workouts in last 4 weeks
   * Groups by workout date and calculates average duration
   * @returns {number} Average session time in minutes (rounded to 1 decimal)
   */
  calculateAvgSessionTime() {
    try {
      const { startDate, endDate } = this.getLast4WeeksRange();
      const sessionTimes = new Map(); // Map<dateString, { startTime, endTime }>

      // Collect all sessions with time data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('build_exercise_')) continue;

        const exerciseKey = key.replace('build_exercise_', '');
        const history = this.storage.getExerciseHistory(exerciseKey);
        if (!history || history.length === 0) continue;

        history.forEach(session => {
          // Skip if no time data
          if (!session.startTime || !session.endTime) return;

          const sessionDate = new Date(session.date);
          if (sessionDate < startDate || sessionDate > endDate) return;

          // Use date string as key (multiple exercises share same workout date)
          const dateKey = session.date;

          // Store earliest startTime and latest endTime for this date
          if (!sessionTimes.has(dateKey)) {
            sessionTimes.set(dateKey, {
              startTime: new Date(session.startTime),
              endTime: new Date(session.endTime)
            });
          } else {
            const existing = sessionTimes.get(dateKey);
            const newStart = new Date(session.startTime);
            const newEnd = new Date(session.endTime);

            if (newStart < existing.startTime) {
              existing.startTime = newStart;
            }
            if (newEnd > existing.endTime) {
              existing.endTime = newEnd;
            }
          }
        });
      }

      // Calculate average duration
      if (sessionTimes.size === 0) return 0;

      let totalMinutes = 0;
      sessionTimes.forEach(({ startTime, endTime }) => {
        const durationMs = endTime - startTime;
        const durationMinutes = durationMs / (1000 * 60);
        totalMinutes += durationMinutes;
      });

      const avgMinutes = totalMinutes / sessionTimes.size;
      return Math.round(avgMinutes * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error('[ProgressAnalyzer] Error calculating avg session time:', error);
      return 0;
    }
  }

  /**
   * Get statistics for last 4 weeks
   * @returns {Object} Stats object
   */
  getLast4WeeksStats() {
    const { startDate, endDate } = this.getLast4WeeksRange();
    const workoutDates = this.getWorkoutDates(startDate, endDate);

    // If no workout history exists, return all zeros
    const workoutsCompleted = workoutDates.size;
    const workoutsPlanned = workoutsCompleted > 0 ? 12 : 0; // 3 per week × 4 weeks

    return {
      workoutsCompleted,
      workoutsPlanned,
      avgSessionMinutes: this.calculateAvgSessionTime(),
      exercisesProgressed: 0, // TODO: Calculate progression
      totalExercises: 0, // TODO: Count unique exercises
      currentStreak: 0 // TODO: Calculate streak
    };
  }
}
