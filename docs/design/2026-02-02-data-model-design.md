# BUILD Tracker Design & Roadmap

**Date:** 2026-02-02
**Version:** 2.1 - Full Body Structure
**Status:** Design In Progress - Training Philosophy Updated
**Type:** New Project (Modular Vanilla JS)
**Last Updated:** 2026-02-03

---

## Executive Summary

This document defines the complete design for the Custom BUILD-Style Beginner Training Tracker, a new Progressive Web App built from scratch. This is a **customized** program optimized for beginners with stiff shoulders, weak lower back, and weak legs.

The tracker replaces day-based workout scheduling with auto-regulating A/B/C rotation, replaces RPE with RIR tracking, implements strict double progression rules, and includes fatigue monitoring with automated deload triggers.

**Key Decision:** Build as a new modular project in `/build/` subdirectory rather than retrofitting the existing 10,817-line SHRED tracker.

**Research Validation:** This spec is custom-modified to address user-specific weaknesses while following evidence-based training principles.

---

## 0. Training Philosophy & User Context (v2.1 - NEW)

### User Profile
**Experience Level:** Beginner
**Primary Goals:**
1. Learn proper form for all movement patterns
2. Build strength and stamina progressively
3. Maintain/improve flexibility and joint mobility
4. Avoid excessive fatigue and burnout

**Training Constraints:**
- Beginner requires high-frequency skill practice (3x/week per movement)
- Must balance progressive overload with recovery capacity
- Needs structured mobility work to prevent stiffness
- Limited capacity to handle high per-session volume

### Training Structure Decision: Full Body 3x Per Week

**Why Full Body vs Body Part Split:**

**Form & Skill Development:**
- Practice each movement pattern 3x/week (156 annual sessions) vs 1x/week (52 sessions)
- Motor learning accelerates with higher frequency
- Beginners benefit most from movement repetition
- Each session is a skill practice opportunity

**Recovery & Fatigue Management:**
- Lower volume per muscle per session = less soreness
- 48-hour recovery between sessions = optimal for beginners
- Won't accumulate fatigue like high-volume body part splits
- Sustainable long-term without burnout

**Strength + Stamina + Mobility:**
- Compound lifts provide strength foundation
- Full body training improves work capacity (stamina)
- Mobility drills integrated every session
- Balanced development across all muscle groups

**Volume Distribution:**
- 9-12 total sets per muscle group per week (optimal for beginners)
- Distributed across 3 sessions = 3-4 sets per muscle per session
- Allows quality reps with good form
- Prevents junk volume from excessive fatigue

### Workout A/B/C Structure (Full Body)

**Each workout includes:**
1. Lower body push (squat variation) - 3 sets
2. Lower body pull (deadlift/hinge variation) - 3 sets
3. Upper body push (bench/overhead press) - 3 sets
4. Upper body pull (row/pull-up variation) - 3 sets
5. Core exercise - 2 sets
6. Mobility work (5-10 minutes before/after)

**Example Weekly Pattern:**
- **Monday - Workout A:** Squat, Row, Bench, RDL, Plank + hip mobility
- **Wednesday - Workout B:** Deadlift, Overhead Press, Pull-up, Lunge, Ab wheel + shoulder mobility
- **Friday - Workout C:** Front Squat, Bench, Bent Row, Leg Curl, Bird-dog + ankle/thoracic mobility

**Key Principles:**
- Same structure every workout (predictable for beginners)
- Different exercise variations for each workout (skill variety)
- All major muscle groups hit 3x per week
- Mobility work built into every session
- Progressive overload through double progression (weight + reps)

### Implications for BUILD Tracker

**Design Requirements:**
1. Support 3-workout rotation (A/B/C) with full body structure
2. Track form quality progression alongside weight/reps
3. Include mobility/warm-up checklists per workout
4. Progress conservatively (beginner-appropriate jumps)
5. Flag when volume gets excessive (burnout prevention)
6. Show last workout data for each exercise (skill learning aid)
7. Auto-suggest rest days (recovery emphasis)

**Progression Philosophy:**
- Form quality > load increases
- Build rep proficiency before adding weight
- RIR 2-3 maintained consistently
- No training to failure (skill acquisition priority)
- Deload proactively when fatigue accumulates

---

## 1. Core Data Model & Storage

### Workout Rotation Tracking
```javascript
{
  workoutRotation: {
    lastWorkout: 'A' | 'B' | 'C',
    lastDate: '2026-02-02',
    nextSuggested: 'B',
    completedSequence: ['A', 'B', 'C', 'A'] // rolling history
  }
}
```

