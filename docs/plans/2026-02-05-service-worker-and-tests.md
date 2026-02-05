# Service Worker & Integration Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, OR use superpowers:subagent-driven-development for parallel execution with review checkpoints.

**Status:** ✅ COMPLETE - All tasks implemented and tested (2026-02-05)

**Goal:** Add offline caching with Service Worker and comprehensive integration tests for the workout flow

**Architecture:** Cache-first strategy for static assets, network-first for dynamic data. Integration tests verify the complete user journey from home screen to workout completion.

**Tech Stack:**
- Service Worker API (Workbox-free, vanilla implementation)
- Manual test checklist (zero dependencies approach chosen)

**Context:** Tasks 1-9 complete. Core app is functional with UI, progression tracking, and data persistence. Need offline capability and end-to-end testing.

## Implementation Summary

- ✅ **Task 10**: Service Worker implementation (commits 06a2821, 64cdbe7)
- ✅ **Task 11**: Manual integration test checklist (commit 6bf6b55)

---

## Task 10: Service Worker for Offline Caching

**Goal:** Enable offline-first PWA functionality with intelligent caching strategies

**Files:**
- Create: `src/sw.js` (Service Worker)
- Modify: `src/index.html` (register Service Worker)
- Create: `tests/unit/sw.test.js` (optional - Service Worker logic tests)

### Step 1: Create Service Worker skeleton

Create `src/sw.js`:

```javascript
const CACHE_NAME = 'build-tracker-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/components.css',
  '/css/screens.css',
  '/css/workout-screen.css',
  '/js/app.js',
  '/js/modules/storage.js',
  '/js/modules/workouts.js',
  '/js/modules/progression.js',
  '/js/modules/workout-manager.js',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return cached response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-GET requests or external URLs
            if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
              return networkResponse;
            }

            // Clone the response (can only be consumed once)
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Network failed and not in cache
            // Could return a custom offline page here
            return new Response('Offline', { status: 503 });
          });
      })
  );
});
```

**Why this approach:**
- Cache-first strategy: faster load times, works offline
- Automatic cache cleanup on version change
- Runtime caching for resources not pre-cached
- Graceful degradation when offline

### Step 2: Register Service Worker in HTML

Modify `src/index.html` - add before closing `</body>` tag:

```html
  <script type="module" src="js/app.js"></script>

  <!-- Service Worker Registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  </script>
</body>
```

**Why after window load:**
- Prevents SW registration from competing with app initialization
- Better performance on first load

### Step 3: Test Service Worker registration

**Manual browser test:**

1. Open `src/index.html` in Chrome/Edge
2. Open DevTools → Application → Service Workers
3. Verify Service Worker is registered and activated
4. Check "Offline" checkbox in DevTools
5. Refresh page - should still work
6. Expected: App loads from cache, no network errors

**Test checklist:**
- [ ] Service Worker shows "activated and is running"
- [ ] All static assets cached (check Application → Cache Storage)
- [ ] App works offline (DevTools offline mode)
- [ ] Console shows "Service Worker registered"

### Step 4: Add cache versioning strategy

Modify `src/sw.js` - add version update logic:

```javascript
const CACHE_NAME = 'build-tracker-v1';

// Update this version number when deploying changes
const APP_VERSION = '1.0.0';

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

Add to `src/index.html` Service Worker registration:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);

        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);

        // Listen for new Service Worker waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New Service Worker available
              if (confirm('New version available! Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
```

**Why this approach:**
- Automatic update checks every minute
- User-friendly update prompt
- No forced refreshes (user controls when to update)

### Step 5: Test cache invalidation

**Manual test:**

1. Load app, verify Service Worker active
2. Change `CACHE_NAME` to `'build-tracker-v2'` in `sw.js`
3. Refresh page multiple times
4. Verify old cache deleted, new cache created
5. Expected: DevTools shows only v2 cache

**Test checklist:**
- [ ] Old cache removed from Cache Storage
- [ ] New cache created with updated name
- [ ] App still works normally
- [ ] Update prompt appears (if implemented)

