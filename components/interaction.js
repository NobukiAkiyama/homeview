/**
 * Interaction Component
 * Handles user interactions:
 * - Idle detection (Auto-resume rotation)
 * - Scroll/Swipe detection (Pause rotation)
 * - Long press (Toggle rotation on/off)
 */

import { pauseRotation, resumeRotation } from './carousel.js';

let idleTimer = null;
let longPressTimer = null;
const IDLE_TIMEOUT = 30000;
const LONG_PRESS_DURATION = 1000;

export function initInteraction() {
    const container = document.querySelector('.info-area');

    // User Activity Listeners (Pause Loop)
    const activityEvents = ['mousedown', 'mousemove', 'wheel', 'touchstart', 'touchmove', 'scroll'];

    // Use capture for scroll to catch inner element scrolls
    activityEvents.forEach(evt => {
        window.addEventListener(evt, handleActivity, { passive: true, capture: true });
    });

    // Long Press Listener
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('mousedown', handleTouchStart);
    container.addEventListener('mouseup', handleTouchEnd);
}

function handleActivity() {
    // 1. Pause Rotation
    pauseRotation();

    // 2. Reset Idle Timer
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        resumeRotation();
        showFeedback('Auto Resume', '▶');
    }, IDLE_TIMEOUT);
}

function handleTouchStart(e) {
    longPressTimer = setTimeout(() => {
        toggleRotationState();
    }, LONG_PRESS_DURATION);
}

function handleTouchEnd(e) {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

// Global toggle state
let isAutoRotateEnabled = true; // Default
// Note: This is separate from temporary 'pause' due to interaction.
// If user explicitly disables it, idle timer shouldn't resume it.

function toggleRotationState() {
    isAutoRotateEnabled = !isAutoRotateEnabled;
    const msg = isAutoRotateEnabled ? 'Rotation ON' : 'Rotation OFF';
    const icon = isAutoRotateEnabled ? '▶' : '⏸';
    showFeedback(msg, icon);

    if (isAutoRotateEnabled) {
        handleActivity(); // Restart idle timer logic
    } else {
        pauseRotation();
        clearTimeout(idleTimer); // Kill idle timer
    }
}

function showFeedback(text, icon) {
    const el = document.getElementById('interaction-feedback');
    const textEl = document.getElementById('feedback-text');
    const iconEl = document.getElementById('feedback-icon');

    if (!el) return;

    textEl.textContent = text;
    iconEl.textContent = icon;

    el.classList.remove('hidden');

    // Auto hide after 2s
    setTimeout(() => {
        el.classList.add('hidden');
    }, 2000);
}
