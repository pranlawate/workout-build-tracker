#!/bin/bash
# Copies videos from SHRED PWA and renames to BUILD naming convention

# Don't exit on error - continue to show all missing files
# set -e

SOURCE="../Workout/Exercise-Videos"
DEST_EXERCISES="./videos/exercises"
DEST_WARMUPS="./videos/warmups"

# Verify source exists
if [ ! -d "$SOURCE" ]; then
  echo "Error: SHRED video directory not found at $SOURCE"
  exit 1
fi

echo "Copying videos from SHRED to BUILD..."
echo "Source: $SOURCE"
echo "Destination: $DEST_EXERCISES, $DEST_WARMUPS"
echo ""

# Exercise video mappings (BUILD name → SHRED filename)
declare -A EXERCISE_MAP=(
  # Chest exercises
  ["db-flat-bench-press"]="CHEST_Flat-Press_Dumbbell.mp4"
  ["decline-db-press"]="CHEST_Flat-Press_Dumbbell.mp4"
  ["incline-db-press"]="CHEST_Incline-Press_Dumbbell.mp4"
  ["cable-chest-fly"]="CHEST_Cable-Fly-High-to-Low_Cable.mp4"

  # Back exercises
  ["seated-cable-row"]="BACK_Seated-Row_Cable.mp4"
  ["chest-supported-row"]="BACK_Chest-Supported-Row_Dumbbell.mp4"
  ["lat-pulldown"]="BACK_Lat-Pulldown_Cable.mp4"
  ["t-bar-row"]="BACK_Bent-Over-Row_Band.mp4"

  # Shoulders
  ["db-shoulder-press"]="SHOULDERS_Overhead-Press_Dumbbell.mp4"
  ["db-lateral-raises"]="SHOULDERS_Lateral-Raise_Dumbbell.mp4"
  ["face-pulls"]="SHOULDERS_Face-Pull-Kneeling_Cable.mp4"
  ["reverse-fly"]="SHOULDERS_Face-Pull_Dumbbell.mp4"

  # Arms
  ["tricep-pushdowns"]="ARMS_Tricep-Extension_Band.mp4"
  ["overhead-tricep-extension"]="ARMS_Tricep-Extension-Incline_Dumbbell.mp4"
  ["standard-db-curls"]="ARMS_Bicep-Curl-Incline_Dumbbell.mp4"
  ["db-hammer-curls"]="ARMS_Bicep-Curl-Incline_Dumbbell.mp4"

  # Legs (using closest available alternatives)
  ["hack-squat"]="LEGS_Squat-Goblet-Weighted_Dumbbell.mp4"
  ["leg-curl"]="LEGS_Hamstring-Curl_Dumbbell.mp4"
  ["leg-extension"]="LEGS_Squat-Goblet-Weighted_Dumbbell.mp4"
  ["leg-press"]="LEGS_Squat-Goblet-Weighted_Dumbbell.mp4"
  ["standing-calf-raise"]="LEGS_Calf-Raise-Standing_Barbell.mp4"
  ["db-goblet-squat"]="LEGS_Squat-Goblet-Weighted_Dumbbell.mp4"
  ["db-romanian-deadlift"]="LEGS_Romanian-Deadlift_Dumbbell.mp4"
  ["bulgarian-split-squat"]="LEGS_Bulgarian-Split-Squat_Dumbbell.mp4"
  ["hip-thrust"]="LEGS_Bulgarian-Split-Squat_Dumbbell.mp4"
  ["leg-abduction"]="LEGS_Bulgarian-Split-Squat_Dumbbell.mp4"
  ["leg-adduction"]="LEGS_Bulgarian-Split-Squat_Dumbbell.mp4"
  ["seated-calf-raise"]="LEGS_Calf-Raise-Seated_Bodyweight.mp4"

  # Core
  ["plank"]="ABS_Hollow-Body-Hold_Bodyweight.mp4"
  ["side-plank"]="ABS_Thread-the-Needle-Plank_Bodyweight.mp4"
  ["dead-bug"]="ABS_Bicycle-Kick_Bodyweight.mp4"
  ["45-hyperextension"]="LEGS_Reverse-Hyperextension_Bodyweight.mp4"

  # Isolation
  ["band-pull-aparts"]="SHOULDERS_Face-Pull_Band.mp4"

  # Barbell (future)
  ["barbell-bench-press"]="CHEST_Bench-Press_Barbell.mp4"
  ["barbell-back-squat"]="LEGS_Squat-Back_Barbell.mp4"
  ["barbell-deadlift"]="LEGS_Deadlift-Conventional_Barbell.mp4"
  ["barbell-overhead-press"]="SHOULDERS_Overhead-Press-Standing_Barbell.mp4"

  # Kettlebell
  ["kb-goblet-squat"]="LEGS_Squat-Goblet-Weighted_Dumbbell.mp4"
  ["kb-swings"]="LEGS_Deadlift_Band.mp4"
)

