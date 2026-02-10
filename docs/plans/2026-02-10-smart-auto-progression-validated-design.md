# Smart Auto-Progression System - Validated Design

**Date:** 2026-02-10
**Status:** Design Validated - Ready for Implementation
**Goal:** THE BEST auto-progression app with zero extra user input

---

## Design Philosophy

The system adapts to gym equipment, suggests progression strategies, and prevents injury—all from existing data (weight/reps/RIR). Users log sets normally. The system decides what to do next.

**Core Principles:**
1. **Zero extra input** - No dropdown menus, no manual selections
2. **Safety first** - Reduce weight before switching exercises
3. **Pattern-based** - Learns from actual performance, not theory
4. **Exercise-specific** - Each exercise gets optimal tempo guidance
5. **Progressive response** - Escalates intervention only when necessary

---

## System Architecture

### 1. Core Decision Engine

**Priority-based suggestion system:**

```javascript
function getSuggestion(exerciseKey, history, painHistory) {
  // Priority 1: Safety (pain handling)
  if (painHistory.hasRecentPain(exerciseKey)) {
    return handlePainBasedSuggestion(exerciseKey, painHistory, history);
  }

  // Priority 2: Progression (weight increase)
  if (hitTopOfReps(history) && canIncreaseWeight(history)) {
    return suggestWeightIncrease(history);
  }

  // Priority 3: Weight gap (tempo progression)
  if (hitTopOfReps(history) && !canIncreaseWeight(history)) {
    return suggestTempoProgression(exerciseKey, history);
  }

  // Priority 4: Plateau detection
  if (detectPlateau(history, minWorkouts = 3)) {
    return suggestAlternative(exerciseKey, 'plateau');
  }

  // Priority 5: Regression warning
  if (detectRegression(history)) {
    return suggestRecoveryCheck(history);
  }

  // Default: Continue current approach
  return suggestContinue(history);
}
```

**Key characteristics:**
- Stateless decisions (fresh analysis each time)
- Pattern detection from history only
- No cached state to maintain
- Adapts to what user actually logs

---

### 2. Pain Handling (Severity-Based Response)

**Progressive escalation based on pain intensity:**

#### Mild Pain (Monitor Only)
```javascript
// First occurrence, mild intensity
return {
  type: 'PAIN_WARNING',
  message: 'Mild shoulder discomfort reported last workout',
  suggestion: 'Monitor form, reduce weight if pain increases',
  urgency: 'low'
};
```

**Display:** Info banner only, no action required

#### Moderate Pain (Reduce Weight)
```javascript
// First occurrence, moderate intensity
return {
  type: 'REDUCE_WEIGHT',
  suggestedWeight: lastWeight * 0.8,  // 20% reduction
  message: 'Try 20kg (was 25kg) - moderate pain detected',
  reason: 'Lighter weight may resolve issue',
  urgency: 'medium'
};
```

**Flow:**
1. Week 1: 25kg, moderate pain → Suggest 20kg
2. Week 2: 20kg, pain resolved → Continue from 20kg
3. Week 2 alt: 20kg, pain persists → Suggest alternative (next level)

#### Persistent Moderate Pain (Switch Exercise)
```javascript
// 2+ workouts with moderate pain
return {
  type: 'TRY_ALTERNATIVE',
  alternative: 'Floor Press',
  message: 'Moderate pain persists - switch to safer variation',
  autoApply: true,
  urgency: 'high'
};
```

#### Severe Pain (Immediate Switch)
```javascript
// First occurrence, severe intensity
return {
  type: 'IMMEDIATE_ALTERNATIVE',
  alternative: 'Floor Press',
  message: 'Severe pain - switching to safer variation immediately',
  warning: 'Consider rest day or medical consultation',
  autoApply: true,
  urgency: 'critical'
};
```

**Threshold Summary:**

| Pain Level | Workouts | Action | Auto-Apply? |
|------------|----------|--------|-------------|
| Mild | 1 | Warning only | No |
| Moderate | 1 | Reduce weight 20% | No |
| Moderate | 2+ | Switch to alternative | Yes |
| Severe | 1 | Immediate switch + rest warning | Yes |

---

### 3. Tempo Progression (Exercise-Specific)

**When weight gaps exist (2.5kg → 5kg = 100% increase), suggest tempo strategies:**

#### Tempo Guidance Database

