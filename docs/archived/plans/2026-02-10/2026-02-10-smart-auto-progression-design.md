# Smart Auto-Progression System - Design Document

**Date:** 2026-02-10
**Status:** Designed - Ready for Implementation
**Goal:** Create THE BEST auto-progression app with zero extra user input

---

## Vision

**Problem:** Beginners struggle with progression because:
1. Weight gaps in gym equipment (2.5kg → 5kg = 100% increase)
2. Don't know WHEN to increase weight vs HOW to increase difficulty
3. Manual alternative selection is tedious
4. Different exercises need different tempo strategies

**Solution:** Smart system that:
- Adapts to actual gym equipment (not theoretical increments)
- Automatically suggests progression TYPE (weight/tempo/alternative)
- Provides exercise-specific guidance
- Requires ZERO extra user input beyond current tracking (weight/reps/RIR)

---

## Core Principles

1. **Adaptive, Not Rigid**
   - Works with what user actually logs, not theoretical progression
   - Learns from user's capability (stronger/weaker than expected)
   - Adjusts to gym equipment (20kg → 25kg jumps are fine)

2. **Zero Extra Input**
   - No tempo dropdown menus
   - No alternative selection dialogs
   - Just suggestions/guidance
   - System works whether user follows suggestions or not

3. **Exercise-Specific Intelligence**
   - Press movements = slow eccentric (lowering)
   - Pull movements = slow concentric + pause (squeeze)
   - Leg movements = slow eccentric (knee safety)
   - Each exercise has optimal tempo strategy

4. **Pattern-Based, Not Rule-Based**
   - Detects patterns in user's history
   - Suggests next step based on trends
   - Handles edge cases (weight jumps, equipment gaps, recovery issues)

---

## System Architecture

### 1. Smart Progression Suggester

**Input:** Exercise history (weight/reps/RIR over time)
**Output:** Next progression suggestion with reasoning

```javascript
// Core algorithm
function suggestNextProgression(exerciseKey, history) {
  const lastWorkout = history[0];
  const last3Workouts = history.slice(0, 3);
  const painHistory = getPainHistory(exerciseKey);

  // Pattern detection
  const patterns = {
    hitTopOfReps: lastWorkout.reps >= getTopOfRange(exerciseKey),
    sameWeight3Times: checkPlateau(last3Workouts),
    weightDecreased: checkRegression(last3Workouts),
    recentPain: checkPainPattern(painHistory),
    canIncreaseWeight: checkWeightGap(lastWorkout.weight)
  };

  // Decision tree
  if (patterns.recentPain) {
    return suggestEasierAlternative(exerciseKey, painHistory);
  }

  if (patterns.hitTopOfReps && patterns.canIncreaseWeight) {
    return suggestWeightIncrease(lastWorkout.weight);
  }

  if (patterns.hitTopOfReps && !patterns.canIncreaseWeight) {
    return suggestTempoProgression(exerciseKey, lastWorkout);
  }

  if (patterns.sameWeight3Times) {
    return suggestVarietyAlternative(exerciseKey);
  }

  if (patterns.weightDecreased) {
    return suggestRecoveryCheck();
  }

  return suggestContinue(lastWorkout);
}
```

### 2. Tempo Guidance Database

**Exercise-specific tempo recommendations:**

```javascript
const TEMPO_GUIDANCE = {
  // Pressing movements - slow ECCENTRIC (lowering)
  'DB Flat Bench Press': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Chest stretch under load = more growth',
    notation: '1-0-3'
  },

  // Pulling movements - slow CONCENTRIC + PAUSE
  'Seated Cable Row': {
    phase: 'concentric',
    instruction: 'Pull slowly to chest, pause 2 seconds at squeeze',
    why: 'Back muscle contraction is key',
    notation: '2-2-2'
  },

  // Isolation - slow ECCENTRIC
  'DB Lateral Raises': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Time under tension for delt growth',
    notation: '1-0-3'
  },

  // Leg movements - slow ECCENTRIC (safety)
  'Hack Squat': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds (knee-friendly)',
    why: 'Control prevents knee stress',
    notation: '3-0-2'
  },

  // Leg curls - BOTH phases
  'Leg Curl': {
    phase: 'both',
    instruction: 'Curl slowly up (2s), lower slowly down (3s)',
    why: 'Hamstrings work both ways',
    notation: '2-0-3'
  },

  // Core - ISOMETRIC
  'Plank': {
    phase: 'isometric',
    instruction: 'Maximum tension throughout, squeeze everything',
    why: 'RKC technique = better activation',
    notation: 'hold'
  }
};
```