### Exercise History (per exercise, per workout type)
```javascript
{
  exerciseHistory: {
    'Workout A - Goblet Squat': [
      {
        date: '2026-02-02',
        sets: [
          { weight: 10, reps: 10, rir: 2 },
          { weight: 10, reps: 11, rir: 2 },
          { weight: 10, reps: 12, rir: 2 }
        ],
        progressionStatus: 'ready', // 'ready' | 'normal' | 'plateau' | 'regression'
        notes: ''
      }
      // ... up to 8 most recent workouts
    ]
  }
}
```

### Deload State
```javascript
{
  deloadState: {
    active: false,
    deloadType: 'standard' | 'light' | 'active_recovery',
    startDate: null,
    endDate: null,
    lastDeloadDate: '2026-01-01',
    weeksSinceDeload: 6,
    dismissedCount: 0,
    autoTriggered: false
  }
}
```

### Workout Session Tracking (NEW)
```javascript
{
  sessionMetrics: [
    {
      date: '2026-02-02',
      workout: 'A',
      sleepHours: 7.5,
      stressLevel: 'low' | 'medium' | 'high',
      energyLevel: 3, // 1-5 scale
      musclesoreness: 'none' | 'mild' | 'moderate' | 'severe',
      fatigueScore: 2, // calculated from above
      completed: true
    }
  ]
}
```

### Exercise Session Data (NEW)
```javascript
{
  exerciseHistory: {
    'Workout A - Goblet Squat': [
      {
        date: '2026-02-02',
        sets: [
          { weight: 10, reps: 10, rir: 2, formQuality: 'good', rom: 'full', pain: false },
          { weight: 10, reps: 11, rir: 2, formQuality: 'good', rom: 'full', pain: false },
          { weight: 10, reps: 12, rir: 2, formQuality: 'ok', rom: 'full', pain: false }
        ],
        progressionStatus: 'ready',
        notes: ''
      }
    ]
  }
}
```

### Key Changes from SHRED Tracker
1. **RIR replaces RPE** - Every set logs Reps In Reserve (0-4) instead of RPE (1-10)
2. **Workout-level rotation** - Instead of day-of-week, we track A/B/C sequence
3. **Per-set structured data** - Current tracker saves input positions; new one saves structured set objects
4. **Double progression** - Weight increases only when ALL sets hit top rep range with RIR ≥ 2
5. **Fatigue monitoring (NEW)** - Tracks sleep, stress, energy, soreness for auto-deload triggers
6. **Enhanced exercise data (NEW)** - Form quality, ROM, and pain flags per set

---

## 2. Progression Logic (Double Progression with RIR)

### Core Progression Rule
Weight increases ONLY when:
1. ALL sets hit the top of the rep range (e.g., 12/12/12 for an 8-12 rep range)
2. ALL sets maintained RIR ≥ 2
3. No exceptions

### Progression Algorithm
```javascript
function shouldIncreaseWeight(exerciseName, repRange) {
  const lastWorkout = getLastWorkout(exerciseName);
  if (!lastWorkout) return false;

  // Check all sets
  const allSetsHitTopRange = lastWorkout.sets.every(set =>
    set.reps >= repRange.max
  );

  const allSetsHadReserve = lastWorkout.sets.every(set =>
    set.rir >= 2
  );

  return allSetsHitTopRange && allSetsHadReserve;
}
```

### Progression Alerts
- 🟢 **Green:** "Hit 12/12/12 with RIR ≥ 2 → Increase weight by 2.5kg"
- 🟡 **Yellow:** "Hit reps but RIR < 2 → Stay at current weight, maintain form"
- 🔴 **Red:** "Weight or reps decreased → Check recovery (sleep, nutrition, stress)"
- 🔵 **Blue:** "Normal progress → Keep current weight, build reps"

### Exercise-Specific Weight Increments

**Large Compound Movements (+2.5kg):**
- Goblet Squat, DB Bench Press, DB RDL
- Split Squat, Bulgarian Split Squat, Hip Thrust
- Seated Cable Row, Chest-Supported Row

**Small Isolation Movements (+1-1.25kg):**
- DB Lateral Raise, Face Pull, Incline DB Press

**Bodyweight Progressions:**
- Push-ups: Add 1-2 reps per workout until 20 reps, then add weight
- Plank: Add 5-10 seconds per workout until 60s, then add weight
- Dead Bug: Add 1 rep/side per workout until 15 reps, then add tempo

### Load Last Workout Behavior
- **If progression criteria met:** Suggest +2.5kg, fill with bottom of rep range (e.g., 8 reps)
- **If not met:** Copy exact weights from last session
- **Always:** Copy RIR values from last session as starting point

---

## 3. Workout Structure & UI Flow

### Navigation Structure
Replace Phase 1/Phase 2 selector with BUILD workout rotation:

```
Header:
┌─────────────────────────────────────┐
│ BUILD Workout Tracker               │
│ Next: Workout B (Suggested)         │
│ Last: Workout A - 2 days ago        │
└─────────────────────────────────────┘

Workout Selector (3 buttons):
[Workout A] [Workout B ✓] [Workout C]
  └─ Highlight suggested workout with checkmark
```

