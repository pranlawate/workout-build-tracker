# Exercise Video Library Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add self-contained exercise video library with searchable UI, accessible during workouts, pre-workout, and as standalone reference screen.

**Problem:** User currently needs to open separate SHRED PWA, manually hunt through workouts/alternatives to find exercise videos. This is slow and breaks workout flow.

**Solution:** Copy videos from SHRED into BUILD, create metadata-driven video library with modal overlay player, add three access points (Library screen, in-workout demo button, pre-workout warmup icons).

**Architecture:** Metadata-driven object model (similar to form-cues.js, exercise-metadata.js) with lazy-loaded videos, service worker runtime caching, and modal overlay (no page navigation).

**Tech Stack:**
- Vanilla JavaScript ES6 modules
- HTML5 `<video>` element
- Service Worker runtime caching
- Modal overlay pattern (no routing)
- 559MB video library copied from SHRED

---

## 1. Video Organization & Metadata

### Directory Structure

```
workout-build-tracker/
├── videos/
│   ├── exercises/           # Main workout exercises (~40-50 videos)
│   │   ├── db-flat-bench-press.mp4
│   │   ├── seated-cable-row.mp4
│   │   ├── hack-squat.mp4
│   │   ├── plank.mp4
│   │   └── ...
│   ├── warmups/            # Warmup movements (~10-15 videos)
│   │   ├── arm-circles.mp4
│   │   ├── leg-swings-forward.mp4
│   │   ├── spiderman-lunge.mp4
│   │   └── ...
│   └── stretches/          # Cool-down stretches (~5-10 videos)
│       ├── chest-doorway-stretch.mp4
│       ├── hamstring-stretch.mp4
│       └── ...
```

### Naming Convention

**Simple, clean filenames (no redundancy):**
- Lowercase with hyphens
- Matches exercise name from workouts.js
- No muscle group/equipment prefix (stored in metadata)

**Examples:**
- "DB Flat Bench Press" → `db-flat-bench-press.mp4`
- "Seated Cable Row" → `seated-cable-row.mp4`
- "Plank" → `plank.mp4`
- "Band Pull-Aparts" → `band-pull-aparts.mp4`

### Metadata Module

**File:** `js/modules/exercise-videos.js`

```javascript
/**
 * Exercise Video Library
 *
 * Metadata-driven video organization with filtering and search.
 * Videos stored in /videos/{category}/{filename}.mp4
 *
 * @module exercise-videos
 */

export const EXERCISE_VIDEOS = {
  'DB Flat Bench Press': {
    filename: 'db-flat-bench-press.mp4',
    category: 'exercises',
    muscleGroup: 'chest',
    equipment: 'dumbbell',
    movementType: 'horizontal_press',
    duration: '0:45',
    fileSize: '12MB'
  },
  'Seated Cable Row': {
    filename: 'seated-cable-row.mp4',
    category: 'exercises',
    muscleGroup: 'back',
    equipment: 'cable',
    movementType: 'horizontal_pull',
    duration: '0:38',
    fileSize: '14MB'
  },
  'Plank': {
    filename: 'plank.mp4',
    category: 'exercises',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    movementType: 'isometric',
    duration: '0:30',
    fileSize: '5MB'
  },
  'Arm Circles': {
    filename: 'arm-circles.mp4',
    category: 'warmups',
    muscleGroup: 'shoulders',
    equipment: 'bodyweight',
    movementType: 'mobility',
    duration: '0:25',
    fileSize: '4MB'
  },
  // ... all BUILD exercises, warmups, stretches
};

/**
 * Get video metadata by exercise name
 *
 * @param {string} exerciseName - Exercise name (matches workouts.js)
 * @returns {Object|null} Video metadata or null if not found
 */
export function getVideoByExercise(exerciseName) {
  const video = EXERCISE_VIDEOS[exerciseName];

  if (!video) {
    console.warn(`[ExerciseVideos] No video metadata for: ${exerciseName}`);
    return null;
  }

  return video;
}

/**
 * Get videos by muscle group
 *
 * @param {string} muscleGroup - Muscle group (chest, back, legs, etc.)
 * @returns {Array} Array of exercise names
 */
export function getVideosByMuscleGroup(muscleGroup) {
  return Object.entries(EXERCISE_VIDEOS)
    .filter(([_, video]) => video.muscleGroup === muscleGroup)
    .map(([name, _]) => name);
}

/**
 * Get videos by equipment
 *
 * @param {string} equipment - Equipment type (dumbbell, cable, bodyweight, etc.)
 * @returns {Array} Array of exercise names
 */
export function getVideosByEquipment(equipment) {
  return Object.entries(EXERCISE_VIDEOS)
    .filter(([_, video]) => video.equipment === equipment)
    .map(([name, _]) => name);
}

/**
 * Get videos by category
 *
 * @param {string} category - Category (exercises, warmups, stretches)
 * @returns {Array} Array of exercise names
 */
export function getVideosByCategory(category) {
  return Object.entries(EXERCISE_VIDEOS)
    .filter(([_, video]) => video.category === category)
    .map(([name, _]) => name);
}

/**
 * Search videos by name (fuzzy match)
 *
 * @param {string} query - Search query
 * @returns {Array} Array of matching exercise names
 */
export function searchVideos(query) {
  const lowerQuery = query.toLowerCase();
  return Object.keys(EXERCISE_VIDEOS)
    .filter(name => name.toLowerCase().includes(lowerQuery));
}

/**
 * Get video file path
 *
 * @param {string} exerciseName - Exercise name
 * @returns {string|null} Video path or null if not found
 */
export function getVideoPath(exerciseName) {
  const video = getVideoByExercise(exerciseName);
  if (!video) return null;

  return `/videos/${video.category}/${video.filename}`;
}
```

