# Exercise Progression Pathways Design

**Date:** 2026-02-12
**Feature:** Comprehensive exercise progression system with Vedic integration
**Status:** Design Complete - Ready for Implementation

## Problem Statement

Current BUILD program has fixed exercises with no progression paths. Users cannot:
1. Progress to advanced variations after mastering current exercises
2. Access easier regressions when recovering from injury
3. Train without equipment (bodyweight-only mode)
4. Unlock exercises based on proven competency

The system needs intelligent progression pathways that respect biomechanical complexity while preserving BUILD's proven structure.

## Solution Overview

Build a progression system that combines Western barbell training with traditional Vedic exercises (Hindu Danda, Baithak, Mudgal). The system uses biomechanical complexity tiers to gate unlocks, equipment profiles to filter options, and flexible progression paths (Easier/Harder/Alternate) to maintain user agency.

Users progress through exercises based on strength milestones, mobility confirmations, pain-free status, and training time—ensuring safety while enabling continuous development.

## Core Principles

**Biomechanical Safety First:** Unlock criteria scale with exercise complexity. Simple exercises require strength only. Complex exercises require strength + mobility + pain-free status + training time.

**Equipment Accessibility:** Bodyweight progressions (Hindu Danda, Baithak) unlock alongside equipment progressions. Users train with available equipment without compromising development.

**Preserve BUILD Structure:** Upper A/Lower A/Upper B/Lower B rotation never changes. Each workout keeps its exercise count. Progressions replace exercises within slots, not workout structure.

**Cultural Equality:** Western and Vedic progressions are biomechanical equals, not hierarchical. Hindu Danda unlocks based on movement complexity, not as "exotic alternative."

**User Agency:** System suggests progressions but user decides. Auto-suggest with manual override prevents surprising exercise changes mid-workout.

## System Architecture

### Three Core Components

**1. Progression Pathway Manager** (`js/modules/progression-pathways.js`)
- Maps each of 26 current exercises to Easier/Harder/Alternate progressions
- Defines unlock criteria per progression (strength, mobility, time, pain-free)
- Returns available progressions based on user's equipment profile and achievements

**2. Equipment Profile Manager** (`js/modules/equipment-profiles.js`)
- Tracks enabled equipment: Gym machines, Dumbbells, Barbells, Mudgal, Bodyweight
- Filters exercise options to match available equipment
- Handles bodyweight substitution logic (maintains 8-12 rep ranges via regressions)

**3. Complexity Tier System** (`js/modules/complexity-tiers.js`)
- Classifies exercises: Simple, Moderate, Complex
- Determines unlock requirements based on complexity
- Validates progression eligibility (has user met criteria?)

### Data Flow

```
User completes workout
  ↓
Check unlock criteria for each exercise slot:
  - Strength milestone met? (e.g., 15kg × 3×12)
  - Mobility confirmed? (from dynamic mobility checks)
  - Pain-free? (no pain last 5 workouts)
  - Time requirement? (8+ weeks for Moderate, 12+ for Complex)
  ↓
Any new unlocks? → Show notification
  ↓
User interaction:
  - Auto-suggest: "💪 Hindu Danda unlocked! Switch? [Yes] [Keep DB Bench]"
  - OR Manual: Settings → Exercise Progressions → Browse unlocked options
  ↓
Choice persists, exercise swapped in workout slot
```

## Biomechanical Complexity Tiers

Exercises classify by joint involvement, stability demands, and movement planes—not by equipment or tradition.

### Tier Definitions

**Simple Tier:**
- Single joint, bilateral, stable support
- Examples: Leg Extension, Machine Chest Press, Cable Fly
- Unlock criteria: Strength milestone only

**Moderate Tier:**
- Multi-joint bilateral OR single-joint unilateral
- Examples: DB Flat Bench, Goblet Squat, T-Bar Row
- Unlock criteria: Strength + (Mobility OR Pain-free)

**Complex Tier:**
- Multi-joint + unilateral OR multi-planar movements
- Examples: Hindu Danda, Pistol Squat, Handstand Push-ups
- Unlock criteria: Strength + Mobility + Pain-free + Time (12+ weeks)

### Why This Matters

A Pistol Squat isn't "harder" than a Barbell Back Squat just because of load—it's the stability, single-leg coordination, and ankle mobility demands. Hindu Danda isn't "advanced" because it's Vedic—it's Complex because it moves through multiple planes with 14 muscle groups coordinating.

The system recognizes complexity comes from multiple factors, preventing premature unlocks that risk injury.

## Equipment Profiles

### Setup (Goal Quiz)

Users select equipment access during initial setup:
- ☐ Gym machines (guided paths, stable)
- ☐ Dumbbells (free weights, bilateral)
- ☐ Barbells (higher loads, locked bar)
- ☐ Mudgal/Gada (rotational implements)
- ☐ Bodyweight (no equipment needed)

**Multiple selections allowed.** Most users check Gym + DB + Bodyweight.

### Dynamic Filtering

Exercise options filter to enabled profiles:
- "Gym machines" disabled → Machine Chest Press hidden
- "Bodyweight" enabled → Hindu Danda, Baithak appear in progressions
- "Barbell" disabled → Barbell Bench locked even if strength criteria met

### Bodyweight Substitution Logic

When switching from equipment to bodyweight, system auto-scales difficulty:

**Example: DB Flat Bench → Hindu Danda**
- User at 7.5kg DB Bench × 12 reps
- Hindu Danda (full bodyweight) too hard
- System substitutes: **Incline Hindu Danda** (hands elevated on bench) @ 8-12 reps
- As user progresses: Incline → Standard → Vruschik (advanced)

