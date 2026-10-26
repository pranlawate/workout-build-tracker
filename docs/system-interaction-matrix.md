# System Interaction Matrix

**Last Updated:** 2026-10-26
**Purpose:** Document all system interactions to prevent conflicts and ensure correct priorities

## Systems Overview

1. **Deload** - Recovery weeks (reduced volume/intensity), time-based trigger gap-aware
2. **Pain** - Exercise swaps for injuries
3. **Gap Return** - Lighter weight after training break (7+ days)
4. **Progression** - Rep-range-only progression (all sets hit max reps)
5. **Rotation** - 8-12 week exercise variety cycles
6. **Unlock** - Barbell progression milestones (checked in rotation logic)
7. **Phase** - Building vs Maintenance cycles (affects deload sensitivity)

---

## Priority Order (Smart Progression System)

Implementation in `smart-progression.js` `getSuggestion()`:

```
PRIORITY 0: Deload active? → Suppress all suggestions ✅
PRIORITY 1: Pain handling → Safety first ✅
PRIORITY 2: Gap return (7+ day break) → Suggest lighter weight ✅
PRIORITY 3: Progression (weight increase) → All sets hit max reps ✅
PRIORITY 4: Rotation variety → 8-12 week cycles ✅
PRIORITY 5: Weight gap (tempo) → Failed weight jump ✅
PRIORITY 6: Plateau detection → Same weight 3+ sessions ✅
PRIORITY 7: Regression warning → Recovery check ✅
PRIORITY 8: Default (continue) ✅
```

---

## Interaction Matrix

| System A → System B | Status | Rule | Implementation |
|---------------------|--------|------|----------------|
| **Deload → Progression** | ✅ HANDLED | Deload suppresses progression | Priority 0 early return |
| **Deload → Rotation** | ✅ HANDLED | Deload suppresses rotation | Priority 0 + rotation-manager internal check |
| **Deload → Gap Return** | ✅ HANDLED | Deload suppresses gap return | Priority 0 early return |
| **Pain → Progression** | ✅ HANDLED | Pain blocks progression | Priority 1 early return |
| **Pain → Rotation** | ✅ HANDLED | Pain blocks rotation | Priority 1 early return |
| **Gap → Progression** | ✅ HANDLED | Gap return overrides stale progression data | Priority 2 before Priority 3 |
| **Rotation → Unlock** | ✅ HANDLED | Rotation suppressed at 80%+ unlock | rotation-manager.js |
| **Phase → Deload** | ✅ HANDLED | Phase affects deload sensitivity | deload.js sensitivity thresholds |
| **Time Deload → Gap** | ✅ HANDLED | 14+ day gap suppresses time-based deload trigger | deload.js `shouldTriggerDeload()` |

---

## Gap-Aware Deload Logic

The time-based deload trigger counts calendar weeks since last deload. Without a gap check,
a 2-month absence triggers both:
- Time-based deload ("8 weeks since deload")
- Gap return ("try lighter weight after 60-day break")

These contradict each other. Fix (implemented in `deload.js`):
- If last workout was 14+ days ago, skip time-based deload trigger
- The body already rested during the gap, so a formal deload is unnecessary
- Performance-based and fatigue-based triggers still work normally

## RIR Removal (Oct 2026)

RIR (Reps In Reserve) was removed from all tracking, UI, and progression logic.
- Progression now uses rep range only: all sets hitting max reps triggers weight increase
- Historical data with RIR values is accepted by import but the field is ignored
- Exercise definitions still carry `rirTarget` as inert metadata (not read by any logic)

---

## Testing Checklist

- [x] Deload + Progression: During deload, no weight increase suggestions
- [x] Deload + Rotation: During deload, no rotation suggestions
- [x] Pain + Progression: With pain, no weight increase suggestions
- [x] Pain + Rotation: With pain, no rotation suggestions
- [x] Rotation + Unlock: At 80%+ unlock, no rotation suggestions
- [x] Gap + Progression: After 7+ day gap, lighter weight suggestion (not increase)
- [x] Gap + Time Deload: After 14+ day gap, no time-based deload trigger
- [x] Multi-system: Deload + Pain + Rotation = deload takes priority (Priority 0)
