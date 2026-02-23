# Automated Browser Console Tests

This directory contains automated test scripts designed to run in the browser console.

## Quick Start

**Run ALL tests:**
```javascript
fetch('./tests/test-runner.js').then(r => r.text()).then(eval);
```

**Or load individual test suites** (see sections below).

---

## Master Test Runner

### `test-runner.js` ⭐ RECOMMENDED

**The master test runner that executes all test suites and provides comprehensive reporting.**

**What it tests:**
- All exercises (28 exercises)
- All progression pathways (all slots across 4 workouts)
- All feature modules (23 modules)
- Phase integration (50+ tests)
- Workout rotation logic (sequence, streaks, cycles, recovery)
- Deload logic (phase-aware triggers, state management)
- Unlock system (criteria evaluation, phase prioritization)
- Smart progression (plateau detection, weight suggestions, decision engine)
- Rotation system (tenure tracking, 8-week cycles, unlock proximity suppression)

**Usage:**
```javascript
// Option 1: Load and auto-run everything
fetch('./tests/test-runner.js').then(r => r.text()).then(eval);

// Option 2: Manual control
fetch('./tests/test-runner.js').then(r => r.text()).then(eval);
// Then run:
testRunner.runAll()              // Run all tests
testRunner.runExercises()        // Run exercise tests only
testRunner.runProgressions()     // Run progression tests only
testRunner.runFeatures()         // Run feature tests only
testRunner.runPhaseIntegration() // Run phase tests only
testRunner.runWorkoutRotation()  // Run rotation logic tests only
testRunner.runDeloadLogic()      // Run deload logic tests only
testRunner.runUnlockSystem()     // Run unlock system tests only
testRunner.runSmartProgression() // Run smart progression tests only
testRunner.runRotationSystem()   // Run rotation system tests only
testRunner.stats()               // Show quick stats
testRunner.exportResults()       // Download JSON report
```

**Output:**
- Comprehensive pass/fail summary
- Success percentage per test suite
- Total duration
- Exportable JSON results

---

## Individual Test Suites

### 1. Exercise Testing

**`test-all-exercises.js`**

**Coverage:** All 28 exercises in the app
- Exercise definitions (sets, reps, weights, increments)
- Form cues (setup, execution, mistakes)
- Equipment profiles
- Complexity tier classification
- Workout integration

**Usage:**
```javascript
fetch('./tests/test-all-exercises.js').then(r => r.text()).then(eval);
// Results: window._exerciseTestResults
```

**What it validates:**
- Every exercise has required fields (sets, repRange, rirTarget, startingWeight)
- Valid sets count (1-5)
- Valid starting weights (> 0kg, < 200kg)
- Weight increments defined
- Form cues exist and are complete (setup, execution, mistakes)
- Equipment profiles defined
- Complexity tiers assigned
- Proper integration with workouts

**Sample Output:**
```
🏋️ COMPREHENSIVE EXERCISE TEST SUITE
═══════════════════════════════════════════════════════════════

✅ PASS: DB Flat Bench Press - Has required fields
✅ PASS: DB Flat Bench Press - Valid sets count (1-5)
✅ PASS: DB Flat Bench Press - Has form cues defined
...

📊 TEST SUMMARY
Exercise Definitions: 140/140 passed (100%)
Form Cues: 84/84 passed (100%)
Equipment Profiles: 28/28 passed (100%)

🎯 OVERALL: 252/252 tests passed (100%)
```

---

### 2. Progression Testing

**`test-all-progressions.js`**

**Coverage:** All progression pathways across all workout slots
- Slot definitions (UPPER_A_SLOT_1, UPPER_A_SLOT_2, etc.)
- Easier/harder/alternate options
- Target exercise existence
- Cross-slot consistency
- Unlock integration

**Usage:**
```javascript
fetch('./tests/test-all-progressions.js').then(r => r.text()).then(eval);
// Results: window._progressionTestResults
```

**What it validates:**
- All slots have current exercise defined
- Current exercises exist in workout system
- All easier/harder/alternate exercises exist
- No duplicates in progression arrays
- All progression exercises have equipment profiles
- All progression exercises have complexity tiers
- Slot naming conventions (WORKOUT_SLOT_N)
- Sequential slot numbering
- Unlock evaluator integration

