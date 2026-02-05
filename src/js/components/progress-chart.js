// src/js/components/progress-chart.js

export class ProgressChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }
    this.ctx = this.canvas.getContext('2d');

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.width = rect.width;
    this.height = rect.height;
  }

  /**
   * Draw weight progression chart
   * @param {Array} history - Exercise history array
   */
  draw(history) {
    if (!history || history.length === 0) {
      this.drawEmptyState();
      return;
    }

    // Extract data points (use first set weight)
    const data = history.map(entry => ({
      date: new Date(entry.date),
      weight: entry.sets[0]?.weight || 0
    }));

    if (data.length === 1) {
      this.drawSinglePoint(data[0]);
      return;
    }

    const padding = 40;
    const chartWidth = this.width - 2 * padding;
    const chartHeight = this.height - 2 * padding;

    // Get weight range
    const weights = data.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight || 10; // Fallback if all same

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw grid
    this.drawGrid(padding, chartWidth, chartHeight, minWeight, maxWeight);

    // Draw line
    this.drawLine(data, padding, chartWidth, chartHeight, minWeight, weightRange);

    // Draw points
    this.drawPoints(data, padding, chartWidth, chartHeight, minWeight, weightRange);

    // Draw labels
    this.drawLabels(data, padding, chartWidth, chartHeight, minWeight, maxWeight);
  }

  drawGrid(padding, width, height, minWeight, maxWeight) {
    this.ctx.strokeStyle = '#334155'; // --color-surface-light
    this.ctx.lineWidth = 1;

    // Horizontal grid lines (5 lines)
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(padding + width, y);
      this.ctx.stroke();
    }

    // Vertical grid lines (4 lines)
    for (let i = 0; i <= 3; i++) {
      const x = padding + (width / 3) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding);
      this.ctx.lineTo(x, padding + height);
      this.ctx.stroke();
    }
  }

  drawLine(data, padding, width, height, minWeight, weightRange) {
    this.ctx.strokeStyle = '#06b6d4'; // --color-primary
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const y = padding + height - ((point.weight - minWeight) / weightRange) * height;

      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });

    this.ctx.stroke();
  }

  drawPoints(data, padding, width, height, minWeight, weightRange) {
    this.ctx.fillStyle = '#06b6d4'; // --color-primary

    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const y = padding + height - ((point.weight - minWeight) / weightRange) * height;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawLabels(data, padding, width, height, minWeight, maxWeight) {
    this.ctx.fillStyle = '#94a3b8'; // --color-text-dim
    this.ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    this.ctx.textAlign = 'center';

    // X-axis labels (dates) - show first, middle, last
    const indices = [0, Math.floor(data.length / 2), data.length - 1];
    indices.forEach(i => {
      if (i < data.length) {
        const x = padding + (i / (data.length - 1)) * width;
        const label = data[i].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        this.ctx.fillText(label, x, this.height - 10);
      }
    });

    // Y-axis labels (weights)
    this.ctx.textAlign = 'right';
    const weightLabels = [minWeight, (minWeight + maxWeight) / 2, maxWeight];
    weightLabels.forEach((weight, i) => {
      const y = padding + height - (i / 2) * height;
      this.ctx.fillText(`${weight.toFixed(1)}kg`, padding - 10, y + 4);
    });
  }

  drawEmptyState() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#94a3b8'; // --color-text-dim
    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('No workout data yet', this.width / 2, this.height / 2);
  }

  drawSinglePoint(point) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const padding = 40;
    const x = this.width / 2;
    const y = this.height / 2;

    // Draw point
    this.ctx.fillStyle = '#06b6d4';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw label
    this.ctx.fillStyle = '#f1f5f9'; // --color-text
    this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `${point.weight}kg - ${point.date.toLocaleDateString()}`,
      x,
      y + 30
    );
  }
}
