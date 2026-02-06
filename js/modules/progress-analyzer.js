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
      avgSessionMinutes: 0, // TODO: Calculate from session times
      exercisesProgressed: 0, // TODO: Calculate progression
      totalExercises: 0, // TODO: Count unique exercises
      currentStreak: 0 // TODO: Calculate streak
    };
  }
}
