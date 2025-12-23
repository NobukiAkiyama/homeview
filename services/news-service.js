/**
 * News Service
 * Fetches news from Google News RSS using rss2json to convert XML to JSON and avoid CORS.
 */

const RSS_URL = 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja';
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

// Cache to prevent hitting rate limits
let cachedNews = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function fetchNews() {
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
                source: item.author || 'Google News', // rss2json sometimes puts source in author
                time: formatTime(item.pubDate),
                link: item.link
            }));
            lastFetchTime = now;
            return cachedNews;
        } else {
            console.error('News API Error:', data.message);
            return getMockNews(); // Fallback
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
