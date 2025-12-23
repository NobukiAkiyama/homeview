/**
 * Clock Component
 * Updates the time and date display every minute.
 */

export function initClock() {
    const clockEl = document.getElementById('clock-display');
    const dateEl = document.getElementById('date-display');

    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        // Format: HH:MM
        clockEl.textContent = `${hours}:${minutes}`;

        // Format: YYYY/MM/DD (Day)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[now.getDay()];

        dateEl.textContent = `${year}/${month}/${day} ${dayName}`;
    }

    // Update immediately
    updateTime();

    // Sync with seconds to update exactly at the minute change
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    setTimeout(() => {
        updateTime();
        // Start 1-minute interval
        setInterval(updateTime, 60000);
    }, msUntilNextMinute);
}