**Sample Output:**
```
🔄 COMPREHENSIVE PROGRESSION PATHWAYS TEST SUITE
═══════════════════════════════════════════════════════════════

✅ PASS: UPPER_A_SLOT_1 - Has current exercise (Current: DB Flat Bench Press)
✅ PASS: UPPER_A_SLOT_1 - Current exercise exists in system
✅ PASS: UPPER_A_SLOT_1 - Harder[0]: "Barbell Bench Press" exists
...

📊 TEST SUMMARY
Slot Definitions: 48/48 passed (100%)
Easier Progressions: 32/32 passed (100%)
Harder Progressions: 45/45 passed (100%)
Unlock Integration: 12/12 passed (100%)

🎯 OVERALL: 189/189 tests passed (100%)
```

---

### 3. Feature Module Testing

**`test-all-features.js`**

**Coverage:** All 23 feature modules
- Module loading
- Public API methods
- Error handling
- App integration
- localStorage compatibility

**Usage:**
```javascript
fetch('./tests/test-all-features.js').then(r => r.text()).then(eval);
// Results: window._featureTestResults
```

**Modules tested:**
- Achievements
- Analytics Calculator
- Barbell Progression Tracker
- Body Weight
- Complexity Tiers
- Deload Manager
- Equipment Profiles
- Exercise Metadata
- Form Cues
- Optional Fifth Day
- Performance Analyzer
- Phase Manager
- Progress Analyzer
- Progression
- Progression Pathways
- Smart Progression
- Storage Manager
- Tempo Guidance
- Unlock Criteria
- Unlock Evaluator
- Warm-up Protocols
- Workout Manager
- Workouts

**What it validates:**
- Module loads without errors
- Public API methods exist
- Methods handle basic inputs without crashing
- Proper integration with window.app
- Safe error handling for edge cases

**Sample Output:**
```
⚙️ COMPREHENSIVE FEATURE MODULES TEST SUITE
═══════════════════════════════════════════════════════════════

✅ PASS: Storage Manager - Loads successfully
✅ PASS: Storage Manager - StorageManager instantiates
✅ PASS: Storage Manager - Has method: getExerciseHistory
✅ PASS: Phase Manager - PhaseManager instantiates
✅ PASS: Phase Manager - getPhase returns valid phase (Phase: building)
...

📊 TEST SUMMARY
Module Loading: 23/23 passed (100%)
Storage Manager: 8/8 passed (100%)
Phase Manager: 5/5 passed (100%)
App Integration: 5/5 passed (100%)

🎯 OVERALL: 95/95 tests passed (100%)
```

---

### 4. Phase Integration Tests

**`test-comprehensive-phase-integration.js`**

**Coverage:** 50+ automated tests for Build/Maintenance Phase Integration
- PhaseManager methods (getPhase, getProgressionBehavior, getDeloadSensitivity, getUnlockPriority)
- DeloadManager phase-aware timing (6 weeks Building, 4 weeks Maintenance)
- UnlockEvaluator phase-aware prioritization
- Error handling and edge cases
- State transitions between phases
- Reset and initialization behavior

**Usage:**
```javascript
fetch('./tests/test-comprehensive-phase-integration.js').then(r => r.text()).then(eval);
// Results: window._phaseTestResults
```

**Legacy test files:**
- `test-phase-integration-ui.js` - UI integration tests
- `test-phase-integration.js` - Earlier version (superseded)

---

### 5. Workout Rotation Logic Tests

**`test-workout-rotation.js`**

**Coverage:** Complete workout rotation algorithm testing
- Next workout suggestion (UPPER_A → LOWER_A → UPPER_B → LOWER_B cycle)
- Rotation sequence tracking (maintains last 12 workouts)
- Streak counting (increments on each workout completion)
- Cycle detection (full 4-workout rotations)
- Muscle recovery warnings (48-hour rest periods)
- State persistence across manager instances
- Edge cases (wrapping, state restoration)

**Usage:**
```javascript
fetch('./tests/test-workout-rotation.js').then(r => r.text()).then(eval);
// Results: window._workoutRotationTestResults
```

**What it validates:**
- Fresh rotation starts with UPPER_A
- Sequence advances correctly (A→B→C→D→A)
- Streak increments on each completion
- Cycle count increases after completing all 4 workouts
- Recovery warnings for same muscle groups < 48 hours apart
- State persists to localStorage correctly

