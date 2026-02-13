# BUILD Tracker Session Summary - v2.1 Design Decisions

**Date:** 2026-02-03
**Session Focus:** Training structure finalization, smart recovery logic, deload improvements

---

## Key Decisions Made This Session

### 1. User Profile & Current Routine

**Current 4-Day Body Part Split:**
- Day 1: Back + Biceps (10 exercises, ~42 sets)
- Day 2: Chest + Triceps (7-8 exercises, ~21-24 sets)
- Day 3: Legs (5-6 exercises, ~15-18 sets)
- Day 4: Shoulders + Neck (5-6 exercises, ~15 sets)

**Current Weights:**
- Lat pulldown: 20-25kg
- Cable rows: 20-25kg
- T-bar row: 5kg
- DB bench press: 7.5kg
- Leg machines: 15-20kg
- Hack squat: 20kg
- Shoulder DB work: 2.5-5kg
- Bicep/tricep cable: 10-15kg
- 45-degree hyperextension: Bodyweight × 10 reps @ RIR 0

**Problems Identified:**
- Too many exercises per session (10 on back day = "collectively tiring")
- Low frequency (1x/week per muscle)
- No dedicated core work (critical for weak lower back)
- No mobility work (critical for stiff shoulders)
- Progress is slow despite effort

**User Goals:**
- Fewer exercises per session
- All muscle groups covered
- Form mastery + strength + stamina + mobility
- No excessive fatigue
- Flexible schedule (late work, poor sleep = skip days)

---

### 2. Deload Logic Improvements

**OLD (flawed):**
```
Trigger deload after 8 completed cycles
```

**NEW (smart):**
```javascript
function shouldTriggerDeload(workoutHistory) {
  const cycles = countCompletedCycles();
  const weeks = calculateWeeksSinceStart();
  const avgCyclesPerWeek = cycles / weeks;

  // Trigger if:
  // 1. At least 6 weeks of training AND
  // 2. At least 8 completed cycles AND
  // 3. Average frequency >= 1 cycle/week (3 workouts/week)

  return (weeks >= 6 && cycles >= 8 && avgCyclesPerWeek >= 1.0);
}
```

**Examples:**
- 8 cycles in 6 weeks (1.33/week) → DELOAD ✓
- 8 cycles in 12 weeks (0.67/week) → NO DELOAD (too slow, no fatigue accumulation)
- 4 cycles in 3 weeks (1.33/week) → NO DELOAD (not enough time)

**Rationale:** Prevents deload trigger when training infrequently. Time + volume + frequency all matter.

---

### 3. Muscle-Specific Recovery Warnings

**User Insight:** "Rest day warning shouldn't trigger after 2 days, but if I go the very next day within 48/72 hours before recovery is complete for previous muscle"

**Implementation:**

```javascript
const RECOVERY_RULES = {
  'quads': { minRecovery: 48, maxFrequency: 3 },
  'hamstrings': { minRecovery: 48, maxFrequency: 3 },
  'glutes': { minRecovery: 48, maxFrequency: 3 },
  'chest': { minRecovery: 48, maxFrequency: 3 },
  'back': { minRecovery: 48, maxFrequency: 3 },
  'shoulders': { minRecovery: 48, maxFrequency: 3 },
  'biceps': { minRecovery: 24, maxFrequency: 4 },
  'triceps': { minRecovery: 24, maxFrequency: 4 },
  'calves': { minRecovery: 24, maxFrequency: 5 },
  'core': { minRecovery: 24, maxFrequency: 5 }
};

const WORKOUT_MUSCLES = {
  'A': ['quads', 'hamstrings', 'glutes', 'chest', 'back', 'shoulders', 'core'],
  'B': ['quads', 'hamstrings', 'glutes', 'chest', 'back', 'shoulders', 'core'],
  'C': ['quads', 'hamstrings', 'glutes', 'chest', 'back', 'shoulders', 'core'],
  'Rest-Arms': ['biceps', 'triceps', 'calves'],
  'Rest-Core': ['core', 'abs']
};

function getRecoveryWarning(lastWorkout, nextWorkout, hoursSince) {
  const lastMuscles = WORKOUT_MUSCLES[lastWorkout.type];
  const nextMuscles = WORKOUT_MUSCLES[nextWorkout];

  const problematicMuscles = [];

  for (const muscle of nextMuscles) {
    if (lastMuscles.includes(muscle)) {
      const rule = RECOVERY_RULES[muscle];
      if (hoursSince < rule.minRecovery) {
        problematicMuscles.push({
          name: muscle,
          hoursNeeded: rule.minRecovery - hoursSince
        });
      }
    }
  }

  if (problematicMuscles.length > 0) {
    return {
      warn: true,
      muscles: problematicMuscles,
      message: `These muscles need ${Math.round(problematicMuscles[0].hoursNeeded)} more hours: ${problematicMuscles.map(m => m.name).join(', ')}`
    };
  }

  return { warn: false };
}
```

**Key Features:**
- Warns based on muscle overlap, not arbitrary days
- Allows safe alternatives (arms+calves on rest days)
- Considers different recovery rates (calves 24hr vs quads 48hr)

---

### 4. Flexible Scheduling (No Fixed Rest Days)

