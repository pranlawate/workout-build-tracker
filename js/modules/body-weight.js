/**
 * Manages body weight tracking data in localStorage
 */
export class BodyWeightManager {
  constructor(storage) {
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
   * Add a new weight entry
   * @param {number} weight_kg - Weight in kilograms
   */
  addEntry(weight_kg) {
    const data = this.getData();
    data.entries.push({
      date: new Date().toISOString(),
      weight_kg: weight_kg
    });

    // Sort entries by date to maintain chronological order
    data.entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    localStorage.setItem('build_body_weight', JSON.stringify(data));
  }
}
