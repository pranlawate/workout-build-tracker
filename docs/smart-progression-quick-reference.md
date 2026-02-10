# Smart Progression System - Quick Reference Guide

## For Users

### What You'll See During Workouts

#### 1. Smart Suggestion Banners
Appear at the top of each exercise card with color-coded urgency:

**Types of Suggestions:**
- 💪 **SMART SUGGESTION**: "Try 12.5kg - you hit 12 reps last time"
- ⏱️ **TEMPO PROGRESSION**: "Build strength at 10kg with slow tempo (3-1-1-0)"
- 🔄 **TRY ALTERNATIVE**: "Consider Cable Chest Press - plateau detected"
- ⚠️ **SAFETY ALERT**: "IMMEDIATE SWITCH - severe pain detected"
- ⬇️ **WEIGHT ADJUSTMENT**: "Drop to 10kg to rebuild strength safely"
- 🚨 **PAIN DETECTED**: "Switch to alternative - pain history detected"
- 📊 **PLATEAU DETECTED**: "Same weight 3+ sessions - try alternative"
- 💤 **RECOVERY CHECK**: "Recent weight drop - ensure adequate recovery"
- ✅ **ON TRACK**: "Continue at current weight - progressing well"

**Urgency Colors:**
- 🔴 **Red (Critical)**: Immediate action needed (pain, safety)
- 🟡 **Orange (Warning)**: Attention needed (plateau, regression)
- 🔵 **Blue (Info)**: Standard suggestions (weight increase, tempo)

#### 2. Form Guide (Collapsible)
Click "📋 Form Guide ▼" to expand form cues:

**Three Categories:**
- **Setup**: How to position yourself before the exercise
- **Execution**: How to perform the movement correctly
- **Common Mistakes**: What to avoid

Available for all 26 exercises in the program.

#### 3. Post-Workout Achievements
After completing a workout, you may see:

- 🔥 **Personal Record**: New weight or rep PR
- ⏱️ **Tempo Mastery**: 3+ weeks of tempo progression work
- 📈 **Progression Streak**: Consistent weight increases (3+ workouts)
- 💡 **Smart Recovery**: Intelligently reduced weight to prevent injury

### What You DON'T Need to Do

- ❌ No dropdown menus to select tempo
- ❌ No buttons to switch to alternatives
- ❌ No manual achievement tracking
- ❌ No extra data input beyond weight/reps/RIR

**The system adapts to what you log. Zero extra effort.**

---

## For Developers

### Module Architecture

```
js/modules/
├── smart-progression.js    # Main suggestion engine (28KB)
│   ├── Exercise metadata (26 exercises)
│   ├── Tempo guidance database
│   ├── Pattern detection functions
│   └── Suggestion logic (getSuggestion)
│
├── achievements.js         # Achievement detection (6.7KB)
│   ├── detectAchievements()
│   ├── detectPersonalRecord()
│   ├── detectTempoMastery()
│   ├── detectProgressionStreak()
│   └── detectSmartRecovery()
│
└── form-cues.js           # Form guidance (11KB)
    ├── FORM_CUES database (26 exercises)
    ├── getFormCues()
    └── getFormCuesByCategory()
```

### Key Functions

#### Smart Progression
```javascript
import { getSuggestion } from './modules/smart-progression.js';

// Get suggestion for an exercise
const suggestion = getSuggestion(exerciseKey, history, painHistory);
// Returns: { type, message, reason, urgency, tempoGuidance? }
// Returns: null if insufficient data
```

#### Achievements
```javascript
import { detectAchievements } from './modules/achievements.js';

// Detect achievements after workout
const achievements = detectAchievements(workoutData, storage);
// Returns: Array of { id, type, exerciseKey, badge, description }
// Automatically saves to storage
```

#### Form Cues
```javascript
import { getFormCues } from './modules/form-cues.js';

// Get form cues for an exercise
const cues = getFormCues('Incline Dumbbell Press');
// Returns: { setup: [], execution: [], mistakes: [] }
// Returns: null if exercise not found
```

