# BUILD Tracker - UI/UX Design Document

**Date:** 2026-02-03
**Version:** 1.0 - Complete Design
**Status:** Ready for Implementation
**Target Device:** Smartphone (Moto Edge 60 Pro, 6.7" display)
**User Profile:** Beginner, 1 month training experience

---

## Executive Summary

This document defines the complete UI/UX design for the BUILD workout tracker Progressive Web App. The design prioritizes in-gym usability: large tap targets, minimal scrolling, smart defaults, and immediate feedback. All screens fit smartphone viewports without scrolling during active use.

**Core Design Principles:**
- **Zero friction during workouts** - Log a set in 1 tap when using suggested weights
- **Mobile-first** - Designed for 6.7" smartphones in portrait orientation
- **Smart defaults** - 85% of sets require no manual input
- **Progressive disclosure** - Show only current exercise expanded, hide completed/upcoming
- **Trend-focused** - Weekly weight fluctuations ignored, monthly trends highlighted

---

## 1. Home Screen

**Purpose:** Quick workout start, recovery status check, progress overview

**Layout:**
```
┌─────────────────────────────────────┐
│  BUILD Tracker                  ⚙️  │
├─────────────────────────────────────┤
│                                     │
│  Next Workout: UPPER A              │
│  Last trained: 2 days ago           │
│                                     │
│  [START UPPER A WORKOUT]            │
│  ↑ 60px height, full width         │
│                                     │
│  ─── Quick Actions ───              │
│  📊 History  |  📈 Progress         │
│                                     │
│  ⚠️ Recovery Check:                 │
│  ✓ Chest ready (48hr passed)       │
│  ✓ Back ready (51hr passed)        │
│  ✓ All muscles recovered            │
│                                     │
│  🎯 Current Streak: 3 workouts      │
│  Next Deload: 5 workouts away       │
└─────────────────────────────────────┘
```

**Key Features:**
- Large primary action button (minimum 60px height)
- Recovery status immediately visible
- Next workout auto-determined by A/B/C rotation
- Cycle progress prevents overtraining

**Recovery Warning Override:**
If user arrives within 48 hours with muscle overlap, START button shows orange warning state requiring tap-to-confirm.

---

## 2. In-Workout Screen - Active Exercise Entry

**Purpose:** Log sets quickly with minimal taps

**Layout Strategy:**
- **Viewport constraint:** ~480px height (Moto Edge 60 Pro portrait)
- **Adaptive visibility:** Collapse completed, hide upcoming, expand current only
- **Sticky input area:** Current set inputs + LOG SET button always visible

**Screen Layout:**
```
┌─────────────────────────────────────┐
│ ← UPPER A         12:34        ⚙️   │  60px
├─────────────────────────────────────┤
│ ✓ Goblet Squat                      │  40px (collapsed)
│ → Cable Row (2/3 sets) ▼            │  50px (header)
│   ┌─────────────────────────────────┤
│   │ Last: 20kg × 10,11,12           │
│   │                                 │
│   │ Set 1: 20kg × 10 @ RIR 2 ✓      │
│   │ Set 2: 20kg × 11 @ RIR 2 ✓      │
│   │                                 │
│   │ ── Set 3 ──                     │  ~300px
│   │ 20kg [✎]  10 [✎]  RIR: ▼2      │  (expanded)
│   │                                 │
│   │     [LOG SET 3]  ← 60px tall    │
│   └─────────────────────────────────┤
│ [3 more exercises] Tap to expand ▼  │  40px
└─────────────────────────────────────┘
```

**Smart Default Behavior:**
- Weight/reps auto-fill from last workout's Set 1 data
- After logging Set 1, Set 2 unlocks with Set 1's values pre-filled
- RIR defaults to target range midpoint (RIR 2 for "2-3" range)
- Tap [✎] to open number input overlay

**Number Input Overlay:**
```
┌─────────────────────────────────────┐
│ Edit Weight                      ✕  │
├─────────────────────────────────────┤
│         20.0 kg                     │
│                                     │
│   [7][8][9]    [+2.5]               │  Each button
│   [4][5][6]    [+5.0]               │  70×70px
│   [1][2][3]    [-2.5]               │  (thumb-sized)
│   [←][0][.]    [Clear]              │
│                                     │
│        [CONFIRM]                    │  Full width
└─────────────────────────────────────┘
```

**Navigation Patterns:**
- Tap ✓ exercise → Jump to that exercise (review mode)
- Tap upcoming exercises group → Expand to see list
- After logging final set → Auto-advance to next exercise
- Swipe down on current exercise → See workout overview

**Post-Set Feedback:**
```
✓ Set 2 logged: 22.5kg × 10 @ RIR 2
🔵 Good progress - add 1-2 reps in Set 3
```

---

## 3. Progression Feedback System

**Purpose:** Provide actionable guidance after each set and workout

**Badge System (Color-Coded):**

🔵 **Normal Progress** (Blue)
- Trigger: RIR 2-3, reps within target range
- Message: "Keep building reps" or "Add 1-2 reps next set"
- Action: Continue as planned

🟢 **Ready to Progress** (Green)
- Trigger: Hit 3×12 @ RIR 2-3 (max reps in range)
- Message: "Next workout: Increase weight by 2.5kg"
- Action: App auto-suggests higher weight next session

🟡 **Plateau Warning** (Yellow)
- Trigger: Same weight/reps for 3+ consecutive workouts
- Message: "No progress in 3 sessions - review form or deload"
- Action: Suggests form check or slight deload

🔴 **Regression Alert** (Red)
- Trigger: Weight or reps decreased from last workout
- Message: "Check recovery - consider extra rest day"
- Action: Recovery warning, suggests investigation

⭐ **Milestone Unlocked** (Gold)
- Trigger: Equipment progression criteria met
- Message: "Barbell bench unlocked! Tap to view transition"
- Action: Opens progression guide with starting protocol

**Post-Workout Summary:**
```
┌─────────────────────────────────────┐
│ 🎉 UPPER A Complete!                │
│ Duration: 38 minutes                │
├─────────────────────────────────────┤
│ Progress Summary:                   │
│                                     │
│ 🟢 Goblet Squat - Ready to add 2.5kg│
│ 🔵 Cable Row - Building reps        │
│ 🔵 DB Bench - Building reps         │
│ 🟢 DB RDL - Ready to add 2.5kg      │
│ 🔵 Lateral Raise - On track         │
│ 🔵 Plank - Add 5 seconds next time  │
│                                     │
│ Cycle Progress: 5/8 until deload    │
│                                     │
│ [VIEW DETAILED STATS]               │
│ [FINISH WORKOUT]                    │
└─────────────────────────────────────┘
```

---

## 4. Exercise History View

**Purpose:** Track progress over time, identify trends

**Access:** Tap exercise name or 📈 button from any screen

**Layout:**
```
┌─────────────────────────────────────┐
│ ← Goblet Squat History         ⚙️  │
├─────────────────────────────────────┤
│ Progress Chart (Last 8 sessions)    │
│                                     │
│  25kg ┤                        ●    │
│  20kg ┤              ●    ●    ●    │
│  15kg ┤    ●    ●    ●             │
│  10kg ┤●   ●                        │
│       └─────────────────────────    │
│        Jan 15  Jan 22  Jan 29  Feb5 │
│                                     │
│ Recent Workouts:                    │
│                                     │
│ 📅 Feb 5 (3 days ago)               │
│ 20kg × 10,11,12 @ RIR 2,2,3        │
│ 🟢 Ready to progress                │
│                                     │
│ 📅 Feb 1 (7 days ago)               │
│ 20kg × 10,10,11 @ RIR 2,3,3        │
│ 🔵 Building reps                    │
│                                     │
│ 📅 Jan 29 (10 days ago)             │
│ 17.5kg × 12,12,12 @ RIR 2,2,2      │
│ 🟢 Weight increased to 20kg         │
│                                     │
│ [VIEW ALL HISTORY]                  │
│ [EXPORT DATA]                       │
└─────────────────────────────────────┘
```

**Key Features:**
- Visual chart shows trajectory, not just numbers
- Recent sessions provide context
- Progress badges show trend
- Export option for data backup

---

## 5. Progress Dashboard

**Purpose:** High-level view of training progress and body composition

**Layout:**
```
┌─────────────────────────────────────┐
│ Progress Dashboard              ⚙️  │
├─────────────────────────────────────┤
│ Last 4 Weeks Summary                │
│                                     │
│ ✅ Workouts completed: 11/12        │
│ ⏱️ Avg session time: 36 min         │
│ 📊 Exercises progressed: 15/18      │
│ 🔥 Current streak: 3 workouts       │
│                                     │
│ ─── Strength Gains ───              │
│                                     │
│ Goblet Squat: 15kg → 20kg (+33%)    │
│ DB Bench: 7.5kg → 10kg (+33%)       │
│ Cable Row: 20kg → 25kg (+25%)       │
│                                     │
│ ─── Body Composition ───            │
│                                     │
│ Current: 57.2 kg (178cm)            │
│ 8-week trend: +0.9 kg               │
│ Rate: +0.5 kg/month                 │
│ Status: 🟢 Healthy lean bulk        │
│                                     │
│ ⭐ Milestones Unlocked:             │
│ • First 20kg squat (Jan 29)         │
│ • 3-week consistency streak (Feb 1) │
│                                     │
│ 🎯 Next Milestones:                 │
│ █████░░░░░ 50% → Barbell bench      │
│ ███░░░░░░░ 30% → EZ curl bar        │
│                                     │
│ [DETAILED ANALYTICS]                │
└─────────────────────────────────────┘
```

**Body Weight Trend Chart:**
```
8-week trend (smoothed):
 58kg ┤                         ●
 57kg ┤              ●    ●    ●
 56kg ┤    ●    ●
      └──────────────────────────
       Dec  Jan  Jan  Jan  Feb
```

**Smart Weight Tracking Logic:**
- Weekly changes shown but not alarmed on
- Monthly trend determines status
- Single-week drops (-0.2kg) ignored as normal fluctuation
- Only flags if monthly trend shows consistent loss (>-0.5kg/month)

---

## 6. Body Weight Tracking

**Purpose:** Monitor muscle gain progress

**Integration Point:** Post-workout summary screen (weekly prompt)

**Weekly Weigh-In Flow:**
```
┌─────────────────────────────────────┐
│ 🎉 UPPER A Complete!                │
│ Duration: 38 minutes                │
├─────────────────────────────────────┤
│ 📊 Weekly Weigh-In                  │
│                                     │
│ You weighed yourself on the scale?  │
│                                     │
│ This week: [57.4] kg                │
│                                     │
│ Last week: 57.2 kg (+0.2)           │
│ 4-week average: 57.1 kg             │
│ 8-week trend: +0.9 kg (↗️ gaining)  │
│                                     │
│ Status: 🟢 On track for lean bulk   │
│                                     │
│ Note: Weekly changes are normal.    │
│ Focus on monthly trends.            │
│                                     │
│ [Log Weight]                        │
│ [Skip This Week]                    │
└─────────────────────────────────────┘
```

**Smart Insights (Auto-Generated):**
- Gaining >1.5kg/month: "Gaining quickly - some may be fat. Consider slowing to 0.5-1kg/month"
- Gaining <0.2kg/month: "Weight stable - may need more calories for muscle growth"
- Losing weight: "⚠️ Losing weight - hard to build muscle in deficit. Increase calories"

**Key Design Decisions:**
- Weekly prompts (not daily) reduce obsession
- Shows this week, last week, 4-week average, 8-week trend
- Fluctuations normalized (±0.2-0.7kg week-to-week expected)
- Action triggers on monthly trends only

---

## 7. Equipment Progression Tracking

**Purpose:** Guide transition to advanced equipment (barbells, EZ bar, etc.)

**Access:** From exercise detail or progress dashboard

**Layout:**
```
┌─────────────────────────────────────┐
│ ← Equipment Progression Guide       │
├─────────────────────────────────────┤
│ 🎯 Barbell Bench Press              │
│                                     │
│ Progress: ████████░░ 80%            │
│ Estimated readiness: 1-2 months     │
│                                     │
│ Ready when:                         │
│ ✅ DB Bench: 3×12 @ 20kg (Done!)    │
│ ✅ Consistent reps (89% stability)  │
│ ✅ No weight drops for 4 weeks      │
│ ⬜ 12+ weeks training (8 weeks done)│
│                                     │
│ Stability indicators:               │
│ • Reps per set: 10,11,12 (good)    │
│ • Weight steady: 4 sessions @ 20kg │
│ • RIR consistent: Always 2-3       │
│                                     │
│ Current status:                     │
│ You're making good progress! Keep   │
│ building stability with dumbbells.  │
│ Practice pausing at the bottom.     │
│                                     │
│ When ready:                         │
│ Start with empty barbell (20kg).    │
│ Keep RIR at 3-4 for first 2 weeks.  │
│                                     │
│ [MARK AS READY]                     │
│ [LEARN MORE]                        │
└─────────────────────────────────────┘
```

**Auto-Tracked Stability Criteria:**
```javascript
function calculateFormStability(exerciseHistory) {
  const signals = {
    repConsistency: checkRepVariance(sets),    // Low variance = stable
    noRegressions: checkWeightProgression(),   // No sudden drops
    steadyProgress: checkProgressionRate(),    // Consistent gains
    rirConsistency: checkRIRPattern(sets)      // Maintains 2-3 range
  };
  return calculateScore(signals); // 0-100%
}
```

**Equipment Progression List:**
- EZ Curl Bar: 1-2 months (DB curl 3×12 @ 5kg)
- Barbell Bench: 2-4 months (DB bench 3×12 @ 20kg)
- Barbell Squat: 3-6 months (Goblet squat 3×12 @ 20kg, Hack squat 3×12 @ 40kg)
- Barbell Deadlift: 4-6 months (DB RDL 3×12 @ 25kg, Hyperextension +10kg)
- Dips: 6-12 months (Push-ups 3×15, DB bench 3×12 @ 25kg)

---

## 8. Settings & Configuration

**Purpose:** Minimal configuration with sensible defaults

**Layout:**
```
┌─────────────────────────────────────┐
│ ← Settings                          │
├─────────────────────────────────────┤
│ 👤 Profile                          │
│ Height: 178 cm                      │
│ Current weight: 57.2 kg             │
│ Experience: Beginner                │
│ Training since: Jan 15, 2026        │
│ [Edit Profile]                      │
│                                     │
│ ─── Workout Settings ───            │
│                                     │
│ Default weight increment:           │
│ ○ 1.25kg  ● 2.5kg  ○ 5kg           │
│                                     │
│ Auto-advance after last set:        │
│ ● On  ○ Off                        │
│                                     │
│ Show technique notes:               │
│ ● Collapsed  ○ Expanded  ○ Hidden  │
│                                     │
│ ─── Recovery Settings ───           │
│                                     │
│ Recovery warning threshold:         │
│ ○ 24hr  ● 48hr  ○ 72hr             │
│                                     │
│ Deload reminder:                    │
│ ● Every 8 cycles  ○ Every 6 weeks  │
│                                     │
│ ─── Data Management ───             │
│                                     │
│ [📤 Export All Data (JSON)]         │
│ [📥 Import Backup]                  │
│ [🗑️ Clear All Data]                 │
│ Last backup: Never                  │
│                                     │
│ ─── Display ───                     │
│                                     │
│ Theme: ● Auto  ○ Light  ○ Dark     │
│ Text size: ○ Small  ● Medium  ○ Large│
│                                     │
│ ─── About ───                       │
│                                     │
│ BUILD Tracker v1.0.0                │
│ Data stored locally (Privacy-first) │
│ [View Documentation]                │
│ [Report Issue]                      │
└─────────────────────────────────────┘
```

**Key Design Decisions:**
- Defaults work for 90% of users
- Export/import prevents data loss
- Privacy-first (local storage, no cloud sync)
- Minimal options reduce decision fatigue

---

## 9. Special Flow Screens

### Recovery Warning Flow

**Trigger:** User starts workout <48 hours after last session with muscle overlap

```
┌─────────────────────────────────────┐
│ ⚠️ Recovery Check                   │
├─────────────────────────────────────┤
│ Last workout: 18 hours ago          │
│                                     │
│ Muscles still recovering:           │
│ • Quads: Need 30 more hours         │
│ • Chest: Need 30 more hours         │
│ • Back: Need 30 more hours          │
│                                     │
│ Training too soon may:              │
│ • Compromise form quality           │
│ • Limit performance gains           │
│ • Increase injury risk              │
│                                     │
│ Recommended:                        │
│ Wait until tomorrow (48hr mark)     │
│                                     │
│ [Wait Until Tomorrow] ← Recommended │
│ [Train Anyway - I Feel Great]      │
└─────────────────────────────────────┘
```

**If user picks "Train Anyway":**
```
┌─────────────────────────────────────┐
│ 💪 Optional Today                   │
├─────────────────────────────────────┤
│ Light cardio or mobility work?      │
│                                     │
│ [20-min Cardio + Stretch]           │
│ [Mobility Routine Only]             │
│ [Continue With Full Workout]        │
└─────────────────────────────────────┘
```

### Deload Week Flow

**Trigger:** 8 completed cycles in 6+ weeks at ≥1 cycle/week pace

```
┌─────────────────────────────────────┐
│ 🎯 Deload Week Recommended          │
├─────────────────────────────────────┤
│ You've completed 8 workout cycles   │
│ in 6 weeks - great consistency!     │
│                                     │
│ Why deload now?                     │
│ • Prevent fatigue accumulation      │
│ • Allow full recovery               │
│ • Come back stronger               │
│                                     │
│ This week:                          │
│ • Same exercises, 50% fewer sets    │
│ • Keep same weights (don't reduce)  │
│ • Focus on perfect form             │
│                                     │
│ Example: Goblet Squat               │
│ Normal: 3 sets × 8-12               │
│ Deload: 2 sets × 8-10 @ RIR 3-4     │
│                                     │
│ [Start Deload Week]                 │
│ [Skip Deload (Not Recommended)]     │
└─────────────────────────────────────┘
```

**During deload week:**
```
┌─────────────────────────────────────┐
│ 🟡 DELOAD WEEK - Workout A          │
├─────────────────────────────────────┤
│ Remember: Easier this week!         │
│ • 2 sets only (not 3)               │
│ • Stop at RIR 3-4 (very easy)       │
│ • Same weights as last week         │
│                                     │
│ 1. Goblet Squat - 2 × 8-10 @ RIR 3 │
│    Last: 20kg  [Start Exercise]     │
│ ...                                 │
└─────────────────────────────────────┘
```

### First-Time Onboarding

**Screen 1: User Profile**
```
┌─────────────────────────────────────┐
│ Welcome to BUILD Tracker!           │
├─────────────────────────────────────┤
│ Quick setup (2 minutes):            │
│                                     │
│ 1️⃣ Your Profile                     │
│ Height: [178] cm                    │
│ Weight: [57.2] kg                   │
│ Experience: ● Beginner ○ Intermediate│
│                                     │
│ 2️⃣ Training Goal                    │
│ ● Build muscle & strength           │
│ ○ Get stronger (maintain weight)    │
│ ○ Lose fat & build muscle          │
│                                     │
│ 3️⃣ Workout Structure                │
│ Full Body 3x/week (recommended)     │
│ Mon/Wed/Fri or flexible schedule    │
│                                     │
│ [Continue]                          │
└─────────────────────────────────────┘
```

**Screen 2: Starting Weights (Corrected for True Beginners)**
```
┌─────────────────────────────────────┐
│ Set Your Starting Weights           │
├─────────────────────────────────────┤
│ Start light - you'll progress fast! │
│                                     │
│ Goblet Squat: [5] kg DB             │
│ Cable Row: [15] kg                  │
│ DB Bench Press: [2.5] kg per hand   │
│ DB RDL: [5] kg per hand             │
│ Lateral Raise: [1] kg per hand      │
│ Overhead Press: [2.5] kg per hand   │
│                                     │
│ Tip: Choose weights that feel easy  │
│ for 10-12 reps. You'll add weight   │
│ every 1-2 weeks as a beginner.      │
│                                     │
│ Your progress (2 months):           │
│ DB Bench: 2.5kg → 7.5kg (+300%!)    │
│ Great gains for a beginner!         │
│                                     │
│ [Use These Suggestions]             │
│ [Customize Weights]                 │
└─────────────────────────────────────┘
```

---

## 10. Mobile Optimization Summary

**Target Device:** Moto Edge 60 Pro (6.7" display, ~400-430px width portrait)

**Viewport Management:**
- Header: 60px
- Current exercise expanded: ~400px
- Bottom padding: 20px
- Total viewport requirement: ~480px

**Touch Target Sizes:**
- Primary buttons: 60px height minimum
- Number pad buttons: 70×70px
- Edit icons: 44×44px minimum (accessibility standard)
- Dropdown selectors: 50px height

**Typography:**
- Headers: 18-20px
- Body text: 16px
- Small labels: 14px
- All text remains legible in gym lighting

**Color System (Accessible):**
- 🔵 Blue (Normal): #2196F3
- 🟢 Green (Progress): #4CAF50
- 🟡 Yellow (Warning): #FF9800
- 🔴 Red (Alert): #F44336
- ⭐ Gold (Milestone): #FFD700
- All meet WCAG AA contrast standards

---

## 11. Data Flow Summary

**Local Storage Structure:**
```javascript
{
  user: {
    height: 178,
    weight: [{ date: '2026-02-03', value: 57.2 }, ...],
    experienceLevel: 'beginner',
    startDate: '2026-01-15'
  },
  workoutRotation: {
    lastWorkout: 'A',
    lastDate: '2026-02-01',
    cycleCount: 5
  },
  workoutHistory: [
    {
      date: '2026-02-01',
      type: 'A',
      duration: 38,
      exercises: [
        {
          name: 'Goblet Squat',
          sets: [
            { weight: 20, reps: 10, rir: 2 },
            { weight: 20, reps: 11, rir: 2 },
            { weight: 20, reps: 12, rir: 3 }
          ]
        },
        ...
      ]
    },
    ...
  ],
  settings: {
    weightIncrement: 2.5,
    autoAdvance: true,
    techniqueNotes: 'collapsed',
    recoveryThreshold: 48,
    deloadTrigger: 'cycles'
  }
}
```

**Export Format:** JSON (human-readable, importable)

---

## 12. Implementation Priority

**Phase 1: MVP (Core Workout Tracking)**
1. Home screen with workout start
2. In-workout screen with set logging
3. Smart defaults (auto-fill from last workout)
4. Basic progression feedback (badges)
5. Exercise history view

**Phase 2: Intelligence Layer**
6. Recovery warnings (48hr muscle overlap detection)
7. Deload triggers (cycle + time + frequency logic)
8. Equipment progression tracking (auto-stability calculation)
9. Body weight tracking (weekly prompts, trend analysis)

**Phase 3: Polish & Refinement**
10. Progress dashboard (charts, milestones)
11. Settings & customization
12. Export/import data
13. First-time onboarding flow
14. Dark mode support

---

**End of UI/UX Design Document**