### Step 6: Commit Service Worker implementation

```bash
git add src/sw.js src/index.html
git commit -m "feat: add service worker for offline caching

- Implement cache-first strategy for static assets
- Add automatic cache cleanup on version change
- Add runtime caching for dynamic resources
- Add update detection and user prompt
- Enable offline-first PWA functionality"
```

**Verification:**
- Service Worker file created
- Registration code added to HTML
- Manual offline test passes

---

## Task 11: Integration Tests for Workout Flow

**Goal:** Add browser-based integration tests covering the complete user journey

**Files:**
- Create: `tests/integration/workout-flow.test.js`
- Create: `tests/integration/helpers/browser.js` (test utilities)
- Modify: `package.json` (add Playwright dependency and test scripts)

**Note:** Integration tests require Playwright. If you want to keep zero dependencies, skip to Alternative Approach below.

### Approach A: Full Integration Tests with Playwright

#### Step 1: Install Playwright

```bash
npm install --save-dev playwright
npx playwright install chromium
```

Update `package.json`:

```json
{
  "scripts": {
    "test": "node --test tests/unit/**/*.test.js",
    "test:watch": "node --test --watch tests/unit/**/*.test.js",
    "test:integration": "node --test tests/integration/**/*.test.js",
    "test:all": "npm run test && npm run test:integration"
  },
  "devDependencies": {
    "playwright": "^1.40.0"
  }
}
```

#### Step 2: Create test helper utilities

Create `tests/integration/helpers/browser.js`:

```javascript
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createBrowser() {
  const browser = await chromium.launch({ headless: true });
  return browser;
}

export async function createPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 }, // iPhone 11 Pro size
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  // Mock localStorage if needed
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  return page;
}

export function getAppUrl() {
  // Serve from file system
  const appPath = resolve(__dirname, '../../../src/index.html');
  return `file://${appPath}`;
}

export async function waitForWorkoutScreen(page) {
  await page.waitForSelector('#workout-screen.active', { timeout: 5000 });
}

export async function waitForHomeScreen(page) {
  await page.waitForSelector('#home-screen.active', { timeout: 5000 });
}

export async function clearAppData(page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}
```

#### Step 3: Write failing integration test - Home screen

Create `tests/integration/workout-flow.test.js`:

```javascript
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createBrowser, createPage, getAppUrl, waitForHomeScreen } from './helpers/browser.js';

