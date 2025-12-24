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

const RSS_FEEDS = [
    {
        name: 'ロイター Top',
        url: 'https://assets.wor.jp/rss/rdf/reuters/top.rdf',
        color: '#ff8000',
        bgImg: 'assets/news_bloomberg.png'
    },
    {
        name: '日経 速報',
        url: 'https://assets.wor.jp/rss/rdf/nikkei/news.rdf',
        color: '#0066b3',
        bgImg: 'assets/news_nikkei.png'
    },
    {
        name: '日経 テック',
        url: 'https://assets.wor.jp/rss/rdf/nikkei/technology.rdf',
        color: '#00afcc',
        bgImg: 'assets/news_nikkei.png'
    },
    {
        name: '読売 新着',
        url: 'https://assets.wor.jp/rss/rdf/yomiuri/latestnews.rdf',
        color: '#ef492d',
        bgImg: 'assets/news_yomiuri.png'
    },
    {
        name: '読売 科学',
        url: 'https://assets.wor.jp/rss/rdf/yomiuri/science.rdf',
        color: '#4b9846',
        bgImg: 'assets/news_yomiuri.png'
    },
    {
        name: 'Oricon 芸能',
        url: 'https://assets.wor.jp/rss/rdf/oricon/entertainment.rdf',
        color: '#da4d95',
        bgImg: 'assets/news_oricon.png'
    },
    {
        name: 'Bloomberg Tech',
        url: 'https://assets.wor.jp/rss/rdf/bloomberg/technology.rdf',
        color: '#2b00f7',
        bgImg: 'assets/news_bloomberg.png'
    }
];

async function renderNews(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'news-view';
    const scroller = document.createElement('div');
    scroller.className = 'news-scroller';
    wrapper.appendChild(scroller);
    container.appendChild(wrapper);

    // Show loading skeleton or text
    scroller.innerHTML = '<div style="padding:48px; font-size:1.5rem; opacity:0.6;">Loading News from Multiple Sources...</div>';

    try {
        const now = Date.now();
        // 5 minute cache
        if (!newsCache || (now - lastNewsFetch > 300000)) {
            // Pick 3 random feeds to mix, plus always include Reuters Top or simply mix all?
            // Let's fetch 3 random ones to keep it varied but fast.
            const shuffled = RSS_FEEDS.sort(() => 0.5 - Math.random());
            const selectedFeeds = shuffled.slice(0, 3);

            // Parallel Fetch
            const promises = selectedFeeds.map(feed =>
                fetch(feed.url)
                    .then(res => res.ok ? res.text() : null)
                    .then(str => {
                        if (!str) return [];
                        const parser = new DOMParser();
                        const xml = parser.parseFromString(str, "text/xml");
                        const items = Array.from(xml.querySelectorAll('item')).slice(0, 4); // Take top 4 from each
                        return items.map(item => {
                            const title = item.querySelector('title')?.textContent || 'No Title';
                            const link = item.querySelector('link')?.textContent || '#';
                            const dateNode = item.querySelector('dc\\:date, date, pubDate');
                            const dateStr = dateNode?.textContent || new Date().toISOString();
                            let description = item.querySelector('description')?.textContent || '';
                            description = description.replace(/<[^>]*>?/gm, '');

                            return {
                                title,
                                source: feed.name,
                                sourceColor: feed.color,
                                link,
                                date: new Date(dateStr),
                                description,
                                bgImg: feed.bgImg
                            };
                        });
                    })
                    .catch(err => {
                        console.warn(`Failed to fetch ${feed.name}`, err);
                        return [];
                    })
            );

            const results = await Promise.all(promises);
            // Flatten and Sort by Date (Newest first)
            let allNews = results.flat().sort((a, b) => b.date - a.date);

            // Limit to top 10 total
            newsCache = allNews.slice(0, 10);
            lastNewsFetch = now;
        }

        if (newsCache.length === 0) throw new Error("No news available");

        // Render cache
        scroller.innerHTML = '';

        // Add pagination indicator container to wrapper (not scroller)
        let indicatorBox = wrapper.querySelector('.news-indicator-box');
        if (!indicatorBox) {
            indicatorBox = document.createElement('div');
            indicatorBox.className = 'news-indicator-box';
            wrapper.appendChild(indicatorBox);
        }
        indicatorBox.innerHTML = newsCache.map((_, i) => `<div class="news-dot ${i === 0 ? 'active' : ''}"></div>`).join('');

        // Add click listeners to dots
        const dots = indicatorBox.querySelectorAll('.news-dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                scroller.scrollTo({
                    left: index * scroller.clientWidth,
                    behavior: 'smooth'
                });
            });
        });

        newsCache.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'news-card';
            // Set base styling just in case, though the inner div handles the visual bg
            card.style.background = '#111';

            const timeDiff = Math.floor((Date.now() - item.date) / 60000);
            const dateFmt = item.date.toLocaleString('ja-JP', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.link)}`;

            card.innerHTML = `
                <div class="news-bg" style="
                    position: absolute; inset: 0; 
                    background: url('${item.bgImg}') center/cover no-repeat; 
                    z-index: 0;
                "></div>
                <!-- Gradient Overlay for readability -->
                <div class="news-bg-overlay" style="
                    position: absolute; inset: 0;
                    background: linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%);
                    z-index: 1;
                "></div>

                <div class="news-content" style="z-index: 2;">
                    <div class="news-header-row">
                        <!-- Apply dynamic source name and optional color accent border -->
                        <span class="news-source" style="border-bottom-color: ${item.sourceColor || '#ccc'};">${item.source}</span>
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

        // Add scroll listener for dots
        scroller.addEventListener('scroll', () => {
            const width = scroller.clientWidth;
            const scrollLeft = scroller.scrollLeft;
            const index = Math.round(scrollLeft / width);

            const dots = indicatorBox.querySelectorAll('.news-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }, { passive: true });

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
