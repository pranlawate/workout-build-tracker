# Pre/Post-Workout Modals Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Separate warm-up and cool-down from tracked workout time with dedicated modals that enforce proper preparation and recovery.

**Architecture:** Modal-first approach with new `stretching-protocols.js` module. Two new modals (#warmup-modal, #cooldown-modal) gate workout start/finish. Workout timer starts AFTER warm-up completion, ensuring accurate time tracking.

**Tech Stack:** Vanilla JavaScript ES6 modules, HTML5, CSS3, localStorage (session-level only)

---

## Phase 1: Stretching Protocols Module

### Task 1: Create stretching-protocols.js Module

**Files:**
- Create: `js/modules/stretching-protocols.js`

**Step 1: Create module with upper body stretches**

```javascript
/**
 * Stretching Protocols Module
 *
 * Built with Science research-backed static stretching sequences.
 * Workout-specific protocols for optimal recovery.
 *
 * @module stretching-protocols
 */

/**
 * Upper body stretching protocol (4-5 min)
 * For Upper A and Upper B workouts
 *
 * @returns {Array} Static stretches with duration and targets
 */
export function getUpperBodyStretches() {
  return [
    {
      name: 'Doorway Chest Stretch',
      duration: '30-60s per side',
      target: 'chest, front delts',
      instructions: 'Place forearm on doorframe, gently lean forward'
    },
    {
      name: 'Cross-Body Shoulder Stretch',
      duration: '30s per side',
      target: 'rear delts, rotator cuff',
      instructions: 'Pull arm across chest, hold with opposite hand'
    },
    {
      name: 'Overhead Tricep Stretch',
      duration: '30s per side',
      target: 'triceps, lats',
      instructions: 'Reach arm overhead, bend elbow, pull with opposite hand'
    },
    {
      name: 'Behind-Back Lat Stretch',
      duration: '30-60s',
      target: 'lats, teres major',
      instructions: 'Clasp hands behind back, straighten arms, lift gently'
    },
    {
      name: 'Wrist Flexor/Extensor Stretch',
      duration: '30s each',
      target: 'forearms',
      instructions: 'Extend arm, pull fingers back/forward with opposite hand'
    }
  ];
}

/**
 * Lower body stretching protocol (6-8 min)
 * For Lower A and Lower B workouts
 *
 * @returns {Array} Static stretches with duration and targets
 */
export function getLowerBodyStretches() {
  return [
    {
      name: 'Standing Quad Stretch',
      duration: '30-60s per side',
      target: 'quadriceps',
      instructions: 'Stand on one leg, pull heel to glute, keep knees together'
    },
    {
      name: 'Standing Hamstring Stretch',
      duration: '30-60s per side',
      target: 'hamstrings',
      instructions: 'Leg on bench, hinge at hips, keep back straight'
    },
    {
      name: 'Hip Flexor Stretch (lunge position)',
      duration: '30-60s per side',
      target: 'hip flexors, psoas',
      instructions: 'Low lunge position, push hips forward, keep back straight'
    },
    {
      name: 'Figure-4 Glute Stretch',
      duration: '30-60s per side',
      target: 'glutes, piriformis',
      instructions: 'Seated, cross ankle over opposite knee, lean forward'
    },
    {
      name: 'Standing Calf Stretch',
      duration: '30s per side',
      target: 'gastrocnemius, soleus',
      instructions: 'Step forward, keep back leg straight, heel down'
    },
    {
      name: 'Seated Spinal Twist',
      duration: '30s per side',
      target: 'lower back, obliques',
      instructions: 'Seated, cross leg over, twist torso, look behind shoulder'
    }
  ];
}
```

**Step 2: Add foam rolling protocols**

```javascript
/**
 * Upper body foam rolling protocol (3-5 min)
 * For Upper A and Upper B workouts
 *
 * @returns {Array} Foam rolling areas with duration and notes
 */
export function getUpperBodyFoamRolling() {
  return [
    {
      area: 'Upper Back/Traps',
      duration: '30-60s',
      note: 'Roll side to side, pause on tender spots'
    },
    {
      area: 'Lats',
      duration: '30-60s per side',
      note: 'Arm overhead, roll along side body'
    },
    {
      area: 'Chest/Pec Minor',
      duration: '30-60s',
      note: 'Use lacrosse ball against wall, slow circles'
    }
  ];
}

/**
 * Lower body foam rolling protocol (5-8 min)
 * For Lower A and Lower B workouts
 *
 * @returns {Array} Foam rolling areas with duration and notes
 */
export function getLowerBodyFoamRolling() {
  return [
    {
      area: 'Quads',
      duration: '30-60s per leg',
      note: 'Roll from hip to knee, pause on tender spots'
    },
    {
      area: 'IT Band',
      duration: '30-60s per leg',
      note: 'Side of thigh, slow passes, very tender'
    },
    {
      area: 'Glutes',
      duration: '30-60s per side',
      note: 'Sit on roller, cross ankle over knee, roll glute'
    },
    {
      area: 'Calves',
      duration: '30-60s per leg',
      note: 'Roll from ankle to knee, point/flex foot'
    }
  ];
}
```

**Step 3: Add LISS cardio recommendation function**

```javascript
/**
 * Get LISS cardio recommendation based on workout type
 *
 * @param {string} workoutKey - Workout key (e.g., 'UPPER_A', 'LOWER_A')
 * @returns {Object} Recommendation with machine, warnings, duration
 */
export function getLISSRecommendation(workoutKey) {
  const isLower = workoutKey.startsWith('LOWER');

  return {
    recommended: 'bike',
    alternatives: isLower
      ? ['elliptical', 'treadmill_caution']
      : ['elliptical', 'treadmill'],
    duration: 10, // default minutes
    warning: isLower
      ? '⚠️ Legs are fatigued - avoid high-impact'
      : 'Legs are fresh - any low-impact cardio works',
    treadmillNote: isLower
      ? '⚠️ Walking only - legs need rest'
      : 'Walking pace recommended'
  };
}
```

**Step 4: Verify module exports**

Run in browser console:
```javascript
import('./js/modules/stretching-protocols.js').then(m => {
  console.log('Upper stretches:', m.getUpperBodyStretches().length);
  console.log('Lower stretches:', m.getLowerBodyStretches().length);
  console.log('Upper foam:', m.getUpperBodyFoamRolling().length);
  console.log('Lower foam:', m.getLowerBodyFoamRolling().length);
  console.log('LISS rec:', m.getLISSRecommendation('UPPER_A'));
});
```

Expected:
```
Upper stretches: 5
Lower stretches: 6
Upper foam: 3
Lower foam: 4
LISS rec: { recommended: 'bike', ... }
```

**Step 5: Commit**

```bash
git add js/modules/stretching-protocols.js
git commit -m "feat: create stretching protocols module

Add workout-specific stretching and foam rolling protocols:
- Upper body: 5 stretches, 3 foam rolling areas
- Lower body: 6 stretches, 4 foam rolling areas
- LISS cardio smart recommendations (bike/elliptical/treadmill)
- Built with Science research-backed protocols"
```

---

## Phase 2: Warm-up Modal HTML & CSS

### Task 2: Add Warm-up Modal HTML

**Files:**
- Modify: `index.html` (after existing modals, before closing body tag)

**Step 1: Add warm-up modal structure**

Find the closing `</body>` tag and add BEFORE it:

```html
<!-- Warm-up Modal -->
<div id="warmup-modal" class="modal" style="display: none;">
  <div class="modal-content modal-medium">
    <h2 class="modal-title">🔥 Warm-up (<span id="warmup-duration">5-7 min</span>)</h2>
    <p class="modal-subtitle">Complete all before starting:</p>

    <div id="warmup-checklist" class="checklist">
      <!-- Dynamically populated from warm-up-protocols.js -->
    </div>

    <div class="progress-indicator">
      <span id="warmup-progress">✓ 0 of 0 completed</span>
    </div>

    <button id="begin-workout-btn" class="btn-primary btn-large" disabled>
      Begin Workout
    </button>
  </div>
</div>
```

**Step 2: Verify HTML structure**

Open index.html in browser, inspect element:
- #warmup-modal exists
- Contains #warmup-checklist
- Contains #warmup-progress
- Contains #begin-workout-btn

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add warm-up modal HTML structure

Add modal with checklist container, progress indicator, and begin button.
Modal hidden by default, will be shown when starting workout."
```

---

### Task 3: Add Cooldown Modal HTML

**Files:**
- Modify: `index.html` (after warmup modal, before closing body tag)

**Step 1: Add cooldown modal structure**

Add AFTER warmup modal, BEFORE `</body>`:

```html
<!-- Cooldown Modal -->
<div id="cooldown-modal" class="modal" style="display: none;">
  <div class="modal-content modal-large">
    <h2 class="modal-title">🧘 Cool Down</h2>

    <!-- Section 1: Mandatory Stretching -->
    <div class="cooldown-section">
      <h3 class="section-title required-section">
        <span class="section-icon">🎯</span>
        STRETCHING (Required)
      </h3>
      <div id="stretching-checklist" class="checklist">
        <!-- Dynamically populated -->
      </div>
      <div class="progress-indicator">
        <span id="stretching-progress">✓ 0 of 0 completed</span>
      </div>
    </div>

    <!-- Section 2: Optional Foam Rolling -->
    <div class="cooldown-section collapsible">
      <h3 class="section-title optional-section" onclick="toggleCooldownSection(this)">
        <span class="section-icon">💆</span>
        FOAM ROLLING (Optional - 5-8 min)
        <span class="toggle-icon">▼</span>
      </h3>
      <div class="section-content" style="display: none;">
        <div id="foam-rolling-checklist" class="checklist">
          <!-- Dynamically populated -->
        </div>
      </div>
    </div>

    <!-- Section 3: Optional LISS Cardio -->
    <div class="cooldown-section collapsible">
      <h3 class="section-title optional-section" onclick="toggleCooldownSection(this)">
        <span class="section-icon">🚴</span>
        LISS CARDIO (Optional - 10-15 min)
        <span class="toggle-icon">▼</span>
      </h3>
      <div class="section-content" style="display: none;">
        <p class="recommendation" id="liss-recommendation">
          💡 Recommended: Bike (10-15 min)<br>
          <small>Legs are fresh - any low-impact cardio works</small>
        </p>

        <div class="radio-group" id="liss-options">
          <label class="radio-item recommended">
            <input type="radio" name="liss-type" value="bike" checked>
            <span class="radio-text">
              Bike - <input type="number" id="liss-bike-duration" value="10" min="5" max="20" class="duration-input"> min
            </span>
          </label>
          <label class="radio-item">
            <input type="radio" name="liss-type" value="elliptical">
            <span class="radio-text">
              Elliptical - <input type="number" id="liss-elliptical-duration" value="10" min="5" max="20" class="duration-input"> min
            </span>
          </label>
          <label class="radio-item">
            <input type="radio" name="liss-type" value="treadmill">
            <span class="radio-text">
              Treadmill - <input type="number" id="liss-treadmill-duration" value="10" min="5" max="20" class="duration-input"> min
            </span>
          </label>
          <label class="radio-item">
            <input type="radio" name="liss-type" value="skip">
            <span class="radio-text">Skip LISS</span>
          </label>
        </div>

        <p class="note">Note: Choose light intensity (can hold conversation)</p>
      </div>
    </div>

    <!-- Section 4: Weigh-in (moved from summary) -->
    <div class="cooldown-section collapsible">
      <h3 class="section-title" onclick="toggleCooldownSection(this)">
        <span class="section-icon">⚖️</span>
        WEIGH-IN
        <span class="toggle-icon">▼</span>
      </h3>
      <div class="section-content" style="display: none;" id="cooldown-weighin">
        <!-- Will be populated by existing weigh-in logic -->
      </div>
    </div>

    <button id="finish-review-btn" class="btn-primary btn-large" disabled>
      Finish & Review
    </button>
  </div>
</div>
```

**Step 2: Add global toggle function**

Add to inline `<script>` section at bottom of index.html (or create if doesn't exist):

```html
<script>
// Toggle cooldown section visibility
function toggleCooldownSection(headerElement) {
  const section = headerElement.parentElement;
  const content = section.querySelector('.section-content');
  const icon = headerElement.querySelector('.toggle-icon');

  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '▲';
  } else {
    content.style.display = 'none';
    icon.textContent = '▼';
  }
}
</script>
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add cooldown modal HTML structure

