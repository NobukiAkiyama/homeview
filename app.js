/**
 * HomeView Unified Script
 * Consolidated to run locally without a server (no modules).
 */

/* =========================================
   1. Clock Component
   ========================================= */
function initClock() {
    const clockEl = document.getElementById('clock-display');
    const dateEl = document.getElementById('date-display');

    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        clockEl.textContent = `${hours}:${minutes}`;

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[now.getDay()];

        dateEl.textContent = `${year}/${month}/${day} ${dayName}`;
    }

    updateTime();

    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    setTimeout(() => {
        updateTime();
        setInterval(updateTime, 60000);
    }, msUntilNextMinute);
}

/* =========================================
   2. News Service
   ========================================= */
const RSS_URL = 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja';
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

let cachedNews = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000;

async function fetchNews() {
    const now = Date.now();
    if (cachedNews && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedNews;
    }

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.status === 'ok') {
            cachedNews = data.items.map(item => ({
                title: item.title,
                description: stripHtml(item.description),
                source: item.author || 'Google News',
                time: formatTime(item.pubDate),
                link: item.link
            }));
            lastFetchTime = now;
            return cachedNews;
        } else {
            console.error('News API Error:', data.message);
            return getMockNews();
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return getMockNews();
    }
}

function stripHtml(html) {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getMockNews() {
    return [
        { title: 'Tech News: minimalist designs are trending', description: 'Designers are focusing on clean lines and negative space.', source: 'Design Weekly', time: '10:00' },
        { title: 'Weather Update: Sunny week ahead', description: 'Expect clear skies for the next 7 days.', source: 'Weather Daily', time: '09:30' },
        { title: 'Stock Market hits record highs', description: 'Global markets are rallying today.', source: 'Finance Now', time: '09:15' },
    ];
}

/* =========================================
   3. Weather Render
   ========================================= */
function renderWeather() {
    const container = document.createElement('div');
    container.className = 'weather-view';

    // Mock Data
    const data = {
        city: 'Tokyo',
        temp: 24,
        condition: 'Clear',
        icon: '☀'
    };

    const icons = {
        'Clear': '☀',
        'Cloudy': '☁',
        'Rain': '☂'
    };

    const iconChar = icons[data.condition] || '☀';

    container.innerHTML = `
        <div class="weather-icon">${iconChar}</div>
        <div class="weather-temp">${data.temp}<span class="unit">°C</span></div>
        <div class="weather-city">${data.city}</div>
    `;

    return container;
}

/* =========================================
   4. News Render
   ========================================= */
async function renderNews() {
    const container = document.createElement('div');
    container.className = 'news-container';
    container.innerHTML = '<div class="loading">News Loading...</div>';

    fetchNews().then(newsItems => {
        container.innerHTML = '';
        newsItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <div class="news-source">
                    <span class="source-name">${item.source}</span>
                    <span class="news-time">${item.time}</span>
                </div>
                <h3 class="news-title">${item.title}</h3>
                <p class="news-desc">${item.description}</p>
            `;
            container.appendChild(card);
        });
    });

    return container;
}

/* =========================================
   5. Calendar Render
   ========================================= */
function renderCalendar() {
    const container = document.createElement('div');
    container.className = 'calendar-container';

    const days = [];
    const today = new Date();

    for (let i = -3; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push({
            date: date,
            isToday: i === 0,
            events: getMockEvents(i)
        });
    }

    days.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day ${day.isToday ? 'today' : ''}`;

        const dateStr = `${day.date.getMonth() + 1}/${day.date.getDate()}`;
        const weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.date.getDay()];
        let eventsHtml = '';
        if (day.events.length > 0) {
            eventsHtml = day.events.map(ev => `
                <div class="cal-event">
                    <span class="cal-time">${ev.time}</span>
                    <span class="cal-title">${ev.title}</span>
                </div>
            `).join('');
        } else {
            eventsHtml = '<div class="no-events">No Events</div>';
        }

        dayEl.innerHTML = `
            <div class="cal-header">
                <span class="cal-date">${dateStr}</span>
                <span class="cal-weekday">${weekDay}</span>
            </div>
            <div class="cal-body">
                ${eventsHtml}
            </div>
        `;

        container.appendChild(dayEl);
    });

    setTimeout(() => {
        const todayEl = container.querySelector('.today');
        if (todayEl) {
            todayEl.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
    }, 100);

    return container;
}

function getMockEvents(offset) {
    if (offset === 0) {
        return [
            { time: '10:00', title: 'Team Meeting' },
            { time: '19:00', title: 'Dinner with Alice' }
        ];
    }
    if (offset === 1) {
        return [{ time: '14:00', title: 'Dentist Appointment' }];
    }
    if (offset === -1) {
        return [{ time: '09:00', title: 'Project Review' }];
    }
    if (Math.random() > 0.7) {
        return [{ time: '12:00', title: 'Lunch' }];
    }
    return [];
}

/* =========================================
   6. Carousel Component
   ========================================= */
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

function initCarousel() {
    carouselElement = document.getElementById('carousel-container');
    if (!carouselElement) return;
    showView(currentIndex);
}

function showView(index) {
    if (!carouselElement) return;
    carouselElement.classList.remove('active');

    setTimeout(() => {
        const view = VIEWS[index];
        carouselElement.innerHTML = '';
        const content = view.render();
        // content might be a promise if async, but here renderNews returns an element immediately (with async fetch inside)
        // Check if content is a promise (unlikely with current structure)
        if (content instanceof Promise) {
            content.then(el => carouselElement.appendChild(el));
        } else {
            carouselElement.appendChild(content);
        }

        carouselElement.classList.add('active');

        if (!isPaused) {
            clearTimeout(rotationTimer);
            rotationTimer = setTimeout(nextView, view.duration);
        }
    }, 500);
}

function nextView() {
    currentIndex = (currentIndex + 1) % VIEWS.length;
    showView(currentIndex);
}

function pauseRotation() {
    isPaused = true;
    clearTimeout(rotationTimer);
}

function resumeRotation() {
    isPaused = false;
    const view = VIEWS[currentIndex];
    clearTimeout(rotationTimer);
    rotationTimer = setTimeout(nextView, view.duration);
}

/* =========================================
   7. Interaction Component
   ========================================= */
let idleTimer = null;
let longPressTimer = null;
const IDLE_TIMEOUT = 30000;
const LONG_PRESS_DURATION = 1000;

function initInteraction() {
    const container = document.querySelector('.info-area');
    const activityEvents = ['mousedown', 'mousemove', 'wheel', 'touchstart', 'touchmove', 'scroll'];

    activityEvents.forEach(evt => {
        window.addEventListener(evt, handleActivity, { passive: true, capture: true });
    });

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('mousedown', handleTouchStart);
    container.addEventListener('mouseup', handleTouchEnd);
}

function handleActivity() {
    if (!isAutoRotateEnabled) return; // Don't check activity if globally disabled

    pauseRotation();
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

let isAutoRotateEnabled = true;

function toggleRotationState() {
    isAutoRotateEnabled = !isAutoRotateEnabled;
    const msg = isAutoRotateEnabled ? 'Rotation ON' : 'Rotation OFF';
    const icon = isAutoRotateEnabled ? '▶' : '⏸';
    showFeedback(msg, icon);

    if (isAutoRotateEnabled) {
        handleActivity();
    } else {
        pauseRotation();
        clearTimeout(idleTimer);
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
    setTimeout(() => {
        el.classList.add('hidden');
    }, 2000);
}

/* =========================================
   Main Initialization
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    console.log('HomeView Initializing...');
    initClock();
    initCarousel();
    initInteraction();
});
