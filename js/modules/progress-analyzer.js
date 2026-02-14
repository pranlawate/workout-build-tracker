/**
 * Analyzes workout progress and calculates statistics
 */

// Analysis period constants
const ANALYSIS_PERIOD_WEEKS = 4;
const ANALYSIS_PERIOD_DAYS = ANALYSIS_PERIOD_WEEKS * 7; // 28 days
const PLANNED_WORKOUTS_PER_WEEK = 3;
const SESSION_DATE_TOLERANCE_DAYS = 3; // Flexibility window for finding historical sessions

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
    startDate.setDate(startDate.getDate() - ANALYSIS_PERIOD_DAYS);
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
    const workoutsPlanned = workoutsCompleted > 0 ? (PLANNED_WORKOUTS_PER_WEEK * ANALYSIS_PERIOD_WEEKS) : 0;

    return {
      workoutsCompleted,
      workoutsPlanned,
      avgSessionMinutes: this.calculateAvgSessionTime(),
      exercisesProgressed: this.countProgressedExercises(startDate, endDate),
      totalExercises: this.countUniqueExercises(startDate, endDate),
      currentStreak: this.storage.getRotation().currentStreak
    };
  }

  /**
   * Count exercises that showed weight progression in date range
   * @param {Date} startDate - Start of range
   * @param {Date} endDate - End of range
   * @returns {number} Count of exercises with progression
   * @private
   */
  countProgressedExercises(startDate, endDate) {
    try {
      let progressedCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('build_exercise_')) continue;

        const exerciseKey = key.replace('build_exercise_', '');
        const history = this.storage.getExerciseHistory(exerciseKey);
        if (!history || history.length === 0) continue;

        // Get most recent session in range
        const recentSession = history
          .filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= endDate;
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (!recentSession || !recentSession.sets || recentSession.sets.length === 0) continue;

        // Find older session (around startDate)
        const oldSession = history
          .filter(session => {
            const sessionDate = new Date(session.date);
            const diffDays = Math.abs((sessionDate - startDate) / (1000 * 60 * 60 * 24));
            return diffDays <= SESSION_DATE_TOLERANCE_DAYS;
          })
          .sort((a, b) => {
            const diffA = Math.abs(new Date(a.date) - startDate);
            const diffB = Math.abs(new Date(b.date) - startDate);
            return diffA - diffB;
          })[0];

        if (!oldSession || !oldSession.sets || oldSession.sets.length === 0) continue;

        // Calculate average weights
        const recentAvgWeight = recentSession.sets.reduce((sum, set) => sum + set.weight, 0) / recentSession.sets.length;
        const oldAvgWeight = oldSession.sets.reduce((sum, set) => sum + set.weight, 0) / oldSession.sets.length;

        // Count if showed progression
        if (oldAvgWeight > 0 && recentAvgWeight > oldAvgWeight) {
          progressedCount++;
        }
      }

      return progressedCount;
    } catch (error) {
      console.error('[ProgressAnalyzer] Error counting progressed exercises:', error);
      return 0;
    }
  }

  /**
   * Count unique exercises performed in date range
   * @param {Date} startDate - Start of range
   * @param {Date} endDate - End of range
   * @returns {number} Count of unique exercises
   * @private
   */
  countUniqueExercises(startDate, endDate) {
    try {
      const uniqueExercises = new Set();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('build_exercise_')) continue;

        const exerciseKey = key.replace('build_exercise_', '');
        const history = this.storage.getExerciseHistory(exerciseKey);
        if (!history || history.length === 0) continue;

        // Check if exercise was performed in date range
        const performedInRange = history.some(session => {
          const sessionDate = new Date(session.date);
          return sessionDate >= startDate && sessionDate <= endDate;
        });

        if (performedInRange) {
          uniqueExercises.add(exerciseKey);
        }
      }

      return uniqueExercises.size;
    } catch (error) {
      console.error('[ProgressAnalyzer] Error counting unique exercises:', error);
      return 0;
    }
  }

  /**
   * Get top progressing exercises by comparing weights from 4 weeks ago to current
   * @param {number} count - Number of exercises to return (default: 3)
   * @returns {Array<Object>} Array of { exerciseName, percentGain }
   */
  getTopProgressingExercises(count = 3) {
    try {
      const { startDate, endDate } = this.getLast4WeeksRange();
      const progressions = [];

      // Loop through all exercises in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('build_exercise_')) continue;

        const exerciseKey = key.replace('build_exercise_', '');
        const history = this.storage.getExerciseHistory(exerciseKey);
        if (!history || history.length === 0) continue;

        // Get most recent session (must be within last 4 weeks)
        const recentSession = history
          .filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= endDate;
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (!recentSession || !recentSession.sets || recentSession.sets.length === 0) continue;

        // Find session from 4 weeks ago (around startDate)
        const oldSession = history
          .filter(session => {
            const sessionDate = new Date(session.date);
            // Look for sessions around the start date (within a few days)
            const diffDays = Math.abs((sessionDate - startDate) / (1000 * 60 * 60 * 24));
            return diffDays <= SESSION_DATE_TOLERANCE_DAYS;
          })
          .sort((a, b) => {
            // Get closest to startDate
            const diffA = Math.abs(new Date(a.date) - startDate);
            const diffB = Math.abs(new Date(b.date) - startDate);
            return diffA - diffB;
          })[0];

        if (!oldSession || !oldSession.sets || oldSession.sets.length === 0) continue;

        // Calculate average weight from sets
        const recentAvgWeight = recentSession.sets.reduce((sum, set) => sum + set.weight, 0) / recentSession.sets.length;
        const oldAvgWeight = oldSession.sets.reduce((sum, set) => sum + set.weight, 0) / oldSession.sets.length;

        // Skip if no progression or division by zero
        if (oldAvgWeight === 0 || recentAvgWeight <= oldAvgWeight) continue;

        // Compute absolute and percentage gain
        const absoluteGain = recentAvgWeight - oldAvgWeight;
        const percentGain = Math.round((absoluteGain / oldAvgWeight) * 100);

        // Extract exercise name (remove workout prefix like "UPPER_A - ")
        const exerciseName = exerciseKey.includes(' - ')
          ? exerciseKey.split(' - ')[1]
          : exerciseKey;

        progressions.push({
          exerciseName,
          percentGain,
          absoluteGain // Used for sorting, removed before output
        });
      }

      // Sort by: 1) percent gain desc, 2) absolute gain desc, 3) alphabetically
      progressions.sort((a, b) => {
        if (b.percentGain !== a.percentGain) {
          return b.percentGain - a.percentGain;
        }
        if (b.absoluteGain !== a.absoluteGain) {
          return b.absoluteGain - a.absoluteGain;
        }
        return a.exerciseName.localeCompare(b.exerciseName);
      });

      // Return top N, removing absoluteGain from output
      return progressions.slice(0, count).map(({ exerciseName, percentGain }) => ({
        exerciseName,
        percentGain
      }));
    } catch (error) {
      console.error('[ProgressAnalyzer] Error getting top progressing exercises:', error);
      return [];
    }
  }
}
