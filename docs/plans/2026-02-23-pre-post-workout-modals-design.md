# Pre/Post-Workout Modals - Design Document

**Date:** 2026-02-23
**Status:** Approved for Implementation
**Author:** Design collaboration with user

---

## 1. Executive Summary

This design introduces dedicated warm-up and cool-down modals to create a clean three-phase workout flow: **Pre-workout → Workout → Post-workout**. This solves the critical issue of warm-up time being incorrectly included in workout duration tracking, and provides a structured approach to stretching, foam rolling, and LISS cardio.

**Key Benefits:**
- ✅ Accurate workout time tracking (timer starts AFTER warm-up)
- ✅ Mandatory stretching enforcement (injury prevention)
- ✅ Smart LISS cardio recommendations based on muscle fatigue
- ✅ Clean separation of training phases
- ✅ Reuses existing warm-up protocols content

---

## 2. Problem Statement

**Current Issues:**

1. **Inaccurate workout time tracking:**
   - Warm-up protocols shown at top of workout screen
   - Workout timer starts immediately when "Start Workout" clicked
   - 5-7 minutes of warm-up counted as "workout time"
   - User reports: "Time lost for warm-up in exercise time tracking"

2. **No structured cool-down:**
   - No guided stretching routine after workout
   - Weigh-in happens in summary screen (user weighs in AFTER stretching/treadmill in reality)
   - No tracking/guidance for foam rolling or LISS cardio

3. **Mixed pre/post workout activities:**
   - User wants uniform flow separating pre-workout phase and post-workout phase
   - Cardio machines (bike, elliptical, treadmill) should fit naturally into pre/post phases

**User Requirements:**
- "I think we should have a warm up modal -> workout -> Stretching modal -> summary"
- "This will save time that is lost for warm in exercise time tracking"
- "Have a uniform flow that separate pre-workout phase and post workout phase"
- "We can including bicycle, elliptical and treadmill and other cardio machines effectively in post or pre workout section"
- "I actually weigh in after stretching/treadmill, post workout"

---

## 3. Architecture Overview

**Selected Approach:** Modal-First with New Module (Approach A)

### Component Structure

**New Modules:**
- `js/modules/stretching-protocols.js` - Stretching content (mirrors `warm-up-protocols.js` structure)

**New Modals:**
- `#warmup-modal` - Pre-workout warm-up checklist
- `#cooldown-modal` - Post-workout stretching + optional extras + weigh-in

**Modified Files:**
- `js/app.js` - Add modal handlers, remove in-workout warm-up section, modify flow
- `index.html` - Add modal HTML structures
- `css/styles.css` - Modal styling (reuse existing modal patterns)

### Why This Approach?