### Workout Templates (v2.1 - FULL BODY STRUCTURE)

**Design Philosophy:** Each workout hits all major muscle groups with different exercise variations. This provides high-frequency skill practice (3x/week per muscle) while keeping per-session volume manageable for beginners.

**Workout A - Full Body (Squat Focus):**
1. **Lower Push:** Goblet Squat (3 × 8-12 @ RIR 2-3)
2. **Upper Pull:** Seated Cable Row (3 × 10-12 @ RIR 2-3)
3. **Upper Push:** Dumbbell Bench Press (3 × 8-12 @ RIR 2-3)
4. **Lower Pull:** Dumbbell Romanian Deadlift (3 × 10-12 @ RIR 2-3)
5. **Accessory:** Dumbbell Lateral Raise (2 × 12-15 @ RIR 2-3)
6. **Core:** Weighted Plank (2 × 30-45s)
7. **Mobility:** Hip Flexor Stretch + 90/90 Hip Rotation (5 min)

**Workout B - Full Body (Deadlift Focus):**
1. **Activation:** Band Pull-Aparts (2 × 20)
2. **Lower Pull:** Trap Bar Deadlift or DB RDL (3 × 8-10 @ RIR 2-3)
3. **Upper Push:** Overhead Press (3 × 8-12 @ RIR 2-3)
4. **Upper Pull:** Lat Pulldown or Assisted Pull-Up (3 × 8-12 @ RIR 2-3)
5. **Lower Push:** Split Squat (3 × 8-10 per leg @ RIR 2-3)
6. **Accessory:** Face Pull (2 × 15 @ RIR 3)
7. **Core:** Ab Wheel Rollout or Front Plank (2 × 8-10 reps or 30-45s)
8. **Mobility:** Shoulder Dislocates + Thoracic Extension (5 min)

**Workout C - Full Body (Unilateral Focus):**
1. **Lower Push:** Bulgarian Split Squat (3 × 10-12 per leg @ RIR 2-3)
2. **Upper Pull:** Chest-Supported Dumbbell Row (3 × 10-12 @ RIR 2-3)
3. **Upper Push:** Push-Ups or Incline DB Press (3 × 8-12 @ RIR 2)
4. **Lower Pull:** Hip Thrust or Glute Bridge (3 × 10-12 @ RIR 2-3)
5. **Accessory:** Single-Arm DB Row or Dumbbell Shrug (2 × 10-12 @ RIR 3)
6. **Core:** Dead Bug (2 × 10-12/side)
7. **Mobility:** Ankle Mobility + Cat-Cow (5 min)

**NOTE:** Exercises marked as "PENDING USER INPUT" - User will provide current workout pattern and available machines/equipment to finalize exercise selection.

### Exercise Card Components
Each exercise displays:
- Title + sets/reps/RIR (e.g., "3 sets × 8-12 reps @ RIR 2-3")
- Technique notes (from spec)
- Optional badge if applicable
- Set input grid: Weight | Reps | RIR dropdown (0-4)
- History button (📈)
- Load Last Workout button

### Session Completion Flow
1. User fills sets throughout workout
2. Auto-save to localStorage on every input
3. "Complete Workout" button at bottom
4. On completion:
   - Save to exercise history
   - Update rotation (A→B, B→C, C→A)
   - Show success modal with recovery reminders
   - Update "Next Suggested" for next session

---

## 4. Warm-Up Protocol & Special Features

### Warm-Up Section (Mandatory - Workout-Specific)
Appears at top of every workout, collapsible by default:

**Workout A Warm-Up:**
```html
<div class="warmup-section">
  <h3>📋 Warm-Up Protocol - Workout A</h3>
  <div class="warmup-checklist">
    ☐ Cat-Cow: 10 reps
    ☐ Band Pull-Aparts: 15 reps
    ☐ Goblet Squat (bodyweight): 10 reps
    ☐ Hip Hinge Drill: 10 reps
    ☐ Ramp-up Set: 50% weight × 10 reps (Goblet Squat)
  </div>
</div>
```

**Workout B Warm-Up:**
```html
<div class="warmup-section">
  <h3>📋 Warm-Up Protocol - Workout B</h3>
  <div class="warmup-checklist">
    ☐ Dead Hang: 20-30 seconds
    ☐ Band Pull-Aparts: 15 reps
    ☐ Bodyweight Split Squat: 5/leg
    ☐ Scapular Pull-Ups: 5 reps
    ☐ Ramp-up Set: 50% weight × 10 reps (Split Squat)
  </div>
</div>
```