# Warmup video mappings
declare -A WARMUP_MAP=(
  ["wrist-circles"]="SHOULDERS_Lateral-Raise_Bodyweight.mp4"
  ["arm-circles"]="SHOULDERS_Lateral-Raise_Bodyweight.mp4"
  ["band-over-and-backs"]="SHOULDERS_Face-Pull_Band.mp4"
  ["band-pull-aparts"]="SHOULDERS_Face-Pull_Band.mp4"
  ["band-external-rotation"]="SHOULDERS_Face-Pull_Band.mp4"
  ["db-shoulder-extensions"]="SHOULDERS_Lateral-Raise_Dumbbell.mp4"
  ["light-cycling"]="LEGS_Squat-Goblet-Weighted_Dumbbell.mp4"
  ["leg-swings-forward"]="LEGS_Reverse-Lunge-Sliding_Bodyweight.mp4"
  ["leg-swings-side"]="LEGS_Reverse-Lunge-Sliding_Bodyweight.mp4"
  ["spiderman-lunge"]="LEGS_Reverse-Lunge-Sliding_Bodyweight.mp4"
  ["wall-ankle-mobilization"]="LEGS_Calf-Raise-Standing_Barbell.mp4"
)

# Copy exercise videos
echo "=== Copying Exercise Videos ==="
copied_exercises=0
missing_exercises=0

for build_name in "${!EXERCISE_MAP[@]}"; do
  shred_file="${EXERCISE_MAP[$build_name]}"

  if [ -f "$SOURCE/$shred_file" ]; then
    cp "$SOURCE/$shred_file" "$DEST_EXERCISES/${build_name}.mp4"
    echo "✓ Copied: $build_name"
    ((copied_exercises++))
  else
    echo "✗ Missing: $build_name (expected $shred_file)"
    ((missing_exercises++))
  fi
done

echo ""
echo "=== Copying Warmup Videos ==="
copied_warmups=0
missing_warmups=0

for build_name in "${!WARMUP_MAP[@]}"; do
  shred_file="${WARMUP_MAP[$build_name]}"

  if [ -f "$SOURCE/$shred_file" ]; then
    cp "$SOURCE/$shred_file" "$DEST_WARMUPS/${build_name}.mp4"
    echo "✓ Copied: $build_name"
    ((copied_warmups++))
  else
    echo "✗ Missing: $build_name (expected $shred_file)"
    ((missing_warmups++))
  fi
done

echo ""
echo "=== Copy Summary ==="
echo "Exercise videos: $copied_exercises copied, $missing_exercises missing"
echo "Warmup videos: $copied_warmups copied, $missing_warmups missing"
echo "Total copied: $((copied_exercises + copied_warmups))"

du -sh "$DEST_EXERCISES"
du -sh "$DEST_WARMUPS"

echo ""
if [ $missing_exercises -eq 0 ] && [ $missing_warmups -eq 0 ]; then
  echo "✓ All videos copied successfully!"
else
  echo "⚠️ Some videos missing - check mappings"
fi
