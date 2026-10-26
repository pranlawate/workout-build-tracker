# Training Philosophy

Guiding principles for the BUILD program. Any code change to workout structure, exercise selection, volume, or progression must align with these.

## 1. Physique Goal: Functional Density, Not Mass

The target physique is lean, defined, and capable: visibly fit without excessive bulk. Think Bruce Lee with slightly more frame. The visual priorities are:

- V-taper (broad shoulders relative to waist) via side delts and lat width
- Defined arms through compound indirect stimulus plus minimal direct isolation
- Upright, confident posture via rear delts, mid/lower traps, and core stability
- Overall proportionality: no single muscle group visually dominant

This means moderate volume across the board. The program should never creep into bodybuilding-level set counts (15-20+ sets per muscle group per week). If a muscle group exceeds 12 direct weekly sets, justify it or cut it back.

## 2. Tendon-First Training

Muscles are the servants; tendons are the foundation. Tendon strength produces injury-proof joints, efficient force transfer, and longevity under load. Muscle should be toned enough to look good and serve the tendons, not the other way around.

**Practical implications:**

- Tendons adapt to sustained mechanical loading on a slower timeline than muscle (collagen turnover is weeks, not days). Short holds (2-3s) are muscle tempo, not tendon stimulus.
- Minimum effective tendon stimulus: ~15 seconds of continuous isometric load at ~70% MVC. Clinical protocols use 30-45s. One 60s hold beats six 10s holds for collagen synthesis.
- The Tendon Hold Protocol (post-last-set isometric at 70% working weight, 20-45s, stretched position) is a core feature, not an afterthought. It adds ~3-4 minutes per workout for meaningful connective tissue adaptation.
- Progressive overload for tendons: increase hold duration by 5s per session until reaching 45s, then increase load slightly and reset duration.
- Controlled eccentrics (2-3s lowering) in working sets are good form practice but are NOT a substitute for dedicated tendon holds.

**See also:** `docs/tendon-training-reference.md` for the full protocol, Yi Jin Jing rest-day practice, and Vedic alternatives.

## 3. Upper/Lower Split, Not Bro-Splits

The program uses a 4-day Upper/Lower rotation (Upper A, Lower A, Upper B, Lower B), not a body-part split (chest day, back day, leg day, etc.).

**Why this matters:**

- **Frequency over volume:** Each muscle group is trained twice per week with moderate volume per session, rather than once per week with high volume. Research consistently shows that spreading the same weekly volume across two sessions produces better strength and hypertrophy outcomes than concentrating it in one.
- **Recovery-friendly:** No single session destroys a muscle group. Moderate stimulus, recover, repeat. This aligns with the tendon-first philosophy: tendons need consistent moderate loading, not weekly blitzes followed by 6 days of nothing.
- **Time-efficient:** 4 sessions per week, ~60-75 minutes each (including warmup, tendon holds, and cooldown). No need for 5-6 day splits.
- **Natural pairing:** Upper A is push-biased (chest angles + back for balance), Upper B is pull-biased (back + shoulders + arms). Lower A is quad-focused (bilateral), Lower B is hamstring-focused (with hip accessory work). Each session is internally balanced.
- **Injury resilience:** Every upper session includes rear delt / rotator cuff work (Face Pulls or Reverse Fly). This isn't an afterthought on "shoulder day": it's baked into every upper session because shoulder health is a continuous requirement, not a weekly checkbox.

**Bro-split pitfalls this avoids:**

- "Chest Monday" syndrome: overtraining one group while others stagnate
- Skipping legs because "leg day" is its own dreaded event
- Rear delts and rotator cuff getting 0-3 sets per week because they don't have their own day
- Long recovery gaps: a muscle trained Monday doesn't get stimulus again until the following Monday (7-day gap)

## 4. Injury Constraints as Design Constraints

The program is designed around specific physical limitations, not despite them. These are non-negotiable:

- **Rotator cuff weakness:** No overhead pressing through the impingement zone. Landmine Press replaces DB Shoulder Press (diagonal arc, not vertical). No behind-neck movements.
- **Chronic neck pain:** No shrugs (upper trap overactivation). Chin Tucks in every upper warmup. Neck stretches in every cooldown.
- **Core rule:** No plank variations (shoulder isometric hold aggravates rotator cuff and loads the neck). All core work is supine (Dead Bug, Reverse Crunch) or standing (Pallof Press).
- **Recovery sequencing:** Lower day always follows upper day. Never schedule shoulder-loading exercises on lower days (recovery overlap with upper sessions).

These constraints must be checked against every exercise addition, swap list entry, and progression pathway. An exercise that violates a constraint doesn't belong in the program regardless of how effective it is for the general population.

## 5. Progressive Overload via Rep Ranges, Not Max Loads

Progression uses rep range completion (hit top of range on all sets → increase weight), not 1RM percentages or daily maxes. This is deliberate:

- Rep range progression is self-regulating: you don't increase weight until you've demonstrated capacity across all sets
- It's tendon-friendly: gradual load increases with demonstrated work capacity, not sudden jumps
- No RIR tracking (removed): subjective RPE/RIR assessment adds cognitive load without proportional benefit at this training stage. The rep range itself encodes the effort target.

## 6. Exercise Rotation for Longevity, Not Novelty

The rotation system (8-12 week exercise tenure, then suggest a variation) exists to:

- Prevent repetitive strain on the same tendons and joint angles
- Provide stimulus variation for continued adaptation
- Cover different heads of the same muscle group over time (e.g., Hammer Curls → Standard Curls: long head bias → short head bias)

Rotation is NOT for:

- "Muscle confusion" (a myth)
- Variety for the sake of engagement
- Swapping to exercises the user hasn't learned proper form for

Rotation is suppressed when: deload is active, pain is detected, or the user is near an unlock milestone (80%+ progress). These suppressions are prioritized in `smart-progression.js`.

## 7. Swap Lists Stay Within Their Muscle Group

Each exercise slot has a progression pathway (easier / current / harder / alternate). These alternatives must target the same primary muscle group and movement pattern as the slot's default.

- LOWER_A_SLOT_3 (Quad Isolation): only quad isolation exercises
- LOWER_A_SLOT_4 (Glute Isolation): only glute isolation exercises
- Never put a quad exercise in a glute slot or vice versa, even if they're "lower body"

Cross-contamination in swap lists breaks workout balance and confuses the progression tracking.

## 8. Volume Guidelines (Weekly Sets per Muscle Group)

Target ranges for the current physique goal (functional density, not mass):

| Muscle Group | Weekly Sets | Notes |
|---|---|---|
| Chest | 6-9 | 6 mandatory + optional Machine Fly |
| Back | 10-12 | Tolerates higher volume; upper end is fine |
| Side Delts | 4-6 | Critical for V-taper visual |
| Rear Delts / Rotator Cuff | 6 | Rehab priority, non-negotiable |
| Triceps (direct) | 2 | Heavy indirect from pressing |
| Biceps (direct) | 2-3 | Heavy indirect from pulling; optional |
| Quads | 8-10 | Compound + isolation |
| Hamstrings | 6 | Lengthened + shortened stimulus |
| Glutes | 6 | Direct + indirect from compounds |
| Calves | 6 | Soleus + gastrocnemius (both heads) |
| Core | 6-9 | Low-intensity; recovers fast |

If any group drifts above its range, question whether the extra volume serves the goal or just adds fatigue.

## 9. Deload and Recovery Are Features, Not Failures

Deload weeks (reduced volume/intensity) are programmed, not reactive. They serve tendons even more than muscles: tendons need periodic reduction in mechanical stress to complete collagen remodelling.

- Building phase: deload every 6-8 weeks
- Maintenance phase: deload every 4-6 weeks
- Training gap of 14+ days: skip time-based deload trigger (the body already rested)

## 10. Zero Dependencies, Offline-First

The app is a PWA with no external dependencies: no CDNs, no frameworks, no external fonts, no analytics. It works offline, loads instantly, and stores everything in localStorage. This isn't a technical constraint: it's a design principle. A workout tracker should work in a gym basement with no signal.