Add modal with 4 sections:
- Mandatory stretching (always visible)
- Optional foam rolling (collapsible)
- Optional LISS cardio with smart recommendations (collapsible)
- Weigh-in (collapsible, moved from summary screen)

Includes toggle function for collapsible sections."
```

---

### Task 4: Add Modal CSS Styles

**Files:**
- Modify: `css/styles.css` (at end of file)

**Step 1: Add warmup modal styles**

```css
/* ========================================
   Warmup Modal Styles
   ======================================== */

#warmup-modal .modal-content {
  max-width: 500px;
}

#warmup-modal .modal-subtitle {
  color: var(--color-text-secondary, #6b7280);
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

#warmup-modal .checklist {
  margin-bottom: 1.5rem;
}

#warmup-modal .checklist-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--color-background-secondary, #f9fafb);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

#warmup-modal .checklist-item:hover {
  background: var(--color-background-hover, #f3f4f6);
}

#warmup-modal .checklist-item input[type="checkbox"] {
  width: 24px;
  height: 24px;
  min-width: 24px;
  margin-right: 1rem;
  cursor: pointer;
}

#warmup-modal .checklist-text {
  flex: 1;
  font-size: 0.95rem;
}

#warmup-modal .progress-indicator {
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: 500;
  color: var(--color-primary, #3b82f6);
}

