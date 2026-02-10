# Smart Auto-Progression System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build THE BEST auto-progression app with zero extra user input

**Architecture:** Pattern-based decision engine that analyzes exercise history and suggests next steps (weight/tempo/alternative). Stateless analysis from existing data, minimal new storage.

**Tech Stack:** Vanilla JavaScript (ES6), localStorage, existing BUILD module system

---

## Phase 1: Core Intelligence (Database Modules)

### Task 1: Exercise Metadata Database

**Files:**
- Create: `js/modules/exercise-metadata.js`

**Step 1: Create exercise metadata module with alternatives for all 26 exercises**

```javascript
// js/modules/exercise-metadata.js
export const EXERCISE_METADATA = {
  // UPPER_A exercises
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
  },

  'DB Single Arm Row': {
    muscleGroup: 'back',
    movementType: 'horizontal_pull',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Seal Row (lower weight)', 'Inverted Row'],
      harder: ['Paused Row', 'Slow Tempo Row'],
      different: ['Cable Row', 'Chest-Supported Row']
    }
  },

  'DB Lateral Raises': {
    muscleGroup: 'shoulders',
    movementType: 'isolation',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Seated Lateral Raises', 'Band Lateral Raises'],
      harder: ['Lean-Away Cable Laterals', 'Paused Raises'],
      different: ['Upright Rows', 'Face Pulls']
    }
  },

  // LOWER_A exercises
  'Goblet Squat': {
    muscleGroup: 'legs',
    movementType: 'squat',
    equipment: 'dumbbell',
    difficulty: 1,
    alternatives: {
      easier: ['Bodyweight Squat', 'Box Squat'],
      harder: ['Paused Goblet Squat', 'Tempo Squat'],
      different: ['Leg Press', 'Hack Squat']
    }
  },

  'Romanian Deadlift': {
    muscleGroup: 'hamstrings',
    movementType: 'hinge',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Single-Leg RDL (lighter)', 'Glute Bridge'],
      harder: ['Paused RDL', 'Deficit RDL'],
      different: ['Leg Curl', 'Nordic Curl']
    }
  },

  'DB Calf Raises': {
    muscleGroup: 'calves',
    movementType: 'isolation',
    equipment: 'dumbbell',
    difficulty: 1,
    alternatives: {
      easier: ['Bodyweight Calf Raises', 'Seated Calf Raises'],
      harder: ['Single-Leg Calf Raises', 'Paused Calf Raises'],
      different: ['Machine Calf Raises', 'Standing Calf Raises']
    }
  },

  // UPPER_B exercises
  'Lat Pulldown': {
    muscleGroup: 'back',
    movementType: 'vertical_pull',
    equipment: 'cable',
    difficulty: 2,
    alternatives: {
      easier: ['Band Pulldowns', 'Negative Pull-Ups'],
      harder: ['Pull-Ups', 'Weighted Pull-Ups'],
      different: ['Straight-Arm Pulldown', 'T-Bar Row']
    }
  },

  'DB Shoulder Press': {
    muscleGroup: 'shoulders',
    movementType: 'vertical_press',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Seated Press', 'Machine Press'],
      harder: ['Standing Press', 'Arnold Press'],
      different: ['Barbell Press', 'Cable Press']
    }
  },

  'DB Incline Curl': {
    muscleGroup: 'biceps',
    movementType: 'isolation',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Hammer Curl', 'Cable Curl'],
      harder: ['Paused Curl', 'Slow Tempo Curl'],
      different: ['Barbell Curl', 'Preacher Curl']
    }
  },

  'Overhead DB Extension': {
    muscleGroup: 'triceps',
    movementType: 'isolation',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Tricep Pushdown', 'Close-Grip Push-Up'],
      harder: ['Skull Crushers', 'Weighted Dips'],
      different: ['Cable Extension', 'Rope Pushdown']
    }
  },

  // LOWER_B exercises
  'Hack Squat': {
    muscleGroup: 'legs',
    movementType: 'squat',
    equipment: 'machine',
    difficulty: 2,
    alternatives: {
      easier: ['Leg Press', 'Goblet Squat'],
      harder: ['Barbell Squat', 'Front Squat'],
      different: ['Bulgarian Split Squat', 'Lunges']
    }
  },

  'Leg Curl': {
    muscleGroup: 'hamstrings',
    movementType: 'isolation',
    equipment: 'machine',
    difficulty: 1,
    alternatives: {
      easier: ['Band Curl', 'Swiss Ball Curl'],
      harder: ['Nordic Curl', 'Single-Leg Curl'],
      different: ['RDL', 'Glute-Ham Raise']
    }
  },

  'Leg Extension': {
    muscleGroup: 'quads',
    movementType: 'isolation',
    equipment: 'machine',
    difficulty: 1,
    alternatives: {
      easier: ['Bodyweight Extension', 'Spanish Squat'],
      harder: ['Single-Leg Extension', 'Paused Extension'],
      different: ['Goblet Squat', 'Leg Press']
    }
  },

  // Band exercises
  'Band Chest Fly': {
    muscleGroup: 'chest',
    movementType: 'isolation',
    equipment: 'band',
    difficulty: 1,
    alternatives: {
      easier: ['Lighter band', 'Wall Press'],
      harder: ['Cable Fly', 'DB Fly'],
      different: ['Push-Up Variations', 'Pec Deck']
    }
  },

  'Band Face Pull': {
    muscleGroup: 'shoulders',
    movementType: 'pull',
    equipment: 'band',
    difficulty: 1,
    alternatives: {
      easier: ['Lighter band', 'Band Pull-Apart'],
      harder: ['Cable Face Pull', 'Reverse Fly'],
      different: ['Rear Delt Fly', 'W-Raise']
    }
  },

  'Band Pull-Apart': {
    muscleGroup: 'back',
    movementType: 'isolation',
    equipment: 'band',
    difficulty: 1,
    alternatives: {
      easier: ['Lighter band', 'Scapular Retraction'],
      harder: ['Cable Pull-Apart', 'Band Face Pull'],
      different: ['Reverse Fly', 'Rear Delt Fly']
    }
  },

  'Band Pallof Press': {
    muscleGroup: 'core',
    movementType: 'anti-rotation',
    equipment: 'band',
    difficulty: 2,
    alternatives: {
      easier: ['Lighter band', 'Dead Bug'],
      harder: ['Cable Pallof Press', 'Half-Kneeling Pallof'],
      different: ['Plank Variations', 'Bird Dog']
    }
  },

  'Hanging Knee Raise': {
    muscleGroup: 'core',
    movementType: 'dynamic',
    equipment: 'bodyweight',
    difficulty: 2,
    alternatives: {
      easier: ['Dead Bug', 'Lying Leg Raise'],
      harder: ['Hanging Leg Raise', 'Toes to Bar'],
      different: ['Ab Wheel', 'Cable Crunch']
    }
  },

  'Copenhagen Plank': {
    muscleGroup: 'adductors',
    movementType: 'isometric',
    equipment: 'bodyweight',
    difficulty: 3,
    alternatives: {
      easier: ['Side Plank', 'Adductor Machine'],
      harder: ['Copenhagen Pulse', 'Weighted Copenhagen'],
      different: ['Cable Adduction', 'Sumo Squat']
    }
  },

  // Barbell progressions (unlockable)
  'Barbell Bench Press': {
    muscleGroup: 'chest',
    movementType: 'horizontal_press',
    equipment: 'barbell',
    difficulty: 3,
    alternatives: {
      easier: ['DB Bench Press', 'Floor Press'],
      harder: ['Paused Bench', 'Close-Grip Bench'],
      different: ['Incline Bench', 'Dips']
    }
  },

  'Barbell Back Squat': {
    muscleGroup: 'legs',
    movementType: 'squat',
    equipment: 'barbell',
    difficulty: 3,
    alternatives: {
      easier: ['Goblet Squat', 'Hack Squat'],
      harder: ['Front Squat', 'Pause Squat'],
      different: ['Leg Press', 'Bulgarian Split Squat']
    }
  },

  'Barbell Deadlift': {
    muscleGroup: 'posterior',
    movementType: 'hinge',
    equipment: 'barbell',
    difficulty: 3,
    alternatives: {
      easier: ['RDL', 'Trap Bar Deadlift'],
      harder: ['Deficit Deadlift', 'Paused Deadlift'],
      different: ['Sumo Deadlift', 'Good Mornings']
    }
  },

  // Additional exercises
  'DB Floor Press': {
    muscleGroup: 'chest',
    movementType: 'horizontal_press',
    equipment: 'dumbbell',
    difficulty: 1,
    alternatives: {
      easier: ['Push-Up', 'Incline Push-Up'],
      harder: ['DB Bench Press', 'Paused Floor Press'],
      different: ['Cable Press', 'Machine Press']
    }
  },

  'Cable Seated Row': {
    muscleGroup: 'back',
    movementType: 'horizontal_pull',
    equipment: 'cable',
    difficulty: 2,
    alternatives: {
      easier: ['Band Row', 'Machine Row'],
      harder: ['Paused Row', 'Single-Arm Row'],
      different: ['DB Row', 'T-Bar Row']
    }
  },

  'Plank': {
    muscleGroup: 'core',
    movementType: 'isometric',
    equipment: 'bodyweight',
    difficulty: 1,
    alternatives: {
      easier: ['Knee Plank', 'Incline Plank'],
      harder: ['Weighted Plank', 'RKC Plank'],
      different: ['Dead Bug', 'Pallof Press']
    }
  },

  'DB Goblet Squat': {
    muscleGroup: 'legs',
    movementType: 'squat',
    equipment: 'dumbbell',
    difficulty: 1,
    alternatives: {
      easier: ['Bodyweight Squat', 'Box Squat'],
      harder: ['Paused Goblet Squat', 'Tempo Squat'],
      different: ['Leg Press', 'Hack Squat']
    }
  }
};

export function findAlternative(exerciseKey, reason, painIntensity = 'moderate') {
  const metadata = EXERCISE_METADATA[exerciseKey];

  if (!metadata) {
    console.warn(`No metadata found for exercise: ${exerciseKey}`);
    return null;
  }

  if (reason === 'pain') {
    // Easier variation (reduced ROM, lower difficulty)
    return metadata.alternatives.easier[0];
  }

  if (reason === 'plateau') {
    // Different equipment (new stimulus)
    return metadata.alternatives.different[0];
  }

  return null;
}
```

**Step 2: Verify module exports work**

Test in browser console:
```javascript
import { EXERCISE_METADATA, findAlternative } from './js/modules/exercise-metadata.js';
console.log(findAlternative('DB Flat Bench Press', 'pain'));
// Expected: "Floor Press"
```

**Step 3: Commit**

