# Weekly Summary Dashboard - Integration Test Checklist

**Feature:** Analytics tab with training volume, performance quality, recovery trends, and pattern detection

**Version:** 1.5.0

---

## Test Scenario 1: Empty State (New User)

**Setup:**
1. Clear all localStorage
2. Open app

**Steps:**
1. Navigate to Progress screen
2. Click Analytics tab

**Expected:**
- ✅ Shows "Complete 4+ workouts to unlock analytics"
- ✅ Shows current progress: 0/4 workouts
- ✅ No analytics sections visible

---

## Test Scenario 2: Insufficient Data (3 Workouts)

**Setup:**
1. Complete 3 workouts
2. Navigate to Analytics tab

**Expected:**
- ✅ Shows "Complete 4+ workouts" message
- ✅ Shows current progress: 3/4 workouts

---

## Test Scenario 3: Volume Section Display

**Setup:**
1. Complete 6 workouts over 10 days
2. Navigate to Analytics tab

**Steps:**
1. View Training Volume section

**Expected:**
- ✅ Shows total volume in kg
- ✅ Shows trend vs previous week (↑/↓/↔)
- ✅ Shows breakdown by workout type (Upper A/B, Lower A/B)
- ✅ Shows session count per workout type

---

## Test Scenario 4: Performance Quality Display

**Setup:**
1. Complete 12 workouts over 28 days
2. Navigate to Analytics tab

**Steps:**
1. View Performance Quality section

**Expected:**
- ✅ Shows average RIR with trend indicator
- ✅ Shows compliance percentage
- ✅ Shows number of exercises progressed
- ✅ Shows top 3-5 progressing exercises with gains

---

## Test Scenario 5: Recovery Trends (No Data)

**Setup:**
1. Complete workouts without recovery tracking
2. Navigate to Analytics tab

**Steps:**
1. View Recovery Trends section

**Expected:**
- ✅ Shows "No recovery data available" message
- ✅ Prompts to start tracking sleep and fatigue

---

## Test Scenario 6: Recovery Trends (With Data)

**Setup:**
1. Complete workouts with recovery metrics
2. Navigate to Analytics tab

**Steps:**
1. View Recovery Trends section

**Expected:**
- ✅ Shows average sleep in hours
- ✅ Shows average fatigue score
- ✅ Shows high fatigue days count (≥4 points)

---

## Test Scenario 7: Pattern Detection (Insufficient Data)

**Setup:**
1. Complete 8 workouts (below 10 threshold)
2. Navigate to Analytics tab

**Steps:**
1. View Discovered Patterns section

**Expected:**
- ✅ Shows "Not enough data yet (8/10 workouts)"

---

## Test Scenario 8: Pattern Detection (Sleep-Progression)

**Setup:**
1. Complete 12+ workouts
2. Track sleep for all workouts
3. Progress more on high sleep days (≥7hrs)

**Steps:**
1. View Discovered Patterns section

**Expected:**
- ✅ Shows pattern card with confidence level
- ✅ Shows message: "When sleep ≥7hrs, you progress X× faster than when sleep <6hrs"
- ✅ Confidence score displayed (55-85%)

---

## Test Scenario 9: Tab Navigation

**Setup:**
1. Navigate to Progress screen

**Steps:**
1. Click Overview tab
2. Click Body Weight tab
3. Click Barbell tab
4. Click Analytics tab

**Expected:**
- ✅ Tab buttons highlight correctly
- ✅ Tab content switches instantly
- ✅ No layout shifts or flashing
- ✅ Analytics recalculates on tab switch

---

## Test Scenario 10: Mobile Responsive

**Setup:**
1. Open app on mobile device (or DevTools mobile view)
2. Navigate to Analytics tab

**Expected:**
- ✅ Tabs stack in 2×2 grid on mobile
- ✅ Metrics grid stacks vertically
- ✅ All text readable (no truncation)
- ✅ Touch targets ≥44px

---

## Performance Tests

**Test 11: Calculation Speed**
1. Add 90 days of workout data (27+ workouts)
2. Switch to Analytics tab
3. Measure time to render

**Expected:**
- ✅ Renders in <100ms
- ✅ No console errors
- ✅ No UI freezing

**Test 12: Error Handling**
1. Corrupt localStorage data (invalid JSON)
2. Navigate to Analytics tab

**Expected:**
- ✅ Shows empty state gracefully
- ✅ Console error logged but no crash
- ✅ User can navigate away

---

## Test Results

**Date Tested:** _________

**Tester:** _________

**Scenarios Passed:** ____ / 12

**Issues Found:**

---

**Notes:**
- All tests assume PWA is installed and offline-capable
- Recovery data requires Enhanced Tracking Metrics feature
- Pattern detection requires 10+ completed workouts