### 3. Adaptive Weight Detection

**Handles real gym equipment:**

```javascript
function getNextAvailableWeight(currentWeight) {
  // Doesn't assume 2.5kg increments
  // Uses what user actually logs

  const userHistory = getAllExerciseWeights();
  const uniqueWeights = [...new Set(userHistory)].sort((a, b) => a - b);

  // Find next weight user has used before
  const nextUsed = uniqueWeights.find(w => w > currentWeight);

  if (nextUsed) {
    return nextUsed;  // User has used this weight before
  }

  // Otherwise suggest standard increment
  return currentWeight + 2.5;
}
```

### 4. Pattern-Based Alternatives

**Minimal database, maximum intelligence:**

```javascript
const EXERCISE_METADATA = {
  'DB Flat Bench Press': {
    muscleGroup: 'chest',
    movementType: 'horizontal_press',
    equipment: 'dumbbell',
    difficulty: 2
  },
  'Floor Press': {
    muscleGroup: 'chest',
    movementType: 'horizontal_press',
    equipment: 'dumbbell',
    difficulty: 1  // Easier
  },
  'Cable Chest Fly': {
    muscleGroup: 'chest',
    movementType: 'horizontal_press',
    equipment: 'cable',
    difficulty: 2  // Different equipment
  }
};

function findAlternative(currentExercise, reason) {
  const current = EXERCISE_METADATA[currentExercise];

  if (reason === 'pain') {
    // Find easier variation (lower difficulty)
    return findExercises({
      muscleGroup: current.muscleGroup,
      difficulty: current.difficulty - 1
    });
  }

  if (reason === 'plateau') {
    // Find different equipment (different stimulus)
    return findExercises({
      muscleGroup: current.muscleGroup,
      equipment: different(current.equipment)
    });
  }
}
```

---

## User Experience Flow

### Scenario 1: Successful Weight Progression

```
Week 1:
┌─────────────────────────────────────────┐
│ E1: DB Flat Bench Press                │
│ Last: 20kg × 12 reps (RIR 2)           │
│                                        │
│ 💡 SMART SUGGESTION:                    │
│ Try 22.5kg today (+2.5kg)              │
│ You hit top of rep range!              │
└─────────────────────────────────────────┘

User logs: 22.5kg × 10 reps (RIR 2)
✅ Success! Continue building reps.

Week 2:
User logs: 22.5kg × 12 reps (RIR 2)
💡 Next suggestion: Try 25kg (+2.5kg)
```

### Scenario 2: Weight Gap Problem (Auto-Tempo)

```
Week 1:
User logs: 10kg × 12 reps (RIR 2)
💡 Suggestion: Try 12.5kg

Week 2:
User logs: 12.5kg × 6 reps (RIR 0) [FAILED]

Week 3: [System detects failure pattern]
┌─────────────────────────────────────────┐
│ 💡 SMART SUGGESTION:                    │
│ Weight gap detected (10→12.5kg = 25%)  │
│                                        │
│ Try slow tempo at 10kg today           │
│                                        │
│ 📖 How to do it:                       │
│ Lower dumbbells slowly (3 seconds)     │
│ Why? Builds strength for bigger jump   │
│                                        │
│ Normal lifting speed up ↑              │
│ Slow controlled lowering ↓ (3 sec)     │
└─────────────────────────────────────────┘

User logs: 10kg × 12 reps (RIR 2)
[User does slow tempo - no need to track it]

Week 4-5:
Continue slow tempo at 10kg
💡 "Keep building strength with tempo"

Week 6:
┌─────────────────────────────────────────┐
│ 💡 Ready to try 12.5kg again!          │
│ You've built strength with tempo       │
│ progression - time to test it!         │
└─────────────────────────────────────────┘

User logs: 12.5kg × 10 reps (RIR 2)
✅ SUCCESS! Tempo progression worked.
```

