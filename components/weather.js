/**
 * Weather Component
 * Renders the weather view.
 * Initially uses Mock Data.
 * Designed to eventually support Open-Meteo.
 */

export function renderWeather() {
    const container = document.createElement('div');
    container.className = 'weather-view';

    // Mock Data
    const data = {
        city: 'Tokyo', // constant for now
        temp: 24,
        condition: 'Clear', // Clear, Cloudy, Rain
        icon: '☀' // Simple text icon for V1, can be replaced with SVG
    };

    // Icons mapping (placeholder)
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