describe('Workout Flow Integration Tests', () => {
  let browser;
  let page;

  before(async () => {
    browser = await createBrowser();
    page = await createPage(browser);
  });

  after(async () => {
    await browser.close();
  });

  it('should display home screen with next workout', async () => {
    await page.goto(getAppUrl());
    await waitForHomeScreen(page);

    // Check home screen is active
    const homeScreenVisible = await page.isVisible('#home-screen.active');
    assert.equal(homeScreenVisible, true, 'Home screen should be visible');

    // Check next workout name is displayed
    const workoutName = await page.textContent('#next-workout-name');
    assert.ok(workoutName.length > 0, 'Next workout name should be displayed');

    // Check "Last trained: Never" for first load
    const lastTrained = await page.textContent('#last-trained');
    assert.equal(lastTrained, 'Last trained: Never', 'Should show never trained on first load');

    // Check Start Workout button exists
    const startButton = await page.isVisible('#start-workout-btn');
    assert.equal(startButton, true, 'Start workout button should be visible');
  });
});
```

#### Step 4: Run test to verify it fails (or passes if app works)

```bash
npm run test:integration
```

**Expected:** Test should pass (app already works)

If test fails, debug with:
- Check console errors: `await page.on('console', msg => console.log(msg.text()))`
- Screenshot: `await page.screenshot({ path: 'debug.png' })`

#### Step 5: Write test - Start workout and render exercises

Add to `tests/integration/workout-flow.test.js`:

```javascript
it('should start workout and display exercises', async () => {
  await page.goto(getAppUrl());
  await waitForHomeScreen(page);

  // Click Start Workout button
  await page.click('#start-workout-btn');

  // Wait for workout screen to appear
  await page.waitForSelector('#workout-screen.active', { timeout: 5000 });

  // Check workout screen is visible
  const workoutScreenVisible = await page.isVisible('#workout-screen.active');
  assert.equal(workoutScreenVisible, true, 'Workout screen should be visible');

  // Check home screen is hidden
  const homeScreenVisible = await page.isVisible('#home-screen.active');
  assert.equal(homeScreenVisible, false, 'Home screen should be hidden');

  // Check workout title is displayed
  const workoutTitle = await page.textContent('#workout-title');
  assert.ok(workoutTitle.length > 0, 'Workout title should be displayed');

  // Check exercises are rendered
  const exercises = await page.locator('.exercise-item').count();
  assert.ok(exercises > 0, 'Should render at least one exercise');

  // Check timer is running
  const timerText = await page.textContent('#timer');
  assert.match(timerText, /\d{2}:\d{2}/, 'Timer should display MM:SS format');
});
```

#### Step 6: Write test - Log sets and complete workout

Add to `tests/integration/workout-flow.test.js`:

```javascript
it('should log sets and complete workout', async () => {
  await page.goto(getAppUrl());
  await waitForHomeScreen(page);

  // Start workout
  await page.click('#start-workout-btn');
  await page.waitForSelector('#workout-screen.active');

  // Fill in first set of first exercise
  const firstWeightInput = await page.locator('.set-input[data-exercise="0"][data-set="0"][data-field="weight"]');
  await firstWeightInput.fill('10');

  const firstRepsInput = await page.locator('.set-input[data-exercise="0"][data-set="0"][data-field="reps"]');
  await firstRepsInput.fill('12');

  const firstRirInput = await page.locator('.set-input[data-exercise="0"][data-set="0"][data-field="rir"]');
  await firstRirInput.fill('2');

  // Check real-time feedback (colored border)
  const setRow = await page.locator('.set-input[data-exercise="0"][data-set="0"][data-field="reps"]').locator('..');
  const borderStyle = await setRow.evaluate(el => el.style.borderLeft);
  assert.ok(borderStyle.length > 0, 'Set should have colored border feedback');

  // Complete workout
  await page.click('#complete-workout-btn');

  // Handle alert
  page.once('dialog', async dialog => {
    assert.ok(dialog.message().includes('completed'), 'Should show completion message');
    await dialog.accept();
  });

  // Wait for return to home screen
  await waitForHomeScreen(page);

  // Check home screen is visible again
  const homeScreenVisible = await page.isVisible('#home-screen.active');
  assert.equal(homeScreenVisible, true, 'Should return to home screen');

  // Check "Last trained: Today"
  const lastTrained = await page.textContent('#last-trained');
  assert.equal(lastTrained, 'Last trained: Today', 'Should show trained today');

  // Check next workout rotated
  const nextWorkout = await page.textContent('#next-workout-name');
  assert.notEqual(nextWorkout, '', 'Next workout should be displayed');
});
```

#### Step 7: Write test - Progression badge display

Add to `tests/integration/workout-flow.test.js`:

```javascript
it('should display progression badges correctly', async () => {
  await page.goto(getAppUrl());
  await waitForHomeScreen(page);

  // Start workout
  await page.click('#start-workout-btn');
  await page.waitForSelector('#workout-screen.active');

  // Check for "First Time" badge on first exercise
  const firstBadge = await page.locator('.exercise-item').first().locator('.progression-badge').textContent();
  assert.ok(firstBadge.includes('First Time') || firstBadge.includes('In Progress'),
    'Should show First Time or In Progress badge');

  // Check for progression hint
  const firstHint = await page.locator('.exercise-item').first().locator('.progression-hint').textContent();
  assert.ok(firstHint.length > 0, 'Should display progression hint');
});
```

#### Step 8: Run all integration tests

```bash
npm run test:integration
```

**Expected:** All tests pass

If failures occur:
- Check selector accuracy
- Add wait times for animations
- Verify localStorage state between tests

#### Step 9: Write test - Data persistence

Add to `tests/integration/workout-flow.test.js`:

```javascript
it('should persist workout data across page reloads', async () => {
  await page.goto(getAppUrl());
  await waitForHomeScreen(page);

  // Complete a workout with data
  await page.click('#start-workout-btn');
  await page.waitForSelector('#workout-screen.active');

  // Log first set
  await page.fill('.set-input[data-exercise="0"][data-set="0"][data-field="weight"]', '10');
  await page.fill('.set-input[data-exercise="0"][data-set="0"][data-field="reps"]', '12');
  await page.fill('.set-input[data-exercise="0"][data-set="0"][data-field="rir"]', '2');

  // Complete workout
  await page.click('#complete-workout-btn');
  page.once('dialog', dialog => dialog.accept());
  await waitForHomeScreen(page);

  // Get next workout name
  const nextWorkout = await page.textContent('#next-workout-name');

  // Reload page
  await page.reload();
  await waitForHomeScreen(page);

  // Verify data persisted
  const reloadedWorkout = await page.textContent('#next-workout-name');
  assert.equal(reloadedWorkout, nextWorkout, 'Next workout should persist after reload');

  const reloadedLastTrained = await page.textContent('#last-trained');
  assert.equal(reloadedLastTrained, 'Last trained: Today', 'Last trained date should persist');
});
```

#### Step 10: Commit integration tests

```bash
git add tests/integration package.json
git commit -m "test: add integration tests for workout flow