### Scenario 3: Pain Detection (Auto-Alternative)

```
Week 1:
User logs: 20kg × 12 reps (RIR 2)
Post-workout: Reports shoulder pain

Week 2:
┌─────────────────────────────────────────┐
│ ⚠️ PAIN DETECTED:                      │
│ Shoulder pain reported last workout    │
│                                        │
│ 💡 SMART SUGGESTION:                    │
│ Switch to Floor Press (easier on       │
│ shoulders)                             │
│                                        │
│ Same muscle group, reduced ROM         │
│ Safer for shoulder recovery            │
│                                        │
│ [Exercise auto-updated for safety]     │
└─────────────────────────────────────────┘

Exercise automatically shows "Floor Press"
User continues with safer variation
```

### Scenario 4: Plateau Detection

```
Week 1-3:
User logs: 22.5kg × 12 reps (RIR 2)
[Same weight for 3 workouts]

Week 4:
┌─────────────────────────────────────────┐
│ ⚠️ PLATEAU DETECTED:                   │
│ Same weight for 3+ workouts            │
│                                        │
│ 💡 SMART SUGGESTION:                    │
│ Try Cable Chest Press (different       │
│ stimulus)                              │
│                                        │
│ Cable provides constant tension        │
│ Different resistance curve             │
│ Can help break through plateau         │
│                                        │
│ Or: Consider deload week               │
└─────────────────────────────────────────┘
```

### Scenario 5: Adaptive Weight Jumps

```
System suggests: 22.5kg
Gym only has: 20kg, 25kg

User logs: 25kg × 10 reps (RIR 2)

System detects:
- User jumped 5kg instead of 2.5kg
- Still hit 10 reps (in range)
- RIR still good
- Conclusion: USER IS STRONGER

Next suggestion: 27.5kg (adjusts expectations)
```

---

## Implementation Phases

### Phase 1: Smart Progression Suggester (Week 1)

**Files:**
- `js/modules/smart-progression.js` (new)
- `js/app.js` (integrate suggestions)

**Features:**
- Pattern detection (plateau/regression/success)
- Next step suggestions (weight/tempo/alternative)
- Adaptive weight detection
- Display suggestion banner before exercise

**Effort:** 200 lines, 1 week

---

### Phase 2: Tempo Guidance System (Week 2)

**Files:**
- `js/modules/tempo-guidance.js` (new)
- `css/tempo-guidance.css` (new)

**Features:**
- Exercise-specific tempo database (26 entries)
- Tempo suggestion display with instructions
- Why explanations for each exercise
- Visual guides (arrows, timings)

**Effort:** 150 lines, 1 week

---

### Phase 3: Exercise Alternatives Metadata (Week 3)

**Files:**
- `js/modules/exercise-metadata.js` (new)

**Features:**
- Minimal metadata for all 26 exercises
- Pattern-based alternative generation
- Auto-suggest alternatives for pain/plateau
- No manual alternative selection needed

**Effort:** 100 lines, 3 days

---

### Phase 4: Optional Tempo Tracking (Week 4)

**Files:**
- Update `js/app.js` (collapsible UI)
- Update `css/workout-screen.css`

**Features:**
- Collapsed tempo selector (optional)
- Expand when user wants to track
- Auto-collapse after logging
- Backward compatible (tempo = null by default)

**Effort:** 50 lines, 2 days

---

## Data Structure

### Set Data (Backward Compatible)

```javascript
// Current structure (unchanged)
{
  weight: 10,
  reps: 12,
  rir: 2,
  date: '2026-02-10T10:30:00Z'
}

// Enhanced (optional tempo field)
{
  weight: 10,
  reps: 12,
  rir: 2,
  tempo: null,  // or 'eccentric' or 'paused'
  date: '2026-02-10T10:30:00Z'
}

// If tempo is null or undefined → assume 'normal'
// Fully backward compatible
```