**Sample Output:**
```
🔄 COMPREHENSIVE WORKOUT ROTATION LOGIC TEST SUITE
═══════════════════════════════════════════════════════════════

✅ PASS: Fresh rotation suggests UPPER_A
✅ PASS: After UPPER_A, suggests LOWER_A
✅ PASS: Cycle detected after completing all 4 workouts
✅ PASS: Warns when doing UPPER_B immediately after UPPER_A
...

📊 TEST SUMMARY
Initial State: 4/4 passed (100%)
Rotation Sequence: 5/5 passed (100%)
Streak Tracking: 5/5 passed (100%)
Cycle Detection: 3/3 passed (100%)
Muscle Recovery: 4/4 passed (100%)

🎯 OVERALL: 35/35 tests passed (100%)
```

---

### 6. Deload Logic Tests

**`test-deload-logic.js`**

**Coverage:** Phase-aware deload management testing
- Weeks-since-deload calculation (handles null, invalid dates, future dates)
- Phase-aware trigger thresholds (6 weeks Building, 4 weeks Maintenance)
- Deload state management (start, end, postpone)
- Days remaining calculation
- Phase integration with PhaseManager
- Edge cases (boundary conditions, error handling)

**Usage:**
```javascript
fetch('./tests/test-deload-logic.js').then(r => r.text()).then(eval);
// Results: window._deloadTestResults
```

**What it validates:**
- Returns 0 weeks for null/undefined/invalid lastDeloadDate
- Calculates correct weeks from date (7 days = 1 week, 28 days = 4 weeks, etc.)
- Building phase triggers after 6 weeks
- Maintenance phase triggers after 4 weeks
- Active deload prevents new triggers
- Postpone increments dismissedCount
- Days remaining calculated correctly

**Sample Output:**
```
⏸️ COMPREHENSIVE DELOAD LOGIC TEST SUITE
═══════════════════════════════════════════════════════════════

✅ PASS: Returns 0 weeks for null lastDeloadDate
✅ PASS: Building phase: Triggers after 6 weeks
✅ PASS: Maintenance phase: Triggers after 4 weeks
✅ PASS: startDeload() sets active to true
...

📊 TEST SUMMARY
Weeks Calculation: 7/7 passed (100%)
Phase-Aware Triggers: 4/4 passed (100%)
Deload State Management: 7/7 passed (100%)
Phase Integration: 3/3 passed (100%)

🎯 OVERALL: 40/40 tests passed (100%)
```

---

### 7. Unlock System Tests

**`test-unlock-system.js`**

**Coverage:** Exercise unlock evaluation system testing
- Simple tier exercises (always unlocked)
- Strength milestone checking (weight × reps × sets thresholds)
- Mobility requirement checking (3+ "yes" responses)
- Pain-free status checking (N consecutive pain-free workouts)
- Training weeks calculation (time since first workout)
- Phase-aware prioritization (bodyweight priority in Maintenance)
- Exercise type detection (barbell, bodyweight, traditional, equipment)
- Priority calculation (1 = high priority, 2 = lower, 999 = not recommended)

**Usage:**
```javascript
fetch('./tests/test-unlock-system.js').then(r => r.text()).then(eval);
// Results: window._unlockSystemTestResults
```

**What it validates:**
- SIMPLE tier always returns unlocked: true
- Already unlocked exercises return unlocked: true
- Strength milestones check recent performance (e.g., 15kg × 12 reps × 3 sets)
- Pain-free requires all recent workouts with painLevel: 0
- Training weeks calculated from first workout date
- Building phase: all exercises priority 1, all phase-recommended
- Maintenance phase: bodyweight priority 1, barbell priority 2
- Constructor requires PhaseManager instance

**Sample Output:**
```
🔓 COMPREHENSIVE UNLOCK SYSTEM TEST SUITE
═══════════════════════════════════════════════════════════════

✅ PASS: Simple tier exercise is always unlocked
✅ PASS: Building phase: All exercises have priority 1
✅ PASS: Maintenance phase: Bodyweight exercise has priority 1
✅ PASS: Maintenance phase: Barbell exercise has priority 2 (lower)
...

📊 TEST SUMMARY
Simple Tier: 3/3 passed (100%)
Phase-Aware Prioritization: 6/6 passed (100%)
Exercise Type Detection: 6/6 passed (100%)
Strength Milestones: 3/3 passed (100%)

🎯 OVERALL: 45/45 tests passed (100%)
```

---

### 8. Smart Progression Tests

**`test-smart-progression.js`**

