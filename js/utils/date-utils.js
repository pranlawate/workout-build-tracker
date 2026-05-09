/**
 * Date utilities for display and gap-aware progression.
 *
 * calendarDaysAgo: local-midnight comparison for UI labels.
 * daysBetween: absolute day difference between two dates.
 * getGapReductionPercent: evidence-based weight reduction after training gaps.
 *
 * Evidence: Mujika & Padilla 2001 (MSSE), Encarnacao et al. 2022 (systematic review).
 * Reductions are conservative, biased toward safety.
 */

export function calendarDaysAgo(dateInput) {
  const then = new Date(dateInput);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const thenMidnight = new Date(then);
  thenMidnight.setHours(0, 0, 0, 0);
  return Math.round((todayMidnight - thenMidnight) / (1000 * 60 * 60 * 24));
}

export function daysBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.round(Math.abs(a - b) / (1000 * 60 * 60 * 24));
}

/**
 * @param {number} daysSinceLastSession
 * @returns {number} Suggested weight reduction percentage (0-25)
 *
 * 0-7 days:  0%  (neural patterns intact, no loss)
 * 7-14 days: 5%  (safety margin, <2% measured loss)
 * 14-28 days: 10% (2-5% early muscular detraining)
 * 4-6 weeks: 15% (5-10% fiber CSA decline begins)
 * 6-8 weeks: 20% (8-15% progressive atrophy)
 * 8+ weeks:  25% (15-25% significant detraining)
 */
export function getGapReductionPercent(daysSinceLastSession) {
  if (daysSinceLastSession <= 7) return 0;
  if (daysSinceLastSession <= 14) return 5;
  if (daysSinceLastSession <= 28) return 10;
  if (daysSinceLastSession <= 42) return 15;
  if (daysSinceLastSession <= 56) return 20;
  return 25;
}
