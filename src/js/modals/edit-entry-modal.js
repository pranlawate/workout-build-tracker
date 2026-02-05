// src/js/modals/edit-entry-modal.js

export class EditEntryModal {
  constructor(storage, onSave) {
    this.storage = storage;
    this.onSave = onSave;
    this.currentExerciseKey = null;
    this.currentIndex = null;
  }

  /**
   * Show edit modal for a workout entry
   * @param {string} exerciseKey - Exercise key
   * @param {number} index - Entry index in history array
   */
  show(exerciseKey, index) {
    this.currentExerciseKey = exerciseKey;
    this.currentIndex = index;

    const history = this.storage.getExerciseHistory(exerciseKey);
    const reversedIndex = history.length - 1 - index;
    const entry = history[reversedIndex];

    if (!entry) {
      console.error('Entry not found');
      return;
    }

    // Populate modal
    this.renderModal(entry);

    // Show modal
    const modal = document.getElementById('edit-entry-modal');
    if (modal) {
      modal.style.display = 'flex';
    }

    // Attach handlers
    this.attachHandlers();
  }

  renderModal(entry) {
    const date = new Date(entry.date).toISOString().split('T')[0]; // YYYY-MM-DD
    const setsContainer = document.getElementById('edit-sets-container');

    if (!setsContainer) return;

    // Render sets
    const setsHtml = entry.sets.map((set, i) => `
      <div class="edit-set-row">
        <span class="edit-set-label">Set ${i + 1}</span>
        <div class="edit-inputs">
          <div class="edit-input-group">
            <label class="edit-label">Weight (kg)</label>
            <input
              type="number"
              class="edit-input"
              data-set="${i}"
              data-field="weight"
              value="${set.weight}"
              step="0.5"
              min="0"
            />
          </div>
          <div class="edit-input-group">
            <label class="edit-label">Reps</label>
            <input
              type="number"
              class="edit-input"
              data-set="${i}"
              data-field="reps"
              value="${set.reps}"
              min="1"
            />
          </div>
          <div class="edit-input-group">
            <label class="edit-label">RIR</label>
            <select
              class="edit-input"
              data-set="${i}"
              data-field="rir"
            >
              <option value="0" ${set.rir === 0 ? 'selected' : ''}>0 (Failure)</option>
              <option value="1" ${set.rir === 1 ? 'selected' : ''}>1</option>
              <option value="2" ${set.rir === 2 ? 'selected' : ''}>2</option>
              <option value="3" ${set.rir === 3 ? 'selected' : ''}>3</option>
              <option value="4" ${set.rir === 4 ? 'selected' : ''}>4</option>
              <option value="5" ${set.rir === 5 ? 'selected' : ''}>5+</option>
            </select>
          </div>
        </div>
      </div>
    `).join('');

    setsContainer.innerHTML = setsHtml;

    // Set date
    const dateInput = document.getElementById('edit-entry-date');
    if (dateInput) {
      dateInput.value = date;
    }
  }

  attachHandlers() {
    const cancelBtn = document.getElementById('edit-entry-cancel');
    const saveBtn = document.getElementById('edit-entry-save');

    if (cancelBtn) {
      cancelBtn.onclick = () => this.hide();
    }

    if (saveBtn) {
      saveBtn.onclick = () => this.save();
    }
  }

  save() {
    const history = this.storage.getExerciseHistory(this.currentExerciseKey);
    const reversedIndex = history.length - 1 - this.currentIndex;
    const entry = history[reversedIndex];

    // Read updated values
    const dateInput = document.getElementById('edit-entry-date');
    if (dateInput) {
      entry.date = new Date(dateInput.value).toISOString();
    }

    // Update sets
    entry.sets.forEach((set, i) => {
      const weightInput = document.querySelector(`.edit-input[data-set="${i}"][data-field="weight"]`);
      const repsInput = document.querySelector(`.edit-input[data-set="${i}"][data-field="reps"]`);
      const rirInput = document.querySelector(`.edit-input[data-set="${i}"][data-field="rir"]`);

      if (weightInput) set.weight = parseFloat(weightInput.value);
      if (repsInput) set.reps = parseInt(repsInput.value);
      if (rirInput) set.rir = parseInt(rirInput.value);

      // Validate
      if (set.weight <= 0 || set.reps <= 0 || set.rir < 0) {
        alert('Invalid values. Please check your inputs.');
        throw new Error('Invalid set values');
      }
    });

    // Save
    this.storage.saveExerciseHistory(this.currentExerciseKey, history);

    // Callback
    if (this.onSave) {
      this.onSave(this.currentExerciseKey);
    }

    this.hide();
  }

  hide() {
    const modal = document.getElementById('edit-entry-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
}