**Benefits:**
- Flexible filtering by any metadata field
- Matches existing module architecture
- Easy to add new metadata fields
- Single source of truth for video mapping
- Clean separation of data and presentation

---

## 2. UI Components & Access Points

### Three Access Points

#### 1. Exercise Library Screen (New Standalone)

**Access:** Home Screen → "Exercise Library" button

**Layout:**
```
┌─────────────────────────────────┐
│ ← Exercise Library              │
├─────────────────────────────────┤
│ [Search exercises...]           │
├─────────────────────────────────┤
│ [All] [Chest] [Back] [Legs]     │ ← Filter pills
│ [Warmups] [Stretches]           │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 🎥                          │ │ ← Exercise card
│ │ DB Flat Bench Press         │ │
│ │ 🏋️ Chest | 🔧 Dumbbell      │ │ ← Metadata badges
│ │ [▶ Watch]                   │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🎥 Seated Cable Row         │ │
│ │ 🏋️ Back | 🔧 Cable          │ │
│ │ [▶ Watch]                   │ │
│ └─────────────────────────────┘ │
│ ...                             │
└─────────────────────────────────┘
```

**Features:**
- Fuzzy search by exercise name
- Filter pills for muscle groups and categories
- Exercise cards with thumbnail, name, metadata badges
- Tap anywhere on card opens video modal
- Scrollable list (mobile-optimized)

#### 2. In-Workout Quick Access

**Location:** Workout Screen → Each exercise card

**Modification:**
```html
<!-- Existing exercise card -->
<div class="exercise-card">
  <h3>DB Flat Bench Press</h3>
  <button class="form-guide-toggle">📋 Form Guide ▼</button>

  <!-- NEW: Watch Demo button (only if video exists) -->
  <button class="watch-demo-btn">🎥 Watch Demo</button>

  <div class="form-guide-content">...</div>
</div>
```

**Behavior:**
- Button appears next to Form Guide toggle
- Only renders if video metadata exists
- Tap → opens video modal overlay (timer keeps running)
- Close modal → returns to workout (no reload)

#### 3. Pre-Workout Modal Warmup Icons

**Location:** Pre-Workout Modal → Warmup checklist

**Modification:**
```html
<!-- Existing warmup checklist -->
<ul class="warmup-list">
  <li>
    <input type="checkbox" id="warmup-1">
    <label>Arm Circles (10 forward, 10 back)</label>

    <!-- NEW: Video icon (only if video exists) -->
    <button class="warmup-video-icon">🎥</button>
  </li>
  <li>
    <input type="checkbox" id="warmup-2">
    <label>Leg Swings (10-15 per side)</label>
    <button class="warmup-video-icon">🎥</button>
  </li>
</ul>
```

**Behavior:**
- Small 🎥 icon next to warmup exercise name
- Tap → opens video modal for that warmup
- Close modal → returns to pre-workout checklist

### Video Player Modal

**CRITICAL:** Modal overlay (NOT page navigation)

```html
<!-- Modal overlay -->
<div id="video-modal" class="video-modal" style="display: none;">
  <div class="video-modal-overlay" onclick="app.closeVideoModal()"></div>

  <div class="video-modal-content">
    <!-- Close button -->
    <button class="video-modal-close" onclick="app.closeVideoModal()">✕</button>

    <!-- Video player -->
    <video id="video-player" controls playsinline>
      <source src="" type="video/mp4">
      Your browser doesn't support video playback.
    </video>

    <!-- Exercise metadata -->
    <div class="video-metadata">
      <h3 id="video-exercise-name">Exercise Name</h3>
      <div class="metadata-badges">
        <span id="video-muscle-group">🏋️ Chest</span>
        <span id="video-equipment">🔧 Dumbbell</span>
      </div>
    </div>

    <!-- Embedded form guide (collapsible) -->
    <div class="video-form-guide">
      <button class="form-guide-toggle" onclick="app.toggleVideoFormGuide()">
        📋 Form Guide ▼
      </button>
      <div id="video-form-content" style="display: none;">
        <!-- Form cues inserted here -->
      </div>
    </div>

    <!-- Error placeholder (hidden by default) -->
    <div id="video-error" class="video-error" style="display: none;">
      <p>⚠️ Video unavailable</p>
      <p>Check your connection or try again later.</p>
      <button onclick="app.retryVideoLoad()">Retry</button>
    </div>
  </div>
</div>
```