```javascript
const TEMPO_GUIDANCE = {
  // Pressing movements - slow ECCENTRIC
  'DB Flat Bench Press': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Chest stretch under load = more growth',
    cue: 'Normal speed up ↑ | Slow controlled down ↓ (3 sec)'
  },

  // Pulling movements - slow CONCENTRIC + PAUSE
  'Seated Cable Row': {
    phase: 'concentric',
    instruction: 'Pull slowly to chest, pause 2 seconds at squeeze',
    why: 'Back muscle contraction is key',
    cue: 'Slow pull → (2 sec) | Hold squeeze (2 sec) | Control release'
  },

  // Leg movements - slow ECCENTRIC (safety)
  'Hack Squat': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds (knee-friendly)',
    why: 'Control prevents knee stress',
    cue: 'Controlled descent ↓ (3 sec) | Explosive drive ↑'
  }
};
```

**Coverage:** All 26 BUILD exercises mapped to optimal tempo phase

**Tempo Progression Flow:**
```
Week 1: 10kg × 12 reps (normal) → Suggest 12.5kg
Week 2: 12.5kg × 6 reps (failed) → Detect weight gap
Week 3: "Try slow tempo at 10kg" + tempo guidance shown
Week 4-5: Continue tempo work at 10kg
Week 6: "Ready to try 12.5kg now - you've built the strength!"
```

**No tracking required:** System suggests tempo when pattern detected, doesn't track compliance

---

### 4. Exercise Alternatives (Pattern-Based)

**Alternative switching for pain or plateau:**

#### Exercise Metadata (Minimal)

```javascript
const EXERCISE_METADATA = {
  'DB Flat Bench Press': {
    muscleGroup: 'chest',
    movementType: 'horizontal_press',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Floor Press', 'Incline Push-Ups'],
      harder: ['Paused Bench Press', 'Slow Tempo Press'],
      different: ['Cable Chest Press', 'DB Incline Press']
    }
  }
};
```

#### Alternative Selection Logic

```javascript
function findAlternative(exerciseKey, reason, painIntensity) {
  const metadata = EXERCISE_METADATA[exerciseKey];

  if (reason === 'pain' && painIntensity === 'moderate') {
    // Easier variation (reduced ROM, lower difficulty)
    return metadata.alternatives.easier[0];
  }

  if (reason === 'pain' && painIntensity === 'severe') {
    // Immediate switch to safest option
    return metadata.alternatives.easier[0];
  }

  if (reason === 'plateau') {
    // Different equipment (new stimulus)
    return metadata.alternatives.different[0];
  }
}
```

#### Preference Storage

```javascript
// localStorage: build_exercise_alternates
{
  "UPPER_A - DB Flat Bench Press": {
    current: "Floor Press",
    original: "DB Flat Bench Press",
    reason: "moderate_pain",
    dateChanged: "2026-02-10T10:30:00Z",
    painFreeWorkouts: 0
  }
}
```

**Auto-revert logic:**
- When `painFreeWorkouts >= 3` → Suggest trying original exercise
- User accepts → Remove from alternates storage
- Display updated to show original exercise again

---

### 5. Form Cues (Collapsible, MVP Included)

**Architecture reuses tempo guidance pattern:**

```javascript
const FORM_CUES = {
  'DB Flat Bench Press': {
    setup: ['Retract shoulder blades', 'Feet flat on floor', 'Arch lower back'],
    execution: ['Elbows at 45° (not 90°)', 'Control descent (2-3 sec)', 'Press to lockout'],
    mistakes: ['Dumbbells drifting apart', 'Bouncing off chest', 'Shoulders rolling forward']
  }
};
```

**Display:**
```
┌─────────────────────────────────────────┐
│ E1: DB Flat Bench Press                │
│                                        │
│ 💡 SMART SUGGESTION:                    │
│ Try 22.5kg today (+2.5kg)              │
│ You hit top of rep range!              │
│                                        │
│ [📋 Form Guide ▼] ← Collapsed default  │
└─────────────────────────────────────────┘
```

**Tap to expand:**
```
┌─────────────────────────────────────────┐
│ 📋 FORM GUIDE ▲                        │
│ • Retract shoulder blades              │
│ • Elbows 45° (not 90°)                 │
│ • Control descent (2-3 sec)            │
│ ⚠️ Avoid dumbbells drifting apart      │
└─────────────────────────────────────────┘
```

**Rationale:** Small data, high impact. Prevents injury, enables progression. Part of MVP.

---

### 6. Gamification (Meaningful Achievements)

**Achievement categories:**

