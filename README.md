# BUILD Workout Tracker

A Progressive Web App for tracking strength training workouts, designed for beginners following a full-body training program.

## Overview

BUILD Tracker is a mobile-first PWA optimized for in-gym usage. It features:

- **Smart defaults**: 85% of sets logged in 1 tap
- **Auto-progression tracking**: Intelligent weight/rep suggestions
- **Recovery monitoring**: Prevents overtraining with muscle-specific rest periods
- **Equipment progression**: Guides transition from dumbbells to barbells
- **Deload automation**: Smart fatigue detection and recovery weeks
- **Offline-first**: Works without internet connection

## Design Philosophy

- **Zero friction**: Minimal taps during workouts
- **Mobile-optimized**: Designed for 6.7" smartphones
- **Data-driven**: Auto-tracks form stability and progression
- **Beginner-focused**: Clear guidance and realistic starting weights

## Project Status

**Current Phase**: Design Complete, Implementation Starting

✅ UI/UX design finalized
✅ Training structure defined (Full Body 3x/week)
✅ Data model designed
🚧 Implementation in progress

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: localStorage with JSON export
- **Deployment**: Progressive Web App (PWA)
- **No dependencies**: Lightweight, fast, privacy-first

## Documentation

- [UI/UX Design](docs/design/2026-02-03-ui-ux-design.md)
- [Training Structure](docs/design/2026-02-03-workout-structure.md)
- Implementation Plan (coming soon)

## Development

```bash
# Clone repository
git clone <repo-url>
cd workout-build-tracker

# Open in browser (no build step needed)
# Simply open src/index.html in your browser
# Or use a local server:
python -m http.server 8000
# Navigate to http://localhost:8000/src/
```

## Features

### Core Tracking
- Full-body workout rotation (A/B/C)
- Set-by-set logging with RIR (Reps in Reserve)
- Auto-filled weights from last workout
- Large touch targets for gym use

### Intelligence Layer
- Recovery warnings (48hr muscle overlap detection)
- Deload triggers (cycle + time + frequency logic)
- Equipment progression tracking (auto-stability calculation)
- Body weight trend analysis (fluctuation-aware)

### User Experience
- Progressive disclosure (expand current, collapse completed)
- No scrolling during set entry
- Color-coded progression badges
- Offline capability

## License

MIT (to be added)

## Author

Built for personal use, open-sourced for the fitness community.

---

**Note**: This is a beginner-focused tracker. If you're an intermediate/advanced lifter, you may need different programming.