### Suggestion Object

```javascript
{
  type: 'INCREASE_WEIGHT' | 'TRY_TEMPO' | 'TRY_ALTERNATIVE' | 'CONTINUE' | 'RECOVERY_WARNING',
  message: 'Try 22.5kg today (+2.5kg)',
  reason: 'You hit top of rep range with good RIR',
  confidence: 'high' | 'medium' | 'low',
  guidance: {
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Builds strength for next weight jump'
  },
  autoApply: false  // true for safety-critical (pain)
}
```

---

## UI Components

### 1. Smart Suggestion Banner

```html
<div class="smart-suggestion">
  <div class="suggestion-icon">💡</div>
  <div class="suggestion-content">
    <strong>SMART SUGGESTION:</strong>
    <p>Try 22.5kg today (+2.5kg)</p>
    <small>You hit top of rep range with good RIR</small>
  </div>
</div>
```

### 2. Tempo Guidance Card

```html
<div class="tempo-guidance">
  <strong>📖 How to do it:</strong>
  <p>Lower dumbbells slowly over 3 seconds</p>
  <div class="tempo-visual">
    Normal speed up ↑ | Slow controlled down ↓ (3 sec)
  </div>
  <small>Why? Chest stretch under load = more growth</small>
</div>
```

### 3. Optional Tempo Tracker

```html
<div class="tempo-section collapsed">
  <button class="tempo-toggle">
    ⚡ Track tempo (optional) [+]
  </button>
  <div class="tempo-options" style="display: none;">
    <label>
      <input type="radio" name="tempo-1" value="normal" checked>
      Normal (1-0-1)
    </label>
    <label>
      <input type="radio" name="tempo-1" value="eccentric">
      Slow eccentric (1-0-3)
    </label>
    <label>
      <input type="radio" name="tempo-1" value="paused">
      Paused (1-2-1)
    </label>
  </div>
</div>
```

---

## CSS Styling

```css
/* Smart Suggestion Banner */
.smart-suggestion {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-left: 4px solid var(--color-primary);
  padding: 12px;
  margin: 12px 0;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.suggestion-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.suggestion-content strong {
  color: var(--color-primary);
  display: block;
  margin-bottom: 4px;
}

.suggestion-content p {
  margin: 4px 0;
  font-size: 16px;
}

.suggestion-content small {
  color: var(--color-text-dim);
  font-style: italic;
}

/* Tempo Guidance */
.tempo-guidance {
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 12px;
  margin: 8px 0;
  border-radius: 8px;
}

.tempo-visual {
  background: var(--color-surface);
  padding: 8px;
  margin: 8px 0;
  border-radius: 4px;
  font-family: monospace;
  text-align: center;
}

/* Collapsible Tempo Tracker */
.tempo-section {
  margin: 8px 0;
}

.tempo-toggle {
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  color: var(--color-text-dim);
  padding: 8px;
  border-radius: 4px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.tempo-options {
  margin-top: 8px;
  padding: 8px;
  background: var(--color-surface);
  border-radius: 4px;
}

.tempo-options label {
  display: block;
  padding: 4px 0;
  cursor: pointer;
}
```

---

## Testing Strategy

### Unit Tests