**Workout C Warm-Up:**
```html
<div class="warmup-section">
  <h3>📋 Warm-Up Protocol - Workout C</h3>
  <div class="warmup-checklist">
    ☐ Shoulder Dislocates: 10 reps
    ☐ Cat-Cow: 10 reps
    ☐ Glute Bridges (bodyweight): 15 reps
    ☐ Push-ups: 5 reps
    ☐ Ramp-up Set: 50% weight × 10 reps (Bulgarian Split Squat)
  </div>
</div>
```

### RIR Input System
- Dropdown selector per set: 0, 1, 2, 3, 4+ RIR
- Color coding:
  - 0-1 RIR: Red (too close to failure)
  - 2-3 RIR: Green (target zone)
  - 4+ RIR: Yellow (too easy, probably need more weight)
- Helper tooltip: "RIR = Reps In Reserve. How many more reps could you do?"

### Optional Exercise Indicator
**Note:** No optional exercises in v2.0 - all exercises contribute to addressing user weaknesses (stiff shoulders, weak lower back, weak legs)
- All exercises in Workouts A, B, C are required
- Can be skipped if injury/pain occurs (log reason)

### Machine Usage Rule
- Info badge on relevant exercises: "ℹ️ Machine OK when fatigued"
- No enforcement, just informational
- Examples: Lat Pulldown, Leg Press, Chest-Supported Row

---

## 5. Automated Deload with Manual Override

### Auto-Trigger Conditions (v2.0 - UPDATED)
System monitors:
1. **Time-based:** 6-8 weeks since program start OR last deload
2. **Performance-based:** Weight/reps decreased on 2+ exercises in same workout
3. **Fatigue-based (NEW):** Fatigue score ≥8 for 2 consecutive workouts

### Fatigue Score Calculation (NEW)
Per workout, system calculates fatigue score:
- Low energy (<3/5): +2 points
- Poor sleep (<6hrs): +2 points
- High stress level: +1 point
- Moderate+ soreness: +1 point
- Form quality "Poor": +2 points
- Pain/discomfort flagged: +3 points

**If score ≥8:** Yellow warning banner
**If score ≥8 for 2 consecutive workouts:** Auto-suggest deload

### Auto-Trigger Behavior
When conditions met, show modal on next workout:

```
⚠️ Deload Week Recommended

You've completed 6 weeks of training!

Deload rules:
• Reduce sets by 40-50% (3→2 sets, 2→1 set)
• Keep current weights
• Focus on perfect form
• Duration: 7 days

[Start Deload Now] [Remind Me Next Workout] [Dismiss]
```

### Manual Override Options
1. **Start Early:** Settings menu always has "Start Deload Now" button
2. **Exit Early:** During deload, "End Deload Early" button in settings
3. **Postpone:** "Remind Me Later" delays trigger by 3 days
4. **Dismiss:** Resets 6-week timer, won't trigger again until next 6-week mark

### Deload Types (v2.0 - UPDATED)

**Standard Deload (default):**
- Reduce sets 40-50% (3→2 sets, 2→1 set)
- Keep weights same
- Focus on perfect form
- Duration: 7 days
- Shows "DELOAD WEEK - Standard" banner

**Light Deload (for minor fatigue):**
- Reduce weight by 20%
- Keep sets same
- Focus on form and ROM
- Duration: 7 days
- Shows "DELOAD WEEK - Light" banner

**Active Recovery Week (for injuries/pain):**
- Replace all exercises with mobility work
- No resistance training
- Light stretching, walking, foam rolling
- Duration: 7 days
- Shows "ACTIVE RECOVERY WEEK" banner

**Deload Completion:**
- After 7 days, modal: "Deload week complete - return to normal volume?"
- User confirms to exit deload mode

### Safety Constraints
1. **No training to failure:** RIR cannot be set to 0 except with warning
2. **Barbell exercises:** Not included in initial BUILD program
3. **Form reminders:** Each exercise shows 1-2 technique cues from spec

---

## 6. Exercise History & Progression Tracking

### History Data Structure
Per exercise, store last 8 workouts:

```javascript
{
  'Workout A - Goblet Squat': [
    {
      date: '2026-02-02',
      sets: [
        { weight: 10, reps: 10, rir: 2 },
        { weight: 10, reps: 11, rir: 2 },
        { weight: 10, reps: 12, rir: 3 }
      ],
      progressionStatus: 'ready',
      notes: ''
    }
  ]
}
```

### History Modal (📈 button)
```
═══════════════════════════════════════
Goblet Squat - Last 8 Workouts
═══════════════════════════════════════

📅 Feb 2, 2026 (Today)
   Set 1: 10kg × 12 @ RIR 2
   Set 2: 10kg × 12 @ RIR 2
   Set 3: 10kg × 12 @ RIR 3
   🟢 Ready to increase → Try 12.5kg

📅 Jan 30, 2026 (3 days ago)
   Set 1: 10kg × 10 @ RIR 2
   Set 2: 10kg × 11 @ RIR 2
   Set 3: 10kg × 11 @ RIR 3
   🔵 Normal progress

[Show trend chart] [Close]
```