**Regression Chains:**
- DB Bench 0-10kg → Incline Hindu Danda (hands on bench, 8-12 reps)
- DB Bench 10-15kg → Hindu Danda (standard, 8-12 reps)
- DB Bench 15kg+ → Full Hindu Danda (8-12 reps)

This maintains hypertrophy stimulus (8-12 rep range) while respecting load differences.

## Progression Path Structure

Each of 26 current BUILD exercises occupies a workout slot. Each slot has Easier/Harder/Alternate progressions.

### Example: Upper A - Slot 1 (Compound Horizontal Push)

**CURRENT: DB Flat Bench Press** (MODERATE)
- Unlock: 10kg × 3×10 + scapular mobility confirmed

**EASIER (SIMPLE tier):**
- Machine Chest Press (default unlocked, no mobility requirement)
- Floor Press (reduces ROM, safer shoulders)

**HARDER (MODERATE → COMPLEX):**
- Barbell Bench Press (COMPLEX) - Requires: 15kg DB × 3×12 + 8 weeks + shoulder stability
- Hindu Danda (COMPLEX) - Requires: 15kg DB × 3×12 + thoracic mobility + 8 weeks + pain-free (new movement family)
- Vruschik Danda (COMPLEX+) - Requires: Hindu Danda mastery (4+ weeks) + advanced mobility
- Vruschik Danda (COMPLEX) - Requires: Hindu Danda mastery + rotational control

**ALTERNATE (MODERATE tier):**
- Cable Chest Press (same tier, different equipment)

**User sees:**
- If "Bodyweight only" mode → Incline Hindu Danda (easier), Hindu Danda, Vruschik Danda (harder)
- If "Gym + Barbell" mode → Machine Press (easier), Barbell Bench
- If both → Full menu, user picks path

### Progression Path Characteristics

**Variable length:** Not forced into 3-tier structure. Some paths have 2 steps (Leg Curl → Nordic Curls). Others have 6+ steps (Lat Pulldown → Pull-ups → Weighted Pull-ups → Archer Pull-ups).

**Parallel paths:** Upper A needs 2 horizontal pulls. Seated Cable Row and T-Bar Row are SEPARATE slots with own progressions—not sequential steps in one path.

**Preserve structure:** Upper A always has 7 exercises regardless of progression tier. Workouts don't shrink or expand when advancing.

## Vedic Exercise Integration

Hindu Danda, Baithak, and Mudgal training integrate as biomechanical equals, not exotic alternatives.

### Research Foundation