**Modal Behavior:**

```javascript
// Open modal - NO navigation, NO page reload
openVideoModal(exerciseName) {
  const videoData = getVideoByExercise(exerciseName);
  if (!videoData) return;

  // Construct video path
  const videoPath = getVideoPath(exerciseName);

  // Set video source (triggers lazy load)
  const videoElement = document.getElementById('video-player');
  videoElement.src = videoPath;

  // Populate metadata
  document.getElementById('video-exercise-name').textContent = exerciseName;
  document.getElementById('video-muscle-group').textContent =
    `🏋️ ${capitalize(videoData.muscleGroup)}`;
  document.getElementById('video-equipment').textContent =
    `🔧 ${capitalize(videoData.equipment)}`;

  // Populate form guide
  const formCues = getFormCues(exerciseName);
  if (formCues) {
    document.getElementById('video-form-content').innerHTML =
      renderFormCues(formCues);
  }

  // Show modal (overlay on current screen)
  const modal = document.getElementById('video-modal');
  modal.style.display = 'block';

  // NO history.pushState()
  // NO route change
  // Workout timer keeps running
  // Exercise state preserved
}

// Close modal - instant, no reload
closeVideoModal() {
  const modal = document.getElementById('video-modal');
  const videoElement = document.getElementById('video-player');

  // Stop and unload video
  videoElement.pause();
  videoElement.src = '';  // Free memory

  // Hide modal
  modal.style.display = 'none';

  // NO page reload
  // NO navigation
  // Instant return to previous screen
}

// ESC key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeVideoModal();
  }
});

// Click outside modal closes it
document.querySelector('.video-modal-overlay').addEventListener('click', () => {
  closeVideoModal();
});
```

**Key UX Features:**
- ✅ Modal overlays current screen (position: fixed, z-index: 9999)
- ✅ Click outside → closes
- ✅ ESC key → closes
- ✅ Close button (✕) → closes
- ✅ NO browser navigation - Back button still navigates app screens
- ✅ NO page reload - Workout timer, exercise state preserved
- ✅ Fast close (instant, no page load wait)
- ✅ Form guide embedded in modal (no need to close video)

---

## 3. Data Flow & Video Loading

### Component Architecture

```
User Action → VideoLibrary UI → exercise-videos.js → Video File → Service Worker Cache
```

### Lazy Loading Strategy

**Only load videos when modal opens:**

```javascript
// Video loading on modal open
openVideoModal(exerciseName) {
  const videoData = getVideoByExercise(exerciseName);
  const videoPath = `/videos/${videoData.category}/${videoData.filename}`;

  // Set video source (triggers load)
  videoElement.src = videoPath;

  // Show modal immediately (video loads in background)
  modal.style.display = 'block';

  // Browser handles buffering/loading state
}

// Free memory when closed
closeVideoModal() {
  videoElement.pause();
  videoElement.src = '';  // Critical: stops download if still loading
  modal.style.display = 'none';
}
```

**Benefits:**
- Videos don't load on page load (no unnecessary bandwidth)
- Only downloads when user requests
- Stops download if user closes modal early
- Memory freed immediately on close

### Service Worker Caching Strategy

**File:** `sw.js`

```javascript
const CACHE_VERSION = 'build-tracker-v100';
const VIDEO_CACHE = 'build-tracker-videos-v1';

// Static assets cached on install
const STATIC_ASSETS = [
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/modules/exercise-videos.js',  // Metadata only
  // ... existing assets
];

// Videos cached on-demand (runtime caching)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Runtime cache strategy for videos
  if (url.pathname.startsWith('/videos/')) {
    event.respondWith(
      caches.open(VIDEO_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          // Return cached video if available (instant playback)
          if (response) {
            console.log('[SW] Serving video from cache:', url.pathname);
            return response;
          }

          // Otherwise fetch and cache for next time
          console.log('[SW] Fetching and caching video:', url.pathname);
          return fetch(event.request).then(networkResponse => {
            // Clone response before caching (response body can only be read once)
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(error => {
            console.error('[SW] Video fetch failed:', error);
            // Return offline message or cached error page
            throw error;
          });
        });
      })
    );
    return;
  }

  // Existing cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Clean up old video cache on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_VERSION && cacheName !== VIDEO_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Caching Behavior

**First View:**
- User opens video modal → Video downloads from network
- Service Worker caches video in `build-tracker-videos-v1`
- Video plays (with buffering)

**Subsequent Views:**
- User opens same video → Service Worker serves from cache
- Instant playback (no network request)
- Works offline

**Offline Behavior:**
- Previously watched videos → Play from cache
- Unwatched videos → Show "offline, video not cached" message

**Progressive Caching:**
- Don't cache all 559MB upfront
- Each video caches individually as user watches
- User only caches videos they actually use
- Typical user might cache 10-20 videos (~150MB)

### Memory Management

```javascript
// Videos unload when modal closes
closeVideoModal() {
  videoElement.pause();
  videoElement.src = '';  // Browser frees memory
}