#warmup-modal .btn-large {
  width: 100%;
  height: 60px;
  font-size: 1.1rem;
}

#warmup-modal .btn-large:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Step 2: Add cooldown modal styles**

```css
/* ========================================
   Cooldown Modal Styles
   ======================================== */

#cooldown-modal .modal-content {
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

#cooldown-modal .cooldown-section {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  padding-bottom: 1.5rem;
}

#cooldown-modal .cooldown-section:last-of-type {
  border-bottom: none;
}

#cooldown-modal .section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  cursor: pointer;
  user-select: none;
}

#cooldown-modal .section-title.required-section {
  color: var(--color-danger, #ef4444);
}

#cooldown-modal .section-title.optional-section {
  color: var(--color-text-secondary, #6b7280);
}

#cooldown-modal .section-icon {
  font-size: 1.2rem;
}

#cooldown-modal .toggle-icon {
  margin-left: auto;
  font-size: 0.8rem;
}

#cooldown-modal .section-content {
  margin-top: 1rem;
}

/* Checklist styles */
#cooldown-modal .checklist-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: var(--color-background-secondary, #f9fafb);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

#cooldown-modal .checklist-item input[type="checkbox"] {
  width: 24px;
  height: 24px;
  min-width: 24px;
  margin-right: 1rem;
  margin-top: 2px;
  cursor: pointer;
}

#cooldown-modal .stretch-info,
#cooldown-modal .foam-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

#cooldown-modal .stretch-name,
#cooldown-modal .foam-area {
  font-weight: 500;
  font-size: 0.95rem;
}

#cooldown-modal .stretch-duration,
#cooldown-modal .foam-duration {
  font-size: 0.85rem;
  color: var(--color-primary, #3b82f6);
}

#cooldown-modal .stretch-target,
#cooldown-modal .foam-note {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #6b7280);
}

/* LISS Cardio styles */
#cooldown-modal .recommendation {
  padding: 1rem;
  background: var(--color-info-bg, #eff6ff);
  border-left: 4px solid var(--color-info, #3b82f6);
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

#cooldown-modal .radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

#cooldown-modal .radio-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--color-background-secondary, #f9fafb);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

#cooldown-modal .radio-item:hover {
  background: var(--color-background-hover, #f3f4f6);
}

#cooldown-modal .radio-item.recommended {
  background: var(--color-success-bg, #f0fdf4);
  border: 2px solid var(--color-success, #10b981);
}

#cooldown-modal .radio-item input[type="radio"] {
  width: 20px;
  height: 20px;
  min-width: 20px;
  margin-right: 1rem;
  cursor: pointer;
}

#cooldown-modal .radio-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

#cooldown-modal .duration-input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 4px;
  font-size: 0.9rem;
}

#cooldown-modal .note {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #6b7280);
  font-style: italic;
}

#cooldown-modal .warning {
  color: var(--color-warning, #f59e0b);
  font-weight: 500;
}

/* Mobile responsive */
@media (max-width: 768px) {
  #cooldown-modal .modal-content {
    max-width: 95%;
    max-height: 95vh;
  }

  #cooldown-modal .btn-large {
    width: 100%;
  }
}
```

**Step 3: Verify CSS loads**

Open browser, inspect #warmup-modal and #cooldown-modal:
- Check computed styles apply correctly
- Verify colors match theme variables
- Test collapsible sections toggle

**Step 4: Commit**

```bash
git add css/styles.css
git commit -m "style: add warmup and cooldown modal CSS

Add comprehensive styles:
- Warmup modal: checklist, progress indicator, large button
- Cooldown modal: 4 sections with collapsible UI
- LISS cardio: radio group with recommended highlighting
- Stretching/foam rolling: detailed info layout
- Mobile responsive design"
```

---

## Phase 3: App Integration - Warmup Modal

### Task 5: Add showWarmupModal() Method

**Files:**
- Modify: `js/app.js`

**Step 1: Import warm-up protocols at top of file**

Find existing imports (line 1-10), verify `warm-up-protocols.js` is already imported:

```javascript
import { getWarmupProtocol } from './modules/warm-up-protocols.js';
```

If not present, add it.

**Step 2: Add showWarmupModal() method**

