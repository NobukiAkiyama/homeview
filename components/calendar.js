/**
 * Calendar Component
 * Renders a horizontal timeline of days with events.
 * Range: Past 3 days | Today | Future 7 days
 */

export function renderCalendar() {
    const container = document.createElement('div');
    container.className = 'calendar-container';

    // Generate dates: -3 to +7
    const days = [];
    const today = new Date();

    for (let i = -3; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push({
            date: date,
            isToday: i === 0,
            events: getMockEvents(i) // Get events for this offset
        });
    }

    days.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day ${day.isToday ? 'today' : ''}`;

        // Date Header
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

    // Auto-scroll to Today after render (small delay to ensure layout)
    setTimeout(() => {
        const todayEl = container.querySelector('.today');
        if (todayEl) {
            todayEl.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
    }, 100);

    return container;
}

function getMockEvents(offset) {
    // Generate some random events
    if (offset === 0) { // Today
        return [
            { time: '10:00', title: 'Team Meeting' },
            { time: '19:00', title: 'Dinner with Alice' }
        ];
    }
    if (offset === 1) { // Tomorrow
        return [{ time: '14:00', title: 'Dentist Appointment' }];
    }
    if (offset === -1) { // Yesterday
        return [{ time: '09:00', title: 'Project Review' }];
    }
    // Randomly add others
    if (Math.random() > 0.7) {
        return [{ time: '12:00', title: 'Lunch' }];
    }
    return [];
}
