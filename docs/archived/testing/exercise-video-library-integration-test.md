# Exercise Video Library - Integration Test Checklist

## Test Environment
- **Date:** _______________
- **Tester:** _______________
- **Browser:** _______________
- **Device:** _______________

## Setup
- [ ] Videos copied to `/videos/exercises/` and `/videos/warmups/`
- [ ] Service Worker updated to v100
- [ ] Hard refresh to get new SW (Ctrl+Shift+R)
- [ ] Console shows no errors

## Exercise Library Screen

### Navigation
- [ ] Click "Exercise Library" on home screen → Library opens
- [ ] No page reload (check Network tab)
- [ ] Click "← Back" → Returns to home screen
- [ ] No page reload

### Search
- [ ] Type "bench" in search bar → Only bench exercises visible
- [ ] Type "BENCH" (caps) → Same results (case-insensitive)
- [ ] Type "zzzzz" → "No exercises found" message
- [ ] Clear search → All exercises visible again

### Filtering
- [ ] Click "Chest" filter → Only chest exercises visible
- [ ] Pill becomes active (highlighted)
- [ ] Click "Back" filter → Only back exercises visible
- [ ] Click "Warmups" → Only warmup exercises visible
- [ ] Click "All" → All exercises visible

### Exercise Cards
- [ ] Each card shows exercise name
- [ ] Each card shows muscle group badge
- [ ] Each card shows equipment badge
- [ ] Each card shows duration
- [ ] Hover over card → Subtle animation
- [ ] Click card → Video modal opens

## Video Modal (from Library)

### Opening
- [ ] Modal overlays library screen (no navigation)
- [ ] Dark overlay visible behind modal
- [ ] Video player visible at top
- [ ] Exercise name displayed
- [ ] Metadata badges displayed (muscle group, equipment)
- [ ] Form guide toggle visible (collapsed by default)

### Playback
- [ ] Video loads and plays automatically
- [ ] Play/pause controls work
- [ ] Seek bar works
- [ ] Volume controls work
- [ ] Fullscreen button works (mobile only)

### Form Guide
- [ ] Click "📋 Form Guide ▼" → Form guide expands
- [ ] Setup cues visible
- [ ] Execution cues visible
- [ ] Common mistakes visible
- [ ] Click toggle again → Form guide collapses

### Closing
- [ ] Click ✕ button → Modal closes, returns to library
- [ ] Click outside modal (dark overlay) → Modal closes
- [ ] Press ESC key → Modal closes
- [ ] Video stops playing when closed
- [ ] No page reload
- [ ] Library search/filter state preserved

## In-Workout Access

### Start Workout
- [ ] Click "Start Workout" on home screen
- [ ] Select workout (e.g., UPPER_A)
- [ ] Workout screen loads
- [ ] Timer starts

### Watch Demo Button
- [ ] Each exercise card shows "🎥 Watch Demo" button
- [ ] Button appears next to "📋 Form Guide" toggle
- [ ] Button only appears for exercises with videos
- [ ] Click "🎥 Watch Demo" on first exercise
- [ ] Video modal opens
- [ ] Correct video plays for that exercise
- [ ] Workout timer still visible in background (running)

### State Preservation
- [ ] Log a set (e.g., 10kg × 12 @ RIR 2)
- [ ] Click "🎥 Watch Demo"
- [ ] Watch video for 10 seconds
- [ ] Close modal
- [ ] Logged set still visible
- [ ] Timer continued running (check time)
- [ ] Next set defaults correct

### Multiple Exercises
- [ ] Complete first exercise
- [ ] Move to second exercise
- [ ] Click "🎥 Watch Demo" on second exercise
- [ ] Correct video loads (not first exercise video)

## Pre-Workout Modal

### Warmup Icons
- [ ] Click "Start Workout" → Pre-workout modal opens
- [ ] Warmup checklist visible
- [ ] Each warmup item has 🎥 icon
- [ ] Click 🎥 icon on "Arm Circles"
- [ ] Video modal opens with warmup video
- [ ] Correct warmup video plays
- [ ] Close modal → Returns to pre-workout modal
- [ ] Warmup checklist state preserved (checkboxes)

