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
    { id: 'notepad', duration: 15000, render: renderNotepad }
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

        // Click to scroll (Vertical)
        dot.addEventListener('click', () => {
            // Ensure we are scrolling the main carousel container
            const height = carouselEl.clientHeight;
            carouselEl.scrollTo({
                top: index * height,
                behavior: 'smooth'
            });
            // Reset timer on manual interaction
            clearTimeout(carouselTimer);
            startRotation();
        });

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
    updatePagination(index);
}

/* --- Renderers --- */
const WEATHER_CODE_MAP = {
    0: { label: '快晴', icon: '☀', bg: 'assets/weather_sunny.png', overlay: 'rgba(0,0,0,0.2)' },
    1: { label: '晴れ', icon: '🌤', bg: 'assets/weather_sunny.png', overlay: 'rgba(0,0,0,0.2)' },
    2: { label: '薄曇り', icon: '⛅', bg: 'assets/weather_cloudy.png', overlay: 'rgba(0,0,0,0.4)' },
    3: { label: '曇り', icon: '☁', bg: 'assets/weather_cloudy.png', overlay: 'rgba(0,0,0,0.4)' },
    45: { label: '霧', icon: '🌫', bg: 'assets/weather_cloudy.png', overlay: 'rgba(0,0,0,0.5)' },
    48: { label: '霧', icon: '🌫', bg: 'assets/weather_cloudy.png', overlay: 'rgba(0,0,0,0.5)' },
    51: { label: '霧雨', icon: '🌧', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.5)' },
    53: { label: '霧雨', icon: '🌧', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.5)' },
    55: { label: '霧雨', icon: '🌧', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.5)' },
    61: { label: '雨', icon: '☔', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.6)' },
    63: { label: '雨', icon: '☔', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.6)' },
    65: { label: '激しい雨', icon: '⛈', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.7)' },
    80: { label: 'にわか雨', icon: '🌦', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.6)' },
    81: { label: 'にわか雨', icon: '🌦', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.6)' },
    82: { label: 'にわか雨', icon: '🌦', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.7)' },
    95: { label: '雷雨', icon: '⚡', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.7)' },
    96: { label: '雷雨', icon: '⚡', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.7)' },
    99: { label: '雷雨', icon: '⚡', bg: 'assets/weather_rainy.png', overlay: 'rgba(0,0,0,0.7)' }
};

const DEFAULT_WEATHER = { label: '曇り', icon: '☁', bg: 'assets/weather_cloudy.png', overlay: 'rgba(0,0,0,0.4)' };

