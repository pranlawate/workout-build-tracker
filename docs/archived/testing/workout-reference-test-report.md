# Workout Reference Test Report

**Date:** 2026-02-11
**Tester:** [Your name]
**Build:** v32

## Desktop Tests

### Basic Functionality
- [ ] Open app in browser (Ctrl+Shift+R to force refresh)
- [ ] Click "📈 Progress" button
- [ ] Verify "📋 Workout Reference" section appears below strength gains
- [ ] Verify all 4 workouts display:
  - [ ] Upper A - Horizontal
  - [ ] Lower A - Bilateral
  - [ ] Upper B - Vertical
  - [ ] Lower B - Unilateral

### Accordion Interaction
- [ ] Click "Upper A - Horizontal" header
- [ ] Verify exercise list expands smoothly
- [ ] Verify correct format displayed:
  - [ ] "1. DB Flat Bench Press"
  - [ ] "3 sets × 8-12 reps"
  - [ ] Notes display correctly
- [ ] Click "Lower A - Bilateral" header
- [ ] Verify Upper A collapses and Lower A expands (only one open at a time)

### Session Persistence
- [ ] Expand "Upper B - Vertical"
- [ ] Refresh page (F5)
- [ ] Verify Upper B remains expanded after reload

### Time-Based Exercises
- [ ] Expand "Lower A - Bilateral"
- [ ] Find "Plank" exercise
- [ ] Verify shows: "3 sets × 30-60s" (no "reps" suffix)
- [ ] Verify notes display correctly: "Core strength for lower back health"

## Mobile Tests

### Responsive Layout
- [ ] Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
- [ ] Set to iPhone/Android viewport (375px width)
- [ ] Navigate to Progress → Overview
- [ ] Verify workout cards are full-width
- [ ] Verify tap targets are easy to hit (12px padding)
- [ ] Verify text is readable at mobile size
- [ ] Verify no horizontal scroll

### Touch Interaction
- [ ] Tap workout headers to expand/collapse
- [ ] Verify smooth animations
- [ ] Verify hover states work on touch devices

## Error Handling Tests

### Console Errors
- [ ] Open console (F12)
- [ ] Navigate through workout reference
- [ ] Expand/collapse all workouts
- [ ] Verify no JavaScript errors
- [ ] Verify no warnings about missing data

### Edge Cases
- [ ] Test rapid clicking on multiple workout headers
- [ ] Verify UI doesn't break
- [ ] Verify state stays consistent

## Offline Mode Test

### Service Worker Caching
- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker active with "build-tracker-v32"
- [ ] Open DevTools → Application → Cache Storage
- [ ] Verify "build-tracker-v32" contains:
  - [ ] css/workout-reference.css
  - [ ] All other CSS files
- [ ] Enable offline mode (DevTools → Network → Offline checkbox)
- [ ] Refresh page
- [ ] Navigate to Progress screen
- [ ] Verify workout reference section renders correctly
- [ ] Verify all styles load (no missing CSS)

## Visual Regression Tests

### CSS Styling
- [ ] Workout cards have proper borders
- [ ] Expand icon rotates 90° when expanded
- [ ] Background colors match theme
- [ ] Text colors are readable (contrast check)
- [ ] Exercise list has proper spacing
- [ ] Mobile breakpoint triggers at 768px

### Integration with Existing UI
- [ ] Workout reference doesn't break achievements gallery
- [ ] Summary stats render correctly above workout reference
- [ ] Strength gains section not affected
- [ ] Scrolling works smoothly

## Issues Found

<!-- List any bugs or issues discovered during testing -->

**Example format:**
- **Issue:** [Description]
- **Severity:** Critical / Important / Minor
- **Steps to Reproduce:** [Steps]
- **Expected:** [What should happen]
- **Actual:** [What actually happened]

## Test Results Summary

**Total Tests:** 35
**Passed:** [Count]
**Failed:** [Count]
**Skipped:** [Count]

## Status

- [ ] ✅ PASS - Ready for production
- [ ] ⚠️ PASS WITH WARNINGS - Deploy with known issues
- [ ] ❌ FAIL - Do not deploy

## Notes

<!-- Additional observations, performance notes, or recommendations -->

## Sign-off

**Tester:** [Your name]
**Date:** [Date completed]
**Approved for deployment:** [ ] Yes [ ] No