// Optional: Manual cache clearing in Settings
async function clearVideoCache() {
  const cache = await caches.open(VIDEO_CACHE);
  const keys = await cache.keys();

  await Promise.all(keys.map(request => cache.delete(request)));

  console.log('[VideoCache] Cleared all cached videos');
  showMessage('Video cache cleared. Videos will re-download on next view.');
}

// Optional: Check cache size
async function getVideoCacheSize() {
  const estimate = await navigator.storage.estimate();
  const usageMB = (estimate.usage / 1024 / 1024).toFixed(1);
  const quotaMB = (estimate.quota / 1024 / 1024).toFixed(1);

  console.log(`Video cache: ${usageMB}MB / ${quotaMB}MB`);
  return { usage: usageMB, quota: quotaMB };
}
```

---

## 4. Video Migration & Error Handling

### Video Copy Strategy

**Script:** `scripts/copy-videos-from-shred.sh`

```bash
#!/bin/bash
# Copies videos from SHRED PWA and renames to BUILD naming convention

set -e  # Exit on error

SOURCE="../Workout/Exercise-Videos"
DEST_EXERCISES="./videos/exercises"
DEST_WARMUPS="./videos/warmups"

# Create directories
mkdir -p "$DEST_EXERCISES"
mkdir -p "$DEST_WARMUPS"

echo "Copying videos from SHRED to BUILD..."
echo "Source: $SOURCE"
echo "Destination: $DEST_EXERCISES, $DEST_WARMUPS"
echo ""

# Exercise video mappings (BUILD name → SHRED filename)
declare -A EXERCISE_MAP=(
  # Chest exercises
  ["db-flat-bench-press"]="CHEST_Flat-Press_Dumbbell.mp4"
  ["decline-db-press"]="CHEST_Decline-Press_Dumbbell.mp4"
  ["incline-db-press"]="CHEST_Incline-Press_Dumbbell.mp4"
  ["cable-chest-fly"]="CHEST_Cable-Fly-High-to-Low_Cable.mp4"

  # Back exercises
  ["seated-cable-row"]="BACK_Seated-Row_Cable.mp4"
  ["chest-supported-row"]="BACK_Chest-Supported-Row_Dumbbell.mp4"
  ["t-bar-row"]="BACK_Bent-Over-Row_Band.mp4"  # Closest match
  ["lat-pulldown"]="BACK_Lat-Pulldown_Cable.mp4"

  # Shoulders
  ["db-shoulder-press"]="SHOULDERS_Overhead-Press_Dumbbell.mp4"
  ["db-lateral-raises"]="SHOULDERS_Lateral-Raise_Dumbbell.mp4"
  ["face-pulls"]="SHOULDERS_Face-Pull_Cable.mp4"
  ["band-pull-aparts"]="SHOULDERS_Face-Pull_Band.mp4"  # Similar movement
  ["reverse-fly"]="SHOULDERS_Face-Pull_Dumbbell.mp4"  # Similar rear delt

  # Arms
  ["tricep-pushdowns"]="ARMS_Tricep-Extension_Cable.mp4"
  ["overhead-tricep-extension"]="ARMS_Tricep-Extension-Incline_Dumbbell.mp4"
  ["standard-db-curls"]="ARMS_Bicep-Curl-Incline_Dumbbell.mp4"
  ["db-hammer-curls"]="ARMS_Bicep-Curl-Incline_Dumbbell.mp4"  # Reuse for now

  # Legs
  ["db-goblet-squat"]="LEGS_Squat-Goblet-Weighted_Dumbbell.mp4"
  ["db-romanian-deadlift"]="LEGS_Deadlift-Romanian_Dumbbell.mp4"
  ["hip-thrust"]="LEGS_Hip-Thrust_Dumbbell.mp4"
  ["bulgarian-split-squat"]="LEGS_Bulgarian-Split-Squat_Dumbbell.mp4"

  # Core
  ["plank"]="ABS_Hollow-Body-Hold_Bodyweight.mp4"  # Similar core stability
  ["side-plank"]="ABS_Thread-the-Needle-Plank_Bodyweight.mp4"  # Has plank
  ["dead-bug"]="ABS_Bicycle-Kick_Bodyweight.mp4"  # Similar core movement

  # Barbell (future unlock)
  ["barbell-bench-press"]="CHEST_Bench-Press_Barbell.mp4"
  ["barbell-back-squat"]="LEGS_Squat-Back_Barbell.mp4"
  ["barbell-deadlift"]="LEGS_Deadlift-Romanian_Barbell.mp4"
  ["barbell-overhead-press"]="SHOULDERS_Overhead-Press-Standing_Barbell.mp4"
)

