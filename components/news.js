/**
 * News Component
 * Renders horizontal scrolling news cards.
 */

import { fetchNews } from '../services/news-service.js';

export async function renderNews() {
    const container = document.createElement('div');
    container.className = 'news-container';

    // Loading state
    container.innerHTML = '<div class="loading">News Loading...</div>';

    // Fetch data (async) - DOM is returned immediately, content updated later
    fetchNews().then(newsItems => {
        container.innerHTML = ''; // Clear loading

        // Add a spacer at the start to center the first item if needed, 
        // or just rely on scroll-snap with padding.
        // For this design: "Left: Past, Right: Newest (Default)"
        // But logical flow is usually Left->Right. 
        // Spec says: "← Past Articles | Latest Article (Initial) →" ??
        // Actually spec says: "← Past (History) | Latest (Initial) " implies Latest is at the right edge?
        // Or Latest is the main view, and you scroll LEFT to see past.
        // Let's implement standard horizontal list, sorted Newest First?
        // If sorting is Newest First, then Left is Newest. 
        // If we want "Scroll Left for Past", then Newest should be on the Right?
        // Let's stick to standard: Left = Newest (1st item). Scroll Right for older.
        // Wait, Spec: "← Past Articles | Latest Article (Initial)" 
        // This implies Latest is on the RIGHT end, or we start scrolled to the right?
        // Let's try starting at the LEFT (First item = Latest). 
        // UX: Scrolled to start.

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
