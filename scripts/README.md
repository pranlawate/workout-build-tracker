# Diagnostic & Utility Scripts

Browser console diagnostic scripts for troubleshooting and analysis.

## Usage

All scripts are designed to be pasted into the browser console while the app is running.

---

## Scripts

### `force-cache-clear.js`
**Purpose:** Completely clears service worker caches and forces a fresh reload.

**When to use:**
- After updating to a new version and seeing stale cached content
- Troubleshooting cache-related issues
- Testing fresh app state

**Usage:**
```javascript
// Copy entire file contents, paste into console, press Enter
```

**What it does:**
- Deletes all cache storage
- Unregisters service workers
- Reloads the page

---

### `check-version.js`
**Purpose:** Displays current app version and cache information.

**When to use:**
- Verifying which version is running
- Confirming cache version after updates
- Debugging version mismatch issues

**Usage:**
```javascript
// Copy entire file contents, paste into console
```

**Output:**
```
=== VERSION CHECK ===
Service Worker Cache: build-tracker-v71
...
```

---

### `diagnose-unlock.js`
**Purpose:** Diagnoses unlock notification and achievement system issues.

**When to use:**
- Achievement notifications not appearing
- Unlock criteria not triggering
- Troubleshooting barbell progression tracking

**Usage:**
```javascript
// Run AFTER completing a workout with expected achievements
// Copy entire file contents, paste into console
```

**What it checks:**
- Achievement notification history
- Unlock criteria progress
- Missing notifications
- Achievement data integrity

---

### `analyze-complex-exercises.js`
**Purpose:** Analyzes COMPLEX tier exercise distribution across workouts.

**When to use:**
- Understanding which exercises require mobility checks
- Verifying unlock prerequisite distribution
- Analyzing workout complexity balance

**Usage:**
```javascript
// Copy entire file contents, paste into console
```

**Output:**
- Lists COMPLEX exercises by workout
- Shows mobility check requirements
- Identifies barbell progression paths

---

## Notes

- These scripts are **diagnostic tools only** - they don't modify app functionality
- `force-cache-clear.js` is the only script that modifies state (clears caches)
- All scripts are safe to run multiple times
- Scripts use ES6 modules and async/await (requires modern browser)

---

## Adding New Scripts

When creating new diagnostic scripts:
1. Add clear purpose and usage comments at the top
2. Use descriptive console.log prefixes (e.g., `[Diagnostic]`)
3. Include sample output in comments
4. Document in this README
5. Keep scripts focused on a single diagnostic purpose
