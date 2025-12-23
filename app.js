/**
 * HomeView App (Smart Display Edition - Manual Scroll Support)
 */

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initCarousel();
    initInteraction();
});

/* --- Clock --- */
function initClock() {
    const clockEl = document.getElementById('clock-text');
    const dateEl = document.getElementById('date-text');

    function update() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        clockEl.textContent = `${h}:${m}`;

        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
    update();
    setInterval(update, 1000);
}

/* --- Carousel / Widgets --- */
const WIDGETS = [
    { id: 'weather', duration: 15000, render: renderWeather },
    { id: 'news', duration: 20000, render: renderNews },
    { id: 'calendar', duration: 15000, render: renderCalendar }
];

let currentIndex = 0;
let carouselTimer = null;
let carouselEl = null;

function initCarousel() {
    carouselEl = document.getElementById('widget-area');

    // Initial Render
    WIDGETS.forEach((widget) => {
        const container = document.createElement('div');
        container.className = 'view-container'; // Flex item
        container.id = `view-${widget.id}`;
        carouselEl.appendChild(container);

        // Render content
        widget.render(container);
    });

    createPagination();

    // Listen for manual scroll
    carouselEl.addEventListener('scroll', handleScroll, { passive: true });

    startRotation();
}

function createPagination() {
    const container = document.getElementById('pagination');
    container.innerHTML = '';
    WIDGETS.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `page-dot ${index === 0 ? 'active' : ''}`;
        container.appendChild(dot);
    });
}

function updatePagination(index) {
    const dots = document.querySelectorAll('.page-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

/* Scroll Handling */
let scrollTimeout;
function handleScroll() {
    if (!carouselEl) return;

    // While scrolling, clear auto-rotate timer
    clearTimeout(carouselTimer);

    // Debounce index calculation
    if (scrollTimeout) clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
        // Calculate current index (Vertical)
        const height = carouselEl.clientHeight;
        const scrollTop = carouselEl.scrollTop;
        const newIndex = Math.round(scrollTop / height);

        if (newIndex !== currentIndex && newIndex < WIDGETS.length) {
            currentIndex = newIndex;
            updatePagination(currentIndex);
        }

        // Restart timer after scroll settles
        startRotation();
    }, 100);
}


function startRotation() {
    clearTimeout(carouselTimer);
    const currentWidget = WIDGETS[currentIndex];
    if (!currentWidget) return;

    carouselTimer = setTimeout(() => {
        nextWidget();
    }, currentWidget.duration);
}

function nextWidget() {
    currentIndex = (currentIndex + 1) % WIDGETS.length;
    scrollToWidget(currentIndex);
}

function scrollToWidget(index) {
    if (!carouselEl) return;
    const height = carouselEl.clientHeight;
    carouselEl.scrollTo({
        top: height * index,
        behavior: 'smooth'
    });
    // Pagination updates via handleScroll listener
}

/* --- Renderers --- */
function renderWeather(container) {
    const data = { temp: 15, cond: 'Partly Cloudy', high: 16, low: 14 };
    container.innerHTML = `
        <div class="weather-view">
            <div class="weather-header">
                <div>
                    <div class="weather-condition-text">Cloudy</div>
                    <div class="weather-sub">Tokyo • ↑${data.high}° ↓${data.low}°</div>
                </div>
            </div>
            <div class="weather-big-temp">${data.temp}°</div>
            <div class="weather-forecast-row">
                ${[12, 15, 18, 21, 0, 3].map(h => `
                    <div class="forecast-col">
                        <span style="font-size:0.9rem; opacity:0.7">${h}:00</span>
                        <span style="font-size:1.5rem">☁</span>
                        <span style="font-weight:600">${10 + Math.floor(Math.random() * 5)}°</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderNews(container) {
    const newsData = [
        { title: "Global Markets Rally as Tech Stocks Surge", source: "Bloomberg", img: "linear-gradient(45deg, #111, #333)" },
        { title: "New EV Battery Tech promises 1000km range", source: "TechCrunch", img: "linear-gradient(45deg, #202020, #404040)" }
    ];
    const wrapper = document.createElement('div');
    wrapper.className = 'news-view';
    const scroller = document.createElement('div');
    scroller.className = 'news-scroller';

    newsData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.style.background = item.img;
        card.innerHTML = `
            <div class="news-content">
                <span class="news-source">${item.source}</span>
                <div class="news-headline">${item.title}</div>
                <div class="news-meta-row">
                    <span>10 mins ago</span>
                </div>
            </div>
        `;
        scroller.appendChild(card);
    });
    wrapper.appendChild(scroller);
    container.appendChild(wrapper);
}

function renderCalendar(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'calendar-view';
    wrapper.innerHTML = '<h2 style="font-size:1.8rem; font-weight:600; margin-bottom:16px;">Schedule</h2>';

    const scroller = document.createElement('div');
    scroller.className = 'cal-scroller';

    for (let i = 0; i < 7; i++) {
        const d = new Date(); d.setDate(d.getDate() + i);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = d.getDate();

        const row = document.createElement('div');
        row.className = 'cal-day-row';
        row.innerHTML = `
            <div class="cal-date-badge">
                <span style="font-size:0.9rem; opacity:0.8">${dayName}</span>
                <span style="font-size:1.4rem">${dayNum}</span>
            </div>
            <div class="cal-event-info">
                <span class="cal-time">10:00 AM - 11:30 AM</span>
                <div class="cal-title">${i === 0 ? 'Team Sync & Review' : 'Focus Time'}</div>
            </div>
        `;
        scroller.appendChild(row);
    }
    wrapper.appendChild(scroller);
    container.appendChild(wrapper);
}

/* --- Interaction --- */
function initInteraction() {
    // Simply reset timer on any interaction to prevent auto-move while reading
    ['mousedown', 'touchstart', 'mousemove'].forEach(evt => {
        window.addEventListener(evt, () => {
            // Handled by handleScroll largely, but adding global activity reset if needed
            // Actually, handleScroll handles the main "carousel" interaction.
            // This global listener is good for "reading" without scrolling.
            startRotation(); // Resets the timer
        }, { passive: true });
    });
}
