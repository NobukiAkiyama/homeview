/**
 * Carousel Component
 * Manages the rotation of information views (Weather, News, Calendar).
 */

import { renderWeather } from './weather.js';
import { renderNews } from './news.js';
import { renderCalendar } from './calendar.js';

const VIEW_DURATION = {
    WEATHER: 25000,
    NEWS: 20000,
    CALENDAR: 25000
};

const VIEWS = [
    { type: 'WEATHER', render: renderWeather, duration: VIEW_DURATION.WEATHER },
    { type: 'NEWS', render: renderNews, duration: VIEW_DURATION.NEWS },
    { type: 'CALENDAR', render: renderCalendar, duration: VIEW_DURATION.CALENDAR }
];

let currentIndex = 0;
let isPaused = false;
let rotationTimer = null;
let carouselElement = null;

export function initCarousel() {
    carouselElement = document.getElementById('carousel-container');
    if (!carouselElement) return;

    // Initial Render
    showView(currentIndex);
}

function showView(index) {
    // Fade out
    carouselElement.classList.remove('active');

    setTimeout(() => {
        // Render new content
        const view = VIEWS[index];
        carouselElement.innerHTML = ''; // Clear previous
        const content = view.render();
        carouselElement.appendChild(content);

        // Fade in
        carouselElement.classList.add('active');

        // Schedule next rotation
        if (!isPaused) {
            clearTimeout(rotationTimer);
            rotationTimer = setTimeout(nextView, view.duration);
        }
    }, 500); // Wait for transition (matches CSS)
}

function nextView() {
    currentIndex = (currentIndex + 1) % VIEWS.length;
    showView(currentIndex);
}

export function pauseRotation() {
    isPaused = true;
    clearTimeout(rotationTimer);
}

export function resumeRotation() {
    isPaused = false;
    nextView(); // Immediately move to next or restart current? 
    // Spec says "Resume rotation", but usually implies restarting timer.
    // simpler to just call nextView or re-render current. 
    // For now, let's re-trigger the current view logic effectively or move next.
    // Let's just restart the timer for the CURRENT view effectively?
    // Actually, spec says "Resume rotation after 30s".
    // We will handle the 30s delay in the interaction module.
    // Here we simply restart the cycle.
    // If we just entered a view and paused, we probably want to see it for a bit.
    // But simplified: just go to next view or re-queue current.
    // Let's re-queue current view's timer for full duration for simplicity.

    // showView(currentIndex); 
    // Actually, if we are mid-view, showing it again triggers animation.
    // Better to just set the timer.

    const view = VIEWS[currentIndex];
    clearTimeout(rotationTimer);
    rotationTimer = setTimeout(nextView, view.duration);
}