```bash
git add js/modules/exercise-metadata.js
git commit -m "feat: add exercise metadata database with alternatives

- 26 BUILD exercises mapped to easier/harder/different alternatives
- Pattern-based alternative selection (pain vs plateau)
- Metadata includes muscle group, movement type, equipment, difficulty

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Tempo Guidance Database

**Files:**
- Create: `js/modules/tempo-guidance.js`

**Step 1: Create tempo guidance module for all 26 exercises**

```javascript
// js/modules/tempo-guidance.js
export const TEMPO_GUIDANCE = {
  // Pressing movements - slow ECCENTRIC (lowering)
  'DB Flat Bench Press': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Chest stretch under load = more growth',
    cue: 'Normal speed up ↑ | Slow controlled down ↓ (3 sec)'
  },

  'DB Shoulder Press': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Control builds shoulder strength',
    cue: 'Press up ↑ (1 sec) | Slow lower ↓ (3 sec)'
  },

  'DB Lateral Raises': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Time under tension for delt growth',
    cue: 'Quick raise ↑ | Slow lower ↓ (3 sec)'
  },

  'DB Floor Press': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Eccentric strength builds pressing power',
    cue: 'Normal press ↑ | Slow lower ↓ (3 sec)'
  },

  // Pulling movements - slow CONCENTRIC + PAUSE
  'DB Single Arm Row': {
    phase: 'concentric',
    instruction: 'Pull slowly to hip, pause 2 seconds at squeeze',
    why: 'Back muscle contraction is key',
    cue: 'Slow pull → (2 sec) | Hold squeeze (2 sec) | Control release'
  },

  'Lat Pulldown': {
    phase: 'concentric',
    instruction: 'Pull down slowly, pause 2 seconds at bottom',
    why: 'Lat activation through full ROM',
    cue: 'Slow pull down → (2 sec) | Pause (2 sec) | Slow return'
  },

  'Cable Seated Row': {
    phase: 'concentric',
    instruction: 'Pull slowly to chest, pause 2 seconds at squeeze',
    why: 'Back muscle contraction is key',
    cue: 'Slow pull → (2 sec) | Hold squeeze (2 sec) | Control release'
  },

  // Isolation curls - slow ECCENTRIC
  'DB Incline Curl': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Eccentric builds bicep strength',
    cue: 'Curl up ↑ (1 sec) | Slow lower ↓ (3 sec)'
  },

  'Overhead DB Extension': {
    phase: 'eccentric',
    instruction: 'Lower dumbbell slowly over 3 seconds',
    why: 'Tricep stretch under tension',
    cue: 'Extend up ↑ (1 sec) | Slow lower ↓ (3 sec)'
  },

  // Leg movements - slow ECCENTRIC (safety + growth)
  'Goblet Squat': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds (knee-friendly)',
    why: 'Control prevents knee stress',
    cue: 'Controlled descent ↓ (3 sec) | Explosive drive ↑'
  },

  'DB Goblet Squat': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds (knee-friendly)',
    why: 'Control prevents knee stress',
    cue: 'Controlled descent ↓ (3 sec) | Explosive drive ↑'
  },

  'Hack Squat': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds (knee-friendly)',
    why: 'Control prevents knee stress',
    cue: 'Controlled descent ↓ (3 sec) | Explosive drive ↑'
  },

  'Romanian Deadlift': {
    phase: 'eccentric',
    instruction: 'Lower barbell/dumbbells slowly over 3 seconds',
    why: 'Hamstring stretch under load',
    cue: 'Control descent ↓ (3 sec) | Drive hips forward ↑'
  },

  'Leg Curl': {
    phase: 'both',
    instruction: 'Curl slowly up (2s), lower slowly down (3s)',
    why: 'Hamstrings work both ways',
    cue: 'Slow curl ↑ (2 sec) | Slow lower ↓ (3 sec)'
  },

  'Leg Extension': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds',
    why: 'Knee-friendly quad work',
    cue: 'Extend up ↑ (1 sec) | Slow lower ↓ (3 sec)'
  },

  'DB Calf Raises': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds',
    why: 'Calf stretch under load',
    cue: 'Raise up ↑ (1 sec) | Slow lower ↓ (3 sec)'
  },

  // Core - ISOMETRIC (max tension)
  'Plank': {
    phase: 'isometric',
    instruction: 'Maximum tension throughout, squeeze everything',
    why: 'RKC technique = better activation',
    cue: 'Squeeze glutes, brace core, pull elbows to toes'
  },

  'Copenhagen Plank': {
    phase: 'isometric',
    instruction: 'Maximum tension, squeeze adductors hard',
    why: 'Isometric strength builds stability',
    cue: 'Squeeze top leg into bench, brace core'
  },

  'Hanging Knee Raise': {
    phase: 'concentric',
    instruction: 'Slow controlled raise (2 sec), pause at top (1 sec)',
    why: 'Core control = better activation',
    cue: 'Slow raise ↑ (2 sec) | Pause (1 sec) | Control lower ↓'
  },

  // Band exercises - constant tension
  'Band Chest Fly': {
    phase: 'eccentric',
    instruction: 'Slow controlled return over 3 seconds',
    why: 'Constant tension through ROM',
    cue: 'Fly forward ↑ (1 sec) | Slow return ↓ (3 sec)'
  },

  'Band Face Pull': {
    phase: 'concentric',
    instruction: 'Pull slowly, pause 2 seconds at peak contraction',
    why: 'Rear delt activation key',
    cue: 'Slow pull → (2 sec) | Pause (2 sec) | Slow return'
  },

  'Band Pull-Apart': {
    phase: 'concentric',
    instruction: 'Pull slowly, pause 2 seconds at full stretch',
    why: 'Scapular retraction strength',
    cue: 'Slow pull → (2 sec) | Pause (2 sec) | Slow return'
  },

  'Band Pallof Press': {
    phase: 'isometric',
    instruction: 'Hold extended position 3 seconds, resist rotation',
    why: 'Anti-rotation core strength',
    cue: 'Press out → Hold (3 sec) | Control return'
  },

  // Barbell progressions
  'Barbell Bench Press': {
    phase: 'eccentric',
    instruction: 'Lower barbell slowly over 2-3 seconds',
    why: 'Control = strength + safety',
    cue: 'Normal press ↑ | Slow controlled lower ↓ (2-3 sec)'
  },

  'Barbell Back Squat': {
    phase: 'eccentric',
    instruction: 'Descend slowly over 3 seconds',
    why: 'Control = knee safety + leg strength',
    cue: 'Controlled descent ↓ (3 sec) | Explosive drive ↑'
  },

  'Barbell Deadlift': {
    phase: 'eccentric',
    instruction: 'Lower barbell slowly over 2-3 seconds',
    why: 'Control = back safety',
    cue: 'Hip hinge back ↓ (2-3 sec) | Drive hips forward ↑'
  }
};

export function getTempoGuidance(exerciseKey) {
  return TEMPO_GUIDANCE[exerciseKey] || null;
}
```

**Step 2: Verify module exports**

Test in browser console:
```javascript
import { getTempoGuidance } from './js/modules/tempo-guidance.js';
console.log(getTempoGuidance('DB Flat Bench Press'));
// Expected: { phase: 'eccentric', instruction: '...', why: '...', cue: '...' }
```

**Step 3: Commit**

```bash
git add js/modules/tempo-guidance.js
git commit -m "feat: add tempo guidance database for all exercises

- Exercise-specific tempo strategies (eccentric/concentric/isometric)
- Pressing = slow eccentric, pulling = slow concentric + pause
- Includes visual cues and rationale for each exercise

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Form Cues Database

**Files:**
- Create: `js/modules/form-cues.js`

**Step 1: Create form cues module for all 26 exercises**