**User Clarification:** "We don't have to mark Wednesday off. If I took off on Tuesday I shall go on Wednesday. I don't want to skip 2 or more days ideally."

**Updated Logic:**
- ✅ Fully flexible A → B → C rotation
- ⚠️ Warn if < 48hr muscle overlap
- ⚠️ Warn if > 3-4 days gap ("Long break detected")
- ❌ No fixed rest days (Sunday/Wednesday/etc)

**Recovery Tracking:**
```javascript
const daysSince = calculateDaysSince(lastWorkout);

if (daysSince < 2 && hasMusleOverlap(lastWorkout, nextWorkout)) {
  warn: "Muscle recovery needed";
} else if (daysSince > 3) {
  suggest: "Long break - consider reducing weight by 10%";
} else {
  allow: "Ready to train";
}
```

---

### 5. Rest Day Accessory Work

**Approved Activities on Rest Days:**

**Option A: Arms + Calves (20-30 min)**
- Bicep Curls - 3 × 10-12 @ RIR 2
- Tricep Pushdowns - 3 × 10-12 @ RIR 2
- Standing Calf Raises - 3 × 15-20 (explosive tempo)
- Seated Calf Raises - 3 × 15-20 (slow tempo for soleus)

**Option B: Core + Mobility (15-20 min)**
- Plank variations - 3 sets
- Dead bugs - 3 sets
- Shoulder mobility - 5 min
- Hip mobility - 5 min

**Option C: Cardio Only**
- 20-30 min low-intensity (elliptical/bike)
- Stretching/yoga
- Walking

**Key:** These are OPTIONAL and don't interfere with main workout recovery.

---

### 6. Muscle Fiber Type Considerations

**User Request:** "Consider which are slow twitch muscles and which are fast twitch so I can adjust my movement speed accordingly."

**Research-Based Tempo Recommendations:**

**Slow-Twitch Dominant (Type I):**
- Soleus (80-90% Type I) → Seated calf raises, 3-5 sec tempo, time under tension
- Lower back/Erector spinae (60% Type I) → Hyperextensions, controlled 3-4 sec tempo
- Core muscles (55-60% Type I) → Planks, holds, slow dead bugs

**Mixed Fiber (50/50):**
- Quads, hamstrings, glutes → Moderate tempo, 2-3 sec eccentric
- Lats, traps → Controlled rows and pulldowns
- Chest, shoulders → Standard press tempo

**Fast-Twitch Dominant (Type II):**
- Triceps (60% Type II) → Explosive concentric (1 sec up), controlled eccentric (2-3 sec down)
- Gastrocnemius (50-55% Type II) → Standing calf raises, explosive push
- Some back muscles → Can handle explosive rowing

**Implementation in Tracker:**
- Exercise cards show recommended tempo
- Example: "Seated Calf Raise (3-5 sec tempo - slow twitch focus)"

---

### 7. Equipment Available

**User's Gym Equipment:**
- Power cage/squat rack, barbells, weight plates (NOT using yet - beginner)
- Dumbbells, kettlebells (NOT using kettlebells yet)
- Adjustable benches
- Functional trainer/cable crossover
- Lat pulldown machine
- Leg curl machine
- Leg extension machine
- Hack squat machine
- EZ curl bar
- Chest press machine
- Pull-up bar
- Standing/seated calf machines
- 45-degree back extension
- T-bar row machine
- Low row, mid row machines
- Chest fly machine
- Preacher curl bench
- Leg abduction machine
- Dip & pull-up station

**NOT Using:**
- Leg press (available but not used)
- Barbells (not ready yet)
- Kettlebells (not ready yet)
- Smith machine (not using)

---

### 8. Open Question: Training Structure

**Three Options Under Consideration:**

**Option 1: Full Body A/B/C**
- Each workout trains ALL muscles (quads, chest, back, shoulders, etc.)
- Different exercises, same muscle groups
- 3x/week frequency per muscle
- Cannot train consecutive days (100% muscle overlap)
- 6-7 exercises per session

**Option 2: Push/Pull/Legs**
- Workout A: Push (chest, shoulders, triceps)
- Workout B: Pull (back, biceps)
- Workout C: Legs (quads, hams, glutes, calves)
- 2x/week frequency per muscle
- CAN train consecutive days (different muscles)
- 7-8 exercises per session
- Matches user's current mental model

**Option 3: TBD - User Requested**
- User wants: "Optimum effort, not overdoing it, but not wasting gym days"
- Looking for a third alternative
- **PENDING DISCUSSION**

---

## Current Status

**Completed:**
✅ Analyzed current routine
✅ Identified problems (excessive volume, low frequency)
✅ Documented equipment and weights
✅ Improved deload logic (time + cycles + frequency)
✅ Designed muscle-specific recovery warnings
✅ Removed fixed rest days (fully flexible)
✅ Added rest day accessory work options
✅ Researched fiber type tempo recommendations

**Pending:**
❌ Choose training structure (Full Body vs Push/Pull/Legs vs Option 3)
❌ Finalize exact exercises for A/B/C
❌ Set starting weights based on current capacity
❌ Create warm-up protocols
❌ Define progression increments
❌ Build tracker logic specifications

**Next Step:**
Explore "Option 3" training structure that maximizes gym value without overdoing it.

---

**End of Session Summary**