**Coverage:** Smart progression calculation engine testing
- Rep range checking (standard 8-12 reps, time-based for planks)
- Plateau detection (same weight for 3+ workouts)
- Regression detection (weight drop OR 25%+ rep drop)
- Weight gap failure (increased weight, failed min reps, RIR 0)
- Successful progression (top reps with RIR 2-3)
- Weight increase suggestions (+2.5kg standard increment)
- Adaptive pattern learning (detects user's progression pattern)
- Main decision engine (getSuggestion with 7-priority system)

**Usage:**
```javascript
fetch('./tests/test-smart-progression.js').then(r => r.text()).then(eval);
// Results: window._smartProgressionTestResults
```

**What it validates:**
- hitTopOfReps returns true for reps >= max (12)
- Plateau detected when same weight for 3+ workouts
- Regression detected on weight drop OR 25%+ rep drop
- Weight gap failure requires: weight increase + below min reps + RIR 0
- Successful progression requires: top reps (12) + good RIR (2-3)
- Weight increase suggests +2.5kg increment
- Adaptive learning detects large jumps (5kg) vs small steps (1kg)
- getSuggestion priorities: pain → progression → rotation → weight gap → plateau → regression → continue

**Sample Output:**
```
📈 COMPREHENSIVE SMART PROGRESSION TEST SUITE
═══════════════════════════════════════════════════════════════

✅ PASS: Returns true for 12 reps (top of standard range)
✅ PASS: Detects plateau with same weight for 3 workouts
✅ PASS: Detects regression with 25%+ rep drop at same weight
✅ PASS: Priority 1: Pain handling takes precedence
...

📊 TEST SUMMARY
Rep Range: 4/4 passed (100%)
Plateau Detection: 3/3 passed (100%)
Regression Detection: 3/3 passed (100%)
Decision Engine: 5/5 passed (100%)

🎯 OVERALL: 50/50 tests passed (100%)
```

---

### 9. Rotation System Tests

**`test-rotation-system.js`**

**Coverage:** Exercise rotation and muscle coverage system
- Tenure tracking (weeks on current exercise)
- Rotation eligibility (8-week threshold)
- Unlock proximity suppression (80%+ progress)
- Rotation pool management (rotation variants)
- Smart progression integration (Priority 3)

**Usage:**
```javascript
fetch('./tests/test-rotation-system.js').then(r => r.text()).then(eval);
// Results: window._rotationSystemTestResults
```

**What it validates:**
- getTenure returns 0 weeks for exercises with no history
- Calculates tenure from first workout date (e.g., 4 weeks from 28 days ago)
- Resets tenure to 0 weeks after rotation
- No rotation suggestion before 8 weeks
- Rotation suggestion appears at 8 weeks
- Suggests correct rotation variant (e.g., Tricep Pushdowns → Overhead Tricep Extension)
- No rotation for exercises without rotation pool
- Suppresses rotation when user 80%+ toward unlock milestone
- Shows rotation when user <80% toward unlock

**Sample Output:**
```
🔄 COMPREHENSIVE ROTATION SYSTEM TEST SUITE
═══════════════════════════════════════════════════════════════

✅ PASS: Returns 0 weeks for exercise with no history
✅ PASS: Calculates 4 weeks from first workout 28 days ago
✅ PASS: Resets tenure to 0 weeks after rotation
✅ PASS: No rotation suggestion before 8 weeks
✅ PASS: Rotation suggestion appears at 8 weeks
✅ PASS: Suggests correct rotation variant
...

📊 TEST SUMMARY
Tenure Tracking: 3/3 passed (100%)
Rotation Eligibility: 4/4 passed (100%)
Unlock Proximity: 2/2 passed (100%)

🎯 OVERALL: 9/9 tests passed (100%)
```

---

## How to Run Automated Tests

### Step 1: Start Local Server

```bash
cd "/home/plawate/Documents and more/workout-build-tracker"
python3 -m http.server 8000
```

### Step 2: Open App in Browser

Navigate to: `http://localhost:8000`

### Step 3: Open Browser DevTools

Press `F12` or right-click → "Inspect" → "Console" tab

### Step 4: Load Test Script

**Method A: Copy-Paste (Recommended)**
```bash
# In terminal, display the test file
cat tests/test-comprehensive-phase-integration.js

# Copy entire output, paste into browser console, press Enter
```

**Method B: Load via Console**
```javascript
// In browser console:
fetch('./tests/test-comprehensive-phase-integration.js')
  .then(r => r.text())
  .then(eval);
```

### Step 5: Review Results

The test suite will automatically:
1. Run all tests
2. Display ✅ PASS or ❌ FAIL for each test
3. Show summary with pass/fail counts by category
4. Log detailed failure information

**Example Output:**
```
🔬 COMPREHENSIVE PHASE INTEGRATION TEST SUITE
═══════════════════════════════════════════════════════════════

✅ PASS: PhaseManager - getPhase() defaults to "building" when null
✅ PASS: PhaseManager - getPhase() handles invalid phases
✅ PASS: DeloadManager - Building phase uses 6 week threshold
✅ PASS: DeloadManager - Maintenance phase uses 4 week threshold
...

📊 SUMMARY
════════════════════════════════════════════════════════════════
PhaseManager: 13/13 passed
DeloadManager: 15/15 passed
Error Handling: 7/7 passed
Total: 50/50 passed (100%)
```

---

## Test Categories

### 1. Unit Tests (Backend Logic)
- **PhaseManager** - Phase coordination and behavior
- **DeloadManager** - Phase-aware deload timing
- **UnlockEvaluator** - Phase-aware unlock prioritization

### 2. Integration Tests
- State transitions (Building ↔ Maintenance)
- Deload timing calculation with phase context
- Unlock priority evaluation with phase context

### 3. Error Handling Tests
- Null/undefined inputs
- Corrupted localStorage data
- Invalid phase values
- Missing dependencies

### 4. UI Tests (Manual + Automated)
- Phase toggle persistence
- Progression message changes
- Unlock priority UI sorting
- Visual badge display
- DOM element existence checks

### 5. Edge Cases
- Boundary conditions (exactly 6 weeks, exactly 4 weeks)
- Future dates
- Reset behavior
- Multiple state changes

---

## Manual Testing

For comprehensive end-to-end manual testing, refer to:

**`docs/testing/integration-test-master.md`**
- Master manual test document
- Feature 10: Build/Maintenance Phase Integration (Tests 10.1-10.15)
- Feature 12: Kettlebell Integration (Tests 12.1-12.28)
- All other features with manual test scenarios

---

## When to Run These Tests

**Run automated tests when:**
- ✅ Making changes to phase-related code
- ✅ Modifying PhaseManager, DeloadManager, or UnlockEvaluator
- ✅ Before deploying phase integration updates
- ✅ Debugging phase-related bugs
- ✅ After localStorage schema changes

**Use manual tests (integration-test-master.md) when:**
- ✅ Testing complete user workflows
- ✅ Pre-production regression testing
- ✅ Cross-browser compatibility checks
- ✅ Mobile responsiveness verification
- ✅ User acceptance testing

---

## Creating New Automated Tests

Follow this pattern for browser console tests:

```javascript
/**
 * Feature Name - Test Suite
 *
 * USAGE:
 * 1. Open app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 */

(async function runTests() {
  console.clear();
  console.log('🔬 YOUR FEATURE TEST SUITE\n');

  const results = { passed: 0, failed: 0, tests: [] };

  function logTest(name, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${passed ? 'PASS' : 'FAIL'}: ${name}`);
    if (details) console.log(`   ${details}`);
    results.tests.push({ name, passed, details });
    passed ? results.passed++ : results.failed++;
  }

  // Test 1: Check something
  try {
    const result = window.app.someModule.someMethod();
    logTest('someMethod returns expected value', result === 'expected');
  } catch (e) {
    logTest('someMethod returns expected value', false, e.message);
  }

  // ... more tests ...

  // Summary
  console.log(`\n📊 SUMMARY: ${results.passed}/${results.passed + results.failed} passed`);
})();
```

---

## Test File Organization

```
tests/
├── README.md                                    ← This file
├── test-comprehensive-phase-integration.js      ← Phase integration (comprehensive)
├── test-phase-integration-ui.js                 ← Phase integration UI tests
├── test-phase-integration.js                    ← Phase integration (legacy)
├── integration/                                 ← Integration test data/fixtures
└── unit/                                        ← Unit test data/fixtures
```

---

## Troubleshooting

**Problem:** Tests fail with "Cannot read property of undefined"
- **Solution:** Ensure app is fully loaded before running tests. Wait for home screen to appear.

**Problem:** Import errors or module not found
- **Solution:** Make sure you're running from `http://localhost:8000`, not `file://` protocol.

**Problem:** localStorage errors
- **Solution:** Clear localStorage before testing: `localStorage.clear(); location.reload();`

**Problem:** Service worker cache issues
- **Solution:** Hard refresh (Ctrl+Shift+R) or disable service worker in DevTools.

---

## Contributing

When adding new features:
1. Create automated browser console tests (if applicable)
2. Add manual test scenarios to `docs/testing/integration-test-master.md`
3. Document test expectations clearly
4. Ensure 100% pass rate before committing
5. Update this README if adding new test files