```javascript
// js/modules/form-cues.js
export const FORM_CUES = {
  'DB Flat Bench Press': {
    setup: ['Retract shoulder blades', 'Feet flat on floor', 'Arch lower back'],
    execution: ['Elbows at 45° (not 90°)', 'Control descent (2-3 sec)', 'Press to full lockout'],
    mistakes: ['Dumbbells drifting apart', 'Bouncing off chest', 'Shoulders rolling forward']
  },

  'DB Single Arm Row': {
    setup: ['Brace on bench', 'Flat back (not rounded)', 'Weight hangs straight down'],
    execution: ['Pull to hip (not chest)', 'Elbow stays tight to body', 'Squeeze at top (2 sec)'],
    mistakes: ['Rotating torso', 'Using momentum', 'Elbow flaring out']
  },

  'DB Lateral Raises': {
    setup: ['Slight forward lean', 'Dumbbells at sides', 'Slight bend in elbows'],
    execution: ['Lead with elbows (not hands)', 'Raise to shoulder height', 'Slow controlled descent'],
    mistakes: ['Using momentum/swinging', 'Shrugging shoulders', 'Going above shoulder height']
  },

  'Goblet Squat': {
    setup: ['Hold weight at chest', 'Feet shoulder-width', 'Toes slightly out'],
    execution: ['Descend slowly (3 sec)', 'Knees track over toes', 'Depth to comfort'],
    mistakes: ['Knees caving in', 'Heels lifting', 'Rounding lower back']
  },

  'Romanian Deadlift': {
    setup: ['Soft knees (not locked)', 'Weight close to body', 'Chest up'],
    execution: ['Hip hinge (not squat)', 'Feel hamstring stretch', 'Drive hips forward'],
    mistakes: ['Rounding back', 'Bending knees too much', 'Weight drifting forward']
  },

  'DB Calf Raises': {
    setup: ['Balls of feet on edge', 'Dumbbells at sides', 'Core engaged'],
    execution: ['Full stretch at bottom', 'Drive through big toe', 'Hold top position (1 sec)'],
    mistakes: ['Bouncing at bottom', 'Not full ROM', 'Using momentum']
  },

  'Lat Pulldown': {
    setup: ['Grip slightly wider than shoulders', 'Chest up', 'Slight lean back (10-15°)'],
    execution: ['Pull to upper chest', 'Elbows down and back', 'Squeeze shoulder blades'],
    mistakes: ['Leaning back too far', 'Using momentum', 'Not full ROM']
  },

  'DB Shoulder Press': {
    setup: ['Dumbbells at shoulder height', 'Core braced', 'Neutral spine'],
    execution: ['Press straight up', 'Full lockout at top', 'Control descent'],
    mistakes: ['Arching back', 'Pressing forward (not up)', 'Elbows flaring wide']
  },

  'DB Incline Curl': {
    setup: ['Back against bench', 'Arms hanging straight', 'Palms forward'],
    execution: ['Curl without moving upper arm', 'Squeeze at top', 'Slow controlled descent'],
    mistakes: ['Swinging arms', 'Moving elbows forward', 'Using momentum']
  },

  'Overhead DB Extension': {
    setup: ['Dumbbell overhead', 'Elbows pointing forward', 'Core braced'],
    execution: ['Lower behind head (3 sec)', 'Keep elbows still', 'Full extension at top'],
    mistakes: ['Elbows flaring out', 'Arching back', 'Not full ROM']
  },

  'Hack Squat': {
    setup: ['Feet shoulder-width on platform', 'Back against pad', 'Core braced'],
    execution: ['Descend slowly (3 sec)', 'Knees track over toes', 'Drive through heels'],
    mistakes: ['Knees caving in', 'Bouncing at bottom', 'Incomplete ROM']
  },

  'Leg Curl': {
    setup: ['Pad on lower calves', 'Hips pressed to bench', 'Grip handles'],
    execution: ['Curl slowly (2 sec)', 'Squeeze at top', 'Slow descent (3 sec)'],
    mistakes: ['Lifting hips', 'Using momentum', 'Not full ROM']
  },

  'Leg Extension': {
    setup: ['Back against pad', 'Pad on lower shins', 'Grip handles'],
    execution: ['Extend slowly', 'Pause at lockout (1 sec)', 'Slow descent (3 sec)'],
    mistakes: ['Using momentum', 'Incomplete lockout', 'Jerking weight']
  },

  'Band Chest Fly': {
    setup: ['Band at chest height', 'Slight forward lean', 'Arms extended'],
    execution: ['Bring hands together (1 sec)', 'Slow controlled return (3 sec)', 'Constant tension'],
    mistakes: ['Bending elbows too much', 'Losing tension', 'Using momentum']
  },

  'Band Face Pull': {
    setup: ['Band at face height', 'Overhand grip', 'Step back for tension'],
    execution: ['Pull to face (2 sec)', 'Elbows high', 'Pause at peak (2 sec)'],
    mistakes: ['Pulling too low', 'Not external rotation', 'Using momentum']
  },

  'Band Pull-Apart': {
    setup: ['Overhand grip', 'Arms at shoulder height', 'Tension in band'],
    execution: ['Pull apart to chest (2 sec)', 'Pause (2 sec)', 'Slow return'],
    mistakes: ['Arms drifting up/down', 'Not full ROM', 'Losing tension']
  },

  'Band Pallof Press': {
    setup: ['Band at chest height', 'Perpendicular to anchor', 'Hands at chest'],
    execution: ['Press straight out', 'Hold (3 sec)', 'Resist rotation', 'Control return'],
    mistakes: ['Rotating torso', 'Arms not fully extended', 'Losing core brace']
  },

  'Hanging Knee Raise': {
    setup: ['Dead hang from bar', 'Shoulders engaged', 'Core braced'],
    execution: ['Raise knees slowly (2 sec)', 'Pause at top (1 sec)', 'Control descent'],
    mistakes: ['Swinging', 'Using momentum', 'Not engaging core']
  },

  'Copenhagen Plank': {
    setup: ['Side plank position', 'Top leg on bench', 'Bottom leg straight'],
    execution: ['Squeeze adductors', 'Hold straight line', 'Brace core'],
    mistakes: ['Hips sagging', 'Not squeezing adductors', 'Losing straight line']
  },

  'Barbell Bench Press': {
    setup: ['Retract shoulder blades', 'Feet flat and driving', 'Arch lower back'],
    execution: ['Lower to mid-chest (2-3 sec)', 'Elbows at 45°', 'Drive bar up explosively'],
    mistakes: ['Bar path not vertical', 'Elbows flaring', 'Bouncing off chest']
  },

  'Barbell Back Squat': {
    setup: ['Bar on upper traps', 'Hands outside shoulders', 'Core braced'],
    execution: ['Descend slowly (3 sec)', 'Knees track over toes', 'Drive through heels'],
    mistakes: ['Good morning squat', 'Knees caving', 'Forward lean']
  },

  'Barbell Deadlift': {
    setup: ['Bar over mid-foot', 'Shins to bar', 'Flat back'],
    execution: ['Hinge at hips', 'Drive through heels', 'Lock out hips and knees together'],
    mistakes: ['Rounding back', 'Bar drifting forward', 'Hitching at lockout']
  },

  'DB Floor Press': {
    setup: ['Lie on floor', 'Knees bent', 'Retract shoulder blades'],
    execution: ['Lower until triceps touch floor', 'Pause (1 sec)', 'Press up'],
    mistakes: ['Bouncing elbows', 'Incomplete ROM', 'Shoulders rolling forward']
  },

  'Cable Seated Row': {
    setup: ['Feet on footrests', 'Slight lean back (10-15°)', 'Chest up'],
    execution: ['Pull to lower chest', 'Squeeze shoulder blades (2 sec)', 'Slow return'],
    mistakes: ['Using momentum/rocking', 'Elbows flaring', 'Not squeezing']
  },

  'Plank': {
    setup: ['Forearms on ground', 'Elbows under shoulders', 'Body straight'],
    execution: ['Squeeze glutes', 'Brace core', 'Pull elbows to toes (tension)'],
    mistakes: ['Hips sagging', 'Not bracing core', 'Holding breath']
  },

  'DB Goblet Squat': {
    setup: ['Hold weight at chest', 'Feet shoulder-width', 'Toes slightly out'],
    execution: ['Descend slowly (3 sec)', 'Knees track over toes', 'Depth to comfort'],
    mistakes: ['Knees caving in', 'Heels lifting', 'Rounding lower back']
  }
};

export function getFormCues(exerciseKey) {
  return FORM_CUES[exerciseKey] || null;
}
```

**Step 2: Verify module exports**

Test in browser console:
```javascript
import { getFormCues } from './js/modules/form-cues.js';
console.log(getFormCues('DB Flat Bench Press'));
// Expected: { setup: [...], execution: [...], mistakes: [...] }
```

**Step 3: Commit**

```bash
git add js/modules/form-cues.js
git commit -m "feat: add form cues database for all exercises

- Setup, execution, and common mistakes for each exercise
- Collapsible UI to prevent screen clutter
- High ROI: prevents injury, enables progression

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Smart Progression Engine

### Task 4: Pattern Detection Functions

**Files:**
- Create: `js/modules/smart-progression.js`

**Step 1: Create pattern detection functions**

```javascript
// js/modules/smart-progression.js

/**
 * Detects plateau pattern (same weight for 3+ workouts)
 * @param {Array} history - Exercise history (most recent first)
 * @param {number} minWorkouts - Minimum workouts to consider plateau
 * @returns {boolean}
 */
export function detectPlateau(history, minWorkouts = 3) {
  if (!history || history.length < minWorkouts) {
    return false;
  }

  const recentWorkouts = history.slice(0, minWorkouts);
  const firstWeight = recentWorkouts[0]?.sets?.[0]?.weight;

  if (firstWeight === undefined || firstWeight === null) {
    return false;
  }

  // Check if all recent workouts used same weight
  return recentWorkouts.every(workout => {
    const workoutWeight = workout.sets?.[0]?.weight;
    return workoutWeight === firstWeight;
  });
}

/**
 * Detects regression pattern (weight/reps decreased from last workout)
 * @param {Array} history - Exercise history (most recent first)
 * @returns {boolean}
 */
export function detectRegression(history) {
  if (!history || history.length < 2) {
    return false;
  }

  const lastWorkout = history[0];
  const previousWorkout = history[1];

  const lastWeight = lastWorkout?.sets?.[0]?.weight;
  const lastReps = lastWorkout?.sets?.[0]?.reps;
  const prevWeight = previousWorkout?.sets?.[0]?.weight;
  const prevReps = previousWorkout?.sets?.[0]?.reps;

  if (lastWeight === undefined || prevWeight === undefined) {
    return false;
  }

  // Weight decreased OR (same weight but reps decreased by 2+)
  return lastWeight < prevWeight ||
         (lastWeight === prevWeight && lastReps < prevReps - 1);
}

/**
 * Checks if user hit top of rep range
 * @param {Array} history - Exercise history
 * @param {number} topReps - Top of rep range (default 12)
 * @returns {boolean}
 */
export function hitTopOfReps(history, topReps = 12) {
  if (!history || history.length === 0) {
    return false;
  }

  const lastWorkout = history[0];
  const avgReps = lastWorkout.sets.reduce((sum, set) => sum + set.reps, 0) / lastWorkout.sets.length;

  return avgReps >= topReps;
}

/**
 * Checks if weight can be increased (detects weight gaps)
 * @param {Array} history - Exercise history
 * @returns {boolean}
 */
export function canIncreaseWeight(history) {
  if (!history || history.length === 0) {
    return true; // Assume can increase if no history
  }

  const lastWorkout = history[0];
  const lastWeight = lastWorkout.sets[0].weight;
  const lastReps = lastWorkout.sets[0].reps;

  // If last attempt at higher weight failed (< 8 reps), weight gap exists
  if (history.length >= 2) {
    const prevWorkout = history[1];
    const prevWeight = prevWorkout.sets[0].weight;

    if (lastWeight > prevWeight && lastReps < 8) {
      return false; // Weight gap detected
    }
  }

  return true; // Can increase
}

/**
 * Gets next available weight from user's history
 * @param {number} currentWeight - Current weight
 * @param {Array} allHistory - All exercise history across exercises
 * @returns {number}
 */
export function getNextAvailableWeight(currentWeight, allHistory = []) {
  // Collect all unique weights user has logged
  const uniqueWeights = new Set();

  allHistory.forEach(workout => {
    workout.sets?.forEach(set => {
      if (set.weight) uniqueWeights.add(set.weight);
    });
  });

  const sortedWeights = Array.from(uniqueWeights).sort((a, b) => a - b);

  // Find next weight user has used before
  const nextUsed = sortedWeights.find(w => w > currentWeight);

  if (nextUsed) {
    return nextUsed;
  }

  // Otherwise suggest standard increment
  return currentWeight + 2.5;
}
```

**Step 2: Write tests for pattern detection**

Create test file (manual testing):
```javascript
// Test detectPlateau
const plateauHistory = [
  { sets: [{ weight: 20, reps: 12 }] },
  { sets: [{ weight: 20, reps: 12 }] },
  { sets: [{ weight: 20, reps: 12 }] }
];
console.assert(detectPlateau(plateauHistory) === true, 'Plateau detection failed');

// Test detectRegression
const regressionHistory = [
  { sets: [{ weight: 20, reps: 10 }] },
  { sets: [{ weight: 22.5, reps: 12 }] }
];
console.assert(detectRegression(regressionHistory) === true, 'Regression detection failed');

// Test hitTopOfReps
const topRepsHistory = [
  { sets: [{ weight: 20, reps: 12 }, { weight: 20, reps: 12 }] }
];
console.assert(hitTopOfReps(topRepsHistory) === true, 'Top of reps detection failed');
```

**Step 3: Commit**

```bash
git add js/modules/smart-progression.js
git commit -m "feat: add pattern detection functions

- detectPlateau: same weight 3+ workouts
- detectRegression: weight/reps decreased
- hitTopOfReps: avg reps >= top of range
- canIncreaseWeight: detects weight gaps
- getNextAvailableWeight: adaptive weight detection

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5: Pain Analysis Functions

**Files:**
- Modify: `js/modules/smart-progression.js`

**Step 1: Add pain analysis functions**

Add to `js/modules/smart-progression.js`:

```javascript
/**
 * Checks if exercise has recent pain reported
 * @param {string} exerciseKey - Exercise key
 * @param {Object} painHistory - Pain history from storage
 * @param {number} recentWorkouts - How many recent workouts to check
 * @returns {Object|null} Pain info or null
 */
export function getRecentPain(exerciseKey, painHistory, recentWorkouts = 2) {
  if (!painHistory || !painHistory[exerciseKey]) {
    return null;
  }

  const painEntries = painHistory[exerciseKey];

  // Sort by date (most recent first)
  const sortedEntries = painEntries.sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  // Check most recent workouts
  const recentEntries = sortedEntries.slice(0, recentWorkouts);

  if (recentEntries.length === 0) {
    return null;
  }

  // Return most recent pain entry
  return recentEntries[0];
}

/**
 * Checks if pain is persistent (2+ workouts)
 * @param {string} exerciseKey - Exercise key
 * @param {Object} painHistory - Pain history from storage
 * @returns {boolean}
 */
export function isPersistentPain(exerciseKey, painHistory) {
  const recentPain = getRecentPain(exerciseKey, painHistory, 2);

  if (!recentPain) {
    return false;
  }

  // Check if last 2 workouts both had pain
  const painEntries = painHistory[exerciseKey];
  const sortedEntries = painEntries.sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  return sortedEntries.length >= 2;
}

/**
 * Counts pain-free workouts since switching alternative
 * @param {string} exerciseKey - Exercise key
 * @param {Object} painHistory - Pain history from storage
 * @param {string} switchDate - Date alternative was switched
 * @returns {number}
 */
export function countPainFreeWorkouts(exerciseKey, painHistory, switchDate) {
  if (!painHistory || !painHistory[exerciseKey]) {
    return 0;
  }

  const painEntries = painHistory[exerciseKey];
  const switchTimestamp = new Date(switchDate).getTime();

  // Filter entries after switch date
  const entriesAfterSwitch = painEntries.filter(entry =>
    new Date(entry.date).getTime() > switchTimestamp
  );

  // Count workouts without pain
  return entriesAfterSwitch.filter(entry => !entry.intensity || entry.intensity === 'none').length;
}
```

**Step 2: Commit**

```bash
git add js/modules/smart-progression.js
git commit -m "feat: add pain analysis functions

- getRecentPain: checks recent pain reports
- isPersistentPain: detects pain 2+ workouts
- countPainFreeWorkouts: tracks recovery progress

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Suggestion Generation - Pain-Based

**Files:**
- Modify: `js/modules/smart-progression.js`

**Step 1: Add pain-based suggestion function**

Add to `js/modules/smart-progression.js`:

```javascript
import { findAlternative } from './exercise-metadata.js';

/**
 * Generates pain-based suggestion (progressive escalation)
 * @param {string} exerciseKey - Exercise key
 * @param {Object} painHistory - Pain history from storage
 * @param {Array} exerciseHistory - Exercise workout history
 * @returns {Object} Suggestion object
 */
export function handlePainBasedSuggestion(exerciseKey, painHistory, exerciseHistory) {
  const recentPain = getRecentPain(exerciseKey, painHistory, 1);

  if (!recentPain) {
    return null;
  }

  const lastWorkout = exerciseHistory[0];
  const lastWeight = lastWorkout?.sets?.[0]?.weight || 0;

  // MILD PAIN: Warning only
  if (recentPain.intensity === 'mild') {
    return {
      type: 'PAIN_WARNING',
      message: `Mild ${recentPain.location || 'discomfort'} reported last workout`,
      suggestion: 'Monitor form, reduce weight if pain increases',
      urgency: 'low',
      icon: 'ℹ️'
    };
  }

  // MODERATE PAIN (first occurrence): Reduce weight
  if (recentPain.intensity === 'moderate' && !isPersistentPain(exerciseKey, painHistory)) {
    const reducedWeight = Math.round(lastWeight * 0.8 * 10) / 10; // Round to 1 decimal

    return {
      type: 'REDUCE_WEIGHT',
      suggestedWeight: reducedWeight,
      message: `Try ${reducedWeight}kg (was ${lastWeight}kg) - moderate pain detected`,
      reason: 'Lighter weight may resolve issue',
      urgency: 'medium',
      icon: '⚠️'
    };
  }

  // MODERATE PAIN (persistent 2+): Switch exercise
  if (recentPain.intensity === 'moderate' && isPersistentPain(exerciseKey, painHistory)) {
    const alternative = findAlternative(exerciseKey, 'pain', 'moderate');

    return {
      type: 'TRY_ALTERNATIVE',
      alternative: alternative,
      message: `Moderate pain persists - switch to ${alternative}`,
      reason: 'Pain persists despite weight reduction',
      autoApply: true,
      urgency: 'high',
      icon: '⚠️'
    };
  }

  // SEVERE PAIN: Immediate switch
  if (recentPain.intensity === 'severe') {
    const alternative = findAlternative(exerciseKey, 'pain', 'severe');

    return {
      type: 'IMMEDIATE_ALTERNATIVE',
      alternative: alternative,
      message: `Severe pain - switching to ${alternative} immediately`,
      warning: 'Consider rest day or medical consultation',
      autoApply: true,
      urgency: 'critical',
      icon: '🚨'
    };
  }

  return null;
}
```

**Step 2: Test pain-based suggestions**

Test scenarios:
```javascript
// Mild pain
const mildPainHistory = {
  'UPPER_A - DB Flat Bench Press': [
    { date: '2026-02-09', intensity: 'mild', location: 'shoulder' }
  ]
};
const suggestion = handlePainBasedSuggestion('UPPER_A - DB Flat Bench Press', mildPainHistory, history);
console.assert(suggestion.type === 'PAIN_WARNING', 'Mild pain should return warning');

// Moderate pain (first)
const moderatePainHistory = {
  'UPPER_A - DB Flat Bench Press': [
    { date: '2026-02-09', intensity: 'moderate', location: 'shoulder' }
  ]
};
const moderateSuggestion = handlePainBasedSuggestion('UPPER_A - DB Flat Bench Press', moderatePainHistory, history);
console.assert(moderateSuggestion.type === 'REDUCE_WEIGHT', 'Moderate pain should reduce weight');
console.assert(moderateSuggestion.suggestedWeight === 20, 'Should be 20% reduction');
```

**Step 3: Commit**

```bash
git add js/modules/smart-progression.js
git commit -m "feat: add pain-based suggestion generation

- Progressive escalation: mild → moderate → severe
- Mild: warning only
- Moderate (first): reduce weight 20%
- Moderate (persistent): switch alternative
- Severe: immediate switch + rest warning

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Suggestion Generation - Weight Increase

**Files:**
- Modify: `js/modules/smart-progression.js`

**Step 1: Add weight increase suggestion**

Add to `js/modules/smart-progression.js`:

```javascript
/**
 * Suggests weight increase (hit top of reps, can progress)
 * @param {Array} exerciseHistory - Exercise history
 * @param {Array} allHistory - All exercise history (for adaptive weight)
 * @returns {Object} Suggestion object
 */
export function suggestWeightIncrease(exerciseHistory, allHistory = []) {
  const lastWorkout = exerciseHistory[0];
  const lastWeight = lastWorkout.sets[0].weight;
  const avgReps = lastWorkout.sets.reduce((sum, set) => sum + set.reps, 0) / lastWorkout.sets.length;
  const avgRir = lastWorkout.sets.reduce((sum, set) => sum + set.rir, 0) / lastWorkout.sets.length;

  const nextWeight = getNextAvailableWeight(lastWeight, allHistory);
  const increase = nextWeight - lastWeight;

  return {
    type: 'INCREASE_WEIGHT',
    suggestedWeight: nextWeight,
    message: `Try ${nextWeight}kg today (+${increase}kg)`,
    reason: `You hit top of rep range with good RIR (${avgRir})`,
    urgency: 'low',
    icon: '💡'
  };
}
```

**Step 2: Test weight increase**

```javascript
const history = [
  { sets: [
    { weight: 20, reps: 12, rir: 2 },
    { weight: 20, reps: 12, rir: 2 },
    { weight: 20, reps: 11, rir: 2 }
  ]}
];

const suggestion = suggestWeightIncrease(history);
console.assert(suggestion.suggestedWeight === 22.5, 'Should suggest 22.5kg');
console.assert(suggestion.type === 'INCREASE_WEIGHT', 'Should be weight increase');
```

**Step 3: Commit**

```bash
git add js/modules/smart-progression.js
git commit -m "feat: add weight increase suggestion

- Suggests next weight when top of reps hit
- Uses adaptive weight detection
- Includes reason and RIR context

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Suggestion Generation - Tempo Progression

**Files:**
- Modify: `js/modules/smart-progression.js`

**Step 1: Add tempo progression suggestion**

Add to `js/modules/smart-progression.js`:

```javascript
import { getTempoGuidance } from './tempo-guidance.js';

/**
 * Suggests tempo progression (weight gap detected)
 * @param {string} exerciseKey - Exercise key
 * @param {Array} exerciseHistory - Exercise history
 * @returns {Object} Suggestion object
 */
export function suggestTempoProgression(exerciseKey, exerciseHistory) {
  const lastWorkout = exerciseHistory[0];
  const lastWeight = lastWorkout.sets[0].weight;

  // Check if this is a failed weight jump
  let targetWeight = lastWeight + 2.5;
  let buildingStrength = false;

  if (exerciseHistory.length >= 2) {
    const prevWorkout = exerciseHistory[1];
    const prevWeight = prevWorkout.sets[0].weight;

    if (lastWeight > prevWeight && lastWorkout.sets[0].reps < 8) {
      // Failed jump detected
      targetWeight = lastWeight;
      buildingStrength = true;
    }
  }

  const tempoGuidance = getTempoGuidance(exerciseKey);

  if (!tempoGuidance) {
    return {
      type: 'TRY_TEMPO',
      suggestedWeight: lastWeight,
      message: `Try slow tempo at ${lastWeight}kg`,
      reason: 'Building strength for next weight jump',
      urgency: 'medium',
      icon: '💡'
    };
  }

  return {
    type: 'TRY_TEMPO',
    suggestedWeight: buildingStrength ? lastWeight - 2.5 : lastWeight,
    message: buildingStrength ?
      `Build reps at ${lastWeight - 2.5}kg with slow tempo` :
      `Try slow tempo at ${lastWeight}kg today`,
    reason: buildingStrength ?
      `Weight gap detected - building strength for ${targetWeight}kg` :
      'Building strength for next weight jump',
    tempoGuidance: tempoGuidance,
    urgency: 'medium',
    icon: '📖'
  };
}
```

**Step 2: Test tempo suggestion**

```javascript
const tempoHistory = [
  { sets: [{ weight: 12.5, reps: 6, rir: 0 }] }, // Failed jump
  { sets: [{ weight: 10, reps: 12, rir: 2 }] }
];

const suggestion = suggestTempoProgression('DB Flat Bench Press', tempoHistory);
console.assert(suggestion.type === 'TRY_TEMPO', 'Should suggest tempo');
console.assert(suggestion.suggestedWeight === 10, 'Should go back to 10kg');
console.assert(suggestion.tempoGuidance !== null, 'Should include tempo guidance');
```

**Step 3: Commit**

```bash
git add js/modules/smart-progression.js
git commit -m "feat: add tempo progression suggestion

- Detects weight gap (failed jump)
- Suggests tempo work at previous weight
- Includes exercise-specific tempo guidance

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 9: Suggestion Generation - Alternative & Continue

**Files:**
- Modify: `js/modules/smart-progression.js`

**Step 1: Add plateau alternative and continue suggestions**

Add to `js/modules/smart-progression.js`:

```javascript
/**
 * Suggests alternative exercise (plateau detected)
 * @param {string} exerciseKey - Exercise key
 * @param {string} reason - Reason for alternative ('plateau')
 * @returns {Object} Suggestion object
 */
export function suggestAlternative(exerciseKey, reason) {
  const alternative = findAlternative(exerciseKey, reason);

  if (!alternative) {
    return {
      type: 'PLATEAU_WARNING',
      message: 'Plateau detected (same weight 3+ workouts)',
      suggestion: 'Consider deload or try different approach',
      urgency: 'medium',
      icon: '⚠️'
    };
  }

  return {
    type: 'TRY_ALTERNATIVE',
    alternative: alternative,
    message: `Try ${alternative} (different stimulus)`,
    reason: 'Plateau detected - new stimulus may help break through',
    autoApply: false,
    urgency: 'medium',
    icon: '💡'
  };
}

/**
 * Suggests recovery check (regression detected)
 * @param {Array} exerciseHistory - Exercise history
 * @returns {Object} Suggestion object
 */
export function suggestRecoveryCheck(exerciseHistory) {
  const lastWorkout = exerciseHistory[0];
  const prevWorkout = exerciseHistory[1];

  return {
    type: 'RECOVERY_WARNING',
    message: 'Strength decreased from last workout',
    suggestion: 'Check recovery: sleep, nutrition, stress. Consider deload.',
    lastWeight: lastWorkout.sets[0].weight,
    prevWeight: prevWorkout.sets[0].weight,
    urgency: 'medium',
    icon: '⬇️'
  };
}

/**
 * Suggests continuing current approach
 * @param {Array} exerciseHistory - Exercise history
 * @returns {Object} Suggestion object
 */
export function suggestContinue(exerciseHistory) {
  const lastWorkout = exerciseHistory[0];
  const lastWeight = lastWorkout.sets[0].weight;
  const avgReps = lastWorkout.sets.reduce((sum, set) => sum + set.reps, 0) / lastWorkout.sets.length;

  return {
    type: 'CONTINUE',
    message: `Continue ${lastWeight}kg, aim for ${Math.ceil(avgReps) + 1} reps`,
    reason: 'Building reps before weight increase',
    urgency: 'low',
    icon: '📊'
  };
}
```

**Step 2: Test alternative and continue**

```javascript
// Test plateau alternative
const plateauSuggestion = suggestAlternative('DB Flat Bench Press', 'plateau');
console.assert(plateauSuggestion.type === 'TRY_ALTERNATIVE', 'Should suggest alternative');
console.assert(plateauSuggestion.alternative === 'Cable Chest Press', 'Should suggest different stimulus');

// Test continue
const continueHistory = [
  { sets: [{ weight: 20, reps: 10, rir: 2 }] }
];
const continueSuggestion = suggestContinue(continueHistory);
console.assert(continueSuggestion.type === 'CONTINUE', 'Should suggest continue');
```

**Step 3: Commit**

```bash
git add js/modules/smart-progression.js
git commit -m "feat: add alternative and continue suggestions

- suggestAlternative: plateau detection
- suggestRecoveryCheck: regression warning
- suggestContinue: default progression

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 10: Core Decision Engine Integration

**Files:**
- Modify: `js/modules/smart-progression.js`

**Step 1: Add main getSuggestion function**

Add to `js/modules/smart-progression.js`:

```javascript
/**
 * Main suggestion engine - priority-based decision system
 * @param {string} exerciseKey - Exercise key
 * @param {Array} exerciseHistory - Exercise history (most recent first)
 * @param {Object} painHistory - Pain history from storage
 * @param {Array} allHistory - All exercise history (for adaptive weight)
 * @returns {Object} Suggestion object
 */
export function getSuggestion(exerciseKey, exerciseHistory, painHistory, allHistory = []) {
  // Guard: No history
  if (!exerciseHistory || exerciseHistory.length === 0) {
    return {
      type: 'NO_HISTORY',
      message: 'No history yet - start with recommended weight',
      urgency: 'low',
      icon: 'ℹ️'
    };
  }

  // Priority 1: Safety (pain handling)
  const painSuggestion = handlePainBasedSuggestion(exerciseKey, painHistory, exerciseHistory);
  if (painSuggestion) {
    return painSuggestion;
  }

  // Priority 2: Progression (weight increase)
  if (hitTopOfReps(exerciseHistory) && canIncreaseWeight(exerciseHistory)) {
    return suggestWeightIncrease(exerciseHistory, allHistory);
  }

  // Priority 3: Weight gap (tempo progression)
  if (hitTopOfReps(exerciseHistory) && !canIncreaseWeight(exerciseHistory)) {
    return suggestTempoProgression(exerciseKey, exerciseHistory);
  }

  // Priority 4: Plateau detection
  if (detectPlateau(exerciseHistory, 3)) {
    return suggestAlternative(exerciseKey, 'plateau');
  }

  // Priority 5: Regression warning
  if (detectRegression(exerciseHistory)) {
    return suggestRecoveryCheck(exerciseHistory);
  }

  // Default: Continue current approach
  return suggestContinue(exerciseHistory);
}
```

**Step 2: Test core decision engine**

```javascript
// Test complete flow
const testHistory = [
  { sets: [{ weight: 20, reps: 12, rir: 2 }] }
];

const painHistory = {};

const suggestion = getSuggestion('DB Flat Bench Press', testHistory, painHistory);
console.assert(suggestion.type === 'INCREASE_WEIGHT', 'Should suggest weight increase');
console.assert(suggestion.suggestedWeight === 22.5, 'Should be 22.5kg');
```

**Step 3: Commit**

```bash
git add js/modules/smart-progression.js
git commit -m "feat: add core decision engine (getSuggestion)

- Priority-based suggestion system
- 5 priorities: pain → progression → tempo → plateau → regression
- Stateless analysis from history
- Returns structured suggestion object

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: UI Integration

### Task 11: Suggestion Banner Component

**Files:**
- Modify: `js/app.js`
- Create: `css/smart-progression.css`

**Step 1: Add suggestion banner HTML generator**

Add to `js/app.js`:

```javascript
import { getSuggestion } from './modules/smart-progression.js';

/**
 * Renders smart suggestion banner
 * @param {Object} suggestion - Suggestion object from getSuggestion
 * @returns {string} HTML string
 */
function renderSuggestionBanner(suggestion) {
  if (!suggestion || suggestion.type === 'NO_HISTORY') {
    return '';
  }

  const urgencyClass = {
    'low': '',
    'medium': 'warning',
    'high': 'urgent',
    'critical': 'urgent'
  }[suggestion.urgency] || '';

  return `
    <div class="smart-suggestion ${urgencyClass}">
      <div class="suggestion-icon">${suggestion.icon}</div>
      <div class="suggestion-content">
        <strong>${getSuggestionTypeLabel(suggestion.type)}</strong>
        <p>${suggestion.message}</p>
        ${suggestion.reason ? `<small>${suggestion.reason}</small>` : ''}
        ${suggestion.warning ? `<div class="warning-text">⚠️ ${suggestion.warning}</div>` : ''}
      </div>
    </div>
  `;
}

function getSuggestionTypeLabel(type) {
  const labels = {
    'PAIN_WARNING': 'NOTE',
    'REDUCE_WEIGHT': 'MODERATE PAIN DETECTED',
    'TRY_ALTERNATIVE': 'SUGGESTED CHANGE',
    'IMMEDIATE_ALTERNATIVE': 'SEVERE PAIN ALERT',
    'INCREASE_WEIGHT': 'SMART SUGGESTION',
    'TRY_TEMPO': 'SMART SUGGESTION',
    'PLATEAU_WARNING': 'PLATEAU DETECTED',
    'RECOVERY_WARNING': 'STRENGTH REGRESSION',
    'CONTINUE': 'PROGRESS UPDATE'
  };

  return labels[type] || 'SUGGESTION';
}
```

**Step 2: Integrate into exercise card rendering**

Modify `renderExerciseCard()` in `js/app.js`:

```javascript
function renderExerciseCard(exercise, exerciseIndex, workoutName) {
  const exerciseKey = `${workoutName} - ${exercise.name}`;

  // Get exercise history
  const exerciseHistory = this.storage.getExerciseHistory(exerciseKey);
  const painHistory = this.storage.getPainHistory();
  const allHistory = []; // TODO: Get all exercise history for adaptive weight

  // Generate suggestion
  const suggestion = getSuggestion(exerciseKey, exerciseHistory, painHistory, allHistory);

  // Existing exercise card HTML...
  return `
    <div class="exercise-card" data-exercise-index="${exerciseIndex}">
      <div class="exercise-header">
        <h3>E${exerciseIndex + 1}: ${exercise.name}</h3>
        <button class="history-btn" onclick="app.showExerciseHistory('${exerciseKey}')">
          📈 History
        </button>
      </div>

      ${renderSuggestionBanner(suggestion)}

      <!-- Rest of exercise card HTML -->
      <div class="exercise-details">
        <p>${exercise.sets} sets × ${exercise.repRange} reps (RIR ${exercise.rirTarget})</p>
      </div>

      <!-- Sets, form cues, etc. -->
    </div>
  `;
}
```

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: integrate suggestion banner into exercise cards

- renderSuggestionBanner: generates HTML from suggestion object
- getSuggestionTypeLabel: maps types to user-friendly labels
- Integrated into renderExerciseCard before sets

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 12: Suggestion Banner Styling

**Files:**
- Create: `css/smart-progression.css`
- Modify: `index.html` (add CSS link)

**Step 1: Create smart-progression.css**

```css
/* css/smart-progression.css */

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

.smart-suggestion.warning {
  background: rgba(245, 158, 11, 0.1);
  border-left-color: #f59e0b;
}

.smart-suggestion.urgent {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: var(--color-danger);
}

.suggestion-icon {
  font-size: 24px;
  flex-shrink: 0;
  line-height: 1;
}

.suggestion-content {
  flex: 1;
}

.suggestion-content strong {
  color: var(--color-primary);
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
}

.smart-suggestion.warning .suggestion-content strong {
  color: #f59e0b;
}

.smart-suggestion.urgent .suggestion-content strong {
  color: var(--color-danger);
}

.suggestion-content p {
  margin: 4px 0;
  font-size: 16px;
  line-height: 1.4;
}

.suggestion-content small {
  color: var(--color-text-dim);
  font-style: italic;
  font-size: 14px;
}

.warning-text {
  margin-top: 8px;
  padding: 8px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 4px;
  color: var(--color-danger);
  font-size: 14px;
  font-weight: 500;
}

/* Tempo Guidance (when included in suggestion) */
.tempo-guidance {
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 12px;
  margin: 8px 0;
  border-radius: 8px;
}

.tempo-guidance strong {
  display: block;
  margin-bottom: 8px;
  color: var(--color-primary);
}

.tempo-visual {
  background: var(--color-surface);
  padding: 8px;
  margin: 8px 0;
  border-radius: 4px;
  font-family: monospace;
  text-align: center;
  font-size: 14px;
}

.tempo-guidance small {
  display: block;
  margin-top: 8px;
  color: var(--color-text-dim);
  font-style: italic;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .smart-suggestion {
    padding: 10px;
    gap: 10px;
  }

  .suggestion-icon {
    font-size: 20px;
  }

  .suggestion-content p {
    font-size: 15px;
  }
}
```