**Pros:**
- Clean separation of phases (visually distinct modals)
- Workout time is accurate (timer starts after warm-up completion)
- Modular, reusable stretching content
- No localStorage pollution (transient session data)
- YAGNI adherent (don't track history unless needed)

**Rejected Alternatives:**
- **Approach B (Integrated Screen States):** Workout screen too complex with 3 states
- **Approach C (Full History Tracking):** Tracking overhead not needed yet (can add later)

---

## 4. User Flow

### Complete Flow Diagram

```
┌─────────────────────────┐
│   HOME SCREEN           │
│   [Start Workout]       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   WARM-UP MODAL         │
│   ✓ Checklist UI        │
│   [Begin Workout] btn   │
└───────────┬─────────────┘
            │ (all items checked)
            ▼
┌─────────────────────────┐
│   WORKOUT SCREEN        │
│   ⏱️ Timer STARTS NOW    │
│   (no warm-up section)  │
│   [Complete Workout]    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   COOLDOWN MODAL        │
│   ✓ Stretches (required)│
│   ☐ Foam rolling (opt.) │
│   ○ LISS cardio (opt.)  │
│   📊 Weigh-in           │
│   [Finish & Review] btn │
└───────────┬─────────────┘
            │ (mandatory stretches done)
            ▼
┌─────────────────────────┐
│   SUMMARY SCREEN        │
│   📈 Stats, PRs         │
│   🩹 Pain tracking      │
│   [Done] → Home         │
└─────────────────────────┘
```

### Phase Breakdown

**Phase 1: Pre-Workout (Warm-up Modal)**
- Display workout-specific warm-up protocol (from `warm-up-protocols.js`)
- Checklist UI with large tap targets (60px)
- Progress indicator: "✓ X of Y completed"
- "Begin Workout" button (enabled when ALL checked)
- Modal cannot be dismissed (forces proper warm-up)

**Phase 2: Workout (Workout Screen)**
- Timer STARTS when "Begin Workout" clicked (accurate tracking)
- Warm-up section REMOVED from top of screen
- User logs sets as normal (no UI changes)
- "Complete Workout" button triggers cooldown

**Phase 3: Post-Workout (Cooldown Modal)**
- Section 1: Mandatory stretching (workout-specific, checkboxes)
- Section 2: Optional foam rolling (body-part checklist)
- Section 3: Optional LISS cardio (smart recommendations)
- Section 4: Weigh-in (moved from summary screen)
- "Finish & Review" button (enabled when mandatory stretches done)

**Phase 4: Review (Summary Screen)**
- Stats, achievements, PRs (existing functionality)
- Pain tracking (existing functionality)
- Done button → Home

---

## 5. Content & Data Structures

### Stretching Protocols Module

**File:** `js/modules/stretching-protocols.js`

**Upper Body Stretches (UPPER_A & UPPER_B):**
```javascript
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
  // Total: ~4-5 minutes
}
```

**Lower Body Stretches (LOWER_A & LOWER_B):**
```javascript
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
  // Total: ~6-8 minutes
}
```

### Foam Rolling Protocols

**Upper Body Foam Rolling:**
```javascript
export function getUpperBodyFoamRolling() {
  return [
    { area: 'Upper Back/Traps', duration: '30-60s', note: 'Roll side to side, pause on tender spots' },
    { area: 'Lats', duration: '30-60s per side', note: 'Arm overhead, roll along side body' },
    { area: 'Chest/Pec Minor', duration: '30-60s', note: 'Use lacrosse ball against wall, slow circles' }
  ];
  // Total: ~3-5 minutes
}
```

**Lower Body Foam Rolling:**
```javascript
export function getLowerBodyFoamRolling() {
  return [
    { area: 'Quads', duration: '30-60s per leg', note: 'Roll from hip to knee, pause on tender spots' },
    { area: 'IT Band', duration: '30-60s per leg', note: 'Side of thigh, slow passes, very tender' },
    { area: 'Glutes', duration: '30-60s per side', note: 'Sit on roller, cross ankle over knee, roll glute' },
    { area: 'Calves', duration: '30-60s per leg', note: 'Roll from ankle to knee, point/flex foot' }
  ];
  // Total: ~5-8 minutes
}
```

### LISS Cardio - Smart Recommendations

**Logic:**

| Workout Type | Recommended | Alternative 1 | Alternative 2 | Rationale |
|--------------|-------------|---------------|---------------|-----------|
| UPPER_A/B | Bike | Elliptical | Treadmill (walking) | Legs are fresh, any low-impact option works |
| LOWER_A/B | Bike (seated recovery) | Elliptical (low-impact) | Treadmill ⚠️ (walking only) | Legs fatigued, minimize impact |

**Duration:** 10-15 minutes (default: 10 min)
**Intensity:** Light (conversational pace, 50-60% max HR)

**Implementation:**
```javascript
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

### State Management

**Workout Session Object (extended):**
```javascript
this.workoutSession = {
  workoutName: 'UPPER_A',
  startTime: null,        // Set when "Begin Workout" clicked (not "Start Workout")
  endTime: null,
  exercises: [...],

  // NEW: Warm-up tracking
  warmupCompleted: false, // Track warm-up completion
  warmupStartTime: null,  // When warm-up modal opened

  // NEW: Cooldown tracking
  cooldownData: {
    stretchesCompleted: false,    // All mandatory stretches done
    foamRolling: {
      completed: false,           // User checked any foam rolling
      areas: []                   // ['quads', 'it_band', 'glutes', 'calves']
    },
    lissCardio: {
      type: null,                 // 'bike' | 'elliptical' | 'treadmill' | null
      duration: 0                 // minutes
    },
    weighIn: {
      completed: false,
      weight: null                // kg
    }
  }
};
```

---

## 6. UI/UX Design

### Warm-up Modal

**HTML Structure:**
```html
<div id="warmup-modal" class="modal">
  <div class="modal-content">
    <h2 class="modal-title">🔥 Warm-up (5-7 min)</h2>
    <p class="modal-subtitle">Complete all before starting:</p>

    <div id="warmup-checklist" class="checklist">
      <!-- Dynamically populated -->
      <label class="checklist-item">
        <input type="checkbox" class="warmup-checkbox">
        <span class="checklist-text">Wrist Circles (10 each direction)</span>
      </label>
      <!-- ... more items ... -->
    </div>

    <div class="progress-indicator">
      <span id="warmup-progress">✓ 0 of 5 completed</span>
    </div>

    <button id="begin-workout-btn" class="btn-primary btn-large" disabled>
      Begin Workout
    </button>
  </div>
</div>
```

**Visual Design:**
```
┌─────────────────────────────────────┐
│  🔥 Warm-up (5-7 min)               │
│                                     │
│  Complete all before starting:      │
│                                     │
│  ☐ Wrist Circles (10 each direction)│
│  ☐ Arm Circles (10 forward, 10 back)│
│  ☐ Band Pull-Aparts (10 reps)      │
│  ☐ Band External Rotation (10/side) │
│  ☐ DB Shoulder Extensions (10/side) │
│                                     │
│  ✓ 3 of 5 completed                 │
│                                     │
│  [ Begin Workout ]  [disabled]      │
└─────────────────────────────────────┘
```

**Behavior:**
- Large checkboxes (60px tap target - matches existing UI standards)
- "Begin Workout" button enables when ALL checked
- Modal cannot be dismissed (no X button, no backdrop click)
- Progress indicator updates on each check
- Equipment-aware warm-ups (uses existing `warm-up-protocols.js` logic)

### Cooldown Modal

**HTML Structure:**
```html
<div id="cooldown-modal" class="modal">
  <div class="modal-content">
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
        <span id="stretching-progress">✓ 0 of 5 completed</span>
      </div>
    </div>

    <!-- Section 2: Optional Foam Rolling -->
    <div class="cooldown-section collapsible">
      <h3 class="section-title optional-section">
        <span class="section-icon">💆</span>
        FOAM ROLLING (Optional - 5-8 min)
        <span class="toggle-icon">▼</span>
      </h3>
      <div id="foam-rolling-content" class="section-content">
        <div id="foam-rolling-checklist" class="checklist">
          <!-- Dynamically populated -->
        </div>
      </div>
    </div>

    <!-- Section 3: Optional LISS Cardio -->
    <div class="cooldown-section collapsible">
      <h3 class="section-title optional-section">
        <span class="section-icon">🚴</span>
        LISS CARDIO (Optional - 10-15 min)
        <span class="toggle-icon">▼</span>
      </h3>
      <div id="liss-cardio-content" class="section-content">
        <p class="recommendation">
          💡 Recommended: Bike (10-15 min)<br>
          <small>Legs are fresh - any low-impact cardio works</small>
        </p>

        <div class="radio-group">
          <label class="radio-item recommended">
            <input type="radio" name="liss-type" value="bike" checked>
            <span class="radio-text">Bike - <input type="number" value="10" min="5" max="20" class="duration-input"> min</span>
          </label>
          <label class="radio-item">
            <input type="radio" name="liss-type" value="elliptical">
            <span class="radio-text">Elliptical - <input type="number" value="10" min="5" max="20" class="duration-input"> min</span>
          </label>
          <label class="radio-item">
            <input type="radio" name="liss-type" value="treadmill">
            <span class="radio-text">Treadmill - <input type="number" value="10" min="5" max="20" class="duration-input"> min</span>
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
    <div class="cooldown-section">
      <h3 class="section-title">
        <span class="section-icon">⚖️</span>
        WEIGH-IN
      </h3>
      <div id="weighin-content" class="section-content">
        <!-- Existing weigh-in UI moved here -->
      </div>
    </div>

    <button id="finish-review-btn" class="btn-primary btn-large" disabled>
      Finish & Review
    </button>
  </div>
</div>
```

**Visual Design:**
```
┌─────────────────────────────────────┐
│  🧘 Cool Down                        │
│                                     │
│  🎯 STRETCHING (Required)           │
│  ☐ Doorway Chest Stretch (30-60s/side) │
│  ☐ Cross-Body Shoulder (30s/side)  │
│  ☐ Overhead Tricep (30s/side)      │
│  ☐ Behind-Back Lat (30-60s)        │
│  ☐ Wrist Flexor/Extensor (30s)     │
│                                     │
│  ✓ 3 of 5 stretches completed       │
│                                     │
│  💆 FOAM ROLLING (Optional) ▼       │
│  ☐ Upper Back/Traps (30-60s)       │
│  ☐ Lats (30-60s/side)              │
│  ☐ Chest (30-60s)                  │
│                                     │
│  🚴 LISS CARDIO (Optional) ▼        │
│  💡 Recommended: Bike (10-15 min)  │
│  Legs are fresh - any low-impact works │
│                                     │
│  ● Bike - [10] min  [Recommended]  │
│  ○ Elliptical - [10] min           │
│  ○ Treadmill - [10] min            │
│  ○ Skip LISS                       │
│                                     │
│  ⚖️ WEIGH-IN ▼                      │
│  Have you weighed in today?        │
│  [Yes] [Skip]                      │
│  Weight: [___] kg                  │
│                                     │
│  [ Finish & Review ]  [disabled]    │
└─────────────────────────────────────┘
```

**Behavior:**
- Sections 2-4 are collapsible/expandable (save screen space)
- Section 1 (stretching) always expanded (cannot collapse)
- "Finish & Review" enables when ALL mandatory stretches checked
- Optional sections can be left unchecked (won't block button)
- Weigh-in functionality same as current (just relocated)
- Modal cannot be dismissed until mandatory stretches done

**LISS Cardio - Lower Workout Warning:**
```
┌─────────────────────────────────────┐
│  🚴 LISS CARDIO (Optional) ▼        │
│  💡 Recommended: Bike (10-15 min)  │
│  ⚠️ Legs are fatigued - avoid high-impact │
│                                     │
│  ● Bike - [10] min  [Recommended]  │
│  ○ Elliptical - [10] min [OK - low impact] │
│  ○ Treadmill - [10] min [⚠️ Walking only] │
│  ○ Skip LISS                       │
└─────────────────────────────────────┘
```

---

## 7. Implementation Details

### Changes to app.js

**1. Remove warm-up section from workout screen:**

```javascript
// DELETE: renderWarmupProtocol() calls
// DELETE: Warm-up collapsible section HTML in workout screen
// Warm-up content now lives entirely in modal
```

**2. Modify startWorkout() flow:**

```javascript
// OLD:
startWorkout(workoutName) {
  this.currentWorkout = this.workoutManager.getWorkout(workoutName);
  this.showWorkoutScreen();
  // Timer starts immediately (WRONG)
}

// NEW:
startWorkout(workoutName) {
  this.currentWorkout = this.workoutManager.getWorkout(workoutName);
  this.showWarmupModal(workoutName);
  // Timer starts when warm-up complete (CORRECT)
}
```

**3. Add showWarmupModal() method:**

```javascript
showWarmupModal(workoutName) {
  const modal = document.getElementById('warmup-modal');
  const checklist = document.getElementById('warmup-checklist');
  const progressSpan = document.getElementById('warmup-progress');
  const beginBtn = document.getElementById('begin-workout-btn');

  // Get workout-specific warm-up protocol
  const protocol = getWarmupProtocol(workoutName, this.equipmentProfile);

  // Populate checklist
  checklist.innerHTML = protocol.exercises.map((exercise, index) => `
    <label class="checklist-item">
      <input type="checkbox" class="warmup-checkbox" data-index="${index}">
      <span class="checklist-text">${exercise.name} (${exercise.reps || exercise.duration})</span>
    </label>
  `).join('');

  // Setup checkbox listeners
  const checkboxes = modal.querySelectorAll('.warmup-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const completed = Array.from(checkboxes).filter(c => c.checked).length;
      const total = checkboxes.length;
      progressSpan.textContent = `✓ ${completed} of ${total} completed`;

      // Enable button when all checked
      beginBtn.disabled = completed < total;
    });
  });

  // Setup begin button
  beginBtn.onclick = () => {
    this.workoutSession = {
      workoutName: workoutName,
      startTime: new Date(), // Timer starts NOW
      exercises: this.currentWorkout.exercises.map(() => ({ sets: [] })),
      warmupCompleted: true
    };

    modal.style.display = 'none';
    this.showWorkoutScreen();
  };

  // Show modal
  modal.style.display = 'flex';
}
```

**4. Modify completeWorkout() flow:**

```javascript
// OLD:
async completeWorkout() {
  // ... save exercise history ...
  this.showWorkoutSummary(workoutData);
}