### Trend Analysis
- **Best Weight:** Highest weight used across all history
- **Best Volume:** Best weight × reps × sets
- **Trend Arrow:** ⬆️ Improving | ➡️ Stable | ⬇️ Declining
- **Plateau Detection:** Same weight for 3+ consecutive workouts

### Load Last Workout Logic
```javascript
function loadLastWorkout(exerciseName) {
  const history = getHistory(exerciseName);
  const lastWorkout = history[history.length - 1];

  if (shouldIncreaseWeight(exerciseName)) {
    return {
      weight: lastWorkout.sets[0].weight + 2.5,
      reps: repRange.min,
      rir: 2
    };
  } else {
    const avgReps = average(lastWorkout.sets.map(s => s.reps));
    return {
      weight: lastWorkout.sets[0].weight,
      reps: Math.round(avgReps),
      rir: 2
    };
  }
}
```

---

## 7. Project Structure (Modular Vanilla JS)

```
/home/plawate/Documents and more/Workout/
├── index.html (SHRED tracker - preserved)
├── index-shred-backup.html (backup)
└── build/
    ├── index.html (BUILD tracker entry point)
    ├── css/
    │   └── styles.css (dark theme, responsive design)
    ├── js/
    │   ├── app.js (initialization, event orchestration)
    │   ├── workouts.js (A/B/C exercise definitions)
    │   ├── storage.js (localStorage API)
    │   ├── progression.js (double progression + RIR logic)
    │   ├── ui.js (DOM rendering, modal handling)
    │   └── deload.js (auto-trigger, set reduction)
    ├── manifest.json (PWA config)
    └── sw.js (service worker for offline)
```

### Module Responsibilities

**workouts.js (v2.0 - UPDATED)**
- Exercise definitions for Workouts A, B, C with v2.0 changes
- Rep ranges, RIR targets, technique notes
- Exercise-specific weight increments (+2.5kg vs +1kg)
- Workout-specific warm-up protocols
- Machine usage indicators

**storage.js (v2.0 - UPDATED)**
- Save/load workout history with enhanced metrics
- Session tracking (sleep, stress, energy, soreness)
- Per-set tracking (form quality, ROM, pain flags)
- Rotation state management
- Deload tracking persistence (including deload type)
- Fatigue score calculation and storage
- localStorage abstraction layer

**progression.js (v2.0 - UPDATED)**
- Analyze exercise history
- Determine weight increase eligibility with exercise-specific increments
- Plateau detection (3+ workouts same weight) with 4-step resolution
- Regression detection
- Barbell transition criteria checking
- Generate progression alerts

**ui.js (v2.0 - UPDATED)**
- Render workout templates with v2.0 exercises
- Render workout-specific warm-ups
- Session metrics input (sleep, stress, energy, soreness)
- Per-set metrics (form quality, ROM, pain flags)
- Update progression alerts
- Show modals (history, deload, completion, barbell transition)
- Handle form inputs with enhanced tracking
- Auto-save on input change
- Weekly summary dashboard

**deload.js (v2.0 - UPDATED)**
- Track weeks since last deload
- Calculate fatigue score per workout
- Auto-trigger modal at 6-8 weeks OR fatigue ≥8 for 2 workouts
- Support 3 deload types (standard, light, active recovery)
- Set count reduction logic (3→2, 2→1)
- Weight reduction logic (20% for light deload)
- Manual override handling (start early, exit early, postpone, dismiss)
- 7-day countdown with completion modal

**app.js**
- Initialize all modules
- Setup event listeners
- Coordinate module interactions
- PWA installation prompts

---

## 8. Implementation Plan

### Phase 1: Foundation (Day 1)
- [ ] Create `/build/` directory structure
- [ ] Create `index.html` with base PWA setup (viewport, theme-color, manifest link)
- [ ] Create `styles.css` with dark theme, responsive grid
- [ ] Create `manifest.json` for PWA installability
- [ ] Create basic service worker for offline caching

### Phase 2: Data Layer (Day 1-2) - v2.0 UPDATED
- [ ] Implement `workouts.js` with v2.0 exercise definitions (updated A/B/C)
- [ ] Add workout-specific warm-up definitions
- [ ] Add exercise-specific weight increment rules
- [ ] Implement `storage.js` with localStorage wrapper
- [ ] Add rotation tracking functions
- [ ] Add exercise history save/load with enhanced metrics (form, ROM, pain)
- [ ] Add session tracking (sleep, stress, energy, soreness)
- [ ] Add fatigue score calculation
- [ ] Add deload state persistence (including deload type)

