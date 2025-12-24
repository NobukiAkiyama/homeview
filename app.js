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
    const conditions = [
        {
            cond: 'Sunny',
            temp: 24,
            high: 28,
            low: 18,
            bg: 'assets/weather_sunny.png',
            overlay: 'rgba(0,0,0,0.2)', // Sunny needs less dark, or maybe just shadow
            icon: '☀'
        },
        {
            cond: 'Cloudy',
            temp: 18,
            high: 20,
            low: 15,
            bg: 'assets/weather_cloudy.png',
            overlay: 'rgba(0,0,0,0.4)',
            icon: '☁'
        },
        {
            cond: 'Rainy',
            temp: 14,
            high: 16,
            low: 12,
            bg: 'assets/weather_rainy.png',
            overlay: 'rgba(0,0,0,0.5)',
            icon: '☂'
        }
    ];

    // Pick a random condition for demonstration
    const weather = conditions[Math.floor(Math.random() * conditions.length)];

    // Apply background with overlay for readability
    const bgStyle = `background: linear-gradient(${weather.overlay}, ${weather.overlay}), url('${weather.bg}') center/cover no-repeat;`;

    container.innerHTML = `
        <div class="weather-view" style="${bgStyle}">
            <div class="weather-header">
                <div>
                    <div class="weather-condition-text">${weather.cond}</div>
                    <div class="weather-sub">Tokyo • ↑${weather.high}° ↓${weather.low}°</div>
                </div>
            </div>
            <div class="weather-big-temp">${weather.temp}°</div>
            <div class="weather-forecast-row">
                ${[12, 15, 18, 21, 0, 3].map(h => `
                    <div class="forecast-col">
                        <span style="font-size:0.9rem; opacity:0.9">${h}:00</span>
                        <span style="font-size:1.5rem">${weather.icon}</span>
                        <span style="font-weight:600">${weather.temp - 2 + Math.floor(Math.random() * 4)}°</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Global cache to prevent re-fetching every rotation (optional, but good for rate limits)
let newsCache = null;
let lastNewsFetch = 0;

async function renderNews(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'news-view';
    const scroller = document.createElement('div');
    scroller.className = 'news-scroller';
    wrapper.appendChild(scroller);
    container.appendChild(wrapper);

    // Show loading skeleton or text
    scroller.innerHTML = '<div style="padding:48px; font-size:1.5rem; opacity:0.6;">Loading News...</div>';

    try {
        // Fetch if cache is empty or old (e.g., 5 mins)
        const now = Date.now();
        if (!newsCache || (now - lastNewsFetch > 300000)) {
            const res = await fetch('https://assets.wor.jp/rss/rdf/reuters/top.rdf');
            if (!res.ok) throw new Error('Network response was not ok');
            const str = await res.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(str, "text/xml");
            const items = Array.from(xml.querySelectorAll('item')).slice(0, 5); // Start with top 5

            newsCache = items.map(item => {
                const title = item.querySelector('title')?.textContent || 'No Title';
                const link = item.querySelector('link')?.textContent || '#';
                const dateStr = item.querySelector('dc\\:date, date')?.textContent || new Date().toISOString();
                // Try to get description or encoded content. Reuters RSS often puts summaries in description.
                let description = item.querySelector('description')?.textContent || '';
                // Strip HTML tags from description if present (Reuters often has HTML)
                description = description.replace(/<[^>]*>?/gm, '');

                return {
                    title,
                    source: 'Reuters', // Hardcoded for this feed, could parse channel title
                    link,
                    date: new Date(dateStr),
                    description: description,
                    // Generic dark gradient background
                    img: `linear-gradient(135deg, #1a1a1a, #2a2a2a)`
                };
            });
            lastNewsFetch = now;
        }

        // Render cache
        scroller.innerHTML = '';
        newsCache.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'news-card';
            // Alternating gradients logic
            const hue = (200 + index * 20) % 360; // Cool blues/purples
            card.style.background = `linear-gradient(135deg, hsl(${hue}, 30%, 20%), hsl(${hue}, 40%, 10%))`;

            // Time formatting
            const timeDiff = Math.floor((Date.now() - item.date) / 60000); // mins
            // Simple format for reference image style: "11月24日 10:51"
            const dateFmt = item.date.toLocaleString('ja-JP', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            // QR Code URL (using goqr.me API as it's simple and reliable)
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.link)}`;

            card.innerHTML = `
                <div class="news-content">
                    <div class="news-header-row">
                        <span class="news-source">${item.source}</span>
                    </div>
                    
                    <div class="news-body">
                        <div class="news-headline">${item.title}</div>
                        <div class="news-description">${item.description}</div>
                    </div>

                    <div class="news-footer-row">
                        <span class="news-meta-time">${dateFmt}</span>
                        <div class="news-qr-area">
                            <span class="news-qr-cta">詳しい内容は<br>QRコードから</span>
                            <img class="news-qr-code" src="${qrUrl}" alt="QR">
                        </div>
                    </div>
                </div>
            `;
            scroller.appendChild(card);
        });

    } catch (e) {
        console.error("News Fetch Failed", e);
        scroller.innerHTML = `
            <div style="padding:48px;">
                <h3>Unable to load news</h3>
                <p style="opacity:0.6">${e.message}</p>
                <p style="opacity:0.6; font-size:0.8rem; margin-top:10px;">Note: Fetching RSS directly from browser may require a CORS proxy or disabling CORS for testing.</p>
            </div>
        `;
    }
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