// NEW:
async completeWorkout() {
  // ... save exercise history (existing logic) ...

  // NEW: Show cooldown modal instead of summary
  this.showCooldownModal(workoutData);
}
```

**5. Add showCooldownModal() method:**

```javascript
showCooldownModal(workoutData) {
  const modal = document.getElementById('cooldown-modal');

  // Populate stretching checklist
  this.renderStretchingChecklist(workoutData.workoutName);

  // Populate foam rolling checklist
  this.renderFoamRollingChecklist(workoutData.workoutName);

  // Setup LISS cardio recommendations
  this.renderLISSRecommendations(workoutData.workoutName);

  // Move weigh-in UI to modal (remove from summary screen)
  this.setupModalWeighIn();

  // Setup "Finish & Review" button
  this.setupFinishReviewButton(workoutData);

  // Show modal
  modal.style.display = 'flex';
}
```

**6. Helper methods:**

```javascript
renderStretchingChecklist(workoutName) {
  const checklist = document.getElementById('stretching-checklist');
  const isUpper = workoutName.startsWith('UPPER');
  const stretches = isUpper
    ? getUpperBodyStretches()
    : getLowerBodyStretches();

  checklist.innerHTML = stretches.map((stretch, index) => `
    <label class="checklist-item">
      <input type="checkbox" class="stretch-checkbox" data-index="${index}">
      <div class="stretch-info">
        <span class="stretch-name">${stretch.name}</span>
        <span class="stretch-duration">${stretch.duration}</span>
        <span class="stretch-target">${stretch.target}</span>
      </div>
    </label>
  `).join('');

  this.setupStretchingProgress();
}

