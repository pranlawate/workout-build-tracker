/**
 * Exercise Library Screen
 *
 * Searchable, filterable video library with exercise cards.
 *
 * @module screens/exercise-library
 */

import {
  getAllExercisesWithVideos,
  getVideoByExercise,
  getVideosByMuscleGroup,
  getVideosByCategory,
  searchVideos
} from '../modules/exercise-videos.js';

export class ExerciseLibrary {
  constructor(app) {
    this.app = app;
    this.currentFilter = 'all';
    this.currentSearch = '';

    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.libraryScreen = document.getElementById('exercise-library-screen');
    this.libraryBackBtn = document.getElementById('library-back-btn');
    this.librarySearch = document.getElementById('library-search');
    this.libraryFilters = document.getElementById('library-filters');
    this.libraryExerciseList = document.getElementById('library-exercise-list');
    this.exerciseLibraryBtn = document.getElementById('exercise-library-btn');

    if (!this.libraryScreen) {
      console.warn('[ExerciseLibrary] Library screen not found');
    }
  }

  attachEventListeners() {
    // Open library button (from home screen)
    if (this.exerciseLibraryBtn) {
      this.exerciseLibraryBtn.addEventListener('click', () => {
        this.showLibrary();
      });
    }

    // Back button
    if (this.libraryBackBtn) {
      this.libraryBackBtn.addEventListener('click', () => {
        this.hideLibrary();
      });
    }

    // Search input
    if (this.librarySearch) {
      this.librarySearch.addEventListener('input', (e) => {
        this.currentSearch = e.target.value;
        this.renderExerciseList();
      });
    }

    // Filter pills
    if (this.libraryFilters) {
      this.libraryFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-pill')) {
          this.setFilter(e.target.dataset.filter);
        }
      });
    }
  }

  showLibrary() {
    console.log('[ExerciseLibrary DEBUG] showLibrary called');

    // Hide all screens
    this.app.hideAllScreens();
    console.log('[ExerciseLibrary DEBUG] All screens hidden');

    // Show library screen
    this.libraryScreen.classList.add('active');
    console.log('[ExerciseLibrary DEBUG] Library screen classList:', this.libraryScreen.classList);
    console.log('[ExerciseLibrary DEBUG] Library screen display:', window.getComputedStyle(this.libraryScreen).display);

    // Reset filters and search
    this.currentFilter = 'all';
    this.currentSearch = '';
    this.librarySearch.value = '';

    // Render exercise list
    console.log('[ExerciseLibrary DEBUG] About to render exercise list');
    this.renderExerciseList();

    console.log('[ExerciseLibrary] Library opened');
  }

  hideLibrary() {
    // Show home screen (handles hiding library screen)
    this.app.showHomeScreen();

    console.log('[ExerciseLibrary] Library closed');
  }

  setFilter(filter) {
    this.currentFilter = filter;

    // Update active pill
    const pills = this.libraryFilters.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
      if (pill.dataset.filter === filter) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Re-render list
    this.renderExerciseList();
  }

  getFilteredExercises() {
    let exercises = [];

    // Apply filter
    if (this.currentFilter === 'all') {
      exercises = getAllExercisesWithVideos();
    } else if (this.currentFilter === 'warmups') {
      exercises = getVideosByCategory('warmups');
    } else {
      // Muscle group filter
      exercises = getVideosByMuscleGroup(this.currentFilter);
    }

    // Apply search
    if (this.currentSearch) {
      const searchResults = searchVideos(this.currentSearch);
      exercises = exercises.filter(name => searchResults.includes(name));
    }

    return exercises;
  }

  renderExerciseList() {
    console.log('[ExerciseLibrary DEBUG] renderExerciseList called');
    const exercises = this.getFilteredExercises();
    console.log('[ExerciseLibrary DEBUG] Filtered exercises:', exercises.length, exercises);

    if (exercises.length === 0) {
      console.log('[ExerciseLibrary DEBUG] No exercises found, showing empty state');
      this.libraryExerciseList.innerHTML = `
        <div class="library-empty">
          <p>No exercises found</p>
          <p class="library-empty-hint">Try a different search or filter</p>
        </div>
      `;
      return;
    }

    const cardsHTML = exercises.map(exerciseName => {
      const videoData = getVideoByExercise(exerciseName);
      if (!videoData) return '';

      const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

      return `
        <div class="library-exercise-card" onclick="app.openVideoModal('${this.app.escapeHtml(exerciseName)}')">
          <div class="library-card-header">
            <span class="library-card-icon">🎥</span>
            <h4 class="library-card-title">${this.app.escapeHtml(exerciseName)}</h4>
          </div>
          <div class="library-card-metadata">
            <span class="badge badge-muscle">🏋️ ${capitalize(videoData.muscleGroup)}</span>
            <span class="badge badge-equipment">🔧 ${capitalize(videoData.equipment)}</span>
          </div>
          <div class="library-card-footer">
            <span class="library-card-duration">⏱️ ${videoData.duration}</span>
            <button type="button" class="library-card-watch-btn">▶ Watch</button>
          </div>
        </div>
      `;
    }).join('');

    console.log('[ExerciseLibrary DEBUG] Generated HTML length:', cardsHTML.length);
    this.libraryExerciseList.innerHTML = cardsHTML;
    console.log('[ExerciseLibrary DEBUG] Rendered to DOM');
  }
}