#### 1. Tempo Mastery
```javascript
{
  type: 'TEMPO_MASTERY',
  exerciseKey: 'UPPER_A - DB Lateral Raises',
  startWeight: 10,
  targetWeight: 12.5,
  tempoWeeks: 3,
  dateAchieved: '2026-02-15',
  badge: '🏆 Tempo Master',
  description: 'Conquered 10kg→12.5kg gap with tempo progression'
}
```

**Trigger:** Successfully completed weight jump after 3+ weeks tempo work

#### 2. Progression Streaks
```javascript
{
  type: 'CONSISTENCY',
  exerciseKey: 'UPPER_A - DB Flat Bench Press',
  streakCount: 5,
  pattern: 'weight_increase',
  badge: '⚡ Progression Streak',
  description: '5 workouts with weight increases'
}
```

**Trigger:** 5 consecutive workouts with weight progression

#### 3. Smart Recovery
```javascript
{
  type: 'SMART_DECISION',
  action: 'alternative_switch',
  exerciseKey: 'UPPER_A - DB Flat Bench Press',
  reason: 'moderate_pain',
  outcome: 'pain_resolved',
  badge: '🧠 Smart Recovery',
  description: 'Prevented injury by switching to Floor Press'
}
```

**Trigger:** Pain resolved after alternative switch (3+ workouts pain-free)

#### 4. Personal Records
```javascript
{
  type: 'PERSONAL_RECORD',
  exerciseKey: 'UPPER_A - DB Flat Bench Press',
  metric: 'weight',
  value: 25,
  reps: 12,
  previousBest: 22.5,
  badge: '🔥 New PR',
  description: 'DB Bench Press: 25kg × 12 reps'
}
```

**Trigger:** Weight or rep PR achieved

**Display:** Post-workout summary screen shows achievements earned

**Integration:** Unified with barbell unlocking system (both use same data, different purposes)

---

## Data Structures

### New localStorage Keys

#### 1. Exercise Alternates
```javascript
// Key: build_exercise_alternates
{
  "UPPER_A - DB Flat Bench Press": {
    current: "Floor Press",
    original: "DB Flat Bench Press",
    reason: "moderate_pain",
    dateChanged: "2026-02-10T10:30:00Z",
    painFreeWorkouts: 0
  }
}
```

#### 2. Achievements
```javascript
// Key: build_achievements
{
  achievements: [
    {
      id: "tempo_master_lateral_raise_10_12.5",
      type: "TEMPO_MASTERY",
      exerciseKey: "UPPER_A - DB Lateral Raises",
      startWeight: 10,
      targetWeight: 12.5,
      tempoWeeks: 3,
      dateAchieved: "2026-02-15T14:20:00Z",
      seen: true
    }
  ],
  streaks: {
    "UPPER_A - DB Flat Bench Press": {
      current: 5,
      best: 7,
      pattern: "weight_increase",
      lastDate: "2026-02-10"
    }
  }
}
```

#### 3. Tempo State (Optional)
```javascript
// Key: build_tempo_state
{
  "UPPER_A - DB Lateral Raises": {
    weight: 10,
    tempoStartDate: "2026-01-20",
    weekCount: 3,
    status: "building_strength",
    targetWeight: 12.5
  }
}
```

**Note:** Tempo state improves experience but not required. System works without it.

### Existing Storage (Unchanged)
- `build_exercise_*` - Exercise history (all data comes from here)
- `build_workout_rotation` - Rotation state
- `build_pain_history` - Pain tracking (enhanced with intensity field)
- `build_weigh_ins` - Body weight

---

## UI Implementation

### 1. Suggestion Banner (Always Inline)

**Single template for all suggestion types:**

```html
<div class="smart-suggestion ${urgencyClass}">
  <div class="suggestion-icon">${icon}</div>
  <div class="suggestion-content">
    <strong>${suggestionType}</strong>
    <p>${message}</p>
    <small>${reason}</small>
  </div>
</div>
```

**CSS:**
```css
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

.smart-suggestion.urgent {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: var(--color-danger);
}

.smart-suggestion.warning {
  background: rgba(245, 158, 11, 0.1);
  border-left-color: var(--color-warning);
}
```

### 2. Tempo Guidance Display

**Shown when tempo suggested:**

```html
<div class="tempo-guidance">
  <strong>📖 How to do it:</strong>
  <p>${tempoInstruction}</p>
  <div class="tempo-visual">${tempoCue}</div>
  <small>Why? ${tempoReason}</small>
</div>
```