- Add Playwright-based browser automation tests
- Test home screen display and navigation
- Test workout start, set logging, and completion
- Test progression badge rendering
- Test data persistence across page reloads
- Add test helpers for browser setup and utilities"
```

---

### Approach B: Lightweight Manual Test Checklist (Zero Dependencies)

If you want to avoid Playwright dependency, create a manual test checklist instead:

#### Step 1: Create manual test document

Create `tests/integration/MANUAL_TEST_CHECKLIST.md`:

```markdown
# Manual Integration Test Checklist

## Test Environment Setup
- [ ] Clear browser cache and localStorage
- [ ] Open `src/index.html` in Chrome/Firefox
- [ ] Open DevTools console (check for errors)

## Test 1: Home Screen Display
- [ ] Page loads without errors
- [ ] "BUILD Tracker" header displays
- [ ] Next workout name shows (e.g., "Upper A - Horizontal")
- [ ] "Last trained: Never" shows on first load
- [ ] "START WORKOUT" button is visible and styled
- [ ] Recovery status shows "✓ All muscles recovered"

## Test 2: Start Workout Flow
- [ ] Click "START WORKOUT" button
- [ ] Home screen hides
- [ ] Workout screen appears
- [ ] Workout title displays correctly
- [ ] Exercise list renders with all exercises
- [ ] Each exercise shows:
  - [ ] Exercise name
  - [ ] Sets × Reps × RIR metadata
  - [ ] Input fields for weight, reps, RIR
  - [ ] "🔵 First Time" badge (first workout)
  - [ ] Progression hint text
- [ ] Timer starts at 00:00 and increments

## Test 3: Set Logging
- [ ] Enter weight (e.g., 10) in first set
- [ ] Enter reps (e.g., 12) in first set
- [ ] Enter RIR (e.g., 2) in first set
- [ ] Set row shows colored border (green/blue/red based on values)
- [ ] Repeat for 2-3 more sets
- [ ] All inputs accept numeric values correctly
- [ ] Negative values rejected (if validation exists)

## Test 4: Complete Workout
- [ ] Click "COMPLETE WORKOUT" button
- [ ] Alert shows "✅ [Workout Name] completed!"
- [ ] Click OK on alert
- [ ] Returns to home screen
- [ ] "Last trained: Today" now displays
- [ ] Next workout name changed (rotation working)
- [ ] Timer stopped

