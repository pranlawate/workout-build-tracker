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