### Phase 3: Core Logic (Day 2-3) - v2.0 UPDATED
- [ ] Implement `progression.js` double progression algorithm
- [ ] Add exercise-specific weight increments (+2.5kg vs +1kg)
- [ ] Add plateau detection (3+ workouts) with 4-step resolution protocol
- [ ] Add regression detection
- [ ] Implement "Load Last Workout" logic
- [ ] Add weight increment suggestions
- [ ] Add barbell transition criteria checking

### Phase 4: User Interface (Day 3-4) - v2.0 UPDATED
- [ ] Implement `ui.js` workout rendering with v2.0 exercises
- [ ] Add workout-specific warm-up checklists (A/B/C different)
- [ ] Add session metrics input form (sleep, stress, energy, soreness)
- [ ] Add per-set metrics (form quality dropdown, ROM, pain checkbox)
- [ ] Add RIR dropdown with color coding
- [ ] Add progression alert banners
- [ ] Implement exercise history modal with enhanced data
- [ ] Add workout completion flow
- [ ] Add weekly summary dashboard

### Phase 5: Deload System (Day 4) - v2.0 UPDATED
- [ ] Implement `deload.js` week tracking
- [ ] Add fatigue score calculation (from session metrics)
- [ ] Add auto-trigger modal at 6 weeks OR fatigue ≥8 for 2 workouts
- [ ] Implement 3 deload types (standard, light, active recovery)
- [ ] Implement set reduction logic (standard deload)
- [ ] Implement weight reduction logic (light deload)
- [ ] Add manual override controls (start early, exit early, postpone, dismiss)
- [ ] Add 7-day countdown and exit prompt
- [ ] Add fatigue warning banner when score ≥8

### Phase 6: Integration & Polish (Day 5) - v2.0 UPDATED
- [ ] Implement `app.js` initialization
- [ ] Wire up all event listeners
- [ ] Add auto-save on input change (including session metrics)
- [ ] Implement rest timer (from SHRED)
- [ ] Add workout rotation suggestion with fatigue consideration
- [ ] Add barbell transition criteria modal
- [ ] Test offline functionality

### Phase 7: Testing (Day 5-6) - v2.0 UPDATED
- [ ] Test workout rotation (A→B→C→A)
- [ ] Test progression algorithm with mock data and exercise-specific increments
- [ ] Test plateau resolution 4-step protocol
- [ ] Test deload auto-trigger (time + performance + fatigue)
- [ ] Test fatigue score calculation
- [ ] Test all 3 deload types
- [ ] Test barbell transition criteria checking
- [ ] Test session metrics tracking
- [ ] Test history modal with enhanced data (form, ROM, pain)
- [ ] Test PWA install on mobile/desktop
- [ ] Cross-browser testing

### Phase 8: Documentation (Day 6)
- [ ] Create README.md for BUILD tracker
- [ ] Document localStorage schema
- [ ] Add inline code comments
- [ ] Create user guide

---

## 9. Key Design Decisions

### Decision 1: New Project vs Retrofit
**Chosen:** New modular project in `/build/` subdirectory
**Rationale:** SHRED tracker is 10,817 lines of monolithic code. BUILD has different philosophy (RIR vs RPE, A/B/C rotation vs day-based, different progression rules). Starting fresh allows clean architecture and maintainability.

### Decision 2: Auto-Suggest Workout Rotation
**Chosen:** Auto-suggest next workout with manual override
**Rationale:** Matches "auto-regulating" philosophy in spec. Guides beginners while allowing flexibility for schedule changes.

### Decision 3: Automated Deload
**Chosen:** Auto-trigger at 6 weeks with manual override
**Rationale:** Prevents overtraining for beginners who might not recognize fatigue. Modal allows informed choice without forcing action.

### Decision 4: Modular Architecture
**Chosen:** Separate JS modules (workouts, storage, progression, ui, deload, app)
**Rationale:** Clean separation of concerns, easier testing, maintainable, still vanilla JS with no build step required.

### Decision 5: Preserve SHRED Tracker
**Chosen:** Keep existing tracker accessible, build BUILD in subdirectory
**Rationale:** Users may want to reference old data. Git history provides safety but direct file access is easier.

---

## 10. Feature Preservation from SHRED

### Keep These Features
- ✅ PWA functionality (install, offline support)
- ✅ Dark theme styling
- ✅ Rest timer between sets
- ✅ Exercise history modal (redesigned for RIR)
- ✅ Auto-save on input
- ✅ localStorage persistence
- ✅ Responsive mobile design
- ✅ Google Sheets sync (adapter layer for new format)

### Remove These Features
- ❌ Phase 1/Phase 2 concept
- ❌ Day-of-week navigation
- ❌ Exercise alternatives dropdown (BUILD has fixed exercises)
- ❌ RPE tracking (replaced with RIR)
- ❌ Color-coded progression based on rep targets alone

### Add These New Features
- ✨ Workout rotation tracking (A/B/C sequence)
- ✨ RIR-based progression validation
- ✨ Warm-up protocol checklist
- ✨ Automated deload system
- ✨ Double progression algorithm
- ✨ Plateau detection (3+ workouts)

