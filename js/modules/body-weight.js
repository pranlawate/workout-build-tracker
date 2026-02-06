/**
 * Manages body weight tracking data in localStorage
 */
export class BodyWeightManager {
  constructor(storage) {
    // Keep storage parameter for future use (testing/mocking)
    // Currently using localStorage directly since StorageManager doesn't expose raw getItem/setItem
    this.storage = storage;
  }

  /**
   * Get body weight data from localStorage
   * @returns {Object} { entries: Array<{date: string, weight_kg: number}> }
   */
  getData() {
    const raw = localStorage.getItem('build_body_weight');
    if (!raw) {
      return { entries: [] };
    }
    try {
      const data = JSON.parse(raw);
      return data || { entries: [] };
    } catch (error) {
      console.error('[BodyWeightManager] Failed to parse weight data:', error);
      return { entries: [] };
    }
  }

  /**
   * Trim entries to last 8 weeks only
   * @param {Array} entries - Weight entries array
   * @returns {Array} Filtered entries
   * @private
   */
  trimTo8Weeks(entries) {
    if (entries.length === 0) return entries;

    const now = new Date();
    const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);

    // Filter to keep only last 8 weeks
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= eightWeeksAgo;
    });
  }

  /**
   * Add a new weight entry
   * @param {number} weight_kg - Weight in kilograms
   */
  addEntry(weight_kg) {
    // Validate input
    if (typeof weight_kg !== 'number' || isNaN(weight_kg) || weight_kg <= 0) {
      console.error('[BodyWeightManager] Invalid weight:', weight_kg);
      return;
    }

    const data = this.getData();
    data.entries.push({
      date: new Date().toISOString(),
      weight_kg: weight_kg
    });

    // Sort entries by date to maintain chronological order
    data.entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Trim to 8 weeks
    data.entries = this.trimTo8Weeks(data.entries);

    localStorage.setItem('build_body_weight', JSON.stringify(data));
  }

  /**
   * Calculate 8-week weight trend
   * @param {Array} entries - Weight entries (sorted chronologically)
   * @returns {number} Weight change in kg over 8 weeks (positive = gain, negative = loss)
   * @private
   */
  calculate8WeekTrend(entries) {
    if (entries.length === 0) return 0;
    if (entries.length === 1) return 0;

    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];

    return lastEntry.weight_kg - firstEntry.weight_kg;
  }

  /**
   * Calculate monthly rate of weight change
   * @param {Array} entries - Weight entries (sorted chronologically)
   * @returns {number} Rate of change in kg/month
   * @private
   */
  calculateMonthlyRate(entries) {
    if (entries.length === 0) return 0;
    if (entries.length === 1) return 0;

    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];

    const firstDate = new Date(firstEntry.date);
    const lastDate = new Date(lastEntry.date);

    const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    if (daysDiff === 0) return 0;

    const weightChange = lastEntry.weight_kg - firstEntry.weight_kg;
    const monthlyRate = (weightChange / daysDiff) * 30; // Convert to per-month rate

    return monthlyRate;
  }

  /**
   * Determine weight change status based on monthly rate
   * @param {number} monthlyRate - kg/month rate
   * @returns {string} Status classification
   * @private
   */
  determineStatus(monthlyRate) {
    if (monthlyRate > 0.7) return 'fast_bulk';
    if (monthlyRate >= 0.3) return 'healthy_bulk';
    if (monthlyRate >= -0.2) return 'maintenance';
    if (monthlyRate >= -0.5) return 'slow_cut';
    return 'rapid_cut'; // < -0.5
  }

  /**
   * Get weight summary with trend analysis
   * @returns {Object|null} Summary object or null if no data
   */
  getWeightSummary() {
    const data = this.getData();
    if (data.entries.length === 0) return null;

    const currentWeight = data.entries[data.entries.length - 1].weight_kg;
    const trend8Week = this.calculate8WeekTrend(data.entries);
    const monthlyRate = this.calculateMonthlyRate(data.entries);
    const status = this.determineStatus(monthlyRate);

    return {
      currentWeight,
      trend8Week,
      monthlyRate,
      status,
      entries: data.entries
    };
  }
}