## Test 5: Data Persistence
- [ ] Refresh browser page (F5)
- [ ] "Last trained: Today" still shows
- [ ] Next workout name persists
- [ ] Start the next workout
- [ ] Previous workout's weight values pre-fill in inputs
- [ ] Data persisted correctly in localStorage

## Test 6: Progression Badges
- [ ] Complete a workout with max reps (e.g., 12 reps for 8-12 range) at good RIR
- [ ] Rotate back to same workout
- [ ] Start workout
- [ ] Exercise shows "🟢 Ready to Progress" badge
- [ ] Hint shows "✨ Increase to [X]kg this session!"
- [ ] Weight input pre-filled with increased weight

## Test 7: Offline Mode (Service Worker)
- [ ] Open DevTools → Application → Service Workers
- [ ] Verify Service Worker active
- [ ] Check "Offline" checkbox in DevTools Network tab
- [ ] Refresh page
- [ ] App loads from cache
- [ ] All features work offline
- [ ] Uncheck "Offline"

## Test 8: Mobile Responsiveness
- [ ] Open DevTools → Toggle device toolbar
- [ ] Test on iPhone 11 Pro (414×896)
- [ ] All text readable
- [ ] Buttons large enough to tap (60px min)
- [ ] No horizontal scrolling
- [ ] Inputs focused properly on tap

## Pass Criteria
- All checkboxes checked ✅
- No console errors
- Smooth user experience
- Data persists correctly

## Notes
[Add any observations or bugs found]
```

#### Step 2: Run through manual tests

Perform each test in the checklist systematically.

**Document results:**
- ✅ Pass
- ❌ Fail (with notes)
- ⚠️ Warning (works but has issues)

#### Step 3: Commit manual test checklist

```bash
git add tests/integration/MANUAL_TEST_CHECKLIST.md
git commit -m "test: add manual integration test checklist

- Document complete user journey testing steps
- Cover home screen, workout flow, persistence
- Include offline mode and mobile testing
- Zero dependencies, browser-based validation"
```

---

## Verification Checklist

After completing Tasks 10-11:

**Task 10 (Service Worker):**
- [ ] `src/sw.js` created with cache strategies
- [ ] Service Worker registered in `index.html`
- [ ] App works offline (DevTools offline mode test)
- [ ] Cache updated on version change
- [ ] Update prompt appears for new versions

**Task 11 (Integration Tests):**

**If Playwright approach:**
- [ ] `tests/integration/workout-flow.test.js` created
- [ ] All 5 integration tests pass
- [ ] Playwright installed and configured
- [ ] `npm run test:integration` runs successfully

**If manual checklist approach:**
- [ ] `tests/integration/MANUAL_TEST_CHECKLIST.md` created
- [ ] All manual tests performed and passed
- [ ] Results documented

**Final validation:**
- [ ] `npm run test` passes (unit tests)
- [ ] `npm run test:integration` passes OR manual checklist complete
- [ ] App works in Chrome, Firefox, Safari
- [ ] App installable as PWA (Add to Home Screen)
- [ ] Offline mode functional

---

## Next Steps After Completion

1. **Deploy to GitHub Pages** (optional):
   - Enable GitHub Pages in repo settings
   - Deploy `src/` folder
   - Test PWA installation from live URL

2. **Performance Optimization** (future):
   - Add lazy loading for CSS
   - Minify JavaScript files
   - Optimize icon sizes

3. **Additional Features** (future):
   - Export workout history to JSON/CSV
   - Import/restore from backup
   - Dark/light theme toggle
   - Custom workout creation

---

## Notes

- **Service Worker Gotchas:**
  - Always test in Incognito mode (clean slate)
  - Hard refresh (Cmd+Shift+R) bypasses Service Worker
  - Update Service Worker requires version bump in `CACHE_NAME`

- **Integration Test Gotchas:**
  - File:// URLs have CORS restrictions
  - May need local server for full testing: `npx serve src`
  - Playwright requires Chromium download (~200MB)

- **Zero Dependencies Philosophy:**
  - Manual testing is valid for small projects
  - Playwright is dev dependency only (doesn't bloat production)
  - Choose based on project needs and team preferences