---

## 11. Technical Specifications

### Browser Support
- Chrome/Edge 90+ (PWA, Service Worker)
- Safari 14+ (iOS PWA)
- Firefox 88+

### Storage Requirements
- localStorage: ~2-5MB (8 workouts × 18 exercises × 3 sets)
- Service Worker cache: ~500KB (HTML, CSS, JS files)

### Performance Targets
- Initial load: < 2 seconds
- Offline functionality: 100%
- Auto-save delay: < 100ms
- History modal render: < 500ms

### PWA Requirements
- ✅ HTTPS (required for Service Worker)
- ✅ manifest.json with icons
- ✅ Service Worker caching strategy
- ✅ Offline fallback page
- ✅ Install prompt

---

## 12. Success Criteria

### Functional Requirements (v2.0 - UPDATED)
- [ ] All 19 exercises across 3 workouts render correctly (v2.0 changes)
- [ ] Workout-specific warm-ups display correctly
- [ ] Rotation correctly suggests next workout (A→B→C→A)
- [ ] Progression algorithm follows double progression rules
- [ ] Exercise-specific weight increments work (+2.5kg vs +1kg)
- [ ] RIR validation enforces ≥2 for weight increases
- [ ] Session metrics tracking (sleep, stress, energy, soreness)
- [ ] Per-set metrics tracking (form, ROM, pain)
- [ ] Fatigue score calculation works correctly
- [ ] Deload auto-triggers at 6 weeks OR fatigue ≥8 for 2 workouts
- [ ] All 3 deload types work (standard, light, active recovery)
- [ ] 4-step plateau resolution protocol executes
- [ ] Barbell transition criteria checking works
- [ ] History shows last 8 workouts per exercise with enhanced data
- [ ] Weekly summary dashboard displays correctly
- [ ] PWA installs on iOS and Android
- [ ] Offline mode works without internet

### User Experience
- [ ] Interface is intuitive for beginners
- [ ] Progression alerts clearly explain next action
- [ ] RIR tooltips educate on proper tracking
- [ ] Warm-up checklist is easy to follow
- [ ] Load Last Workout saves time between sessions

### Code Quality
- [ ] Modular architecture with clear separation
- [ ] Inline comments explain complex logic
- [ ] No duplicate code across modules
- [ ] localStorage schema documented
- [ ] Functions are testable

---

## 13. Future Enhancements (Post-MVP)

### Phase 2: Advanced Features
- Exercise video integration (if BUILD videos available)
- Export workout history to CSV
- Detailed progress charts (weight over time)
- Note-taking per exercise
- Custom rest timer per exercise

### Phase 3: Social Features
- Share workout completion to social media
- Compare progress with friends
- Export progress screenshots

### Phase 4: Advanced Programming
- Support for Intermediate BUILD program
- Program switching (Beginner → Intermediate)
- Custom exercise substitutions

---

## 14. Version 2.0 Improvements Summary

### Exercise Selection Changes
1. **Workout A:**
   - DB RDL: 2 sets → 3 sets (weak lower back needs volume)
   - Standing Calf Raise → Weighted Plank (core stability priority)

2. **Workout B:**
   - Added Band Pull-Aparts pre-activation (2×20) for shoulder health
   - Total exercises: 6 → 7

3. **Workout C:**
   - Leg Press/Goblet Squat → Bulgarian Split Squat (eliminate redundancy)
   - Hip Thrust: 2 sets → 3 sets (weak legs need glute volume)
   - External Shoulder Rotation → Banded Shoulder Dislocates (better mobility)
   - Dead Hang → Dead Bug (beginner-friendly core, lower back health)

### Volume Optimization
| Muscle Group | v1.0 Sets/Week | v2.0 Sets/Week | Change |
|--------------|----------------|----------------|--------|
| Hamstrings   | 8              | 11             | +3 ✓   |
| Glutes       | 8              | 9              | +1 ✓   |
| Core         | 4              | 8              | +4 ✓   |
| Shoulders    | 10             | 12             | +2 ✓   |

### Progression Enhancements
4. **Exercise-Specific Weight Increments:**
   - Compounds: +2.5kg
   - Isolation: +1-1.25kg
   - Bodyweight: Rep/time progressions defined

5. **4-Step Plateau Resolution:**
   - Week 1: Form check (-10% weight)
   - Week 2: Rep manipulation
   - Week 3: Exercise variation
   - Week 4: Deload

6. **Barbell Transition Criteria:**
   - Strength benchmarks (e.g., Goblet Squat 3×12 @ 30kg+)
   - Mobility checklist (shoulder, lower back, hip hinge)
   - Transition protocol (2-week hybrid, 2-week barbell only)

