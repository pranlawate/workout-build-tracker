# Future Improvement Ideas

**Last Updated:** 2026-02-16

This document tracks improvement ideas and potential enhancements for future development.

---

## Workout Design & Balance

### 1. Upper A & Upper B Balance Review
**Priority:** Medium
**Status:** Not Started
**Description:**
- Review UPPER_A and UPPER_B workouts for muscle balance (similar to LOWER restructure)
- Check if exercise ordering is optimal (compound → isolation → small muscles)
- Verify muscle coverage per week is balanced
- Consider if any exercises should be swapped between days

**Context:** After successfully restructuring LOWER_A and LOWER_B to achieve balanced muscle distribution (3 quad exercises, 3 hamstring exercises, 5 glute exercises per week), we should apply similar analysis to UPPER workouts.

---

## Exercise Hints & User Guidance

### 2. Enhanced Exercise Hints (Isolation/Compound Labels)
**Priority:** Medium
**Status:** Not Started
**Description:**
- Add exercise type labels to hints (e.g., "compound" or "isolation")
- Update exercise notes to include:
  - Already mentioned: Muscle groups targeted
  - **NEW:** Exercise type (compound/isolation)
  - Example: "Hack Squat - Quad compound (vertical squat pattern)"

**Benefits:**
- Helps users understand exercise purpose
- Educational - teaches compound vs isolation concepts
- Better workout planning and exercise selection

**Affected Files:**
- `js/modules/workouts.js` - Exercise notes field
- UI rendering code (app.js) - Display hints

---

## Progression Pathways

### 3. Kettlebell Exercise Integration
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

### ✅ Lower Workout Restructure (Implemented 2026-02-16)
- Swapped exercises 1-4 between LOWER_A and LOWER_B
- Achieved balanced muscle distribution (3 quads, 3 hamstrings, 5 glutes per week)
- Utilized both Leg Press and Hack Squat machines
- Removed redundant DB Goblet Squat
- **Commits:** c22fa6c, 7a53f93
