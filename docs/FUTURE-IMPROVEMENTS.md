# Future Improvement Ideas

**Last Updated:** 2026-02-22

This document tracks improvement ideas and potential enhancements for future development.

---

## Exercise Hints & User Guidance

---

## Progression Pathways

_(No pending progression pathway improvements at this time)_

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

### ✅ Kettlebell Exercise Integration (Implemented 2026-02-22)
- Added KB Goblet Squat as default-unlocked regression option for Hack Squat
- Added KB Swings with MODERATE complexity and DB RDL prerequisite
- Integrated with existing equipment-aware architecture
- Safety-focused unlock criteria (8 weeks training, strength milestone, pain-free requirement)
- **Files modified:** progression-pathways.js, equipment-profiles.js, complexity-tiers.js, unlock-criteria.js, form-cues.js, workouts.js
- **Commits:** cc0b920, 47da4b2, 654769e, 79b2cf6, 08761a8, 1bade85, c4b8bd3, 831458b, 63e19da, 2eaf671, e717940, 6f728b4, 2d51472

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