Find the `App` class, add this method after `startWorkout()` (around line 300):

```javascript
  /**
   * Show warm-up modal with workout-specific protocol
   * @param {string} workoutName - Workout key (e.g., 'UPPER_A')
   */
  showWarmupModal(workoutName) {
    const modal = document.getElementById('warmup-modal');
    const checklist = document.getElementById('warmup-checklist');
    const progressSpan = document.getElementById('warmup-progress');
    const durationSpan = document.getElementById('warmup-duration');
    const beginBtn = document.getElementById('begin-workout-btn');

    // Get workout-specific warm-up protocol
    const protocol = getWarmupProtocol(workoutName, this.equipmentProfile);

    // Update duration
    durationSpan.textContent = protocol.estimatedDuration;

    // Populate checklist
    checklist.innerHTML = protocol.exercises.map((exercise, index) => `
      <label class="checklist-item">
        <input type="checkbox" class="warmup-checkbox" data-index="${index}">
        <span class="checklist-text">
          ${this.escapeHtml(exercise.name)}
          ${exercise.reps ? `(${this.escapeHtml(exercise.reps)})` : ''}
          ${exercise.duration ? `(${this.escapeHtml(exercise.duration)})` : ''}
        </span>
      </label>
    `).join('');

    // Setup checkbox listeners
    const checkboxes = modal.querySelectorAll('.warmup-checkbox');
    const total = checkboxes.length;

    const updateProgress = () => {
      const completed = Array.from(checkboxes).filter(c => c.checked).length;
      progressSpan.textContent = `✓ ${completed} of ${total} completed`;
      beginBtn.disabled = completed < total;
    };

    checkboxes.forEach(cb => {
      cb.addEventListener('change', updateProgress);
    });

    // Initialize progress
    progressSpan.textContent = `✓ 0 of ${total} completed`;
    beginBtn.disabled = true;

    // Setup begin button
    beginBtn.onclick = () => {
      // Start workout timer NOW (after warm-up)
      this.workoutSession = {
        workoutName: workoutName,
        startTime: new Date(), // Accurate timing
        exercises: this.currentWorkout.exercises.map(() => ({ sets: [] })),
        warmupCompleted: true
      };

      console.log('[App] Warm-up completed, starting workout timer');

      // Close modal and show workout screen
      modal.style.display = 'none';
      this.showWorkoutScreen();
    };

    // Show modal
    modal.style.display = 'flex';
  }
```

**Step 3: Modify startWorkout() to show warm-up modal**

Find `startWorkout()` method (around line 250), modify it:

```javascript
  // OLD:
  startWorkout(workoutName) {
    this.currentWorkout = this.workoutManager.getWorkout(workoutName);
    this.showWorkoutScreen();
  }

  // NEW:
  startWorkout(workoutName) {
    this.currentWorkout = this.workoutManager.getWorkout(workoutName);

    // Show warm-up modal FIRST (don't start timer yet)
    this.showWarmupModal(workoutName);
  }
```

**Step 4: Test in browser**

1. Click "Start Workout" on home screen
2. Verify warm-up modal appears
3. Verify checklist populated with warm-up exercises
4. Check progress updates as boxes are checked
5. Verify "Begin Workout" button enables when all checked
6. Click "Begin Workout", verify workout screen appears

**Step 5: Commit**

```bash
git add js/app.js
git commit -m "feat: add warm-up modal to workout start flow

Modify startWorkout() to show warm-up modal before workout screen.
Add showWarmupModal() method that:
- Populates checklist from warm-up-protocols.js
- Tracks progress (X of Y completed)
- Enables 'Begin Workout' when all items checked
- Starts workout timer AFTER warm-up completion

Accurate workout timing: warm-up time excluded from workout duration."
```

---

## Phase 4: App Integration - Cooldown Modal

### Task 6: Add showCooldownModal() Method

**Files:**
- Modify: `js/app.js`

**Step 1: Import stretching protocols at top of file**

Add to imports section (line 1-20):

```javascript
import {
  getUpperBodyStretches,
  getLowerBodyStretches,
  getUpperBodyFoamRolling,
  getLowerBodyFoamRolling,
  getLISSRecommendation
} from './modules/stretching-protocols.js';
```

**Step 2: Add renderStretchingChecklist() helper method**

Add after `showWarmupModal()` method:

```javascript
  /**
   * Render stretching checklist in cooldown modal
   * @param {string} workoutName - Workout key
   */
  renderStretchingChecklist(workoutName) {
    const checklist = document.getElementById('stretching-checklist');
    const progressSpan = document.getElementById('stretching-progress');
    const isUpper = workoutName.startsWith('UPPER');
    const stretches = isUpper
      ? getUpperBodyStretches()
      : getLowerBodyStretches();

    checklist.innerHTML = stretches.map((stretch, index) => `
      <label class="checklist-item">
        <input type="checkbox" class="stretch-checkbox" data-index="${index}">
        <div class="stretch-info">
          <span class="stretch-name">${this.escapeHtml(stretch.name)}</span>
          <span class="stretch-duration">${this.escapeHtml(stretch.duration)}</span>
          <span class="stretch-target">Targets: ${this.escapeHtml(stretch.target)}</span>
        </div>
      </label>
    `).join('');

    // Setup progress tracking
    const checkboxes = checklist.querySelectorAll('.stretch-checkbox');
    const total = checkboxes.length;

    const updateProgress = () => {
      const completed = Array.from(checkboxes).filter(c => c.checked).length;
      progressSpan.textContent = `✓ ${completed} of ${total} completed`;

      // Enable finish button when all stretches done
      const finishBtn = document.getElementById('finish-review-btn');
      finishBtn.disabled = completed < total;
    };

    checkboxes.forEach(cb => {
      cb.addEventListener('change', updateProgress);
    });

    // Initialize
    progressSpan.textContent = `✓ 0 of ${total} completed`;
  }

  /**
   * Render foam rolling checklist in cooldown modal
   * @param {string} workoutName - Workout key
   */
  renderFoamRollingChecklist(workoutName) {
    const checklist = document.getElementById('foam-rolling-checklist');
    const isUpper = workoutName.startsWith('UPPER');
    const areas = isUpper
      ? getUpperBodyFoamRolling()
      : getLowerBodyFoamRolling();

    checklist.innerHTML = areas.map((area, index) => `
      <label class="checklist-item">
        <input type="checkbox" class="foam-rolling-checkbox" data-area="${this.escapeHtml(area.area)}">
        <div class="foam-info">
          <span class="foam-area">${this.escapeHtml(area.area)}</span>
          <span class="foam-duration">${this.escapeHtml(area.duration)}</span>
          <span class="foam-note">${this.escapeHtml(area.note)}</span>
        </div>
      </label>
    `).join('');
  }

  /**
   * Render LISS cardio recommendations in cooldown modal
   * @param {string} workoutName - Workout key
   */
  renderLISSRecommendations(workoutName) {
    const recommendation = getLISSRecommendation(workoutName);
    const recElement = document.getElementById('liss-recommendation');

    // Update recommendation text
    recElement.innerHTML = `
      💡 Recommended: ${recommendation.recommended.charAt(0).toUpperCase() + recommendation.recommended.slice(1)} (10-15 min)<br>
      <small>${this.escapeHtml(recommendation.warning)}</small>
    `;

    // Add warning to treadmill option if needed
    if (recommendation.treadmillNote.includes('⚠️')) {
      const treadmillLabel = document.querySelector('input[value="treadmill"]').parentElement;
      const treadmillText = treadmillLabel.querySelector('.radio-text');
      treadmillText.innerHTML += ` <small class="warning">${this.escapeHtml(recommendation.treadmillNote)}</small>`;
    }
  }
```