**Step 2: Add CSS link to index.html**

Add to `<head>`:

```html
<link rel="stylesheet" href="css/smart-progression.css">
```

**Step 3: Commit**

```bash
git add css/smart-progression.css index.html
git commit -m "feat: add smart progression CSS styling

- Suggestion banner styles (default, warning, urgent)
- Color-coded borders and backgrounds
- Tempo guidance styling
- Mobile responsive

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 13: Tempo Guidance Display

**Files:**
- Modify: `js/app.js`

**Step 1: Add tempo guidance renderer**

Add to `js/app.js`:

```javascript
/**
 * Renders tempo guidance section (shown when tempo suggested)
 * @param {Object} tempoGuidance - Tempo guidance from suggestion
 * @returns {string} HTML string
 */
function renderTempoGuidance(tempoGuidance) {
  if (!tempoGuidance) {
    return '';
  }

  return `
    <div class="tempo-guidance">
      <strong>📖 How to do it:</strong>
      <p>${tempoGuidance.instruction}</p>
      <div class="tempo-visual">${tempoGuidance.cue}</div>
      <small>Why? ${tempoGuidance.why}</small>
    </div>
  `;
}
```

**Step 2: Integrate into suggestion banner**

Modify `renderSuggestionBanner()`:

```javascript
function renderSuggestionBanner(suggestion) {
  if (!suggestion || suggestion.type === 'NO_HISTORY') {
    return '';
  }

  const urgencyClass = {
    'low': '',
    'medium': 'warning',
    'high': 'urgent',
    'critical': 'urgent'
  }[suggestion.urgency] || '';

  return `
    <div class="smart-suggestion ${urgencyClass}">
      <div class="suggestion-icon">${suggestion.icon}</div>
      <div class="suggestion-content">
        <strong>${getSuggestionTypeLabel(suggestion.type)}</strong>
        <p>${suggestion.message}</p>
        ${suggestion.reason ? `<small>${suggestion.reason}</small>` : ''}
        ${suggestion.warning ? `<div class="warning-text">⚠️ ${suggestion.warning}</div>` : ''}
      </div>
    </div>
    ${suggestion.tempoGuidance ? renderTempoGuidance(suggestion.tempoGuidance) : ''}
  `;
}
```

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add tempo guidance display

- renderTempoGuidance: shows exercise-specific tempo instructions
- Includes visual cue and rationale
- Integrated into suggestion banner

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 14: Form Cues Collapsible Component

**Files:**
- Modify: `js/app.js`
- Modify: `css/smart-progression.css`

**Step 1: Add form cues HTML renderer**

Add to `js/app.js`:

```javascript
import { getFormCues } from './modules/form-cues.js';

/**
 * Renders collapsible form guide
 * @param {string} exerciseKey - Exercise key
 * @param {number} exerciseIndex - Exercise index
 * @returns {string} HTML string
 */