renderFoamRollingChecklist(workoutName) {
  const checklist = document.getElementById('foam-rolling-checklist');
  const isUpper = workoutName.startsWith('UPPER');
  const areas = isUpper
    ? getUpperBodyFoamRolling()
    : getLowerBodyFoamRolling();

  checklist.innerHTML = areas.map((area, index) => `
    <label class="checklist-item">
      <input type="checkbox" class="foam-rolling-checkbox" data-area="${area.area}">
      <div class="foam-info">
        <span class="foam-area">${area.area}</span>
        <span class="foam-duration">${area.duration}</span>
        <span class="foam-note">${area.note}</span>
      </div>
    </label>
  `).join('');
}

renderLISSRecommendations(workoutName) {
  const container = document.getElementById('liss-cardio-content');
  const recommendation = getLISSRecommendation(workoutName);

  // Update recommendation text
  const recText = container.querySelector('.recommendation');
  recText.innerHTML = `
    💡 Recommended: ${recommendation.recommended.charAt(0).toUpperCase() + recommendation.recommended.slice(1)} (10-15 min)<br>
    <small>${recommendation.warning}</small>
  `;

  // Mark recommended option
  const bikeRadio = container.querySelector('input[value="bike"]');
  bikeRadio.checked = true;
  bikeRadio.parentElement.classList.add('recommended');

  // Add warning to treadmill if lower workout
  if (recommendation.treadmillNote.includes('⚠️')) {
    const treadmillLabel = container.querySelector('input[value="treadmill"]').parentElement;
    treadmillLabel.innerHTML += ` <small class="warning">${recommendation.treadmillNote}</small>`;
  }
}