async function renderWeather(container) {
    // Check if we already have a location cached to speed up render, or use default view first
    container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;font-size:1.5rem;opacity:0.6;">Locating...</div>';

    try {
        // 1. Get Location
        const pos = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) reject(new Error("Geolocation not supported"));
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        const { latitude: lat, longitude: lon } = pos.coords;

        // 2. Fetch Weather Data
        // 2. Fetch Weather & Location Data Parallelly
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,is_day&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
        const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ja`;

        const [weatherRes, geoRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(geoUrl)
        ]);

        if (!weatherRes.ok) throw new Error('Weather API Error');
        const data = await weatherRes.json();
        const geoData = await geoRes.json();

        // Extract location name (Concat parts for full address: e.g. "OsakaSakaiHigashi-ku")
        const locationName = [
            geoData.principalSubdivision,
            geoData.city,
            geoData.locality
        ].filter(Boolean).join('') || 'Unknown Location';

        // 3. Parse Data
        const current = data.current;
        const daily = data.daily;
        const weatherInfo = WEATHER_CODE_MAP[current.weather_code] || DEFAULT_WEATHER;

        // Adjust background for night time if needed (optional improvement for later)

        const temp = Math.round(current.temperature_2m);
        const high = Math.round(daily.temperature_2m_max[0]);
        const low = Math.round(daily.temperature_2m_min[0]);

        // Apply background with overlay
        const bgStyle = `background: linear-gradient(${weatherInfo.overlay}, ${weatherInfo.overlay}), url('${weatherInfo.bg}') center/cover no-repeat;`;

        container.innerHTML = `
            <div class="weather-view" style="${bgStyle}">
                <div class="weather-header">
                    <div>
                        <div class="weather-condition-text">${weatherInfo.label}</div>
                        <div class="weather-sub">${locationName} • 最高:${high}° 最低:${low}°</div>
                    </div>
                </div>
                <div class="weather-big-temp">
                    ${temp}<span style="font-size:4rem;vertical-align:top;">°</span>
                    <span style="font-size:2rem;margin-left:12px;">${weatherInfo.icon}</span>
                </div>
                
                <div class="weather-forecast-row" style="overflow-x:auto;">
                    ${renderHourlyForecast(data.hourly)}
                </div>
            </div>
        `;

    } catch (err) {
        console.warn("Weather load failed", err);
        container.innerHTML = `
            <div class="weather-view" style="background: url('assets/weather_cloudy.png') center/cover;">
                <div style="background:rgba(0,0,0,0.6);padding:24px;border-radius:12px;">
                    <div style="font-size:1.2rem;margin-bottom:8px;">Unable to load weather</div>
                    <div style="font-size:0.9rem;opacity:0.8;">Please allow location access.</div>
                </div>
            </div>
        `;
    }
}

function renderHourlyForecast(hourly) {
    if (!hourly || !hourly.time) return '';

    // API returns data starting from 00:00 today. Find current hour index.
    const currentHour = new Date().getHours();

    let html = '';
    // Show next 6 hours
    for (let i = 1; i <= 6; i++) {
        const idx = currentHour + i;
        if (idx >= hourly.time.length) break;

        const timeStr = hourly.time[idx]; // "YYYY-MM-DDTHH:00"
        const hourLabel = timeStr.split('T')[1].slice(0, 5); // "HH:00"
        const temp = Math.round(hourly.temperature_2m[idx]);
        const code = hourly.weather_code[idx];
        const icon = (WEATHER_CODE_MAP[code] || DEFAULT_WEATHER).icon;

        html += `
            <div class="forecast-col">
                <span style="font-size:0.9rem; opacity:0.7">${hourLabel}</span>
                <span style="font-size:1.5rem">${icon}</span>
                <span style="font-weight:600">${temp}°</span>
            </div>
        `;
    }
    return html;
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

        // Liquid Pagination Configuration
        const DOT_SIZE = 8;
        const DOT_GAP = 12;
        const PADDING_LEFT = 16; // .liquid-pagination padding-left
        const ACTIVE_WIDTH_BASE = 2.5 * DOT_SIZE; // 20px
        const MAX_STRETCH = 0.5 * DOT_SIZE; // 4px extra
        const PITCH = DOT_SIZE + DOT_GAP; // 20px center-to-center distance

        let paginationBox = wrapper.querySelector('.liquid-pagination');
        if (!paginationBox) {
            paginationBox = document.createElement('div');
            paginationBox.className = 'liquid-pagination';
            wrapper.appendChild(paginationBox);
        }

        const totalItems = newsCache.length;
        // Generate Dots
        // Note: For simplicity in this liquid version, we show all dots if count is reasonable (< 15).
        // If > 15, we might need a sliding window, but let's assume < 15 for now as per plan.
        const visibleCount = Math.min(totalItems, 12);

        let dotsHtml = `<div class="liquid-pill"></div>`;
        for (let i = 0; i < visibleCount; i++) {
            dotsHtml += `<div class="liquid-dot" data-index="${i}"></div>`;
        }
        paginationBox.innerHTML = dotsHtml;

        const pill = paginationBox.querySelector('.liquid-pill');
        const dots = paginationBox.querySelectorAll('.liquid-dot');

        // Helper: Easing & Math
        const lerp = (start, end, t) => start * (1 - t) + end * t;
        const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

        // Custom Easing for asymmetry
        // easeOut for leading edge (fast start)
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        // easeIn for trailing edge (slow start, catches up late)
        const easeInCubic = t => t * t * t;

        // Stretch curve: sin(pi * t) -> 0 at 0, 1 at 0.5, 0 at 1
        const getStretch = t => Math.sin(Math.PI * t);

        function updateLiquidPagination(scrollProgress) {
            // scrollProgress is a float (0.0 to totalItems-1.0)

            // 1. Calculate Pill Position & Width
            const currentIndex = Math.floor(scrollProgress);
            const nextIndex = Math.min(currentIndex + 1, visibleCount - 1);
            const progress = scrollProgress - currentIndex; // 0.0 to 1.0 within the segment

            // Determine direction to apply asymmetry
            // We assume forward movement if we just look at progress, but for simplicity:
            // Let's model "Rightward" movement logic for generic 0->1.
            // If dragging left (progress decreasing), we effectively want the "Left" edge to lead.
            // However, a simple asymmetrical ease based on 0->1 works well enough for "moving right".

            // Center positions of dots relative to container
            // dot[i] center = PADDING_LEFT + (i * PITCH) + (DOT_SIZE / 2)
            // But we place pill using 'left' and 'width'.

            // Let's calculate LEFT Edge and RIGHT Edge of the target pill position.
            // Idle Width w_active = ACTIVE_WIDTH_BASE.
            // Centered on dot i:
            // Center_i = PADDING_LEFT + i * PITCH + DOT_SIZE/2
            // Left_i = Center_i - w_active/2
            // Right_i = Center_i + w_active/2

            const getPillBounds = (idx) => {
                const center = PADDING_LEFT + idx * PITCH + DOT_SIZE / 2;
                return {
                    left: center - ACTIVE_WIDTH_BASE / 2,
                    right: center + ACTIVE_WIDTH_BASE / 2
                };
            };

            const currBounds = getPillBounds(currentIndex);
            const nextBounds = getPillBounds(nextIndex);

            // Apply Stretch & Asymmetry
            // We want "Leading edge moves fast", "Trailing edge moves slow".
            // Moving i -> i+1 (Right interaction)
            // Right Edge uses easeOut (moves fast)
            // Left Edge uses easeIn (moves slow)

            // To handle Bi-directional accurately without tracking velocity state,
            // we can use a symmetric "Rubber Band" approximation or just stick to the requested asymmetry.
            // Requested: "Right move: Right edge leads. Left move: Left edge leads."
            // Since we only have 'progress' (0..1), we can just treat it as 0->1.

            // Settle Phase is implicit in the easing approaching 0 or 1.

            const rightEdge = lerp(currBounds.right, nextBounds.right, easeOutCubic(progress));
            const leftEdge = lerp(currBounds.left, nextBounds.left, easeInCubic(progress));

            // Extra Stretch from the "Stretch Phase" logic (width += stretch * extra)
            // The differential easing above naturally creates stretch.
            // Let's Add explicit extra stretch if needed, or rely on the math.
            // Diff easing: Midpoint (0.5) -> Right has moved ~0.875, Left ~0.125.
            // Gap is 12px. Delta centers = 20px.
            // Right moves 0->20. Left moves 0->20.
            // At 0.5: Right is at 17.5, Left is at 2.5.
            // Original Width = 20.
            // New Width = (Right_i + 17.5) - (Left_i + 2.5) 
            // = (Start_R + 17.5) - (Start_L + 2.5)
            // = (Start_L + 20 + 17.5) - (Start_L + 2.5) = 20 + 15 = 35. (+15px stretch).
            // This might be too much stretch.

            // Let's tone down the asymmetry or blend with linear.
            const t_right = easeOutCubic(progress) * 0.7 + progress * 0.3;
            const t_left = easeInCubic(progress) * 0.7 + progress * 0.3;

            let finalLeft = lerp(currBounds.left, nextBounds.left, t_left);
            let finalRight = lerp(currBounds.right, nextBounds.right, t_right);
            let finalWidth = finalRight - finalLeft;

            // Clamp width to prevent inversion or too thin
            if (finalWidth < DOT_SIZE) {
                // Should not happen with logic above but safety
                const center = (finalLeft + finalRight) / 2;
                finalWidth = DOT_SIZE;
                finalLeft = center - DOT_SIZE / 2;
            }

            // Apply to Pill
            pill.style.left = `${finalLeft}px`;
            pill.style.width = `${finalWidth}px`;

            // 2. Neighbor Effects (Scale/Opacity)
            dots.forEach((dot, idx) => {
                const dist = Math.abs(scrollProgress - idx);
                // "Close" means dist < 1.0 roughly.
                // Target dot (closest integer) gets full opacity? 
                // Spec: "Target dot opacity 0.45->0.75"
                // But pill is on top.
                // The dots BEHIND the pill should be hidden or allow the pill to cover them.
                // Since pill is opaque white and dots are semi-transparent white, 
                // covering is fine.

                // Let's implement the "Target dot slightly scales up"
                if (dist < 1.0) {
                    // 1.0 -> 0.0 distance
                    // scale 1.0 -> 1.05
                    const scale = 1.0 + (1.0 - dist) * 0.15; // slightly bolder
                    const opacity = 0.35 + (1.0 - dist) * 0.4;
                    dot.style.transform = `scale(${scale})`;
                    dot.style.opacity = opacity;
                } else {
                    dot.style.transform = 'scale(1.0)';
                    dot.style.opacity = '0.35';
                }
            });
        }

        // Click to Scroll
        paginationBox.addEventListener('click', (e) => {
            const dot = e.target.closest('.liquid-dot');
            if (dot) {
                const targetIndex = parseInt(dot.dataset.index);
                scroller.scrollTo({
                    left: targetIndex * scroller.clientWidth,
                    behavior: 'smooth'
                });
            }
        });

        // Initial set
        updateLiquidPagination(0);

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
            // High-precision scroll tracking for liquid animation
            // Using requestAnimationFrame to decouple slightly if needed, but direct update is usually fine for UI sync
            const progress = scrollLeft / width; // float 0.0 -> N.0

            requestAnimationFrame(() => {
                updateLiquidPagination(progress);
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

function renderNotepad(container) {
    // 1. Load saved note
    const SAVED_KEY = 'homeview_note';
    const savedText = localStorage.getItem(SAVED_KEY) || '';

    // 2. Create UI with Premium Dark Style
    // Using inline styles for simplicity within the widget constraints, ensuring consistency.
    container.innerHTML = `
        <div class="notepad-view" style="
            background: rgba(30, 30, 35, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            padding: 24px;
            border-radius: 24px;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.08);
            color: #e0e0e0;
        ">
            <!-- Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="font-size:1.4rem; font-weight:600; margin:0; letter-spacing:0.05em; opacity:0.9;">NOTES</h2>
                <span id="note-status" style="font-size:0.8rem; opacity:0.5; font-weight:500; letter-spacing:0.05em;">READY</span>
            </div>

            <!-- Text Area -->
            <textarea id="notepad-area" style="
                flex: 1;
                width: 100%;
                background: transparent;
                border: none;
                resize: none;
                color: #ffffff;
                font-family: 'Inter', sans-serif; /* Fallback to system fonts */
                font-size: 1.1rem;
                line-height: 1.6;
                outline: none;
                padding: 0;
            " placeholder="Tap to start typing...">${savedText}</textarea>
        </div>
    `;

    // 3. Attach Logic
    const textarea = container.querySelector('#notepad-area');
    const statusEl = container.querySelector('#note-status');
    let timeoutId;

    textarea.addEventListener('input', () => {
        statusEl.textContent = 'SAVING...';
        statusEl.style.opacity = '1';

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            localStorage.setItem(SAVED_KEY, textarea.value);
            statusEl.textContent = 'SAVED';
            statusEl.style.opacity = '0.5';
        }, 500); // Debounce save
    });
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