### 3. Form Cues (Collapsible)

**Default collapsed:**
```html
<button class="form-guide-toggle collapsed" onclick="toggleFormGuide(exerciseIndex)">
  📋 Form Guide ▼
</button>
<div class="form-guide-content" style="display: none;">
  <ul>
    <li>${setupCue1}</li>
    <li>${executionCue1}</li>
    <li>⚠️ ${mistakeToAvoid}</li>
  </ul>
</div>
```

### 4. Achievement Display (Post-Workout)

```html
<div class="achievements-earned">
  <h3>🎉 Achievements Earned Today</h3>
  <div class="achievement-badge">
    <span class="badge-icon">🔥</span>
    <div class="badge-details">
      <strong>New PR</strong>
      <p>DB Bench Press: 25kg × 12 reps</p>
    </div>
  </div>
</div>
```

---

## Implementation Phases

### Phase 1: Smart Progression Engine (Days 1-3)

**Files:**
- `js/modules/smart-progression.js` (new)
- `js/modules/exercise-metadata.js` (new)
- `js/modules/tempo-guidance.js` (new)
- `js/modules/form-cues.js` (new)

**Deliverable:** `getSuggestion(exerciseKey)` returns intelligent response

### Phase 2: UI Integration (Days 4-5)

**Files:**
- `js/app.js` (modify)
- `css/smart-progression.css` (new)

**Deliverable:** Suggestions appear in workout screen

### Phase 3: Storage & Persistence (Day 6)

**Files:**
- `js/modules/storage.js` (modify)
- Add new localStorage methods

**Deliverable:** Alternative preferences persist

### Phase 4: Post-Workout Integration (Day 7)

**Files:**
- `js/screens/post-workout-summary.js` (modify)
- `css/achievements.css` (new)

**Deliverable:** Achievements appear after workout

### Phase 5: Progress Screen Enhancement (Days 8-10)

**Files:**
- `js/screens/progress-screen.js` (modify)

**Deliverable:** Achievement gallery + unified progression dashboard

**Total Timeline:** 10-12 days focused development

---

## Testing Strategy

### Pattern Detection Tests
- Plateau: Same weight 3+ workouts → Suggest alternative
- Weight gap: Failed jump → Suggest tempo
- Regression: Weight dropped → Warning
- Pain mild: 1 workout → Info only
- Pain moderate: 1 workout → Reduce weight
- Pain moderate: 2+ workouts → Switch exercise
- Pain severe: 1 workout → Immediate switch

### Adaptive Weight Tests
- Suggested 22.5kg, user logs 25kg → Next suggestion from 25kg
- User has no 12.5kg available → Detects 10kg→15kg jump
- Gym equipment differs from standard → Learns actual weights

### Achievement Tests
- Tempo progression 3 weeks → Jump successful → Award Tempo Master
- 5 workouts weight increase → Award Progression Streak
- Pain → Switch → Pain resolves → Award Smart Recovery
- New weight PR → Award PR badge

---

## Success Metrics

**How we measure effectiveness:**

1. **Adaptation Rate:** 80%+ users follow weight suggestions
2. **Plateau Reduction:** 50% fewer users stuck 3+ weeks
3. **Pain Response:** 90%+ accuracy in alternative suggestions
4. **Weight Gap Success:** 80%+ complete tempo progression successfully
5. **Zero Friction:** Set logging remains 3 taps average

---

## Design Decisions Summary

### Validated Through Brainstorming

1. **Pain handling:** Progressive (reduce weight → switch exercise), severity-based
2. **Form cues:** Included in MVP, collapsible, high ROI
3. **Tempo tracking:** Optional state, system works without it
4. **Alternative threshold:** Plateau = 3 workouts, pain = progressive response
5. **Gamification:** Meaningful achievements, integrated with barbell unlocking
6. **Display:** Always-inline suggestions, single template, no conditionals
7. **Architecture:** Stateless decisions, pattern-based, reuses existing data

### Key Revisions From Initial Design

1. Added severity-based pain response (mild/moderate/severe)
2. Included form cues in MVP (small data, high impact)
3. Progressive pain handling (reduce weight first, alternative if persistent)
4. Simplified UI (always-inline, no conditional expansion)

---

## Next Steps

1. Create detailed implementation plan (task-by-task)
2. Use writing-plans skill for bite-sized tasks
3. Execute using subagent-driven-development
4. Deploy Phase 1 → Test → Deploy remaining phases

**Status:** Design validated and ready for implementation planning.
