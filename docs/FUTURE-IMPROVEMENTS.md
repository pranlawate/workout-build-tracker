# Future Improvement Ideas

**Last Updated:** 2026-02-16

This document tracks improvement ideas and potential enhancements for future development.

---

## Exercise Hints & User Guidance

---

## Progression Pathways

### 1. Kettlebell Exercise Integration
**Priority:** Low
**Status:** Not Started
**Description:**
- Evaluate adding kettlebell exercises to progression pathways
- Similar to how we have barbell and dumbbell progressions
- Identify exercises that work well with kettlebells:
  - Kettlebell Swings (hip hinge pattern - could replace DB RDL)
  - Kettlebell Goblet Squat (squat pattern)
  - Kettlebell Turkish Get-Up (full body)
  - Kettlebell Clean & Press (explosive compound)

**Considerations:**
- User has weak lower back (kettlebell swings may be risky - need proper form)
- User successfully did Hip Thrust with 12.5kg kettlebell
- Kettlebells excel at ballistic/explosive movements
- May need to add `equipmentType: 'kettlebell'` to exercise definitions

**Affected Files:**
- `js/modules/workouts.js` - Add kettlebell exercises
- `js/modules/progression-pathways.js` - Add kettlebell progression options
- `js/modules/unlock-evaluator.js` - Handle kettlebell equipment type

**Questions to Resolve:**
- Which exercises benefit most from kettlebell variant?
- Should kettlebells be in progression pathways or alternatives?
- Do we need separate unlock criteria for kettlebell exercises?

---

## Implementation Notes

When implementing these improvements:
1. Follow the same planning process used for LOWER restructure
2. Use `docs/plans/YYYY-MM-DD-feature-name.md` for implementation plans
3. Update BUILD-SPECIFICATION.md with rationale
4. Add tests to `docs/testing/integration-test-master.md`
5. Bump service worker cache version for deployment

---

## Archived Ideas

_(Ideas that have been implemented or rejected will be moved here with notes)_

### ✅ Enhanced Exercise Hints with Type Labels (Implemented 2026-02-20)
- Implemented pipe-separated format: `[Type] | [Specific Muscles] | [Tempo/Key Info]`
- Updated all 28 exercises across 4 workouts
- Compounds use educational eccentric/concentric terminology
- Isolations use intuitive movement-specific terms
- Repositioned display from bottom to top of exercise card
- Added CSS styling for `.exercise-type-info` class
- **Benefits:** Educational, specific muscle targeting, visible at-a-glance
- **Commit:** d85b714

### ✅ Lower Workout Restructure (Implemented 2026-02-16)
- Swapped exercises 1-4 between LOWER_A and LOWER_B
- Achieved balanced muscle distribution (3 quads, 3 hamstrings, 5 glutes per week)
- Utilized both Leg Press and Hack Squat machines
- Removed redundant DB Goblet Squat
- **Commits:** c22fa6c, 7a53f93

### ⚪ Upper A & Upper B Balance Review (Reviewed 2026-02-16 - No Changes)
- Reviewed UPPER_A and UPPER_B for muscle balance (chest: 9 sets/week, back: 12 sets/week)
- Exercise ordering confirmed optimal (compound → isolation → small muscles)
- Verified muscle coverage per week is balanced
- **Decision:** Keep current structure - good rotator cuff coverage, both horizontal and vertical patterns, adequate volume