# Warmup video mappings
declare -A WARMUP_MAP=(
  ["arm-circles"]="SHOULDERS_Lateral-Raise_Bodyweight.mp4"  # Similar movement
  ["leg-swings-forward"]="LEGS_Leg-Swing-Dynamic_Bodyweight.mp4"
  ["spiderman-lunge"]="LEGS_Lunge-Reverse_Bodyweight.mp4"  # Similar lunge
)

# Copy exercise videos
echo "=== Copying Exercise Videos ==="
for build_name in "${!EXERCISE_MAP[@]}"; do
  shred_file="${EXERCISE_MAP[$build_name]}"

  if [ -f "$SOURCE/$shred_file" ]; then
    cp "$SOURCE/$shred_file" "$DEST_EXERCISES/${build_name}.mp4"
    echo "✓ Copied: $build_name (from $shred_file)"
  else
    echo "✗ Missing: $build_name (expected $shred_file)"
  fi
done

echo ""
echo "=== Copying Warmup Videos ==="
for build_name in "${!WARMUP_MAP[@]}"; do
  shred_file="${WARMUP_MAP[$build_name]}"

  if [ -f "$SOURCE/$shred_file" ]; then
    cp "$SOURCE/$shred_file" "$DEST_WARMUPS/${build_name}.mp4"
    echo "✓ Copied: $build_name (from $shred_file)"
  else
    echo "✗ Missing: $build_name (expected $shred_file)"
  fi
done

echo ""
echo "=== Copy Summary ==="
exercise_count=$(ls -1 "$DEST_EXERCISES" | wc -l)
warmup_count=$(ls -1 "$DEST_WARMUPS" | wc -l)
echo "Exercise videos: $exercise_count"
echo "Warmup videos: $warmup_count"
echo "Total: $((exercise_count + warmup_count))"

du -sh "$DEST_EXERCISES"
du -sh "$DEST_WARMUPS"

echo ""
echo "✓ Video copy complete!"
```

**Run:** `bash scripts/copy-videos-from-shred.sh`

### Missing Video Handling

**Graceful degradation when videos don't exist:**

```javascript
// exercise-videos.js - Return null if no metadata
export function getVideoByExercise(exerciseName) {
  const video = EXERCISE_VIDEOS[exerciseName];

  if (!video) {
    console.warn(`[ExerciseVideos] No video metadata for: ${exerciseName}`);
    return null;
  }

  return video;
}

// app.js - Don't render button if no video
renderWatchDemoButton(exerciseName) {
  const videoData = getVideoByExercise(exerciseName);

  // No video metadata = no button
  if (!videoData) {
    return '';
  }

  return `
    <button class="watch-demo-btn" onclick="app.openVideoModal('${this.escapeHtml(exerciseName)}')">
      🎥 Watch Demo
    </button>
  `;
}

// Video load error handling
videoElement.addEventListener('error', (e) => {
  console.error('[VideoModal] Failed to load video:', e);

  // Hide video player, show error state
  videoElement.style.display = 'none';
  document.getElementById('video-error').style.display = 'block';

  // Keep modal open so user can read form guide
});

// Retry video load
retryVideoLoad() {
  const videoElement = document.getElementById('video-player');
  const errorElement = document.getElementById('video-error');

  // Show video player, hide error
  videoElement.style.display = 'block';
  errorElement.style.display = 'none';

  // Reload video
  videoElement.load();
}
```

### Offline Behavior

```javascript
// Detect offline + uncached video
videoElement.addEventListener('error', (e) => {
  if (!navigator.onLine) {
    showMessage(
      'You\'re offline. This video hasn\'t been cached yet. ' +
      'Watch it once online to save for offline use.'
    );
  } else {
    showMessage('Failed to load video. Please try again.');
  }
});

// Service Worker - graceful offline handling
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/videos/')) {
    event.respondWith(
      caches.open(VIDEO_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) return response;

          return fetch(event.request)
            .then(networkResponse => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
            .catch(error => {
              // Offline or network error
              console.error('[SW] Video unavailable offline:', error);

              // Could return custom offline placeholder video
              // or let error bubble up to video.onerror
              throw error;
            });
        });
      })
    );
  }
});
```

### Error States Summary

| Scenario | Behavior |
|----------|----------|
| No video metadata | Button doesn't render |
| Video file not found | Show error placeholder in modal |
| Offline + uncached | Show "watch once online to cache" message |
| Offline + cached | Play from cache (instant) |
| Load error | Show retry button, keep form guide visible |
| Slow network | Browser shows buffering state automatically |

**Graceful degradation:**
- Never block workout from starting
- Never crash app due to missing videos
- Always provide helpful error messages
- Form guide still visible even if video fails
- User can close modal and continue workout

---

## 5. Testing Strategy

### Automated Module Tests

**File:** `tests/test-exercise-videos.js`

```javascript
/**
 * Exercise Videos Module Test Suite
 *
 * Validates video metadata coverage and file existence.
 * Run in browser console after loading app.
 */

