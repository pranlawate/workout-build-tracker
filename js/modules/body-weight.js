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
}