### Tracking & Monitoring
7. **Session Metrics (NEW):**
   - Sleep hours
   - Stress level
   - Energy rating (1-5)
   - Muscle soreness

8. **Per-Set Metrics (NEW):**
   - Form quality (Good/OK/Poor)
   - Range of motion (Full/Partial)
   - Pain/discomfort flag

9. **Fatigue Score System (NEW):**
   - Auto-calculated from session metrics
   - Triggers deload at score ≥8 for 2 workouts
   - Warning banner at score ≥8

### Deload Improvements
10. **Three Deload Types:**
    - Standard: -40-50% sets, same weight
    - Light: -20% weight, same sets
    - Active Recovery: Mobility only

11. **Enhanced Triggers:**
    - Time: 6-8 weeks
    - Performance: Regression on 2+ exercises
    - Fatigue: Score ≥8 for 2 workouts

### Warm-Up Enhancements
12. **Workout-Specific Protocols:**
    - Workout A: Lower body focused (goblet squat BW, hip hinge)
    - Workout B: Upper pull focused (dead hang, scapular pulls)
    - Workout C: Stability focused (shoulder dislocates, glute bridges)

### Recovery & Context
13. **Weekly Summary Dashboard (NEW):**
    - Total volume calculation
    - Average RIR across all sets
    - Exercises progressed
    - Compliance rate
    - Sleep/fatigue trends

14. **Recovery Structure:**
    - Explicit rest day patterns for 3/4/5-day weeks
    - Active recovery guidance
    - Sleep/nutrition logging

---

## Appendix: BUILD Specification Summary

### Training Principles
- Training focus: Balanced muscle + strength (hypertrophy)
- Effort regulation: Always RIR 2-3
- No training to failure (except bodyweight with stop rules)
- Form quality > load progression
- Moderate weekly volume for recovery

### Weekly Structure
- 3-5 training days per week
- Rotation: A / B / C (repeat)
- 3 days: A/B/C
- 4 days: A/B/A/C
- 5 days: A/B/C/A/B

### Progression Rules
- Double progression: increase weight only when ALL sets hit top rep range with RIR ≥ 2
- Weight increments: +2.5kg (dumbbells), +1-2kg (isolation)
- No forced reps, no grinding

### Deload Protocol
- Trigger: Every 6-8 weeks OR persistent fatigue OR joint discomfort
- Rules: Reduce sets 40-50%, maintain weights, perfect form
- Duration: 1 week

---

## 15. Version 2.1 Changes - Full Body Training Structure

**Date:** 2026-02-03

### Major Philosophy Shift

**From:** Specialized workouts (Lower Body + Horizontal Push, Posterior Chain + Vertical Pull, Technique + Stability)

**To:** Full Body 3x per week structure

### Rationale

**User Context:**
- Beginner trainee requiring form mastery across all movement patterns
- Needs high-frequency skill practice (3x/week per movement vs 1x/week)
- Goals: Strength + stamina + mobility without excessive fatigue
- Must avoid burnout while building capacity

**Training Science:**
- Motor learning accelerates with higher frequency
- Beginners recover faster, can train each muscle 3x/week
- Lower per-session volume = better form quality
- Full body training improves work capacity and conditioning
- 156 annual practice sessions per movement vs 52 with splits

### Updated Workout Structure

**Each workout (A/B/C) now includes:**
- 1 Lower body push (squat variation)
- 1 Lower body pull (hinge/deadlift variation)
- 1 Upper body push (horizontal or vertical)
- 1 Upper body pull (horizontal or vertical)
- 1 Accessory movement (shoulders, arms, or isolation)
- 1 Core exercise
- Mobility work (5-10 min)

**Volume Per Muscle:**
- 9-12 sets per muscle group per week
- Distributed across 3 sessions = 3-4 sets per muscle per session
- Same weekly volume as v2.0, better distributed for recovery

### Design Implications

**New Tracking Requirements:**
1. Form quality becomes equal to weight/reps progression
2. Mobility checklist compliance tracking
3. Session RPE/readiness scoring (auto-infer fatigue)
4. Exercise variation rotation within same movement pattern
5. Rest day suggestions based on recovery metrics

**Updated Progression:**
- Focus on movement pattern proficiency first
- Weight increases secondary to form quality
- RIR 2-3 strictly enforced (no grinding reps)
- Deload if form degrades before volume/intensity triggers

### Next Steps

**PENDING USER INPUT:**
1. Current workout pattern and exercise selection
2. Available equipment and machines at gym
3. Any exercises currently performed and liked/disliked
4. Current strength levels (baseline weights for progression planning)
5. Schedule preference (3-day, 4-day, or 5-day per week)

Once received, finalize:
- Exact exercise selection for Workouts A/B/C
- Starting weights and rep ranges
- Warm-up protocols specific to available equipment
- Progression increments based on available weights

---

**End of Design Document**
