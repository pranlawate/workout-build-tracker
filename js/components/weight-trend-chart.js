/**
 * Renders body weight trend chart using Canvas API
 */
export class WeightTrendChart {
  constructor(width = 350, height = 200) {
    this.width = width;
    this.height = height;
    this.padding = { top: 20, right: 20, bottom: 30, left: 50 };
  }

  /**
   * Apply moving average smoothing
   * @param {Array} entries - Weight entries
   * @returns {Array} Smoothed entries
   * @private
   */
  smooth8Week(entries) {
    if (entries.length < 3) return entries;

    const smoothed = [];
    const windowSize = Math.min(3, entries.length);

    for (let i = 0; i < entries.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(entries.length, start + windowSize);
      const window = entries.slice(start, end);
      const avgWeight = window.reduce((sum, e) => sum + e.weight_kg, 0) / window.length;

      smoothed.push({
        date: entries[i].date,
        weight_kg: avgWeight
      });
    }

    return smoothed;
  }

  /**
   * Draw axes and labels
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} minWeight - Min weight value
   * @param {number} maxWeight - Max weight value
   * @private
   */
  drawAxes(ctx, minWeight, maxWeight) {
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const chartHeight = this.height - this.padding.top - this.padding.bottom;

    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(this.padding.left, this.padding.top);
    ctx.lineTo(this.padding.left, this.padding.top + chartHeight);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(this.padding.left, this.padding.top + chartHeight);
    ctx.lineTo(this.padding.left + chartWidth, this.padding.top + chartHeight);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const weight = minWeight + ((maxWeight - minWeight) * i / ySteps);
      const y = this.padding.top + chartHeight - (chartHeight * i / ySteps);
      ctx.fillText(weight.toFixed(1), this.padding.left - 10, y + 3);
    }
  }

  /**
   * Draw data points
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Array} entries - Weight entries
   * @param {number} minWeight - Min weight
   * @param {number} maxWeight - Max weight
   * @param {Date} minDate - Earliest date
   * @param {Date} maxDate - Latest date
   * @private
   */
  drawDataPoints(ctx, entries, minWeight, maxWeight, minDate, maxDate) {
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const chartHeight = this.height - this.padding.top - this.padding.bottom;

    ctx.fillStyle = '#a78bfa';

    entries.forEach(entry => {
      const date = new Date(entry.date);
      const x = this.padding.left + ((date - minDate) / (maxDate - minDate)) * chartWidth;
      const y = this.padding.top + chartHeight - ((entry.weight_kg - minWeight) / (maxWeight - minWeight)) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  /**
   * Draw trend line
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Array} smoothed - Smoothed entries
   * @param {number} minWeight - Min weight
   * @param {number} maxWeight - Max weight
   * @param {Date} minDate - Earliest date
   * @param {Date} maxDate - Latest date
   * @private
   */
  drawTrendLine(ctx, smoothed, minWeight, maxWeight, minDate, maxDate) {
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const chartHeight = this.height - this.padding.top - this.padding.bottom;

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    smoothed.forEach((entry, i) => {
      const date = new Date(entry.date);
      const x = this.padding.left + ((date - minDate) / (maxDate - minDate)) * chartWidth;
      const y = this.padding.top + chartHeight - ((entry.weight_kg - minWeight) / (maxWeight - minWeight)) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }

  /**
   * Render weight trend chart
   * @param {Array} weightEntries - Array of {date, weight_kg}
   * @returns {HTMLCanvasElement} Canvas element
   */
  render(weightEntries) {
    if (!weightEntries || weightEntries.length === 0) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    const ctx = canvas.getContext('2d');

    // Clear background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, this.width, this.height);

    // Calculate ranges
    const weights = weightEntries.map(e => e.weight_kg);
    const minWeight = Math.min(...weights) - 0.5;
    const maxWeight = Math.max(...weights) + 0.5;
    const dates = weightEntries.map(e => new Date(e.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Draw chart
    this.drawAxes(ctx, minWeight, maxWeight);
    this.drawDataPoints(ctx, weightEntries, minWeight, maxWeight, minDate, maxDate);

    const smoothed = this.smooth8Week(weightEntries);
    this.drawTrendLine(ctx, smoothed, minWeight, maxWeight, minDate, maxDate);

    return canvas;
  }
}