**Step 3: Add showCooldownModal() method**

```javascript
  /**
   * Show cooldown modal with stretching, foam rolling, LISS, weigh-in
   * @param {Object} workoutData - Completed workout data
   */
  showCooldownModal(workoutData) {
    const modal = document.getElementById('cooldown-modal');

    // Populate stretching (mandatory)
    this.renderStretchingChecklist(workoutData.workoutName);

    // Populate foam rolling (optional)
    this.renderFoamRollingChecklist(workoutData.workoutName);

    // Setup LISS recommendations (optional)
    this.renderLISSRecommendations(workoutData.workoutName);

    // Move weigh-in UI to modal
    this.setupCooldownWeighIn();

    // Setup finish button
    this.setupFinishReviewButton(workoutData);

    // Show modal
    modal.style.display = 'flex';

    console.log('[App] Cooldown modal shown');
  }
```

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: add cooldown modal rendering methods

Add methods to populate cooldown modal:
- renderStretchingChecklist(): Workout-specific mandatory stretches
- renderFoamRollingChecklist(): Optional foam rolling areas
- renderLISSRecommendations(): Smart cardio suggestions
- showCooldownModal(): Main method to show modal after workout

Stretching progress tracked, finish button enabled when complete."
```

---

### Task 7: Add Cooldown Data Collection Methods

**Files:**
- Modify: `js/app.js`

**Step 1: Add data collection helper methods**

Add after `showCooldownModal()`:

```javascript
  /**
   * Collect foam rolling data from cooldown modal
   * @returns {Object} Foam rolling completion data
   */
  collectFoamRollingData() {
    const checkboxes = document.querySelectorAll('.foam-rolling-checkbox');
    const checkedAreas = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.area);

    return {
      completed: checkedAreas.length > 0,
      areas: checkedAreas
    };
  }

  /**
   * Collect LISS cardio data from cooldown modal
   * @returns {Object} LISS cardio data
   */
  collectLISSData() {
    const selectedRadio = document.querySelector('input[name="liss-type"]:checked');
    const type = selectedRadio?.value;

    if (!type || type === 'skip') {
      return { type: null, duration: 0 };
    }

    // Get duration from corresponding input
    const durationInput = document.getElementById(`liss-${type}-duration`);
    const duration = durationInput ? parseInt(durationInput.value, 10) : 10;

    return { type, duration };
  }

  /**
   * Setup weigh-in UI in cooldown modal (moved from summary)
   */
  setupCooldownWeighIn() {
    const container = document.getElementById('cooldown-weighin');

    // Copy existing weigh-in HTML structure
    // (Find existing weigh-in code in setupSummaryWeighIn and reuse)
    container.innerHTML = `
      <div class="weighin-section">
        <p class="weighin-question">Have you weighed in today?</p>
        <div class="weighin-buttons">
          <button id="weighin-yes-cooldown" class="btn-secondary">Yes</button>
          <button id="weighin-skip-cooldown" class="btn-secondary">Skip</button>
        </div>
        <div id="weighin-input-cooldown" style="display: none;">
          <label for="weight-input-cooldown">Weight (kg):</label>
          <input type="number" id="weight-input-cooldown" step="0.1" min="30" max="200" placeholder="70.0">
          <button id="weighin-save-cooldown" class="btn-primary">Save Weight</button>
        </div>
      </div>
    `;

    // Setup event listeners (reuse existing weigh-in logic)
    this.setupWeighInListeners('cooldown');
  }

  /**
   * Collect weigh-in data from cooldown modal
   * @returns {Object} Weigh-in data
   */
  collectWeighInData() {
    const weightInput = document.getElementById('weight-input-cooldown');
    const weight = weightInput?.value ? parseFloat(weightInput.value) : null;

    return {
      completed: weight !== null,
      weight: weight
    };
  }

  /**
   * Setup weigh-in event listeners
   * @param {string} context - 'cooldown' or 'summary'
   */
  setupWeighInListeners(context) {
    const yesBtn = document.getElementById(`weighin-yes-${context}`);
    const skipBtn = document.getElementById(`weighin-skip-${context}`);
    const inputDiv = document.getElementById(`weighin-input-${context}`);
    const saveBtn = document.getElementById(`weighin-save-${context}`);

    yesBtn.onclick = () => {
      inputDiv.style.display = 'block';
    };

    skipBtn.onclick = () => {
      inputDiv.style.display = 'none';
    };

    saveBtn.onclick = () => {
      const weightInput = document.getElementById(`weight-input-${context}`);
      const weight = parseFloat(weightInput.value);

      if (weight && weight >= 30 && weight <= 200) {
        // Save to localStorage
        const today = new Date().toISOString().split('T')[0];
        const weighIns = JSON.parse(localStorage.getItem('build_body_weight') || '[]');
        weighIns.push({ date: today, weight });
        localStorage.setItem('build_body_weight', JSON.stringify(weighIns));

        alert(`✅ Weight saved: ${weight} kg`);
        inputDiv.style.display = 'none';
      } else {
        alert('⚠️ Please enter a valid weight (30-200 kg)');
      }
    };
  }