function renderFormGuide(exerciseKey, exerciseIndex) {
  const exerciseName = exerciseKey.split(' - ')[1];
  const formCues = getFormCues(exerciseName);

  if (!formCues) {
    return '';
  }

  return `
    <div class="form-guide">
      <button class="form-guide-toggle collapsed"
              onclick="app.toggleFormGuide(${exerciseIndex})"
              data-exercise-index="${exerciseIndex}">
        📋 Form Guide ▼
      </button>
      <div class="form-guide-content"
           id="form-guide-${exerciseIndex}"
           style="display: none;">
        <ul>
          ${formCues.setup.map(cue => `<li><strong>Setup:</strong> ${cue}</li>`).join('')}
          ${formCues.execution.map(cue => `<li><strong>Do:</strong> ${cue}</li>`).join('')}
          ${formCues.mistakes.map(mistake => `<li><strong>⚠️ Avoid:</strong> ${mistake}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

// Add toggle function to App class
toggleFormGuide(exerciseIndex) {
  const content = document.getElementById(`form-guide-${exerciseIndex}`);
  const toggle = document.querySelector(`button[data-exercise-index="${exerciseIndex}"]`);

  if (!content || !toggle) return;

  if (content.style.display === 'none') {
    content.style.display = 'block';
    toggle.classList.remove('collapsed');
    toggle.textContent = '📋 Form Guide ▲';
  } else {
    content.style.display = 'none';
    toggle.classList.add('collapsed');
    toggle.textContent = '📋 Form Guide ▼';
  }
}
```

**Step 2: Add form guide CSS**

Add to `css/smart-progression.css`:

```css
/* Form Guide Collapsible */
.form-guide {
  margin: 12px 0;
}

.form-guide-toggle {
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  color: var(--color-text-dim);
  padding: 8px 12px;
  border-radius: 4px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-guide-toggle:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.form-guide-content {
  margin-top: 8px;
  padding: 12px;
  background: var(--color-surface);
  border-radius: 4px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.form-guide-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.form-guide-content li {
  padding: 6px 0;
  line-height: 1.4;
  font-size: 14px;
}

.form-guide-content li strong {
  color: var(--color-primary);
  margin-right: 4px;
}

.form-guide-content li:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Step 3: Integrate into exercise card**

Modify `renderExerciseCard()`:

```javascript
return `
  <div class="exercise-card" data-exercise-index="${exerciseIndex}">
    <div class="exercise-header">
      <h3>E${exerciseIndex + 1}: ${exercise.name}</h3>
      <button class="history-btn" onclick="app.showExerciseHistory('${exerciseKey}')">
        📈 History
      </button>
    </div>

    ${renderSuggestionBanner(suggestion)}
    ${renderFormGuide(exerciseKey, exerciseIndex)}

    <!-- Rest of exercise card -->
  </div>
`;
```

**Step 4: Commit**

```bash
git add js/app.js css/smart-progression.css
git commit -m "feat: add collapsible form guide component

- renderFormGuide: shows setup, execution, mistakes
- toggleFormGuide: expand/collapse functionality
- CSS for collapsible UI
- Integrated into exercise cards

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Storage & Persistence

### Task 15: Exercise Alternates Storage

**Files:**
- Modify: `js/modules/storage.js`

**Step 1: Add exercise alternates storage methods**

Add to `js/modules/storage.js`:

```javascript
/**
 * Get exercise alternates from localStorage
 * @returns {Object} Exercise alternates map
 */
getExerciseAlternates() {
  try {
    const data = this.storage.getItem('build_exercise_alternates');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to parse exercise alternates:', error);
    return {};
  }
}

/**
 * Set exercise alternate for a specific exercise
 * @param {string} exerciseKey - Exercise key
 * @param {string} alternativeName - Alternative exercise name
 * @param {string} reason - Reason for switch ('pain', 'plateau')
 */
setExerciseAlternate(exerciseKey, alternativeName, reason) {
  const alternates = this.getExerciseAlternates();

  alternates[exerciseKey] = {
    current: alternativeName,
    original: exerciseKey.split(' - ')[1],
    reason: reason,
    dateChanged: new Date().toISOString(),
    painFreeWorkouts: 0
  };

  this.storage.setItem('build_exercise_alternates', JSON.stringify(alternates));
}

/**
 * Get current exercise (original or alternate)
 * @param {string} exerciseKey - Exercise key
 * @returns {string} Current exercise name
 */
getCurrentExercise(exerciseKey) {
  const alternates = this.getExerciseAlternates();
  const alternate = alternates[exerciseKey];

  if (alternate && alternate.current) {
    return alternate.current;
  }

  return exerciseKey.split(' - ')[1]; // Return original name
}

/**
 * Remove exercise alternate (revert to original)
 * @param {string} exerciseKey - Exercise key
 */
removeExerciseAlternate(exerciseKey) {
  const alternates = this.getExerciseAlternates();
  delete alternates[exerciseKey];
  this.storage.setItem('build_exercise_alternates', JSON.stringify(alternates));
}

/**
 * Increment pain-free workout count for alternate
 * @param {string} exerciseKey - Exercise key
 */
incrementPainFreeWorkouts(exerciseKey) {
  const alternates = this.getExerciseAlternates();
  const alternate = alternates[exerciseKey];

  if (alternate) {
    alternate.painFreeWorkouts = (alternate.painFreeWorkouts || 0) + 1;
    this.storage.setItem('build_exercise_alternates', JSON.stringify(alternates));
  }
}
```

**Step 2: Test storage methods**

```javascript
// Test set alternate
storage.setExerciseAlternate('UPPER_A - DB Flat Bench Press', 'Floor Press', 'moderate_pain');
const current = storage.getCurrentExercise('UPPER_A - DB Flat Bench Press');
console.assert(current === 'Floor Press', 'Should return alternate');

// Test remove alternate
storage.removeExerciseAlternate('UPPER_A - DB Flat Bench Press');
const original = storage.getCurrentExercise('UPPER_A - DB Flat Bench Press');
console.assert(original === 'DB Flat Bench Press', 'Should return original');
```

**Step 3: Commit**

```bash
git add js/modules/storage.js
git commit -m "feat: add exercise alternates storage

- getExerciseAlternates: retrieves all alternates
- setExerciseAlternate: saves alternative with reason
- getCurrentExercise: returns current or alternate
- removeExerciseAlternate: reverts to original
- incrementPainFreeWorkouts: tracks recovery

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 16: Achievements Storage

**Files:**
- Modify: `js/modules/storage.js`

**Step 1: Add achievements storage methods**

Add to `js/modules/storage.js`:

```javascript
/**
 * Get achievements from localStorage
 * @returns {Object} Achievements object
 */
getAchievements() {
  try {
    const data = this.storage.getItem('build_achievements');
    return data ? JSON.parse(data) : { achievements: [], streaks: {} };
  } catch (error) {
    console.error('Failed to parse achievements:', error);
    return { achievements: [], streaks: {} };
  }
}

/**
 * Add achievement
 * @param {Object} achievement - Achievement object
 */
addAchievement(achievement) {
  const data = this.getAchievements();

  // Check if achievement already exists
  const exists = data.achievements.some(a => a.id === achievement.id);
  if (exists) {
    return;
  }

  data.achievements.push({
    ...achievement,
    dateAchieved: new Date().toISOString(),
    seen: false
  });

  this.storage.setItem('build_achievements', JSON.stringify(data));
}

/**
 * Mark achievements as seen
 * @param {Array<string>} achievementIds - Achievement IDs
 */
markAchievementsSeen(achievementIds) {
  const data = this.getAchievements();

  data.achievements.forEach(achievement => {
    if (achievementIds.includes(achievement.id)) {
      achievement.seen = true;
    }
  });

  this.storage.setItem('build_achievements', JSON.stringify(data));
}

/**
 * Get unseen achievements
 * @returns {Array} Unseen achievements
 */
getUnseenAchievements() {
  const data = this.getAchievements();
  return data.achievements.filter(a => !a.seen);
}

/**
 * Update streak
 * @param {string} exerciseKey - Exercise key
 * @param {number} currentStreak - Current streak count
 * @param {string} pattern - Streak pattern ('weight_increase', etc.)
 */
updateStreak(exerciseKey, currentStreak, pattern) {
  const data = this.getAchievements();

  if (!data.streaks[exerciseKey]) {
    data.streaks[exerciseKey] = {
      current: 0,
      best: 0,
      pattern: pattern,
      lastDate: null
    };
  }

  const streak = data.streaks[exerciseKey];
  streak.current = currentStreak;
  streak.pattern = pattern;
  streak.lastDate = new Date().toISOString();

  if (currentStreak > streak.best) {
    streak.best = currentStreak;
  }

  this.storage.setItem('build_achievements', JSON.stringify(data));
}
```

**Step 2: Test achievements storage**

```javascript
// Test add achievement
const achievement = {
  id: 'pr_bench_25kg',
  type: 'PERSONAL_RECORD',
  exerciseKey: 'UPPER_A - DB Flat Bench Press',
  weight: 25,
  reps: 12,
  badge: '🔥 New PR'
};

storage.addAchievement(achievement);
const unseen = storage.getUnseenAchievements();
console.assert(unseen.length === 1, 'Should have 1 unseen achievement');

// Test mark seen
storage.markAchievementsSeen(['pr_bench_25kg']);
const unseenAfter = storage.getUnseenAchievements();
console.assert(unseenAfter.length === 0, 'Should have 0 unseen achievements');
```

**Step 3: Commit**

```bash
git add js/modules/storage.js
git commit -m "feat: add achievements storage

- getAchievements: retrieves all achievements
- addAchievement: saves new achievement
- markAchievementsSeen: marks as viewed
- getUnseenAchievements: filters unseen
- updateStreak: tracks progression streaks

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 17: Achievement Detection Logic

**Files:**
- Create: `js/modules/achievement-detector.js`

**Step 1: Create achievement detector module**

```javascript
// js/modules/achievement-detector.js

/**
 * Detects PR achievements (weight or reps)
 * @param {string} exerciseKey - Exercise key
 * @param {Array} history - Exercise history
 * @returns {Object|null} Achievement object or null
 */
export function detectPR(exerciseKey, history) {
  if (!history || history.length < 2) {
    return null;
  }

  const latest = history[0];
  const latestWeight = latest.sets[0].weight;
  const latestReps = Math.max(...latest.sets.map(s => s.reps));

  // Find previous best weight
  const previousBest = Math.max(...history.slice(1).map(w =>
    w.sets[0].weight
  ));

  if (latestWeight > previousBest) {
    return {
      id: `pr_${exerciseKey}_${latestWeight}kg_${Date.now()}`,
      type: 'PERSONAL_RECORD',
      exerciseKey: exerciseKey,
      metric: 'weight',
      value: latestWeight,
      reps: latestReps,
      previousBest: previousBest,
      badge: '🔥 New PR',
      description: `${exerciseKey.split(' - ')[1]}: ${latestWeight}kg × ${latestReps} reps`
    };
  }

  return null;
}

/**
 * Detects progression streaks
 * @param {string} exerciseKey - Exercise key
 * @param {Array} history - Exercise history
 * @returns {Object|null} Achievement object or null
 */
export function detectProgressionStreak(exerciseKey, history) {
  if (!history || history.length < 5) {
    return null;
  }

  let streak = 0;
  for (let i = 0; i < history.length - 1; i++) {
    const current = history[i].sets[0].weight;
    const previous = history[i + 1].sets[0].weight;

    if (current > previous) {
      streak++;
    } else {
      break;
    }
  }

  if (streak >= 5) {
    return {
      id: `streak_${exerciseKey}_${streak}_${Date.now()}`,
      type: 'CONSISTENCY',
      exerciseKey: exerciseKey,
      streakCount: streak,
      pattern: 'weight_increase',
      badge: '⚡ Progression Streak',
      description: `${streak} workouts with weight increases`
    };
  }

  return null;
}

/**
 * Detects tempo mastery (successful weight jump after tempo work)
 * @param {string} exerciseKey - Exercise key
 * @param {Array} history - Exercise history
 * @param {Object} tempoState - Tempo state from storage
 * @returns {Object|null} Achievement object or null
 */
export function detectTempoMastery(exerciseKey, history, tempoState) {
  if (!tempoState || !tempoState[exerciseKey]) {
    return null;
  }

  const state = tempoState[exerciseKey];

  if (state.status !== 'building_strength') {
    return null;
  }

  // Check if latest workout successfully hit target weight
  const latest = history[0];
  const latestWeight = latest.sets[0].weight;
  const latestReps = latest.sets[0].reps;

  if (latestWeight === state.targetWeight && latestReps >= 8) {
    return {
      id: `tempo_master_${exerciseKey}_${state.weight}_${state.targetWeight}_${Date.now()}`,
      type: 'TEMPO_MASTERY',
      exerciseKey: exerciseKey,
      startWeight: state.weight,
      targetWeight: state.targetWeight,
      tempoWeeks: state.weekCount,
      badge: '🏆 Tempo Master',
      description: `Conquered ${state.weight}kg→${state.targetWeight}kg gap with tempo progression`
    };
  }

  return null;
}

/**
 * Detects smart recovery (pain resolved after alternative switch)
 * @param {string} exerciseKey - Exercise key
 * @param {Object} alternates - Exercise alternates from storage
 * @param {Object} painHistory - Pain history
 * @returns {Object|null} Achievement object or null
 */
export function detectSmartRecovery(exerciseKey, alternates, painHistory) {
  const alternate = alternates[exerciseKey];

  if (!alternate || alternate.reason !== 'moderate_pain') {
    return null;
  }

  // Check if 3+ pain-free workouts on alternative
  if (alternate.painFreeWorkouts >= 3) {
    return {
      id: `smart_recovery_${exerciseKey}_${Date.now()}`,
      type: 'SMART_DECISION',
      action: 'alternative_switch',
      exerciseKey: exerciseKey,
      reason: alternate.reason,
      outcome: 'pain_resolved',
      badge: '🧠 Smart Recovery',
      description: `Prevented injury by switching to ${alternate.current}`
    };
  }

  return null;
}

/**
 * Detects all achievements for a workout
 * @param {string} exerciseKey - Exercise key
 * @param {Object} context - Context object with history, tempoState, alternates, painHistory
 * @returns {Array} Array of achievement objects
 */
export function detectAchievements(exerciseKey, context) {
  const achievements = [];

  const pr = detectPR(exerciseKey, context.history);
  if (pr) achievements.push(pr);

  const streak = detectProgressionStreak(exerciseKey, context.history);
  if (streak) achievements.push(streak);

  const tempo = detectTempoMastery(exerciseKey, context.history, context.tempoState);
  if (tempo) achievements.push(tempo);

  const recovery = detectSmartRecovery(exerciseKey, context.alternates, context.painHistory);
  if (recovery) achievements.push(recovery);

  return achievements;
}
```

**Step 2: Test achievement detection**

```javascript
// Test PR detection
const prHistory = [
  { sets: [{ weight: 25, reps: 12 }] },
  { sets: [{ weight: 22.5, reps: 12 }] }
];

const prAchievement = detectPR('UPPER_A - DB Flat Bench Press', prHistory);
console.assert(prAchievement !== null, 'Should detect PR');
console.assert(prAchievement.value === 25, 'Should be 25kg PR');
```

**Step 3: Commit**

```bash
git add js/modules/achievement-detector.js
git commit -m "feat: add achievement detection logic

- detectPR: weight/rep personal records
- detectProgressionStreak: 5+ consecutive increases
- detectTempoMastery: successful weight jump after tempo
- detectSmartRecovery: pain resolved after alternative
- detectAchievements: all achievement checks

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: Post-Workout & Progress Integration

### Task 18: Post-Workout Achievement Display

**Files:**
- Modify: `js/screens/post-workout-summary.js`
- Modify: `css/smart-progression.css`

**Step 1: Add achievement detection to post-workout**

Modify `js/screens/post-workout-summary.js`:

```javascript
import { detectAchievements } from '../modules/achievement-detector.js';

// After workout completion, detect achievements
function finalizeWorkout(workoutData) {
  const achievements = [];

  workoutData.exercises.forEach(exercise => {
    const exerciseKey = `${workoutData.workoutName} - ${exercise.name}`;

    const context = {
      history: this.storage.getExerciseHistory(exerciseKey),
      tempoState: this.storage.getItem('build_tempo_state') || {},
      alternates: this.storage.getExerciseAlternates(),
      painHistory: this.storage.getPainHistory()
    };

    const exerciseAchievements = detectAchievements(exerciseKey, context);
    achievements.push(...exerciseAchievements);
  });

  // Save achievements
  achievements.forEach(achievement => {
    this.storage.addAchievement(achievement);
  });

  // Show post-workout summary with achievements
  showPostWorkoutSummary(workoutData, achievements);
}

function showPostWorkoutSummary(workoutData, achievements) {
  const summaryHTML = `
    <div class="post-workout-summary">
      <h2>🎉 Workout Complete!</h2>

      ${renderWorkoutStats(workoutData)}

      ${achievements.length > 0 ? renderAchievements(achievements) : ''}

      ${renderPainTracking()}
      ${renderWeighIn()}

      <button onclick="app.returnHome()">Return to Home</button>
    </div>
  `;

  document.getElementById('app-container').innerHTML = summaryHTML;
}

function renderAchievements(achievements) {
  if (achievements.length === 0) {
    return '';
  }

  return `
    <div class="achievements-earned">
      <h3>🎉 Achievements Earned Today</h3>
      <div class="achievement-list">
        ${achievements.map(achievement => `
          <div class="achievement-badge">
            <span class="badge-icon">${achievement.badge.split(' ')[0]}</span>
            <div class="badge-details">
              <strong>${achievement.badge}</strong>
              <p>${achievement.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <p class="achievement-total">Total Achievements: ${this.storage.getAchievements().achievements.length}</p>
    </div>
  `;
}
```

**Step 2: Add achievement CSS**

Add to `css/smart-progression.css`:

```css
/* Achievement Display */
.achievements-earned {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.achievements-earned h3 {
  margin: 0 0 16px 0;
  color: var(--color-primary);
  font-size: 20px;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-badge {
  background: var(--color-surface);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.badge-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.badge-details {
  flex: 1;
}

.badge-details strong {
  display: block;
  color: var(--color-primary);
  font-size: 16px;
  margin-bottom: 4px;
}

.badge-details p {
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
}

.achievement-total {
  margin-top: 16px;
  text-align: center;
  color: var(--color-text-dim);
  font-size: 14px;
}
```

**Step 3: Commit**

```bash
git add js/screens/post-workout-summary.js css/smart-progression.css
git commit -m "feat: add achievement display to post-workout summary

- Detect achievements after workout completion
- Show earned achievements in summary
- Animated achievement badges
- Total achievement count

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 19: Progress Screen Achievement Gallery

**Files:**
- Modify: `js/screens/progress-screen.js`

**Step 1: Add achievement gallery to progress screen**

Modify `js/screens/progress-screen.js`:

```javascript
function renderProgressScreen() {
  const achievements = this.storage.getAchievements();

  const progressHTML = `
    <div class="progress-screen">
      <h1>Progress Dashboard</h1>

      <div class="progress-tabs">
        <button class="tab-btn active" onclick="app.showProgressTab('stats')">Stats</button>
        <button class="tab-btn" onclick="app.showProgressTab('achievements')">Achievements</button>
        <button class="tab-btn" onclick="app.showProgressTab('analytics')">Analytics</button>
      </div>

      <div id="progress-content">
        ${renderStatsTab()}
      </div>
    </div>
  `;

  document.getElementById('app-container').innerHTML = progressHTML;
}

function showProgressTab(tab) {
  const content = document.getElementById('progress-content');

  if (tab === 'achievements') {
    content.innerHTML = renderAchievementsTab();
  } else if (tab === 'stats') {
    content.innerHTML = renderStatsTab();
  } else if (tab === 'analytics') {
    content.innerHTML = renderAnalyticsTab();
  }

  // Update active tab button
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

function renderAchievementsTab() {
  const data = this.storage.getAchievements();

  if (data.achievements.length === 0) {
    return `
      <div class="empty-state">
        <p>No achievements yet. Keep training to unlock achievements!</p>
      </div>
    `;
  }

  // Group achievements by type
  const grouped = {
    'PERSONAL_RECORD': [],
    'CONSISTENCY': [],
    'TEMPO_MASTERY': [],
    'SMART_DECISION': []
  };

  data.achievements.forEach(achievement => {
    if (grouped[achievement.type]) {
      grouped[achievement.type].push(achievement);
    }
  });

  return `
    <div class="achievements-tab">
      <div class="achievement-summary">
        <h3>Total Achievements: ${data.achievements.length}</h3>
      </div>

      ${Object.entries(grouped).map(([type, achievements]) => {
        if (achievements.length === 0) return '';

        const typeLabel = {
          'PERSONAL_RECORD': '🔥 Personal Records',
          'CONSISTENCY': '⚡ Progression Streaks',
          'TEMPO_MASTERY': '🏆 Tempo Mastery',
          'SMART_DECISION': '🧠 Smart Decisions'
        }[type];

        return `
          <div class="achievement-category">
            <h4>${typeLabel} (${achievements.length})</h4>
            <div class="achievement-grid">
              ${achievements.map(achievement => `
                <div class="achievement-card">
                  <span class="achievement-icon">${achievement.badge.split(' ')[0]}</span>
                  <strong>${achievement.badge}</strong>
                  <p>${achievement.description}</p>
                  <small>${new Date(achievement.dateAchieved).toLocaleDateString()}</small>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}

      ${renderStreaksSection(data.streaks)}
    </div>
  `;
}

function renderStreaksSection(streaks) {
  const streakEntries = Object.entries(streaks);

  if (streakEntries.length === 0) {
    return '';
  }

  return `
    <div class="streaks-section">
      <h4>📊 Current Streaks</h4>
      <div class="streaks-list">
        ${streakEntries.map(([exerciseKey, streak]) => `
          <div class="streak-card">
            <strong>${exerciseKey.split(' - ')[1]}</strong>
            <div class="streak-stats">
              <span>Current: ${streak.current}</span>
              <span>Best: ${streak.best}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
```

**Step 2: Add achievement gallery CSS**

Add to `css/smart-progression.css`:

```css
/* Achievement Gallery */
.achievements-tab {
  padding: 16px 0;
}

.achievement-summary {
  background: var(--color-surface);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: center;
}

.achievement-summary h3 {
  margin: 0;
  color: var(--color-primary);
  font-size: 20px;
}

.achievement-category {
  margin-bottom: 32px;
}

.achievement-category h4 {
  margin: 0 0 16px 0;
  color: var(--color-text);
  font-size: 18px;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.achievement-card {
  background: var(--color-surface);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.achievement-icon {
  display: block;
  font-size: 48px;
  margin-bottom: 12px;
}

.achievement-card strong {
  display: block;
  color: var(--color-primary);
  font-size: 16px;
  margin-bottom: 8px;
}

.achievement-card p {
  margin: 8px 0;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.4;
}

.achievement-card small {
  display: block;
  color: var(--color-text-dim);
  font-size: 12px;
  margin-top: 8px;
}

/* Streaks Section */
.streaks-section {
  margin-top: 32px;
}

.streaks-section h4 {
  margin: 0 0 16px 0;
  color: var(--color-text);
  font-size: 18px;
}

.streaks-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.streak-card {
  background: var(--color-surface);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.streak-card strong {
  display: block;
  color: var(--color-text);
  font-size: 14px;
  margin-bottom: 8px;
}

.streak-stats {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-text-dim);
}

.streak-stats span {
  padding: 4px 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .achievement-grid {
    grid-template-columns: 1fr;
  }

  .streaks-list {
    grid-template-columns: 1fr;
  }
}
```

**Step 3: Commit**

```bash
git add js/screens/progress-screen.js css/smart-progression.css
git commit -m "feat: add achievement gallery to progress screen

- Achievement tab with category grouping
- Current streaks section
- Achievement cards with icons and dates
- Grid layout responsive to mobile

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 20: Final Integration & Testing

**Files:**
- Modify: `js/app.js`
- Create: `docs/testing/smart-progression-integration-test.md`

**Step 1: Add auto-apply logic for exercise alternatives**

Add to `js/app.js`:

```javascript
/**
 * Apply exercise alternative automatically (pain-based)
 * @param {string} exerciseKey - Exercise key
 * @param {Object} suggestion - Suggestion object
 */
function applyAutoAlternative(exerciseKey, suggestion) {
  if (!suggestion.autoApply || !suggestion.alternative) {
    return;
  }

  this.storage.setExerciseAlternate(exerciseKey, suggestion.alternative, suggestion.type);

  // Refresh UI to show new exercise name
  showWorkoutScreen(currentWorkout);
}

// Call after generating suggestion
const suggestion = getSuggestion(exerciseKey, exerciseHistory, painHistory, allHistory);

if (suggestion.autoApply) {
  applyAutoAlternative(exerciseKey, suggestion);
}
```

**Step 2: Add recovery suggestion logic**

Add to `js/app.js`:

```javascript
/**
 * Check if user should be prompted to try original exercise again
 * @param {string} exerciseKey - Exercise key
 * @returns {boolean}
 */
function shouldPromptOriginalExercise(exerciseKey) {
  const alternates = this.storage.getExerciseAlternates();
  const alternate = alternates[exerciseKey];

  if (!alternate || alternate.reason !== 'moderate_pain') {
    return false;
  }

  // Suggest original after 3+ pain-free workouts
  return alternate.painFreeWorkouts >= 3;
}

// Show prompt in suggestion banner
if (shouldPromptOriginalExercise(exerciseKey)) {
  suggestion = {
    type: 'TRY_ORIGINAL',
    message: `Ready to try ${alternate.original} again?`,
    reason: 'No pain for 3 workouts - original exercise may be safe now',
    urgency: 'low',
    icon: '✅'
  };
}
```

**Step 3: Create integration test document**

Create `docs/testing/smart-progression-integration-test.md`:

```markdown
# Smart Auto-Progression Integration Test

## Test Scenarios

### Scenario 1: Weight Progression (Happy Path)
1. Log: 10kg × 12 reps (RIR 2)
2. Expected: "Try 12.5kg today (+2.5kg)"
3. Log: 12.5kg × 10 reps (RIR 2)
4. Expected: "Continue 12.5kg, aim for 12 reps"
5. Log: 12.5kg × 12 reps (RIR 2)
6. Expected: "Try 15kg today (+2.5kg)"

**Result:** ✅ / ❌

---

### Scenario 2: Weight Gap + Tempo Progression
1. Log: 10kg × 12 reps (RIR 2)
2. Expected: Suggest next weight
3. Log: 15kg × 6 reps (RIR 0) [Failed jump]
4. Expected: "Build reps at 10kg with slow tempo"
5. Verify: Tempo guidance displayed
6. Log 3 workouts: 10kg × 12 reps
7. Expected: "Ready to try 15kg again!"

**Result:** ✅ / ❌

---

### Scenario 3: Pain Progression (Mild → Moderate → Alternative)
1. Report mild shoulder pain
2. Expected: "Mild shoulder discomfort - monitor form"
3. Next workout: Report moderate pain
4. Expected: "Try 20kg (was 25kg)"
5. Log 20kg, still moderate pain
6. Expected: Auto-switch to Floor Press
7. Verify: Exercise name updated

**Result:** ✅ / ❌

---

### Scenario 4: Plateau Detection
1. Log 3 workouts: 22.5kg × 12 reps
2. Expected: "Plateau detected - try Cable Chest Press"
3. Verify: Alternative suggested (not auto-applied)

**Result:** ✅ / ❌

---

### Scenario 5: Achievement Detection
1. Log PR (new weight)
2. Expected: 🔥 New PR achievement in post-workout
3. Log 5 consecutive weight increases
4. Expected: ⚡ Progression Streak achievement
5. Check Progress screen
6. Expected: Achievements displayed in gallery

**Result:** ✅ / ❌

---

### Scenario 6: Form Cues
1. Tap "📋 Form Guide"
2. Expected: Collapsible expands
3. Verify: Setup, execution, mistakes shown
4. Tap again
5. Expected: Collapses

**Result:** ✅ / ❌

---

### Scenario 7: Adaptive Weight Detection
1. System suggests: 22.5kg
2. Log: 25kg × 10 reps (user used heavier)
3. Next workout suggestion
4. Expected: Continues from 25kg (not 22.5kg)

**Result:** ✅ / ❌

---

## Checklist

- [ ] All database modules load without errors
- [ ] Suggestions appear in exercise cards
- [ ] Pain-based suggestions escalate correctly
- [ ] Tempo guidance shows exercise-specific instructions
- [ ] Form cues collapse/expand correctly
- [ ] Exercise alternates persist in localStorage
- [ ] Achievements save and display correctly
- [ ] Progress screen achievement gallery works
- [ ] Auto-apply alternatives update exercise name
- [ ] No console errors during normal flow
```

**Step 4: Run manual integration tests**

Follow test document scenarios and check all work correctly.

**Step 5: Commit**

```bash
git add js/app.js docs/testing/smart-progression-integration-test.md
git commit -m "feat: finalize smart auto-progression integration

- Auto-apply logic for pain-based alternatives
- Recovery prompt for trying original exercise
- Integration test document with 7 scenarios
- All phases complete and integrated

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Plan Complete!

**Summary:**
- ✅ Phase 1: Database modules (exercise metadata, tempo guidance, form cues)
- ✅ Phase 2: Smart progression engine (pattern detection, suggestion generation)
- ✅ Phase 3: UI integration (suggestion banners, tempo display, form cues)
- ✅ Phase 4: Storage (exercise alternates, achievements)
- ✅ Phase 5: Post-workout & progress integration

**Total Tasks:** 20
**Estimated Timeline:** 10-12 days
**Files Created:** 7 new modules, 2 new CSS files, 1 test document
**Files Modified:** 5 existing files

**Next Step:** Choose execution approach:

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks
2. **Parallel Session (separate)** - Open new session with executing-plans

**Which approach?**