setupFinishReviewButton(workoutData) {
  const btn = document.getElementById('finish-review-btn');
  const stretchCheckboxes = document.querySelectorAll('.stretch-checkbox');

  // Enable button when all mandatory stretches checked
  const updateButtonState = () => {
    const allStretched = Array.from(stretchCheckboxes).every(cb => cb.checked);
    btn.disabled = !allStretched;
  };

  stretchCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateButtonState);
  });

  btn.onclick = () => {
    // Collect cooldown data
    this.workoutSession.cooldownData = {
      stretchesCompleted: true,
      foamRolling: this.collectFoamRollingData(),
      lissCardio: this.collectLISSData(),
      weighIn: this.collectWeighInData()
    };

    // Close modal
    document.getElementById('cooldown-modal').style.display = 'none';

    // Show summary screen
    this.showWorkoutSummary(workoutData);
  };
}
```

**7. Update showWorkoutSummary():**

```javascript
showWorkoutSummary(workoutData) {
  // ... existing stats rendering ...

  // REMOVE: weigh-in section (now in cooldown modal)
  // DELETE: setupSummaryWeighIn() call

  // Keep: pain tracking, achievements, done button
  this.setupSummaryPainTracking(workoutData);
  this.setupSummaryDoneButton(workoutData);
}
```

### Edge Cases & Error Handling

**1. User closes browser during warm-up:**
- **State:** No workout session started yet
- **Recovery:** Next visit shows home screen (normal state)
- **Data loss:** None (warm-up is transient, not saved)

**2. User closes browser during workout:**
- **State:** Partial workout data in `workoutSession`
- **Recovery:** Current behavior - partial workout data saved to localStorage
- **Data loss:** Warm-up completion status (acceptable - it's transient)

**3. User closes browser during cooldown:**
- **State:** Workout data already saved (in `completeWorkout()`)
- **Recovery:** Next visit shows home screen with normal progression
- **Data loss:** Post-workout activities (stretching, foam rolling, LISS, weigh-in)
- **Decision:** Don't persist cooldown state (optional activities, not critical to progression)

**4. User skips all optional items:**
- **State:** Only mandatory stretches checked
- **Button:** "Finish & Review" enabled (requirements met)
- **Data:** Summary shows "LISS: Not performed", "Foam rolling: Not performed"

**5. User tries to dismiss modals:**
- **Warm-up modal:** No X button, no backdrop click (cannot dismiss)
- **Cooldown modal:** No X button, no backdrop click (cannot dismiss)
- **Rationale:** Force proper warm-up and stretching (injury prevention)

**6. Browser back button behavior:**

```javascript
// During warm-up modal:
window.addEventListener('popstate', (e) => {
  if (document.getElementById('warmup-modal').style.display === 'flex') {
    // Allow back to home (no workout started yet)
    document.getElementById('warmup-modal').style.display = 'none';
    this.showHomeScreen();
  }
});