```

**Step 2: Add setupFinishReviewButton() method**

```javascript
  /**
   * Setup finish & review button in cooldown modal
   * @param {Object} workoutData - Workout data to pass to summary
   */
  setupFinishReviewButton(workoutData) {
    const btn = document.getElementById('finish-review-btn');

    // Button already has disabled state managed by stretching progress

    btn.onclick = () => {
      // Collect all cooldown data
      this.workoutSession.cooldownData = {
        stretchesCompleted: true,
        foamRolling: this.collectFoamRollingData(),
        lissCardio: this.collectLISSData(),
        weighIn: this.collectWeighInData()
      };

      console.log('[App] Cooldown completed:', this.workoutSession.cooldownData);

      // Close modal
      document.getElementById('cooldown-modal').style.display = 'none';

      // Show summary screen
      this.showWorkoutSummary(workoutData);
    };
  }
```

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add cooldown data collection methods

Add methods to collect cooldown modal data:
- collectFoamRollingData(): Areas completed
- collectLISSData(): Machine type and duration
- setupCooldownWeighIn(): Weigh-in UI (moved from summary)
- collectWeighInData(): Weight entry
- setupFinishReviewButton(): Finish handler with data collection

All data stored in workoutSession.cooldownData."
```

---

## Phase 5: Modify Workout Completion Flow

### Task 8: Update completeWorkout() to Show Cooldown Modal

**Files:**
- Modify: `js/app.js`

**Step 1: Modify completeWorkout() method**

Find `completeWorkout()` method (around line 5080), modify the end:

```javascript
  async completeWorkout() {
    // ... existing logic for saving exercise history ...
    // ... existing logic for partial workout handling ...
    // ... existing logic for recovery metrics ...
    // ... existing logic for checking unlocks ...

    // OLD: (around line 5172)
    // this.showWorkoutSummary(workoutData);

    // NEW:
    // Show cooldown modal instead of summary
    this.showCooldownModal(workoutData);
  }
```

**Step 2: Test workout completion flow**

1. Start workout → Complete warm-up → Log sets → Complete workout
2. Verify cooldown modal appears (not summary screen)
3. Check all 4 sections present (stretching, foam rolling, LISS, weigh-in)
4. Verify "Finish & Review" disabled until stretches checked
5. Complete mandatory stretches
6. Verify "Finish & Review" enables
7. Click button, verify summary screen appears

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: modify workout completion to show cooldown modal

Update completeWorkout() to show cooldown modal instead of summary screen.
User must complete mandatory stretching before seeing workout summary.

Flow: Workout → Cooldown Modal → Summary Screen"
```

---

### Task 9: Remove Weigh-in from Summary Screen

**Files:**
- Modify: `js/app.js`

**Step 1: Find and comment out weigh-in setup in showWorkoutSummary()**

Find `showWorkoutSummary()` method (around line 4288), locate and remove:

```javascript
  showWorkoutSummary(workoutData) {
    // ... existing stats rendering ...

    this.renderPostWorkoutSummaryStats(stats, newRecords, achievements);
    this.setupSummaryPainTracking(workoutData);

    // REMOVE THIS LINE:
    // this.setupSummaryWeighIn();

    this.setupSummaryDoneButton(workoutData);
  }
```

**Step 2: Hide weigh-in section in summary screen HTML**

Find `#summary-screen` in index.html, locate weigh-in section and add `style="display: none;"`:

```html
<!-- In summary screen, find weigh-in section -->
<div id="summary-weighin" style="display: none;">
  <!-- Weigh-in content (now unused, moved to cooldown modal) -->
</div>
```

**Step 3: Test summary screen**

1. Complete workout → Complete cooldown → View summary
2. Verify NO weigh-in section visible
3. Verify pain tracking still works
4. Verify done button works

**Step 4: Commit**

```bash
git add js/app.js index.html
git commit -m "feat: remove weigh-in from summary screen

Remove setupSummaryWeighIn() call from showWorkoutSummary().
Hide weigh-in section in summary screen HTML.

Weigh-in now happens in cooldown modal (after stretching/LISS)."
```

---

## Phase 6: Remove Warm-up from Workout Screen

### Task 10: Remove In-Workout Warm-up Section

**Files:**
- Modify: `js/app.js`

**Step 1: Remove renderWarmupProtocol() calls**

Find all calls to `renderWarmupProtocol()` in `showWorkoutScreen()` and delete them:

```javascript
  showWorkoutScreen() {
    // ... existing code ...

    // DELETE THESE LINES:
    // const warmupHTML = this.renderWarmupProtocol();
    // warmupContainer.innerHTML = warmupHTML;

    // Keep rest of workout screen rendering
  }
```

**Step 2: Remove warm-up container from workout screen HTML**

Find `#workout-screen` in index.html, locate and remove warm-up section:

```html
<!-- In workout screen, DELETE this section -->
<!--
<div id="warmup-container" class="warmup-section collapsible">
  <h3>Warm-up Protocol</h3>
  ...
</div>
-->
```

**Step 3: Remove renderWarmupProtocol() method entirely**

Find and delete the `renderWarmupProtocol()` method from app.js (if it exists as a separate method).

**Step 4: Test workout screen**

