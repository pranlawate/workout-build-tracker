# System Interaction Matrix

**Date:** 2026-02-23
**Purpose:** Document all system interactions to prevent conflicts and ensure correct priorities

## Systems Overview

1. **Rotation** - 8-12 week exercise variety cycles for muscle coverage
2. **Deload** - Recovery weeks (reduced volume/intensity)
3. **Progression** - Double progression (reps → weight)
4. **Pain** - Exercise swaps for injuries
5. **Unlock** - Barbell progression milestones
6. **Phase** - Building vs Maintenance cycles

---

## Interaction Matrix

| System A → System B | Current Status | Priority Rule | Implementation |
|---------------------|---------------|---------------|----------------|
| **Pain → Progression** | ✅ HANDLED | Pain blocks progression | Priority 1 in smart-progression.js |
| **Pain → Rotation** | ✅ HANDLED | Pain blocks rotation | Pain checked before rotation in priority order |
| **Pain → Unlock** | ⚠️ UNKNOWN | Pain should NOT block unlock progress | Need to verify |
| **Deload → Progression** | ❌ MISSING | Deload blocks progression | NOT checked in smart-progression.js |
| **Deload → Rotation** | ✅ FIXED | Deload blocks rotation | Added in rotation-manager.js line 43 |
| **Rotation → Unlock** | ✅ HANDLED | Rotation suppressed at 80%+ unlock | rotation-manager.js line 56-61 |
| **Rotation → Progression** | ✅ HANDLED | Progression checked before rotation | Priority 2 vs Priority 3 |
| **Phase → Deload** | ✅ HANDLED | Phase affects deload sensitivity | deload.js line 25-31 |
| **Phase → Progression** | ⚠️ PARTIAL | Maintenance affects tempo focus | Checked in progression hints, not smart suggestions |
| **Unlock → Progression** | ⚠️ UNKNOWN | Need to verify barbell unlock doesn't break progression | Need to test |

---

## Priority Order (Smart Progression System)

Current implementation in `smart-progression.js`:

```
PRIORITY 0: Deload active? → MISSING ❌
PRIORITY 1: Pain handling → HANDLED ✅
PRIORITY 2: Progression (weight increase) → HANDLED ✅
PRIORITY 3: Rotation variety → HANDLED ✅
PRIORITY 4: Weight gap (tempo) → HANDLED ✅
PRIORITY 5: Plateau detection → HANDLED ✅
PRIORITY 6: Regression warning → HANDLED ✅
PRIORITY 7: Default (continue) → HANDLED ✅
```

---

## Critical Gaps Found

### 1. Deload State Not Checked in Smart Progression ❌

**Issue:** During deload week, smart progression still suggests weight increases and tempo changes.

**Expected Behavior:**
- During deload: Suppress all progression suggestions
- Show deload-specific message instead

**Fix Required:** Add deload check as Priority 0 in `getSuggestion()`

**Code Location:** `js/modules/smart-progression.js` line 819

---

### 2. Phase-Based Progression Partially Implemented ⚠️

**Issue:** Maintenance phase tempo focus is checked in old `renderProgressionHint()` but not in smart suggestions.

**Current:** Old system shows tempo suggestions during maintenance
**Smart System:** Doesn't consider phase for tempo recommendations

**Fix Required:** Pass `PhaseManager` to smart-progression and check phase in tempo suggestions

---

### 3. Pain-Unlock Interaction Unknown ⚠️

**Question:** If user has pain on an exercise they're trying to unlock, what should happen?

**Options:**
1. **Continue unlock progress** - Pain swap doesn't affect unlock counter (current assumption)
2. **Pause unlock progress** - Must be pain-free to count toward unlock
3. **Reset unlock progress** - Pain restarts unlock journey

**Decision Needed:** Which behavior is correct?

---

## Recommended Priority Order (Fixed)

```javascript
// Priority 0: Deload active check (NEW)
if (isDeloadActive()) {
  return {
    type: 'DELOAD',
    message: 'Focus on recovery this week',
    reason: 'Active deload week - reduced volume/intensity'
  };
}

// Priority 1: Safety (pain) ✅
// Priority 2: Progression (weight) ✅
// Priority 3: Rotation variety ✅
// Priority 4: Weight gap (tempo) ✅
// Priority 5: Plateau ✅
// Priority 6: Regression ✅
// Priority 7: Default ✅
```

---

## Testing Checklist

- [ ] **Deload + Progression:** During deload, no weight increase suggestions
- [ ] **Deload + Rotation:** During deload, no rotation suggestions (FIXED)
- [ ] **Pain + Progression:** With pain, no weight increase suggestions
- [ ] **Pain + Rotation:** With pain, no rotation suggestions
- [ ] **Pain + Unlock:** With pain, verify unlock behavior
- [ ] **Rotation + Unlock:** At 80%+ unlock, no rotation suggestions
- [ ] **Phase + Progression:** Maintenance phase shows tempo focus
- [ ] **Multi-system:** Deload + Pain + Rotation = pain takes priority

---

## Implementation Plan

1. **Add deload check to smart-progression.js** (Priority 0)
2. **Pass PhaseManager to smart-progression** (for maintenance tempo)
3. **Clarify pain-unlock interaction** (document decision)
4. **Add comprehensive system interaction tests**
5. **Update CLAUDE.md with interaction rules**

---

## Notes

- Single source of truth: `smart-progression.js` handles all suggestion logic
- Old system (`renderProgressionHint()`) removed to prevent conflicts
- Rotation manager checks deload internally (defense in depth)
- Each system should check dependencies before returning suggestions