```javascript
// tests/unit/smart-progression.test.js
describe('Smart Progression Suggester', () => {
  test('suggests weight increase when top of range hit', () => {
    const history = [{ weight: 10, reps: 12, rir: 2 }];
    const suggestion = suggestNextProgression('test-key', history);
    expect(suggestion.type).toBe('INCREASE_WEIGHT');
  });

  test('suggests tempo when weight gap exists', () => {
    const history = [
      { weight: 10, reps: 12, rir: 2 },
      { weight: 12.5, reps: 6, rir: 0 }  // Failed jump
    ];
    const suggestion = suggestNextProgression('test-key', history);
    expect(suggestion.type).toBe('TRY_TEMPO');
  });

  test('detects plateau (same weight 3 times)', () => {
    const history = [
      { weight: 10, reps: 12, rir: 2 },
      { weight: 10, reps: 12, rir: 2 },
      { weight: 10, reps: 12, rir: 2 }
    ];
    const suggestion = suggestNextProgression('test-key', history);
    expect(suggestion.type).toBe('TRY_ALTERNATIVE');
  });

  test('adapts to actual weight used (not suggestion)', () => {
    const history = [
      { weight: 20, reps: 12, rir: 2 },  // System suggested 22.5
      { weight: 25, reps: 10, rir: 2 }   // User used 25 instead
    ];
    const suggestion = suggestNextProgression('test-key', history);
    expect(suggestion.suggestedWeight).toBe(27.5);  // Continues from 25
  });
});
```

### Integration Tests

```markdown
# Manual Test Scenarios

## Scenario 1: Happy Path Weight Progression
1. Log 10kg × 12 reps (RIR 2)
2. Check suggestion shows "Try 12.5kg"
3. Log 12.5kg × 10 reps (RIR 2)
4. Check suggestion shows "Continue 12.5kg, aim for 12 reps"
5. Log 12.5kg × 12 reps (RIR 2)
6. Check suggestion shows "Try 15kg"

## Scenario 2: Weight Gap Tempo Progression
1. Log 10kg × 12 reps (RIR 2)
2. Check suggestion shows "Try next weight"
3. Log 15kg × 6 reps (RIR 0) [Failed]
4. Check suggestion shows "Try slow tempo at 10kg"
5. Verify tempo guidance displayed with instructions
6. Log 10kg × 12 reps (no tempo tracking needed)
7. After 3 weeks, check suggestion "Ready to try 15kg again"

## Scenario 3: Pain-Based Alternative
1. Log 20kg × 12 reps (RIR 2)
2. Report shoulder pain post-workout
3. Next workout: Check suggestion shows alternative exercise
4. Verify exercise name updated automatically

## Scenario 4: Adaptive Weight Detection
1. System suggests 22.5kg
2. Log 25kg × 10 reps (RIR 2) [User used heavier]
3. Next workout: Check suggestion continues from 25kg (not 22.5kg)
```

---

## Success Metrics

**How we'll know it works:**

1. **User adapts to suggestions:** 70%+ of users follow weight suggestions
2. **Plateau reduction:** 50% fewer users stuck at same weight 3+ weeks
3. **Pain-based switches:** 90%+ auto-switch accuracy (no manual intervention)
4. **Weight gap handling:** 80%+ success rate after tempo progression
5. **Zero extra taps:** Average set logging remains 3 taps (weight/reps/RIR)

---

## Future Enhancements (Not in MVP)

1. **Machine Learning:** Learn user's response patterns over time
2. **Exercise video links:** Link to form videos in tempo guidance
3. **Voice suggestions:** "Slow down the lowering phase today"
4. **Progress predictions:** "At this rate, you'll hit 30kg in 6 weeks"
5. **Social features:** "85% of users break plateau with this strategy"

---

## Related Documents

- [SHRED vs BUILD Feature Comparison](2026-02-10-shred-vs-build-feature-comparison.md) - Original research
- [Built with Science Exercise Safety](2026-02-09-exercise-safety-verification-builtwithscience.md) - Form cues
- [README.md](../../README.md) - Project overview

---

## Summary

**What makes this THE BEST auto-progression app:**

✅ **Zero extra input** - Just log weight/reps/RIR as normal
✅ **Adaptive** - Works with actual gym equipment, not theory
✅ **Exercise-specific** - Each exercise gets optimal tempo strategy
✅ **Pattern-based** - Learns from what you actually do
✅ **Safety-first** - Auto-switches exercises when pain detected
✅ **Beginner-friendly** - Solves weight gap problem automatically

**Total effort:** 3-4 weeks, ~500 lines of code
**Total impact:** Solves #1 beginner progression problem

**Next step:** Implement Phase 1 (Smart Progression Suggester)