### Storage Methods

All smart progression data stored via StorageManager:

```javascript
// Exercise Alternates
storage.getExerciseAlternates()      // Get all mappings
storage.addExerciseAlternate(from, to)  // Add mapping
storage.saveExerciseAlternates(data)    // Save mappings

// Tempo State
storage.getTempoState()              // Get tempo state
storage.updateTempoState(key, state) // Update state
storage.saveTempoState(data)         // Save state

// Achievements
storage.getAchievements()            // Get all achievements
storage.addAchievement(achievement)  // Add achievement
storage.markAchievementAsSeen(id)    // Mark as seen
storage.getUnseenCount()             // Count unseen
```

### UI Integration Points

#### 1. Workout Screen (app.js)
```javascript
// In renderExercises():
const suggestion = getSuggestion(exerciseKey, history, painHistory);
const suggestionBanner = this.generateSuggestionBanner(suggestion);

const formCues = getFormCues(exercise.name);
// Render form guide with toggle functionality
```

#### 2. Summary Screen (app.js)
```javascript
// In completeWorkout():
const achievements = detectAchievements(workoutData, this.storage);
this.renderPostWorkoutSummaryStats(stats, newRecords, achievements);
```

#### 3. Progress Screen (app.js)
```javascript
// Achievement gallery integration
const allAchievements = getAllAchievements(this.storage);
const unseenCount = getUnseenCount(this.storage);
```

### CSS Classes

#### Suggestion Banners (workout-screen.css)
```css
.smart-suggestion        /* Container */
.smart-suggestion.urgent /* Critical urgency (red) */
.smart-suggestion.warning /* High urgency (orange) */
.smart-suggestion.info   /* Low urgency (blue) */
.suggestion-icon         /* Icon display */
.suggestion-content      /* Content wrapper */
.suggestion-type         /* Type label */
.suggestion-message      /* Main message */
.suggestion-reason       /* Reasoning text */
.tempo-guidance          /* Tempo instruction block */
```

#### Form Guides (workout-screen.css)
```css
.form-guide-section      /* Container */
.form-guide-toggle       /* Toggle button */
.form-guide-content      /* Collapsible content */
.form-cue-category       /* Category wrapper */
```

#### Achievements (achievements.css)
```css
.achievements-earned     /* Post-workout container */
.achievements-title      /* Section title */
.achievements-list       /* Achievement list */
.achievement-badge       /* Individual badge */
.achievement-badge.pr    /* PR-specific styling */
.achievement-badge.tempo /* Tempo-specific styling */
.achievement-badge.recovery /* Recovery-specific */
.achievement-badge.streak   /* Streak-specific */
```

### Data Structures

#### Suggestion Object
```javascript
{
  type: 'INCREASE_WEIGHT' | 'TRY_TEMPO' | 'TRY_ALTERNATIVE' |
        'IMMEDIATE_ALTERNATIVE' | 'REDUCE_WEIGHT' | 'PAIN_WARNING' |
        'PLATEAU_WARNING' | 'RECOVERY_WARNING' | 'CONTINUE',
  message: 'User-facing message',
  reason: 'Explanation of why this suggestion',
  urgency: 'critical' | 'high' | 'medium' | 'low' | 'normal',
  tempoGuidance?: {
    tempo: '3-1-1-0',
    instruction: 'How to perform tempo',
    cue: 'Visual cue',
    why: 'Reason for this tempo'
  }
}
```

#### Achievement Object
```javascript
{
  id: 'pr_Upper_A_-_Incline_Dumbbell_Press_1707600000000',
  type: 'PERSONAL_RECORD' | 'TEMPO_MASTERY' |
        'PROGRESSION_STREAK' | 'SMART_RECOVERY',
  exerciseKey: 'Upper A - Incline Dumbbell Press',
  badge: '🔥' | '⏱️' | '📈' | '💡',
  description: 'Incline Dumbbell Press: 25kg × 12 reps',
  timestamp?: 1707600000000,
  seenAt?: null
}
```