Based on Built with Science principles and traditional pehlwan training:
- **Hindu Danda:** Pike → dive through center → arched spine (cobra) → push back. Engages 14 muscle groups, sagittal plane movement with spinal mobility ([source](https://www.mensjournal.com/health-fitness/the-centuries-old-hindu-pushup-that-undoes-the-damage-of-sitting-all-day))
- **Baithak:** Heels off ground, forward-to-rear arm swing, knees over toes. Emphasizes ankle/foot strength ([source](https://en.wikipedia.org/wiki/Hindu_squat))
- **Mudgal/Gada:** Uneven weight distribution creates rotational force requiring stabilization. 360° swings and pendulum patterns ([source](https://www.bodymind-fit.com/2024/09/04/introduction-to-gada-training/))

### Documented Variations

**Danda Progressions (4 verified, framework for 12 total):**
1. Incline Hindu Danda (hands elevated - easier regression)
2. Hindu Danda (standard dive-through arch)
3. Dive Bomber (retraces path backward)
4. Vruschik Danda (Hindu + Spiderman rotation, multi-planar)
5-12. *Framework exists for additional traditional variations (requires akhara consultation)*

**Baithak Progressions (3 verified, framework for 8 total):**
1. Standard Baithak (heels up, arm swing)
2. Full-sole Baithak (heels down, ankle mobility)
3. Jumping Baithak (explosive, coordination)
4-8. *Framework exists for additional traditional variations*

**Mudgal/Gada Progressions:**
1. 10-to-2 Pendulum Swings (foundational)
2. 360° Swings (advanced rotational control)
3. Gada Flow Sequences (combined patterns)

### Cultural Note

Traditional sources mention 12 Danda types and 8 Baithak types practiced in akharas ([source](https://www.bignetindia.com/lifestyle/how-to-do-dandasana-and-what-are-benefits-of-dandasana/)). Specific names not documented in accessible English sources. System designed to accommodate full traditional variety as knowledge becomes available.

## Goal Quiz & Initial Setup

Three questions determine starting configuration:

### Q1: Training Experience
- **Beginner** → Shows tutorial tooltips, extra guidance
- **Some experience** → Standard experience (current BUILD interface)
- **Advanced** → Minimal hand-holding, shows advanced unlock paths

*Does NOT change workout structure. Only affects UI help level.*

### Q2: Equipment Access (checkboxes)
- ☐ Gym machines
- ☐ Dumbbells
- ☐ Barbells
- ☐ Mudgal/Gada
- ☐ Bodyweight

*Filters exercise options. Multiple selections encouraged.*

### Q3: Training Goals
- **Build muscle** → Suggests volume/TUT progressions (tempo, pause reps)
- **Build strength** → Suggests weight/load progressions (barbell, weighted variations)
- **Both** → Balanced suggestions

*Affects which progressions get auto-suggested. Doesn't restrict options.*

## Training Phases

Two phases define training focus: Building and Maintenance. User switches phases manually in settings.

### Building Phase (Default)

**Goal:** Progressive overload, unlock new exercises, build capacity

**Behavior:**
- System suggests weight increases after hitting top of rep range
- New exercise unlocks when criteria met
- Deload cycles: Every 6-8 weeks
- Exercise selection: Fixed (same exercises each rotation)

**Duration:** Ongoing until user switches to Maintenance

### Maintenance Phase

**Goal:** Sustain current strength, manage recovery, prevent regression

**Behavior:**
- Progression suggestions less aggressive (slower weight increases)
- New exercise unlocks disabled (stick with current exercises)
- Deload cycles: Every 4-6 weeks (more frequent recovery)
- Exercise rotation: Every 4-6 weeks (see below)

**Duration:** User-controlled (can switch back to Building anytime)

### Maintenance Phase Exercise Rotation

Preserves Upper A/Lower A/Upper B/Lower B structure. Rotates accessories for freshness, keeps primaries for strength maintenance.

**Upper A Example:**

**Primary (fixed every workout):**
- DB Flat Bench Press
- Seated Cable Row
- T-Bar Row

**Accessory (rotate every 4-6 weeks):**
- Weeks 1-4: Cable Chest Fly, DB Lateral Raises, Face Pulls
- Weeks 5-8: Incline DB Press, Cable Lateral Raises, Reverse Fly (Upper B)
- Weeks 9-12: DB Chest Fly, Seated Lateral Raises, Reverse Fly (Upper A)

**Why:** Prevents overuse injuries, provides variety, maintains engagement. Full muscle coverage guaranteed every 4-6 week period.

## Warm-Up Protocols

Based on Built with Science research. SHRED tracker already implements these successfully.

### Upper Body Warm-Up (5-7 min)

**Before Upper A & Upper B workouts:**

1. Wrist Circles - 10 each direction
2. Arm Circles - 10 forward, 10 back
3. Band Over-and-Backs - 5 reps
4. Band Pull-Aparts - 10 reps
5. Band External Rotation - 10-15 per side
6. DB Shoulder Extensions - 10-15 per side

**Plus warm-up sets for first exercise:**
- Set 1: 50% working weight × 8 reps (45-60 sec rest)
- Set 2: 70% working weight × 3-4 reps (45-60 sec rest)
- Set 3: 90% working weight × 1 rep (2 min rest)
- Begin working sets

### Lower Body Warm-Up (5-8 min)

**Before Lower A & Lower B workouts:**

1. Light Cycling - 3-5 minutes
2. Forward & Back Leg Swings - 10-15 per side
3. Side-to-Side Leg Swings - 10-15 per side
4. Spiderman Lunge w/ Thoracic Extension - 5 per side
5. Wall Ankle Mobilization - 5 per side w/ 2 sec hold

**Plus warm-up sets for first exercise:**
- Set 1: 50% working weight × 8 reps (45-60 sec rest)
- Set 2: 70% working weight × 3-4 reps (45-60 sec rest)
- Set 3: 90% working weight × 1 rep (2 min rest)
- Begin working sets

### Implementation

**UI:** Collapsible checklist at top of workout screen (like original BUILD design, implemented in SHRED)

**Purpose:** Injury prevention, mobility prep, movement pattern activation

**Source:** Built with Science / Jeremy Ethier research ([source](https://fitnessvolt.com/jeff-nippard-science-based-leg-workout/))

## Optional 5th Day: Injury Prevention + GPP

When user has energy/time for deeper injury prevention and conditioning work.

### Duration: 30-40 minutes

### Structure (3 Blocks)

**Block 1: Core Intensive (12-15 min)**

Plank progressions circuit:
- RKC Plank: 3 × 20-30 sec
- Side Plank: 3 × 30 sec each side
- Dead Bug: 3 × 10 reps

Anti-rotation work:
- Pallof Press: 3 × 12 each side
- Bird Dog: 3 × 10 each side

Advanced core (if unlocked):
- L-Sit holds: 3 × max time
- Ab Wheel rollouts: 3 × 8-10 reps

**Block 2: Mobility + Injury Prevention (10-12 min)**

Rotator cuff circuit:
- Band External Rotations: 2 × 15 each side
- YTWLs: 2 × 10 each position
- Face Pull variations: 2 × 15

Hip mobility:
- 90/90 Hip Stretch: 2 × 30 sec each side
- Cossack Squats: 2 × 8 each side
- Hip Flexor Stretch: 2 × 30 sec each side

Ankle mobility:
- Wall Ankle Mobilization: 2 × 10 each side
- Calf Stretch: 2 × 30 sec each side

**Block 3: User Choice (10-15 min)**

**Option A - Cardio HIIT:**
- Jump rope intervals: 8 rounds × 30 sec on / 30 sec off
- OR Hill sprints: 6 × 30 sec
- OR Rowing intervals: 10 × 1 min moderate pace

**Option B - Mudgal/Gada Flow:**
- 10-to-2 Pendulum Swings: 3 × 12 each side
- 360° Swings: 3 × 8 each side (when unlocked)
- Gada flow sequences: 10 min continuous

**Option C - High-Rep Bodyweight:**
- Hindu Danda: 3 × 15 reps
- Baithak: 3 × 20 reps
- Surya Namaskar: 5-8 rounds

**Cool-down (3-5 min):**
- Foam rolling
- Static stretching
- Breathing work

### Access Points

**Home Screen (always visible):**
```
┌─────────────────────────────────────┐
│ Next Workout: Lower A - Bilateral  │
│ [START WORKOUT]                     │
│                                     │
│ Optional Training:                  │
│ [💪 Injury Prevention + Core Day]   │
└─────────────────────────────────────┘
```

**After 4-Workout Cycle:**
```
┌─────────────────────────────────────┐
│ ✅ Cycle Complete!                  │
│                                     │
│ • [Start New Cycle] (Upper A)      │
│ • [Take Rest Day]                   │
│ • [💪 Optional: Core + GPP Day]     │
└─────────────────────────────────────┘
```

**Hybrid approach:** Always accessible, plus timely reminder at natural break point.

## Unlock Criteria by Complexity Tier

### Simple Tier

**Requirements:**
- Strength milestone only

**Example: Machine Chest Press**
- Unlocked by default (no prerequisites)
- OR unlock when: DB Bench 7.5kg × 3×10

**Rationale:** Machine-guided movements are inherently safe. Build strength foundation before adding stability demands.

### Moderate Tier

**Requirements:**
- Strength milestone
- AND (Mobility confirmed OR Pain-free status)

**Example: DB Flat Bench Press**
- Unlock when: 10kg Machine Press × 3×12
- AND (Scapular retraction mobility confirmed OR No shoulder pain last 5 workouts)

**Rationale:** Free weights require stability. Either prove mobility OR prove pain-free movement pattern.

### Complex Tier

**Requirements:**
- Strength milestone
- AND Mobility confirmed
- AND Pain-free status (5+ workouts)
- AND Time requirement (12+ weeks training)

**Example: Hindu Danda**
- Unlock when: 20kg DB Bench × 3×12
- AND Thoracic mobility confirmed (3+ "yes" responses)
- AND No shoulder/elbow pain last 5 workouts
- AND 12+ weeks of upper body training

**Rationale:** Multi-planar, high-coordination movements require proven capacity across all dimensions. Time requirement ensures neurological adaptation.

## User Experience Flow

### Auto-Suggest (During Workout)

After completing a set of current exercise:

```
✅ Set 3 logged: DB Bench 15kg × 12 reps @ RIR 2

💪 NEW UNLOCK: Hindu Danda
Strength ✅ | Mobility ✅ | Pain-free ✅ | 12 weeks ✅

Switch now or keep DB Bench?
[Switch to Hindu Danda] [Keep DB Bench]
```

**If user selects "Keep":** Won't ask again for 4 workouts (one full rotation).

**If user selects "Switch":** Hindu Danda replaces DB Bench in Upper A Slot 1 immediately.

### Manual Browse (Settings)

Settings → Exercise Progressions:

```
┌─────────────────────────────────────┐
│ UPPER A - Slot 1: Horizontal Push  │
├─────────────────────────────────────┤
│ Current: DB Flat Bench Press [▼]   │
│                                     │
│ ✅ Floor Press (Easier)             │
│ ✅ Hindu Danda (Harder) - NEW!      │
│ 🔒 Barbell Bench (Harder)           │
│    Need: 8 more weeks training     │
│ 🔒 Vruschik Danda (Complex)         │
│    Need: Master Hindu Danda first  │
└─────────────────────────────────────┘
```

User taps any unlocked option to switch. Change persists across workouts.

## All 26 Exercise Progression Mappings

Each current BUILD exercise maps to a progression slot with Easier/Harder/Alternate paths.

### UPPER A - HORIZONTAL (7 slots)

**Slot 1 - Compound Horizontal Push:**
- Easier: Machine Chest Press, Incline Hindu Danda (hands elevated)
- **Current: DB Flat Bench Press** (MODERATE)
- Harder: Barbell Bench (COMPLEX - load progression), Hindu Danda (COMPLEX - new movement), Vruschik Danda (COMPLEX+ - requires Hindu Danda mastery)
- Alternate: Cable Chest Press
- **Note:** Barbell Bench and Hindu Danda unlock together after meeting DB Bench criteria. Vruschik Danda unlocks after 4+ weeks Hindu Danda.

**Slot 2 - Mid-back Horizontal Pull:**
- Easier: Machine Row (wide grip)
- **Current: Seated Cable Row** (MODERATE)
- Harder: Barbell Bent-Over Row (wide grip), Inverted Row
- Alternate: Chest-Supported Row variant

**Slot 3 - Isolation Horizontal Push:**
- Easier: Machine Chest Fly
- **Current: Cable Chest Fly** (SIMPLE)
- Harder: DB Chest Fly (requires stability)
- Alternate: Push-up variations

**Slot 4 - Lat-emphasis Horizontal Pull:**
- Easier: Single-Arm Cable Row
- **Current: T-Bar Row** (MODERATE)
- Harder: Pendlay Row (explosive)
- *(No bodyweight alternate - unique equipment)*

**Slot 5 - Lateral Deltoids:**
- Easier: Cable Lateral Raises, Seated DB Lateral Raises
- **Current: DB Lateral Raises** (SIMPLE)
- Harder: Lean-Away Cable Laterals, Single-arm variations
- Alternate: Upright Rows (compound)

**Slot 6 - Rear Delts/Rotator Cuff:**
- Easier: Band Face Pulls (lighter resistance)
- **Current: Face Pulls** (SIMPLE)
- Harder: Heavy Face Pulls with pause
- Alternate: Reverse Fly

**Slot 7 - Scapular Retraction/Rear Delts:**
- Easier: Cable Reverse Fly, Machine Reverse Fly
- **Current: Reverse Fly** (SIMPLE)
- Harder: Y-Raises (MODERATE - requires shoulder mobility), Prone Y-Raises
- Alternate: Cable Face Pulls variant
- **Note:** Intentional duplication with Upper B Slot 5 for shoulder stability weakness (2×/week frequency). Progress to Y-Raises after graduating from `shoulder_stability` limitation.

### LOWER A - BILATERAL (6 slots)

**Slot 1 - Quad-dominant Bilateral:**
- Easier: Leg Press (more stable)
- **Current: Hack Squat** (MODERATE)
- Harder: Barbell Back Squat
- Alternate: Standard Baithak (bodyweight)

**Slot 2 - Hamstring Isolation:**
- Easier: Lighter weight, slow tempo
- **Current: Leg Curl** (SIMPLE)
- Harder: Nordic Curls (eccentric bodyweight)

**Slot 3 - Quad Isolation:**
- Easier: Lighter weight
- **Current: Leg Extension** (SIMPLE)
- Harder: Single-leg Leg Extension, Sissy Squats

**Slot 4 - Hip Hinge/Posterior Chain:**
- Easier: Back Extension (different angle)
- **Current: 45° Hyperextension** (MODERATE)
- Harder: Weighted Hyperextension, Barbell RDL, Barbell Deadlift
- Alternate: Good Mornings

**Slot 5 - Gastrocnemius (Calf):**
- Easier: Machine calf raise
- **Current: Standing Calf Raise** (SIMPLE)
- Harder: Single-leg Calf Raise, Weighted Single-leg

**Slot 6 - Core Anti-extension:**
- Easier: Plank (knees), Incline Plank
- **Current: Plank** (SIMPLE)
- Harder: Weighted Plank, RKC Plank, Ab Wheel, L-Sit
- Alternate: Dead Bug (dynamic core)

### UPPER B - VERTICAL (6 slots)

**Slot 1 - Vertical Pull:**
- Easier: Assisted Lat Pulldown
- **Current: Lat Pulldown** (MODERATE)
- Harder: Band-Assisted Pull-ups, Pull-ups, Weighted Pull-ups, Archer Pull-ups

**Slot 2 - Vertical Push:**
- Easier: Machine Shoulder Press
- **Current: DB Shoulder Press** (MODERATE)
- Harder: Barbell Overhead Press, Pike Push-ups, Handstand Push-ups (wall), Freestanding Handstand Push-ups, Half-moon Push-up

**Slot 3 - Upper Back/Stability:**
- Easier: Machine Row
- **Current: Chest-Supported Row** (MODERATE)
- Harder: DB Single-Arm Row
- Alternate: Seal Row (chest-supported barbell)

**Slot 4 - Upper Chest/Incline:**
- Easier: Machine Incline Press
- **Current: Incline DB Press** (MODERATE)
- Harder: Barbell Incline Press, Vruschik Danda (advanced)
- Alternate: Incline Push-ups (bodyweight)

**Slot 5 - Rear Delts/Posture:**
- Easier: Cable Reverse Fly
- **Current: Reverse Fly** (SIMPLE)
- Harder: Bent-Over Reverse Fly (freestanding)

**Slot 6 - Core Anti-rotation:**
- Easier: Partial Dead Bug (one limb at a time)
- **Current: Dead Bug** (SIMPLE)
- Harder: Weighted Dead Bug, Bird Dog
- Alternate: Pallof Press

### LOWER B - UNILATERAL (6 slots)

**Slot 1 - Squat/Mobility Foundation:**
- Easier: Bodyweight Squat
- **Current: DB Goblet Squat** (MODERATE)
- Harder: Standard Baithak, Full-sole Baithak, Jumping Baithak, Bulgarian Split Squat, Pistol Squat

**Slot 2 - Hip Hinge:**
- Easier: Light DB RDL, Glute-Ham Developer
- **Current: DB Romanian Deadlift** (MODERATE)
- Harder: Barbell RDL, Single-leg RDL, Deficit RDL

**Slot 3 - Hip Abduction:**
- Easier: Banded Hip Abduction
- **Current: Leg Abduction** (SIMPLE)
- Harder: Cable Hip Abduction, Copenhagen Plank

**Slot 4 - Hip Extension/Glutes:**
- Easier: Glute Bridge
- **Current: Hip Thrust** (MODERATE)
- Harder: Barbell Hip Thrust, Single-leg Hip Thrust, Weighted Single-leg Hip Thrust

**Slot 5 - Soleus (Calf):**
- Easier: Bodyweight seated calf raise
- **Current: Seated Calf Raise** (SIMPLE)
- Harder: Single-leg Seated Calf Raise, Weighted variations

**Slot 6 - Lateral Core:**
- Easier: Side Plank (knees), Wall-assisted
- **Current: Side Plank** (SIMPLE)
- Harder: Weighted Side Plank, Side Plank with Leg Raise, Copenhagen Plank

## Data Structures

### localStorage Keys

```javascript
// Equipment profile (from goal quiz)
build_equipment_profile = {
  gym: true,
  dumbbells: true,
  barbells: false,
  mudgal: false,
  bodyweight: true
}

// Exercise selections (current exercise per slot)
build_exercise_selections = {
  "UPPER_A_SLOT_1": "DB Flat Bench Press",
  "UPPER_A_SLOT_2": "Seated Cable Row",
  // ... all 26 slots
}

// Unlock achievements (what user has earned)
build_unlocks = {
  "Hindu Danda": {
    unlockedDate: "2026-04-15",
    criteria: {
      strength: true,      // 20kg × 3×12 achieved
      mobility: true,      // Thoracic mobility confirmed
      painFree: true,      // 5 workouts no pain
      weeks: 14            // 14 weeks training
    }
  }
}

// Training phase
build_training_phase = "building"  // or "maintenance"

// Maintenance rotation schedule (if in maintenance)
build_maintenance_rotation = {
  lastRotationDate: "2026-03-01",
  currentAccessories: {
    "UPPER_A_SLOT_3": "Cable Chest Fly",
    "UPPER_A_SLOT_5": "DB Lateral Raises",
    // ... accessories only
  }
}
```

## Implementation Checklist

### Files to Create

**1. `js/modules/progression-pathways.js`** (~400 lines)
- PROGRESSION_PATHS object (all 26 exercise mappings)
- UNLOCK_CRITERIA object (requirements per progression)
- Helper: getProgressionsForSlot(workoutKey, slotNumber)
- Helper: checkUnlockEligibility(exerciseName, userData)

**2. `js/modules/equipment-profiles.js`** (~200 lines)
- EQUIPMENT_FILTERS object (exercise → equipment requirements)
- BODYWEIGHT_REGRESSIONS object (scaling logic)
- Helper: filterExercisesByProfile(exercises, profile)
- Helper: getBodyweightSubstitute(exerciseName, userStrength)

**3. `js/modules/complexity-tiers.js`** (~150 lines)
- COMPLEXITY_CLASSIFICATIONS object (exercise → tier)
- UNLOCK_REQUIREMENTS object (tier → criteria)
- Helper: getComplexityTier(exerciseName)
- Helper: getUnlockCriteria(exerciseName)

**4. `js/modules/goal-quiz.js`** (~100 lines)
- Quiz UI component
- Process answers → set equipment profile, training phase, UI preferences
- Save to localStorage

**5. `js/modules/optional-fifth-day.js`** (~250 lines)
- Workout structure (3 blocks)
- Exercise definitions for injury prevention work
- Render workout screen
- Track completion

**6. `js/modules/warm-up-protocols.js`** (~100 lines)
- UPPER_WARMUP array (6 exercises)
- LOWER_WARMUP array (5 exercises)
- Render collapsible checklist
- Track completion

### Files to Modify

**7. `js/app.js`**
- Import progression modules
- Show unlock notifications after set logging
- Handle auto-suggest flow ("Switch? [Yes] [Keep]")
- Add "Optional Day" button to home screen
- Add cycle completion prompt

**8. `js/modules/workouts.js`**
- Add complexity tier metadata to exercises
- Add equipment requirements metadata

**9. `js/utils/storage-manager.js`**
- Add getEquipmentProfile()
- Add saveEquipmentProfile()
- Add getExerciseSelections()
- Add saveExerciseSelection()
- Add getUnlocks()
- Add saveUnlock()
- Add getTrainingPhase()
- Add saveTrainingPhase()

**10. `index.html`**
- Add Settings → Exercise Progressions menu
- Add Settings → Training Phase toggle
- Add warm-up sections to workout screens

## Testing Strategy

### Unit Tests (Manual)

- Test unlock criteria calculation with mock data
- Test equipment filtering (all profile combinations)
- Test bodyweight substitution logic (various strength levels)
- Verify complexity tier classifications accurate

### Integration Tests

- Fresh install: Goal quiz populates equipment profile correctly
- Unlock notification: Appears after meeting criteria
- Exercise swap: Replaces correct slot, persists across sessions
- Maintenance rotation: Accessories rotate every 4-6 weeks, primaries stay fixed
- Optional 5th day: Accessible from home + cycle completion

### User Acceptance

- Complete 12 weeks training (enough to unlock Complex tier)
- Verify unlock notifications appear appropriately
- Test auto-suggest flow (accept/reject unlocks)
- Test manual browse (Settings → Exercise Progressions)
- Verify bodyweight-only mode works (regression scaling correct)
- Test Maintenance phase (rotation works, primaries fixed)
- Complete optional 5th day (all 3 block options work)

## Edge Cases

### First Workout (No Training History)

**Problem:** Cannot calculate unlock eligibility with 0 sessions
**Solution:** All SIMPLE tier exercises unlocked by default. MODERATE/COMPLEX require 2+ sessions data before evaluation.

### Equipment Profile Changes

**Problem:** User toggles "Barbell" off after unlocking Barbell Bench
**Solution:** Warning modal: "Changing equipment will restructure workouts. Exercise selections may change. Continue?" If yes, substitute with next-best option from enabled profiles.

### Progression Conflicts

**Problem:** User at 20kg DB Bench, unlocked Hindu Danda (bodyweight). Which is "harder"?
**Solution:** Both show in "Harder" category. User chooses based on goals (strength → stick with DB, skill → switch to Hindu Danda). No forced hierarchy.

### Maintenance → Building Phase Switch

**Problem:** User in Maintenance with rotated accessories, switches back to Building
**Solution:** Keep current exercise selections (don't reset). Resume normal progression suggestions. Rotation stops (exercises stay fixed).

### Missing Unlock Criteria

**Problem:** User meets strength + time but never did mobility checks
**Solution:** Show partial unlock: "Hindu Danda: 3/4 criteria met. Complete thoracic mobility check to unlock." Link to mobility check modal.

## Future Work

### Dynamic Mobility Checks Integration

Graduation data from dynamic mobility checks unlocks progressions:
- Graduate from `lower_back_sensitive` → unlock Barbell Deadlift
- Graduate from `shoulder_stability` → unlock Handstand Push-ups

**Implementation:** Add mobility graduation checks to unlock criteria validation.

### Exercise Recommendation AI

Analyze user's pain history, regression patterns, equipment usage:
- Frequently regressing on bench? → Suggest rotator cuff work (5th day)
- Never using Mudgal despite owning one? → Suggest Gada flow tutorial

**Implementation:** Separate feature using performance analyzer patterns.

### Community Progressions

Allow users to submit custom progression paths:
- "My gym has a specific machine, here's how it fits the progression"
- Share Vedic variations discovered through akhara training

**Implementation:** Requires backend/cloud sync (beyond localStorage scope).

## Success Metrics

**User Benefits:**
- Continuous progression path (no dead-end exercises)
- Equipment flexibility (train anywhere: gym, home, park)
- Cultural diversity (Western + Vedic equally accessible)
- Injury prevention (warm-ups + optional 5th day + complexity gates)
- Agency maintained (suggestions, not mandates)

**Technical Benefits:**
- Preserves BUILD structure (Upper/Lower split intact)
- Extensible (add new progressions without breaking existing)
- No hardcoded assumptions (equipment, experience level)
- Graceful degradation (missing data = conservative defaults)

## Design Validation

All design decisions validated through comprehensive brainstorming:
- Progression source: Hybrid (conventional + biomechanics + personalized)
- Complexity basis: Joint involvement + stability + planes
- Equipment handling: Profiles with bodyweight regression scaling
- Unlock criteria: Tiered by complexity (Simple/Moderate/Complex)
- User interaction: Auto-suggest + manual override
- Quiz structure: 3 questions (experience, equipment, goals)
- Phase behavior: Building vs Maintenance (rotation, deloads, unlocks)
- Warm-ups: BWS protocols (proven in SHRED)
- Optional day: Injury prevention + GPP (hybrid access)
- Vedic integration: Cultural equality via biomechanical parity

## Dependencies

- Existing workouts.js (26 current exercises)
- Existing storage-manager.js (localStorage abstraction)
- Dynamic mobility checks system (for unlock criteria)
- Existing progression.js (double progression logic)
- Built with Science research (warm-up protocols)

## Timeline Estimate

- progression-pathways.js: 8 hours (26 exercise mappings + unlock logic)
- equipment-profiles.js: 4 hours (filtering + bodyweight substitution)
- complexity-tiers.js: 3 hours (classifications + criteria)
- goal-quiz.js: 3 hours (UI + processing)
- optional-fifth-day.js: 5 hours (workout structure + rendering)
- warm-up-protocols.js: 2 hours (BWS protocols implementation)
- app.js modifications: 6 hours (unlock notifications + auto-suggest flow)
- storage-manager.js additions: 2 hours (new localStorage methods)
- UI updates (index.html): 4 hours (Settings menus + home buttons)
- Testing: 6 hours (all scenarios)
- **Total: ~43 hours**

## Open Questions (To Resolve Before Implementation)

### Critical (Must Resolve)

**Q1: Mobility Check Integration**
- **Question:** Which mobility checks count for unlock criteria? Does graduating from `shoulder_stability` (dynamic mobility checks) unlock Barbell Bench? Or only specific checks like "thoracic_mobility"?
- **Impact:** Affects unlock logic directly
- **Resolution:** Hybrid approach - progression unlocks if EITHER specific mobility check passed (3+ "yes") OR graduated from related limitation category. Example: Barbell Bench unlocks if (`scapular_retraction` check passed) OR (graduated from `shoulder_stability`).
- **Status:** ✅ RESOLVED

**Q2: Exercise History Tracking After Swapping**
- **Question:** When user switches DB Bench → Hindu Danda, how does Performance Analyzer handle this? Separate history tracks? Merged? Does regression detection break?
- **Impact:** Affects core Performance Analyzer feature
- **Status:** ✅ RESOLVED - Option C (Separate tracks + slot metadata)
- **Solution:** Each exercise maintains separate history with slot metadata linking. Performance Analyzer reads current exercise only. Slot metadata enables future cross-exercise analytics ("you've worked this slot for 20 weeks across 3 different exercises"). History never merges - clean separation prevents data corruption. When user swaps back to DB Bench later, original history intact.

**Q3: Time Requirement Calculation**
- **Question:** "12+ weeks training" means: (A) 12 weeks total program time, (B) 12 weeks doing that movement pattern, or (C) 12 weeks since starting BUILD?
- **Impact:** Affects unlock criteria accuracy
- **Status:** ✅ RESOLVED - Option C (Specific Exercise Time)
- **Solution:** Track weeks since first workout of the specific prerequisite exercise. Reuse existing barbell-progression-tracker pattern: `_calculateWeeksProgress(exerciseKey, requiredWeeks)`. Most accurate competency measure.
- **Implementation Note:** Revisit specific week counts (12 weeks may be too long) during implementation phase. Consider workout frequency (Upper A = once every 4 workouts, so 12 weeks ≈ 12 actual sessions if training 4x/week).

### Important (Affects UX)

**Q4: Multiple Unlock Notifications**
- **Question:** If user unlocks 3 exercises in one workout (e.g., hits 12 weeks milestone), show all 3 notifications? Priority system? Queue for next login?
- **Impact:** User experience quality
- **Status:** ✅ RESOLVED - Option B (Priority System)
- **Solution:** Show only highest-priority unlock immediately post-workout. Priority: Complex tier > Moderate tier > Simple tier, Primary > Accessories. Other unlocks surface in Settings → "Available Progressions (badge count)". Prevents notification fatigue while maintaining achievement visibility.

**Q5: Warm-up Equipment Requirements**
- **Question:** Warm-ups include "Band Pull-Aparts", "Band Over-and-Backs". What if user's equipment profile doesn't include bands? Substitute or skip?
- **Impact:** Breaks warm-up if user has no bands
- **Status:** ✅ RESOLVED - Option C (Smart Substitution) + Exercise Replacement
- **Solution:**
  - **Main fix:** Replace Upper A Slot 7 from "Band Pull-Aparts" to "Reverse Fly" (allows duplication with Upper B Slot 5 for injury prevention - 2×/week shoulder stability work during weakness phase)
  - **Warm-up substitutions:** If equipment profile excludes bands, substitute: Band Over-and-Backs → Arm Circles Extended, Band External Rotation → Floor Angels (lying shoulder mobility), Band Pull-Aparts → Scapular Wall Slides
  - **Natural progression:** After graduating from `shoulder_stability` limitation, progress Upper A Slot 7 to Y-Raises while keeping Upper B at Reverse Fly

**Q6: Equipment Profile Toggle Substitution Algorithm**
- **Question:** When user disables equipment mid-program, "next-best option from enabled profiles" is vague. What's the exact priority? Primary → Accessory? Same complexity tier first?
- **Impact:** Core feature interaction
- **Status:** ✅ RESOLVED - Option C (Hybrid Fallback Chain)
- **Solution:** 4-step fallback algorithm:
  1. Check same complexity tier with enabled equipment
  2. If none found, drop one tier easier (safer default)
  3. If still none, try one tier harder (advancement)
  4. Last resort: skip exercise with warning notification
- **Example:** User disables Barbell, currently doing Barbell Bench (COMPLEX) → Check COMPLEX tier (Hindu Danda requires Mudgal) → Drop to MODERATE (DB Flat Bench Press ✓ selected)

### Minor (Nice to Clarify)

**Q7: Repeated Unlock Rejections**
- **Question:** User rejects unlock 5 times (20 workouts). Does system stop suggesting forever? Re-prompt after long break (e.g., 8 weeks)?
- **Impact:** Edge case, low frequency
- **Status:** ✅ RESOLVED - Option B (Re-prompt After Long Break)
- **Solution:** After 5 rejections of same exercise, pause auto-suggestions for 8 weeks. After 8 weeks, suggest once more (user's goals/readiness may have changed). If rejected again, pause another 8 weeks.
- **Manual Override:** Rejection tracking only affects automatic notifications. User can ALWAYS manually switch via Settings → Exercise Progressions regardless of rejection history. No lock-out.

**Q8: Optional 5th Day Tracking**
- **Question:** Does completing 5th day count toward streak? Show in analytics? Affect rotation schedule?
- **Impact:** Analytics only
- **Status:** ✅ RESOLVED - Hybrid Approach
- **Solution:**
  - **Streak:** Count 5th day IF it prevents streak break (maintains momentum), otherwise optional
  - **Analytics:** Track separately in "Optional Workouts" section, NOT in main charts (keeps primary metrics focused)
  - **Rotation:** Does NOT advance rotation (5th day is supplemental, next workout still based on last main workout)
  - **Muscle Fatigue Management:** System suggests optimal day based on last workout + shows warnings for conflicting blocks
    - After Lower B: "Best day: Tomorrow (2 days until Upper A)"
    - If <48 hours until Upper: "⚠️ Consider skipping Block 2 (shoulders) and Block 3 (Mudgal) to prevent fatigue"
    - User can override warnings (knows their recovery best)

**Q9: Maintenance Rotation Initial State**
- **Question:** When user first switches to Maintenance, which accessories are selected for Weeks 1-4? Current ones? Random? Predefined set?
- **Impact:** Has reasonable defaults
- **Status:** ✅ RESOLVED - Keep Current (Simplest)
- **Solution:** Whatever accessories user currently has stay the same when switching to Maintenance. No rotation reset, no special logic. Accessories continue their normal 4-6 week rotation cycle regardless of phase changes.

**Q10: Progression Path Difficulty Ordering**
- **Question:** Barbell Bench and Hindu Danda both listed as "Harder" from DB Bench. Are they equal difficulty? Should one unlock before the other? User might expect ordering within "Harder" category.
- **Impact:** UX polish
- **Status:** ✅ RESOLVED - Movement Similarity Criterion
- **Solution:**
  - **Load Progressions** (same movement, heavier load) unlock immediately: Barbell Bench
  - **Movement Progressions** (new skill families) unlock entry-level version immediately: Hindu Danda
  - **Advanced Movement Variations** unlock after mastering base version: Vruschik Danda requires 4+ weeks Hindu Danda + strength milestone
  - **Rationale:** Barbell Bench = familiar movement (just more weight). Hindu Danda = new skill to learn (rotational pattern). Both unlock together but serve different progression goals.

---

## Next Steps

1. ✅ Review design for gaps (comprehensive check)
2. Resolve open questions (systematic review)
3. Write implementation plan (superpowers:writing-plans)
4. Create isolated workspace (superpowers:using-git-worktrees)
5. Execute implementation (superpowers:executing-plans)
6. Manual testing with real workout data
7. Commit and push

---

**Design Status:** ✅ Complete - All Questions Resolved
**Ready for Implementation:** Yes
**Approved by:** User (2026-02-12)