async function testExerciseVideos() {
  console.log('🎥 EXERCISE VIDEOS MODULE TEST SUITE\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let totalTests = 0;
  let passedTests = 0;
  const failures = [];

  // Test 1: All BUILD exercises have video metadata
  console.log('📋 Test 1: Video Metadata Coverage\n');

  const allExercises = window.app.workoutManager.getAllExercises();
  const missingVideos = [];

  allExercises.forEach(exercise => {
    totalTests++;
    const video = getVideoByExercise(exercise.name);

    if (video) {
      passedTests++;
    } else {
      missingVideos.push(exercise.name);
      failures.push(`No video metadata: ${exercise.name}`);
    }
  });

  const coverage = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`Coverage: ${passedTests}/${totalTests} exercises (${coverage}%)`);

  if (missingVideos.length > 0) {
    console.warn('⚠️ Missing video metadata:');
    missingVideos.forEach(name => console.warn(`  - ${name}`));
  }
  console.log('');

  // Test 2: Video files exist
  console.log('📁 Test 2: Video File Existence\n');

  const allVideos = Object.entries(EXERCISE_VIDEOS);
  let fileTests = 0;
  let filesFound = 0;

  for (const [exerciseName, videoData] of allVideos) {
    fileTests++;
    const path = getVideoPath(exerciseName);

    try {
      const response = await fetch(path, { method: 'HEAD' });
      if (response.ok) {
        filesFound++;
        console.log(`✓ Found: ${path}`);
      } else {
        failures.push(`File not found (${response.status}): ${path}`);
        console.error(`✗ Missing (${response.status}): ${path}`);
      }
    } catch (error) {
      failures.push(`Fetch error: ${path} - ${error.message}`);
      console.error(`✗ Error: ${path} - ${error.message}`);
    }
  }

  console.log(`\nFiles found: ${filesFound}/${fileTests}`);
  console.log('');

  // Test 3: Filtering functions
  console.log('🔍 Test 3: Filter Functions\n');

  const chestExercises = getVideosByMuscleGroup('chest');
  console.log(`✓ Chest exercises: ${chestExercises.length}`);
  chestExercises.forEach(name => console.log(`  - ${name}`));

  const dumbbellExercises = getVideosByEquipment('dumbbell');
  console.log(`✓ Dumbbell exercises: ${dumbbellExercises.length}`);

  const warmups = getVideosByCategory('warmups');
  console.log(`✓ Warmup videos: ${warmups.length}`);

  const searchResults = searchVideos('bench');
  console.log(`✓ Search "bench": ${searchResults.length} results`);
  console.log('');

  // Test 4: Metadata completeness
  console.log('📊 Test 4: Metadata Completeness\n');

  let metadataTests = 0;
  let metadataPassed = 0;

  for (const [exerciseName, videoData] of allVideos) {
    metadataTests++;

    const hasAllFields =
      videoData.filename &&
      videoData.category &&
      videoData.muscleGroup &&
      videoData.equipment &&
      videoData.movementType &&
      videoData.duration &&
      videoData.fileSize;

    if (hasAllFields) {
      metadataPassed++;
    } else {
      failures.push(`Incomplete metadata: ${exerciseName}`);
      console.warn(`⚠️ Incomplete metadata: ${exerciseName}`);
    }
  }

  console.log(`Metadata complete: ${metadataPassed}/${metadataTests}`);
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY\n');
  console.log(`Total tests: ${totalTests + fileTests + metadataTests}`);
  console.log(`Passed: ${passedTests + filesFound + metadataPassed}`);
  console.log(`Failed: ${failures.length}`);

  if (failures.length > 0) {
    console.error('\n❌ FAILURES:');
    failures.forEach(f => console.error(`  - ${f}`));
  } else {
    console.log('\n✅ ALL TESTS PASSED');
  }
}

// Run tests
testExerciseVideos();
```

**Run:** Load app in browser, open console, run `testExerciseVideos()`

### Manual Testing Checklist

**File:** `docs/testing/exercise-video-library-integration-test.md`

```markdown
# Exercise Video Library Integration Test