// During cooldown modal:
window.addEventListener('popstate', (e) => {
  if (document.getElementById('cooldown-modal').style.display === 'flex') {
    // Prevent dismiss (workout already saved, must complete stretching)
    e.preventDefault();
    history.pushState({ screen: 'cooldown' }, '', '');
  }
});
```

---

## 8. Success Criteria

**Functional Requirements:**

1. ✅ **Warm-up modal appears when "Start Workout" clicked**
   - Displays workout-specific warm-up protocol
   - All items must be checked before "Begin Workout" enabled
   - Cannot be dismissed (mandatory)

2. ✅ **Workout timer starts AFTER warm-up completion**
   - `workoutSession.startTime` set when "Begin Workout" clicked
   - Warm-up time NOT included in workout duration
   - Workout screen does NOT show warm-up section at top

3. ✅ **Cooldown modal appears when "Complete Workout" clicked**
   - Mandatory stretching section (workout-specific)
   - Optional foam rolling section (collapsible)
   - Optional LISS cardio section (smart recommendations)
   - Weigh-in section (moved from summary)

4. ✅ **Smart LISS recommendations based on workout type**
   - Upper workouts: Recommend bike, no warnings
   - Lower workouts: Recommend bike, warn about treadmill impact

5. ✅ **Summary screen shows AFTER cooldown completion**
   - Stats, achievements, PRs (existing functionality)
   - Pain tracking (existing functionality)
   - NO weigh-in section (moved to cooldown modal)

**Non-Functional Requirements:**

6. ✅ **Large tap targets (60px minimum)**
   - All checkboxes have 60px tap area
   - Buttons match existing UI standards

7. ✅ **Collapsible sections for optional content**
   - Foam rolling section can collapse
   - LISS cardio section can collapse
   - Saves vertical screen space

8. ✅ **Consistent modal styling**
   - Reuse existing modal patterns from app
   - Consistent with pain tracking, weigh-in modals

9. ✅ **No data persistence for warm-up/cooldown**
   - Transient session data only
   - No localStorage pollution
   - Can add history tracking later if needed

---

## 9. Appendix: Design Decisions

### Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-23 | Use Modal-First Architecture (Approach A) | Clean separation, accurate timing, modular content |
| 2026-02-23 | Mandatory stretching, optional foam rolling/LISS | Balance injury prevention with time constraints |
| 2026-02-23 | Smart LISS recommendations based on workout type | Reduce leg impact after lower workouts |
| 2026-02-23 | Move weigh-in to post-workout modal | User weighs in AFTER stretching/treadmill in reality |
| 2026-02-23 | Remove warm-up section from workout screen | Timer starts AFTER warm-up (accurate tracking) |
| 2026-02-23 | No history tracking for warm-up/cooldown | YAGNI - can add later if needed |
| 2026-02-23 | Cannot dismiss modals (no X button) | Force proper warm-up and stretching (injury prevention) |
| 2026-02-23 | Workout-specific stretching protocols | Target muscles worked in that session |
| 2026-02-23 | Checklist UI (not timer-based stretching) | Simpler implementation, trust user to hold 30-60s |
| 2026-02-23 | Single cardio machine selection (not multiple) | LISS = 10-15 min on ONE machine (active recovery) |

### Research References

**Built With Science Warm-up Principles:**
- Dynamic stretches before workout (not static)
- Movement pattern priming (mirrors workout movements)
- Progressive intensity (bodyweight → light weights)

**Built With Science Cool-down Principles:**
- Static stretches AFTER workout (30-60s holds)
- Target primary muscles worked
- LISS cardio for active recovery (10-15 min, conversational pace)
- Foam rolling for myofascial release (30-60s per area)

### Alternative Approaches Considered

**Approach B: Integrated Screen States**
- Rejected: Workout screen becomes too complex (3 states)
- Benefit: Single screen, visual continuity
- Cost: Harder to enforce mandatory warm-up, state management complexity

**Approach C: Full History Tracking**
- Deferred: Can add later if user wants adherence analytics
- Benefit: Dashboard insights ("90% warm-up adherence this month")
- Cost: More localStorage complexity, implementation overhead

---

**End of Design Document**