#### Form Cues Object
```javascript
{
  setup: [
    'Set bench to 30-45 degree incline',
    'Sit with dumbbells on thighs'
  ],
  execution: [
    'Press up and slightly in',
    'Lower with control (2-3 seconds)'
  ],
  mistakes: [
    'Arching back excessively',
    'Bouncing dumbbells off chest'
  ]
}
```

### Error Handling

All modules use defensive programming:

```javascript
// Always check for null/undefined
if (!history || history.length < 2) return null;

// Wrap in try-catch
try {
  // Logic here
} catch (error) {
  console.error('[ModuleName] Error:', error);
  return safeDefault; // null, [], {}, etc.
}

// Safe array access
const latest = history[history.length - 1];
const latestBest = getBestSet(latest?.sets);
if (!latestBest) return null;
```

### Testing Checklist

Before deploying changes:

- [ ] Run syntax checks: `node --check js/modules/[module].js`
- [ ] Verify imports match exports
- [ ] Check CSS classes are defined
- [ ] Test with null/empty data
- [ ] Verify localStorage integration
- [ ] Test UI rendering (no crashes)
- [ ] Check mobile responsiveness
- [ ] Verify PWA compatibility

### Performance Notes

- **Lightweight**: All modules < 30KB combined
- **Lazy evaluation**: Suggestions only calculated when needed
- **No external dependencies**: Pure JavaScript
- **localStorage**: Efficient JSON serialization
- **Mobile-first**: Optimized for 6.7" screens

### Common Gotchas

1. **Exercise Name Matching**: Form cues use exact exercise names
   - ✅ "Incline Dumbbell Press"
   - ❌ "Incline DB Press"

2. **History Format**: Expects standardized format from StorageManager
   ```javascript
   {
     date: '2026-02-10',
     sets: [{ weight: 25, reps: 12, rir: 2 }]
   }
   ```

3. **Pain History**: Optional parameter, can be null
   ```javascript
   getSuggestion(exerciseKey, history, painHistory);
   // painHistory can be null - system handles it
   ```

4. **Achievement Timing**: Only detect after workout completion
   ```javascript
   // ❌ Don't call during workout
   // ✅ Call in completeWorkout()
   const achievements = detectAchievements(workoutData, storage);
   ```

---

## Quick Start Examples

### Add a New Exercise

1. **Add to smart-progression.js**:
```javascript
EXERCISE_METADATA: {
  'New Exercise': {
    pattern: 'horizontal_press',
    muscleGroup: 'chest',
    equipment: 'dumbbell',
    alternatives: ['Cable Chest Press']
  }
}

TEMPO_GUIDANCE: {
  'New Exercise': {
    tempo: '3-0-1-0',
    instruction: '3 second lower, press up fast',
    cue: 'Slow down, fast up',
    why: 'Eccentric overload builds strength'
  }
}
```

2. **Add to form-cues.js**:
```javascript
FORM_CUES: {
  'New Exercise': {
    setup: ['Setup cue 1', 'Setup cue 2'],
    execution: ['Execution cue 1', 'Execution cue 2'],
    mistakes: ['Mistake 1', 'Mistake 2']
  }
}
```

3. **Done!** System will now provide suggestions, tempo, and form cues.

### Customize Suggestion Logic

Edit `getSuggestion()` in smart-progression.js:
```javascript
export function getSuggestion(exerciseKey, history, painHistory = null) {
  // Add your custom logic here
  if (customCondition) {
    return {
      type: 'CUSTOM_TYPE',
      message: 'Custom message',
      reason: 'Custom reason',
      urgency: 'normal'
    };
  }
  // ... existing logic
}
```

---

## Support

For questions or issues:
1. Check integration verification: `docs/smart-progression-integration-verification.md`
2. Review implementation plan: `docs/plans/2026-02-10-smart-auto-progression-implementation-plan.md`
3. See design document: `docs/plans/2026-02-10-smart-auto-progression-design.md`

---

**Last Updated**: 2026-02-10
**Version**: 1.0.0 (Production Ready)