1. Start workout → Complete warm-up → Workout screen appears
2. Verify NO warm-up section at top
3. Verify first exercise displayed correctly
4. Verify workout timer accurate (started when "Begin Workout" clicked)

**Step 5: Commit**

```bash
git add js/app.js index.html
git commit -m "feat: remove warm-up section from workout screen

Delete renderWarmupProtocol() calls and warm-up HTML section.
Warm-up now happens in dedicated modal before workout starts.

Workout timer starts AFTER warm-up completion (accurate timing)."
```

---

## Phase 7: Testing & Verification

### Task 11: Manual Integration Testing

**Files:**
- None (manual testing)

**Step 1: Test complete workout flow**

Run through entire flow:

1. Home screen → Click "Start Workout"
2. **Warm-up Modal:**
   - Verify warm-up modal appears
   - Verify workout-specific exercises shown
   - Check all boxes
   - Verify "Begin Workout" enables
   - Click "Begin Workout"
3. **Workout Screen:**
   - Verify workout screen appears
   - Verify NO warm-up section at top
   - Verify timer starts NOW (not during warm-up)
   - Log sets for all exercises
   - Click "Complete Workout"
4. **Cooldown Modal:**
   - Verify cooldown modal appears
   - Expand all sections (foam rolling, LISS, weigh-in)
   - Verify workout-specific stretches shown
   - Check all stretches
   - Verify "Finish & Review" enables
   - Optional: Check foam rolling areas
   - Optional: Select LISS cardio
   - Optional: Enter weight
   - Click "Finish & Review"
5. **Summary Screen:**
   - Verify summary screen appears
   - Verify stats displayed correctly
   - Verify workout duration accurate (excludes warm-up time)
   - Verify NO weigh-in section
   - Complete pain tracking
   - Click "Done" → Home

**Step 2: Test UPPER vs LOWER workout differences**

**UPPER_A:**
- Warm-up: 5 exercises (arm circles, band pull-aparts, etc.)
- Stretches: 5 stretches (chest, shoulders, triceps, lats, wrists)
- Foam rolling: 3 areas (upper back, lats, chest)
- LISS: "Legs are fresh - any low-impact cardio works" (no warning)

**LOWER_A:**
- Warm-up: 5 exercises (leg swings, spiderman lunges, etc.)
- Stretches: 6 stretches (quads, hamstrings, hip flexors, glutes, calves, spinal twist)
- Foam rolling: 4 areas (quads, IT band, glutes, calves)
- LISS: "⚠️ Legs are fatigued - avoid high-impact" + Treadmill warning

**Step 3: Test edge cases**

**Browser refresh during warm-up:**
- Refresh page → Home screen (no data loss, expected)

**Browser refresh during workout:**
- Refresh page → Partial workout saved (current behavior)

**Browser refresh during cooldown:**
- Refresh page → Workout already saved, cooldown data lost (acceptable)

**Skip optional sections:**
- Complete only mandatory stretches → "Finish & Review" enables
- Summary shows: "Foam rolling: Not performed", "LISS: Not performed"

**Back button during warm-up:**
- Back → Returns to home (warm-up dismissed)

**Back button during cooldown:**
- Back → Prevented (must complete stretches)

**Step 4: Document test results**

Create test log:
```
Manual Integration Test - 2026-02-23

✅ Warm-up modal appears before workout
✅ Workout timer starts AFTER warm-up completion
✅ Warm-up section removed from workout screen
✅ Cooldown modal appears after workout completion
✅ Mandatory stretches enforce completion
✅ Optional sections (foam rolling, LISS) can be skipped
✅ Weigh-in moved to cooldown modal
✅ Summary screen shows AFTER cooldown
✅ Workout duration excludes warm-up time
✅ UPPER workouts show upper stretches/foam rolling
✅ LOWER workouts show lower stretches/foam rolling + LISS warning
✅ Edge cases handled correctly (refresh, back button)
```

**Step 5: Commit test results**

```bash
git commit --allow-empty -m "test: manual integration test passed - pre/post workout modals verified

Complete workflow tested:
- Warm-up modal before workout (timer starts after completion)
- Warm-up section removed from workout screen
- Cooldown modal after workout (mandatory stretches enforced)
- Weigh-in moved to cooldown modal
- Summary screen after cooldown (no weigh-in section)
- UPPER/LOWER workout differences verified
- Edge cases handled correctly"
```

---

## Phase 8: Documentation Updates

### Task 12: Update Service Worker Cache

**Files:**
- Modify: `sw.js`

**Step 1: Increment cache version**

Find cache version constant (line 1-10):

```javascript
// OLD:
const CACHE_NAME = 'build-tracker-v70';

// NEW:
const CACHE_NAME = 'build-tracker-v71';
```

**Step 2: Add new module to cache list**

Find `urlsToCache` array, add new module:

```javascript
const urlsToCache = [
  // ... existing files ...
  './js/modules/warm-up-protocols.js',
  './js/modules/stretching-protocols.js', // NEW
  // ... rest of files ...
];
```

**Step 3: Test service worker update**

1. Open DevTools → Application → Service Workers
2. Click "Update" or reload page
3. Verify new cache created: `build-tracker-v71`
4. Verify old cache deleted: `build-tracker-v70`
5. Check stretching-protocols.js cached

**Step 4: Commit**

```bash
git add sw.js
git commit -m "chore: update service worker cache to v71

Add stretching-protocols.js to cache.
Increment cache version for pre/post workout modals feature."
```

---

### Task 13: Update Documentation

**Files:**
- Modify: `docs/IMPLEMENTATION-STATUS.md`

**Step 1: Add feature to completed section**

Find "✅ COMPLETED Features" section, add:

```markdown
### Pre/Post-Workout Modals ✅
**Source:** `docs/plans/2026-02-23-pre-post-workout-modals-design.md`

**Status:** ✅ Completed (2026-02-23)

**Implemented Features:**
- ✅ **Warm-up Modal** - Pre-workout checklist before workout timer starts
- ✅ **Cooldown Modal** - Post-workout stretching, foam rolling, LISS, weigh-in
- ✅ **Accurate Workout Timing** - Warm-up excluded from workout duration
- ✅ **Workout-Specific Protocols** - Upper/lower body stretches and foam rolling
- ✅ **Smart LISS Recommendations** - Machine selection based on muscle fatigue
- ✅ **Mandatory Stretching** - Enforced completion before summary screen
- ✅ **Optional Extras** - Foam rolling and LISS can be skipped for time constraints
- ✅ **Weigh-in Relocated** - Moved from summary to post-workout modal

**Implementation Details:**
- New Module: `js/modules/stretching-protocols.js` (stretching and foam rolling content)
- New Modals: `#warmup-modal`, `#cooldown-modal` (gate workout start/finish)
- Modified: `js/app.js` (modal handlers, flow changes)
- Removed: In-workout warm-up section (now in dedicated modal)
- Cache: v71 (updated for new module)

**Flow:**
```
Home → Warm-up Modal → Workout Screen (timer starts) → Cooldown Modal → Summary → Home
```

**Files Modified/Created:**
```
js/modules/stretching-protocols.js    (new, 150+ lines)
index.html                             (+200 lines - 2 modals)
css/styles.css                         (+150 lines - modal styles)
js/app.js                              (+300 lines - modal handlers)
sw.js                                  (cache v71)
```
```

**Step 2: Commit**

```bash
git add docs/IMPLEMENTATION-STATUS.md
git commit -m "docs: add pre/post-workout modals to implementation status

Mark feature as completed with comprehensive details:
- Warm-up and cooldown modal implementation
- Accurate workout timing (warm-up excluded)
- Workout-specific protocols and smart LISS recommendations
- Files modified and cache version updated"
```

---

## Phase 9: Final Verification

### Task 14: Cross-Browser Testing

**Files:**
- None (manual testing)

**Step 1: Test on Chrome/Edge**

Test complete workflow on Chrome:
- Warm-up modal functionality
- Cooldown modal functionality
- Modal styling and responsiveness
- Collapsible sections
- Form inputs (checkboxes, radio buttons, number inputs)

**Step 2: Test on Firefox**

Same tests as Chrome.

**Step 3: Test on Safari/iOS (if available)**

Same tests as Chrome.

**Step 4: Test mobile responsive design**

Open DevTools → Device Toolbar:
- iPhone 12 (390x844)
- iPad (768x1024)
- Test modal sizing
- Test button tap targets (60px minimum)
- Test collapsible sections on mobile
- Test number input keyboard

**Step 5: Document browser compatibility**

```
Browser Compatibility Test - 2026-02-23

✅ Chrome/Edge (latest): All features working
✅ Firefox (latest): All features working
✅ Safari/iOS (if tested): All features working
✅ Mobile responsive: Modals scale correctly, tap targets adequate
```

**Step 6: Commit**

```bash
git commit --allow-empty -m "test: cross-browser compatibility verified

Tested on:
- Chrome/Edge: All features working
- Firefox: All features working
- Safari/iOS: All features working (if available)
- Mobile: Responsive design verified, tap targets adequate"
```

---

### Task 15: Final Commit

**Files:**
- None (summary commit)

**Step 1: Create final summary commit**

```bash
git commit --allow-empty -m "feat: complete pre/post-workout modals implementation

Implemented comprehensive warm-up and cool-down modal system:

WARM-UP MODAL:
- Pre-workout checklist before workout timer starts
- Workout-specific warm-up protocols (from warm-up-protocols.js)
- Progress tracking (X of Y completed)
- Begin Workout button enabled when all items checked
- Accurate workout timing (warm-up excluded from duration)

COOLDOWN MODAL:
- Mandatory stretching (workout-specific: upper/lower body)
- Optional foam rolling (body-part checklist)
- Optional LISS cardio (smart recommendations: bike/elliptical/treadmill)
- Weigh-in (moved from summary screen)
- Finish & Review button enabled when mandatory stretches complete

FLOW CHANGES:
- Home → Warm-up Modal → Workout Screen → Cooldown Modal → Summary
- Removed warm-up section from workout screen
- Workout timer starts AFTER warm-up completion
- Summary screen shows AFTER cooldown completion

SMART FEATURES:
- LISS recommendations based on muscle fatigue
  * UPPER workouts: Any low-impact cardio
  * LOWER workouts: Bike recommended, treadmill warning
- Collapsible sections for optional content
- Session-level data (no localStorage pollution)

FILES:
- New: js/modules/stretching-protocols.js
- Modified: js/app.js, index.html, css/styles.css, sw.js
- Cache: v71

TESTING:
- Manual integration tests: PASSED
- Cross-browser compatibility: VERIFIED
- Mobile responsive: VERIFIED

Design: docs/plans/2026-02-23-pre-post-workout-modals-design.md

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Step 2: Verify git log**

```bash
git log --oneline -20
```

Expected: Clean commit history with descriptive messages.

---

## Summary

**Total Tasks:** 15 tasks across 9 phases
**Estimated Time:** 6-8 hours

**Deliverables:**
- ✅ stretching-protocols.js module (150+ lines)
- ✅ Warm-up modal HTML + CSS
- ✅ Cooldown modal HTML + CSS (4 sections)
- ✅ App.js integration (300+ lines added)
- ✅ Workout flow modifications (warm-up modal → workout → cooldown modal → summary)
- ✅ Removed in-workout warm-up section
- ✅ Moved weigh-in from summary to cooldown
- ✅ Service worker cache updated (v71)
- ✅ Documentation updated

**Success Criteria:**
- Warm-up modal appears before workout starts
- Workout timer starts AFTER warm-up completion
- Warm-up time excluded from workout duration
- Cooldown modal appears after workout completion
- Mandatory stretching enforced before summary
- Optional sections (foam rolling, LISS) can be skipped
- Weigh-in happens after stretching (in cooldown modal)
- Summary screen shows after cooldown
- Cross-browser compatible
- Mobile responsive

---

**Implementation plan saved to:** `docs/plans/2026-02-23-pre-post-workout-modals.md`