### Multiple Warmups
- [ ] Click 🎥 on "Leg Swings"
- [ ] Correct video loads (different from Arm Circles)
- [ ] Close modal
- [ ] Pre-workout modal still open

## Service Worker Caching

### Initial Load (Online)
- [ ] Open DevTools → Network tab
- [ ] Watch a video (e.g., DB Flat Bench Press)
- [ ] Network shows video downloaded (~9MB)
- [ ] Video plays smoothly

### Cache Hit (Online)
- [ ] Watch same video again
- [ ] Network shows "(from disk cache)" or 304
- [ ] Video plays instantly (no loading)

### Cache Storage
- [ ] DevTools → Application → Cache Storage
- [ ] Find `build-tracker-videos-v1`
- [ ] Video file listed in cache

### Offline Playback
- [ ] Watch 3 different videos (online)
- [ ] DevTools → Network → Toggle "Offline"
- [ ] Try cached video → Plays instantly
- [ ] Try uncached video → Error message
- [ ] Error: "You're offline. This video hasn't been cached yet..."

### Back Online
- [ ] Toggle online
- [ ] Retry uncached video → Downloads and plays
- [ ] Toggle offline again
- [ ] Previously failed video now cached → Plays

## Error Handling

### Missing Video File
- [ ] Edit `exercise-videos.js` → Change filename to invalid
- [ ] Try to watch that exercise
- [ ] Error placeholder shows in modal
- [ ] Error message: "Video unavailable"
- [ ] "Retry" button visible
- [ ] Form guide still visible
- [ ] Can close modal

### Missing Metadata
- [ ] Remove exercise from `EXERCISE_VIDEOS`
- [ ] View that exercise in workout
- [ ] "🎥 Watch Demo" button doesn't appear
- [ ] Form guide toggle still works
- [ ] Workout functions normally

### Slow Network
- [ ] DevTools → Network → Throttle to "Slow 3G"
- [ ] Open video modal
- [ ] Video shows loading/buffering state
- [ ] Can close modal during load
- [ ] Reopen modal → Resumes download

## Mobile Testing

### Touch Interactions
- [ ] Tap exercise card → Modal opens
- [ ] Tap outside modal → Closes
- [ ] Swipe video controls → Work correctly
- [ ] Pinch to zoom disabled on video

### Fullscreen
- [ ] Tap fullscreen button on video
- [ ] Video fills entire screen
- [ ] Exit fullscreen → Returns to modal

### Responsive Layout
- [ ] Library cards stack vertically on mobile
- [ ] Modal fills screen on mobile
- [ ] Touch targets are large enough (min 44px)

## Performance

### Video Loading
- [ ] Videos don't load on page load (check Network)
- [ ] Videos only load when modal opens
- [ ] Closing modal stops download if in progress
- [ ] Memory freed after close (check Task Manager)

### Cache Size
- [ ] Console: `navigator.storage.estimate()`
- [ ] Check usage vs quota
- [ ] Watch 10+ videos
- [ ] Verify cache size ~100-150MB

## Regression Testing

### Existing Features Still Work
- [ ] Workout rotation works
- [ ] Set logging works
- [ ] Progression logic works
- [ ] Form guide toggle works (non-video)
- [ ] Pre-workout modal works
- [ ] Post-workout modal works
- [ ] Timer works
- [ ] Progress dashboard works
- [ ] Service worker updates work

## Browser Compatibility

### Chrome/Edge
- [ ] All features work
- [ ] Video playback smooth
- [ ] Caching works
- [ ] Offline works

### Firefox
- [ ] All features work
- [ ] Video playback smooth
- [ ] Caching works
- [ ] Offline works

### Safari (iOS)
- [ ] Video playback works
- [ ] Fullscreen works
- [ ] Caching works
- [ ] PWA install works
- [ ] Videos work in PWA mode

## Final Verification

- [ ] No console errors
- [ ] No broken links
- [ ] All videos load correctly
- [ ] Service Worker updated
- [ ] Cache version incremented
- [ ] Documentation updated

## Test Results

**Overall Status:** ☐ PASS  ☐ FAIL

**Issues Found:**

**Notes:**