## Setup
- [ ] Run `bash scripts/copy-videos-from-shred.sh`
- [ ] Verify videos copied to `/videos/exercises/` and `/videos/warmups/`
- [ ] Open app in browser (http://localhost:8000)
- [ ] Open DevTools → Network tab (monitor video requests)

## Exercise Library Screen

### Search & Filter
- [ ] Click "Exercise Library" button on home screen
- [ ] Library screen opens (no page reload)
- [ ] Search bar visible at top
- [ ] Filter pills visible (All, Chest, Back, Legs, Warmups, Stretches)
- [ ] Type "bench" in search → Only bench exercises show
- [ ] Clear search → All exercises show
- [ ] Click "Chest" filter → Only chest exercises show
- [ ] Click "All" → All exercises show

### Exercise Cards
- [ ] Each card shows:
  - [ ] Exercise name
  - [ ] Muscle group badge
  - [ ] Equipment badge
  - [ ] "▶ Watch" button
- [ ] Cards are scrollable on mobile
- [ ] Tap card → Video modal opens

### Video Modal from Library
- [ ] Modal overlays library screen (no navigation)
- [ ] Video loads and plays
- [ ] Exercise name displayed
- [ ] Metadata badges displayed
- [ ] Form guide section present (collapsed)
- [ ] Click form guide toggle → Expands with cues
- [ ] Click ✕ button → Modal closes, returns to library
- [ ] Click outside modal → Modal closes
- [ ] Press ESC → Modal closes
- [ ] Back button navigates to home (NOT modal history)

## In-Workout Access

### Start Workout
- [ ] Start a workout (e.g., UPPER_A)
- [ ] Workout timer starts

### Watch Demo Button
- [ ] Each exercise card shows "🎥 Watch Demo" button
- [ ] Button appears next to "📋 Form Guide" toggle
- [ ] Button only appears for exercises with videos
- [ ] Click "🎥 Watch Demo" on first exercise
- [ ] Video modal opens (overlays workout screen)
- [ ] Workout timer visible in background (still running)
- [ ] Video plays correctly
- [ ] Close modal → Returns to workout (no reload)
- [ ] Timer continues from where it left off
- [ ] Exercise state preserved (reps, weight, RIR)

### Exercise State Preservation
- [ ] Log a set (e.g., 10kg × 12 reps @ RIR 2)
- [ ] Open video modal
- [ ] Close modal
- [ ] Logged set still visible
- [ ] Next set defaults still correct

## Pre-Workout Modal

### Warmup Video Icons
- [ ] Click "Start Workout" → Pre-workout modal opens
- [ ] Warmup checklist visible
- [ ] Each warmup has 🎥 icon next to name
- [ ] Click 🎥 icon on "Arm Circles"
- [ ] Video modal opens with Arm Circles video
- [ ] Close modal → Returns to pre-workout modal
- [ ] Warmup checklist state preserved
- [ ] Click 🎥 on another warmup
- [ ] Correct video loads

## Video Player Functionality

### Playback
- [ ] Video plays when modal opens
- [ ] Play/pause controls work
- [ ] Seek bar works
- [ ] Volume controls work
- [ ] Fullscreen button works (mobile)
- [ ] Video loops when finished (optional)

### Form Guide Integration
- [ ] Form guide section collapsed by default
- [ ] Click toggle → Form guide expands
- [ ] Setup cues visible
- [ ] Execution cues visible
- [ ] Common mistakes visible
- [ ] Click toggle again → Collapses
- [ ] Can read cues while video plays

### Modal Controls
- [ ] ✕ button closes modal
- [ ] Click outside (dark overlay) closes modal
- [ ] ESC key closes modal
- [ ] No page reload on close
- [ ] No navigation history created

## Offline Behavior

### Cache Videos
- [ ] Online: Watch 3 different exercise videos
- [ ] Network tab shows videos downloaded
- [ ] Watch same videos again
- [ ] Network tab shows "(from disk cache)" or 304

### Test Offline
- [ ] DevTools → Network tab → Toggle offline
- [ ] Watch previously cached video
- [ ] Video plays instantly (no network request)
- [ ] Watch new (uncached) video
- [ ] Error message: "You're offline. Watch once online to cache."
- [ ] Form guide still visible
- [ ] Can close modal and continue workout

### Back Online
- [ ] Toggle online in DevTools
- [ ] Try previously failed video
- [ ] Video downloads and plays
- [ ] Next offline session: video now cached

## Error Handling

### Missing Video File
- [ ] Edit `exercise-videos.js` → Change filename to non-existent file
- [ ] Try to watch that exercise
- [ ] Error placeholder shows in modal
- [ ] Error message: "Video unavailable"
- [ ] "Retry" button visible
- [ ] Form guide still visible below error
- [ ] Can close modal

### Missing Metadata
- [ ] Remove exercise from `EXERCISE_VIDEOS` object
- [ ] View that exercise in workout
- [ ] "🎥 Watch Demo" button doesn't appear
- [ ] Workout still functions normally
- [ ] Form guide toggle still works

### Slow Network
- [ ] DevTools → Network → Throttle to "Slow 3G"
- [ ] Open video modal
- [ ] Video shows buffering/loading state
- [ ] Can close modal during load (stops download)
- [ ] Reopen modal → Resumes download

## Performance

### Video Loading
- [ ] Videos don't load on page load (check Network tab)
- [ ] Videos only load when modal opens
- [ ] Closing modal stops download if in progress
- [ ] Memory freed after close (check browser Task Manager)

### Cache Size
- [ ] Console: `navigator.storage.estimate()`
- [ ] Check usage vs quota
- [ ] Watch 10+ videos
- [ ] Check cache size increased appropriately
- [ ] Cache size ~10-15MB per video

## Mobile Testing

### Touch Interactions
- [ ] Tap exercise card → Modal opens
- [ ] Tap outside modal → Closes
- [ ] Swipe video controls → Work correctly
- [ ] Pinch to zoom → Disabled (video fills screen)

### Fullscreen
- [ ] Tap fullscreen button
- [ ] Video fills entire screen
- [ ] Exit fullscreen → Returns to modal
- [ ] Modal still overlays workout

## Browser Compatibility

### Chrome/Edge
- [ ] All features work
- [ ] Video playback smooth
- [ ] Caching works

### Firefox
- [ ] All features work
- [ ] Video playback smooth
- [ ] Caching works

### Safari (iOS)
- [ ] Video playback works
- [ ] Fullscreen works
- [ ] Caching works
- [ ] Add to home screen → Videos still work

## Regression Tests

### Existing Features
- [ ] Workout rotation works
- [ ] Set logging works
- [ ] Progression logic works
- [ ] Form guide toggle works (non-video)
- [ ] Pre-workout modal works
- [ ] Post-workout modal works
- [ ] Timer works
- [ ] Service worker updates work

## Test Results

**Date:** _______________
**Tester:** _______________
**Browser:** _______________
**Device:** _______________

**Pass/Fail:** _______________
**Notes:** _______________
```

### Performance Monitoring

```javascript
// Check video library size and cache usage

// Total video library size
const totalSize = Object.values(EXERCISE_VIDEOS)
  .reduce((sum, v) => sum + parseFloat(v.fileSize), 0);

console.log(`📊 Video Library Stats:`);
console.log(`Total videos: ${Object.keys(EXERCISE_VIDEOS).length}`);
console.log(`Total size: ${totalSize.toFixed(1)}MB`);
console.log(`Average size: ${(totalSize / Object.keys(EXERCISE_VIDEOS).length).toFixed(1)}MB`);

// Cache size monitoring
navigator.storage.estimate().then(estimate => {
  const usageMB = (estimate.usage / 1024 / 1024).toFixed(1);
  const quotaMB = (estimate.quota / 1024 / 1024).toFixed(1);
  const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(1);

  console.log(`\n💾 Cache Stats:`);
  console.log(`Usage: ${usageMB}MB`);
  console.log(`Quota: ${quotaMB}MB`);
  console.log(`Percent used: ${percentUsed}%`);
});

// Monitor video cache specifically
caches.open('build-tracker-videos-v1').then(cache => {
  cache.keys().then(keys => {
    console.log(`\n📹 Cached Videos: ${keys.length}`);
    keys.forEach(key => {
      console.log(`  - ${key.url.split('/').pop()}`);
    });
  });
});
```

---

## 6. Implementation Summary

### New Files
- `js/modules/exercise-videos.js` - Video metadata module
- `js/screens/exercise-library.js` - Library UI screen
- `css/video-modal.css` - Modal and player styles
- `scripts/copy-videos-from-shred.sh` - Video migration script
- `tests/test-exercise-videos.js` - Automated tests
- `docs/testing/exercise-video-library-integration-test.md` - Manual test checklist

### Modified Files
- `js/app.js` - Add modal, library screen, watch demo buttons
- `sw.js` - Add video runtime caching
- `index.html` - Add video modal HTML, library screen link
- `css/styles.css` - Import video modal styles
- `manifest.json` - Update cache version

### New Directories
- `videos/exercises/` - Main exercise videos (~40-50 files)
- `videos/warmups/` - Warmup movement videos (~10-15 files)
- `videos/stretches/` - Stretch videos (~5-10 files, future)

### Video Library Size
- Total: ~559MB (copied from SHRED)
- Individual videos: 4-20MB each
- Progressive caching: Users only cache what they watch
- Typical user cache: ~150MB (10-20 videos)

### Key Features
1. **Three access points:** Library screen, in-workout demo, pre-workout warmup
2. **Modal overlay:** No page navigation, instant close
3. **Lazy loading:** Videos only load on modal open
4. **Runtime caching:** Watch once online, play forever offline
5. **Graceful degradation:** Missing videos don't break app
6. **Form guide integration:** Cues embedded in video modal
7. **Metadata-driven:** Flexible filtering and search

### Success Criteria
- ✅ User can watch exercise demos without leaving BUILD
- ✅ No hunting through SHRED workouts
- ✅ Fast access during workouts (1 tap)
- ✅ Works offline after first view
- ✅ No page reloads or navigation disruption
- ✅ Workout state preserved (timer, sets)
- ✅ All BUILD exercises have videos
- ✅ Easy to add new videos in future

---

## Next Steps

After design approval:
1. Invoke `superpowers:writing-plans` to create implementation plan
2. Execute plan with `superpowers:subagent-driven-development`
3. Copy videos from SHRED using migration script
4. Populate `exercise-videos.js` with metadata
5. Implement video modal and library UI
6. Update service worker with video caching
7. Run automated and manual tests
8. Deploy with updated cache version

**Estimated Implementation Time:** 4-6 hours
**Estimated Testing Time:** 2-3 hours
**Total: 6-9 hours**
