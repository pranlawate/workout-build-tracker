# Barbell Progression Tracker - Usage Guide

**Feature Status:** Implemented (2026-02-05)
**Version:** 1.0

## Overview

The Barbell Progression Tracker helps you safely transition from dumbbell exercises to barbell variations (Bench Press, Back Squat, Deadlift) by tracking:
- **Strength benchmarks** - Specific weight/rep targets
- **Mobility criteria** - Movement quality assessments
- **Pain tracking** - Per-exercise pain history
- **Training weeks** - Minimum time requirements

## How It Works

### 1. In-Workout Mobility Checks

After completing certain exercises, you'll see a mobility check prompt:

**DB Shoulder Press (UPPER_A):**
- Question: "Could you press overhead without back arching today?"
- Purpose: Assesses shoulder mobility for Barbell Bench Press

**Goblet Squat (LOWER_B):**
- Question: "Did you keep heels flat during squats today?"
- Purpose: Assesses ankle mobility for Barbell Back Squat

**DB Romanian Deadlift (LOWER_B):**
- Question: "Could you touch your toes during warm-up today?"
- Purpose: Assesses hip hinge mobility for Barbell Deadlift

**Response Options:**
- **Yes** - You demonstrated good mobility
- **No** - Mobility needs improvement
- **Not sure** - You're uncertain

**Frequency:** Once per workout (won't ask multiple times same day)

**Progress Requirement:** 5 consecutive "Yes" responses to meet mobility criteria

### 2. Pain Tracking

After EVERY exercise, you'll see a pain tracking prompt:

**Severity Options:**
- **No** - No pain or discomfort
- **Yes, minor** - Mild discomfort that doesn't limit movement
- **Yes, significant** - Pain that affects your ability to exercise

**Location Options:**
If you report pain, you'll select the location:
- Shoulder, Elbow, Wrist
- Lower back, Knee, Hip
- Other

**Per-Exercise Attribution:**
- Pain is tracked separately for each exercise
- Example: Shoulder pain during "DB Bench Press" won't affect "Goblet Squat"
- This prevents incorrect conclusions about exercise safety

**Safety Threshold:**
- If you report pain 2+ times in last 5 workouts, barbell progression is blocked
- This protects against training through recurring injuries

### 3. Progress Dashboard

Access via **📈 Progress** button from home screen.

**What You'll See:**
- Three progression cards (Bench, Squat, Deadlift)
- Overall readiness percentage (0-100%)
- Status of four criteria:
  - ✅ Strength (met)
  - ⏳ In progress
  - ❌ Not started
- Next step or blocker message

**Example:**
```
─── Barbell Bench Press ───
Progress: 65%
███████░░░░░░░░

✅ Strength: 20kg × 3×12
✅ Training: 14 weeks completed
⏳ Mobility: 3/5 confirmations
✅ Pain-free: No recent issues

Next: Confirm overhead mobility
```

## Readiness Criteria

### Barbell Bench Press

**Strength:**
- DB Flat Bench Press: 3 sets × 12 reps @ 20kg per hand
- RIR 2-3 (2-3 reps left in tank)

**Training Time:**
- 12+ weeks of DB pressing

**Mobility:**
- Overhead mobility: 5 consecutive "Yes" confirmations
- (Checked after DB Shoulder Press)

**Pain-Free:**
- No shoulder or elbow pain in last 5 DB Bench workouts
- Max 1 painful session allowed

### Barbell Back Squat

**Strength:**
- DB Goblet Squat: 3 sets × 12 reps @ 20kg
- RIR 2-3

**Training Time:**
- 16+ weeks of squatting

**Mobility:**
- Heels flat during squats: 5 consecutive "Yes" confirmations
- (Checked after Goblet Squat)

**Pain-Free:**
- No knee or lower back pain in last 5 Goblet Squat workouts
- Max 1 painful session allowed

### Barbell Deadlift

**Strength:**
- DB Romanian Deadlift: 3 sets × 12 reps @ 25kg per hand
- RIR 2-3

**Training Time:**
- 20+ weeks of deadlift work

**Mobility:**
- Toe touch: 5 consecutive "Yes" confirmations
- (Checked after DB RDL)

**Pain-Free:**
- No lower back pain in last 5 DB RDL workouts
- Max 1 painful session allowed

## Percentage Calculation

Overall readiness percentage uses weighted formula:
- **40%** - Strength benchmarks
- **30%** - Mobility confirmations
- **20%** - Training weeks
- **10%** - Pain-free status

**Example:**
- Strength: 100% (met) → contributes 40%
- Mobility: 60% (3/5 confirmations) → contributes 18%
- Weeks: 100% (met) → contributes 20%
- Pain-free: Yes → contributes 10%
- **Total: 88%**

## Troubleshooting

**"I answered 'No' accidentally, can I change it?"**
- Mobility checks are per-workout, not per-exercise
- Next workout, answer correctly
- 5 consecutive "Yes" required, so one mistake resets the count

**"Why does it say 0/5 confirmations when I've been training for weeks?"**
- You need to respond "Yes" 5 times in a row
- If you haven't been prompted, complete the trigger exercise (e.g., DB Shoulder Press for bench mobility)
- Prompts only appear during actual workouts, not when viewing history

**"I reported pain but now it's gone. Will it still block me?"**
- Only recent history matters (last 5 workouts)
- If you're pain-free in next 4-5 workouts, the painful session will age out
- Max 1 painful session in last 5 is allowed

**"Progress percentage seems stuck at X%?"**
- Check each criterion's status in the dashboard
- Blockers listed under "Next:" show exactly what's needed
- Example: "Need 4 more weeks of training" means you must wait

## Data Storage

All data stored locally in browser:
- **Mobility checks:** `localStorage.barbell_mobility_checks`
- **Pain reports:** `localStorage.exercise_pain_history`
- **Exercise history:** Used to calculate strength and weeks

**Privacy:** Data never leaves your device.

**Export:** Use Settings → Export Data to backup your progress.

## Technical Details

**Module:** `BarbellProgressionTracker` (read-only analysis)
**Storage:** `StorageManager` extensions
**UI:** Progress Dashboard screen + in-workout prompts

**Dependencies:**
- Requires existing workout tracking to function
- Uses exercise history to calculate strength and weeks
- Prompts integrated into workout flow

---

**For technical implementation details, see:**
- `docs/plans/2026-02-05-barbell-progression-design.md`
- `docs/plans/2026-02-05-barbell-progression-implementation.md`
