/**
 * Analytics calculation module for workout volume, trends, and performance metrics.
 * Uses dependency injection to access StorageManager for all data operations.
 * @module AnalyticsCalculator
 */

// Constants
const HIGH_FATIGUE_THRESHOLD = 4;

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

  /**
   * Calculates recovery trends including sleep, fatigue, and weekly trends
   * @param {number} [days=28] - Number of days to include in calculation
   * @returns {Object} Recovery trends with avgSleep, avgFatigue, highFatigueDays, and weeklyTrend
   * @returns {number} returns.avgSleep - Average sleep hours in the period
   * @returns {number} returns.avgFatigue - Average fatigue score in the period
   * @returns {number} returns.highFatigueDays - Count of days with fatigue score ≥ 4
   * @returns {Array<{week: string, avgSleep: number, avgFatigue: number}>} returns.weeklyTrend - Weekly averages sorted by week
   */
  calculateRecoveryTrends(days = 28) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      // Get recovery metrics from localStorage
      const metricsData = localStorage.getItem('build_recovery_metrics');
      if (!metricsData) {
        return { avgSleep: 0, avgFatigue: 0, highFatigueDays: 0, weeklyTrend: [] };
      }

      const allMetrics = JSON.parse(metricsData);
      const recentMetrics = allMetrics.filter(m => m.date >= cutoffStr);

      if (recentMetrics.length === 0) {
        return { avgSleep: 0, avgFatigue: 0, highFatigueDays: 0, weeklyTrend: [] };
      }

      // Calculate averages
      const avgSleep = recentMetrics.reduce((sum, m) => sum + (m.sleep || 0), 0) / recentMetrics.length;
      const avgFatigue = recentMetrics.reduce((sum, m) => sum + (m.fatigueScore || 0), 0) / recentMetrics.length;

      // Count high fatigue days (≥4 points)
      const highFatigueDays = recentMetrics.filter(m => (m.fatigueScore || 0) >= HIGH_FATIGUE_THRESHOLD).length;

      // Calculate weekly trend (4 weeks)
      const weeklyTrend = this.calculateWeeklyRecoveryTrend(recentMetrics);

      return { avgSleep, avgFatigue, highFatigueDays, weeklyTrend };
    } catch (error) {
      console.error('[AnalyticsCalculator] Recovery trends error:', error);
      return { avgSleep: 0, avgFatigue: 0, highFatigueDays: 0, weeklyTrend: [] };
    }
  }

  /**
   * Calculates weekly recovery trends from metrics data
   * @private
   * @param {Array<{date: string, sleep: number, fatigueScore: number}>} metrics - Recovery metrics to analyze
   * @returns {Array<{week: string, avgSleep: number, avgFatigue: number}>} Weekly averages sorted by week
   */
  calculateWeeklyRecoveryTrend(metrics) {
    try {
      // Group by week
      const weekMap = new Map();

      metrics.forEach(m => {
        const date = new Date(m.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Sunday
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, { sleep: [], fatigue: [] });
        }

        weekMap.get(weekKey).sleep.push(m.sleep || 0);
        weekMap.get(weekKey).fatigue.push(m.fatigueScore || 0);
      });

      // Calculate weekly averages
      const trend = Array.from(weekMap.entries())
        .map(([week, data]) => ({
          week,
          avgSleep: data.sleep.reduce((a, b) => a + b, 0) / data.sleep.length,
          avgFatigue: data.fatigue.reduce((a, b) => a + b, 0) / data.fatigue.length
        }))
        .sort((a, b) => a.week.localeCompare(b.week));

      return trend;
    } catch (error) {
      console.error('[AnalyticsCalculator] Weekly trend error:', error);
      return [];
    }
  }

  /**
   * Detects patterns correlating recovery metrics with performance
   * @returns {Array<{type: string, confidence: number, message: string}>} Detected patterns sorted by confidence
   */
  detectPatterns() {
    try {
      const patterns = [];

      // Get all workout dates
      const rotation = this.storage.getRotation();
      if (!rotation || !rotation.sequence) {
        return [{ type: 'insufficient-data', confidence: 0, message: 'Not enough data yet (0/10 workouts)' }];
      }

      const completedWorkouts = rotation.sequence.filter(w => w.completed);
      if (completedWorkouts.length < 10) {
        return [{ type: 'insufficient-data', confidence: 0, message: `Not enough data yet (${completedWorkouts.length}/10 workouts)` }];
      }

      // Pattern 1: Sleep vs Progression
      const sleepPattern = this.detectSleepProgressionPattern();
      if (sleepPattern) patterns.push(sleepPattern);

      // Pattern 2: Volume vs Pain
      const volumePainPattern = this.detectVolumePainPattern();
      if (volumePainPattern) patterns.push(volumePainPattern);

      // Sort by confidence
      return patterns.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('[AnalyticsCalculator] Pattern detection error:', error);
      return [];
    }
  }

  /**
   * Detects correlation between sleep and progression
   * @private
   * @returns {Object|null} Pattern object or null if no pattern found
   */
  detectSleepProgressionPattern() {
    try {
      const metricsData = localStorage.getItem('build_recovery_metrics');
      if (!metricsData) return null;

      const allMetrics = JSON.parse(metricsData);
      const rotation = this.storage.getRotation();
      if (!rotation || !rotation.sequence) return null;

      // Map workouts to sleep data
      const workoutSleepData = rotation.sequence
        .filter(w => w.completed)
        .map(w => {
          const metrics = allMetrics.find(m => m.date === w.date);
          const progressed = this.didProgressOnDate(w.date);
          return {
            date: w.date,
            sleep: metrics?.sleep || 0,
            progressed
          };
        })
        .filter(d => d.sleep > 0); // Only include days with sleep data

      if (workoutSleepData.length < 10) return null;

      // Split by sleep quality
      const highSleep = workoutSleepData.filter(d => d.sleep >= 7);
      const lowSleep = workoutSleepData.filter(d => d.sleep < 6);

      if (highSleep.length < 5 || lowSleep.length < 5) return null;

      // Calculate progression rates
      const highSleepProgressRate = highSleep.filter(d => d.progressed).length / highSleep.length;
      const lowSleepProgressRate = lowSleep.filter(d => d.progressed).length / lowSleep.length;

      // Check for significant difference (1.5x threshold)
      if (highSleepProgressRate > lowSleepProgressRate * 1.5) {
        const confidence = this.calculateConfidence(highSleep.length, lowSleep.length);
        const multiplier = (highSleepProgressRate / Math.max(lowSleepProgressRate, 0.01)).toFixed(1);

        return {
          type: 'sleep-progression',
          confidence,
          message: `When sleep ≥7hrs, you progress ${multiplier}× faster than when sleep <6hrs`
        };
      }

      return null;
    } catch (error) {
      console.error('[AnalyticsCalculator] Sleep pattern error:', error);
      return null;
    }
  }

  /**
   * Detects correlation between volume and pain
   * @private
   * @returns {Object|null} Pattern object or null if no pattern found
   */
  detectVolumePainPattern() {
    try {
      // Get all pain reports
      const painKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('build_pain_'));

      if (painKeys.length === 0) return null;

      // Analyze volume when pain occurred
      const painDates = new Set();
      painKeys.forEach(key => {
        const painData = JSON.parse(localStorage.getItem(key) || '[]');
        painData.forEach(p => {
          if (p.severity && p.severity !== 'none') {
            painDates.add(p.date);
          }
        });
      });

      if (painDates.size < 3) return null;

      // Calculate average volume on pain days vs pain-free days
      const rotation = this.storage.getRotation();
      if (!rotation || !rotation.sequence) return null;

      const volumeOnPainDays = [];
      const volumeOnNormalDays = [];

      rotation.sequence.filter(w => w.completed).forEach(w => {
        const volume = this.getVolumeForDate(w.date);
        if (painDates.has(w.date)) {
          volumeOnPainDays.push(volume);
        } else {
          volumeOnNormalDays.push(volume);
        }
      });

      if (volumeOnPainDays.length < 3 || volumeOnNormalDays.length < 5) return null;

      const avgPainVolume = volumeOnPainDays.reduce((a, b) => a + b, 0) / volumeOnPainDays.length;
      const avgNormalVolume = volumeOnNormalDays.reduce((a, b) => a + b, 0) / volumeOnNormalDays.length;

      // Check if pain days have significantly higher volume (20% threshold)
      if (avgPainVolume > avgNormalVolume * 1.2) {
        const confidence = this.calculateConfidence(volumeOnPainDays.length, volumeOnNormalDays.length);
        const threshold = Math.round(avgPainVolume / 100) * 100; // Round to nearest 100

        return {
          type: 'volume-pain',
          confidence,
          message: `Pain appears when weekly volume exceeds ${threshold}kg`
        };
      }

      return null;
    } catch (error) {
      console.error('[AnalyticsCalculator] Volume-pain pattern error:', error);
      return null;
    }
  }

  /**
   * Checks if any exercise progressed on a specific date
   * @private
   * @param {string} date - Date to check
   * @returns {boolean} True if progression occurred
   */
  didProgressOnDate(date) {
    try {
      const allKeys = this.storage.getAllExerciseKeys();

      let progressed = false;

      allKeys.forEach(key => {
        const history = this.storage.getExerciseHistory(key);
        const entryIndex = history.findIndex(e => e.date === date);
        if (entryIndex > 0) {
          const currentEntry = history[entryIndex];
          const previousEntry = history[entryIndex - 1];

          const currentWeight = currentEntry.sets[0]?.weight || 0;
          const previousWeight = previousEntry.sets[0]?.weight || 0;

          if (currentWeight > previousWeight) {
            progressed = true;
          }
        }
      });

      return progressed;
    } catch (error) {
      console.error('[AnalyticsCalculator] Progression check error:', error);
      return false;
    }
  }

  /**
   * Gets total volume for a specific date
   * @private
   * @param {string} date - Date to get volume for
   * @returns {number} Total volume for the date
   */
  getVolumeForDate(date) {
    try {
      const allKeys = this.storage.getAllExerciseKeys();

      let totalVolume = 0;

      allKeys.forEach(key => {
        const history = this.storage.getExerciseHistory(key);
        const entry = history.find(e => e.date === date);
        if (entry) {
          const volume = entry.sets.reduce((sum, set) => {
            return sum + (set.weight * set.reps);
          }, 0);
          totalVolume += volume;
        }
      });

      return totalVolume;
    } catch (error) {
      console.error('[AnalyticsCalculator] Volume for date error:', error);
      return 0;
    }
  }

  /**
   * Calculates confidence score based on sample sizes
   * @private
   * @param {number} sampleSize1 - First sample size
   * @param {number} sampleSize2 - Second sample size
   * @returns {number} Confidence percentage (55-85)
   */
  calculateConfidence(sampleSize1, sampleSize2) {
    // Confidence based on sample sizes
    const totalSamples = sampleSize1 + sampleSize2;
    if (totalSamples >= 30) return 85;
    if (totalSamples >= 20) return 75;
    if (totalSamples >= 15) return 65;
    return 55;
  }
}
