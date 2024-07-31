class Notifications {
    constructor(app) {
        this.app = app;
        this.seenEvents = new Set();
        this.notifiedEvents = new Set();
    }

    updateNotifications() {
        const notificationsList = document.getElementById('notifications-list');
        notificationsList.innerHTML = '';

        const events = this.app.markers.getMarkers();
        const now = new Date();

        let hasNewNotifications = false;

        const ongoingEvents = events.filter(event => {
            const startDate = new Date(event.eventData.start);
            const endDate = new Date(event.eventData.end);
            return startDate <= now && endDate >= now;
        });

        const upcomingEvents = events.filter(event => {
            const startDate = new Date(event.eventData.start);
            return startDate > now;
        });

        if (ongoingEvents.length > 0) {
            const ongoingItem = document.createElement('li');
            ongoingItem.innerHTML = `<strong>Événements en cours (${ongoingEvents.length})</strong>`;
            notificationsList.appendChild(ongoingItem);

            ongoingEvents.forEach(event => {
                if (!this.notifiedEvents.has(event.eventData.id)) {
                    const eventItem = document.createElement('li');
                    eventItem.innerHTML = `
                        <span>${event.eventData.title}</span>
                        <span>Début: ${new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(event.eventData.start))}</span>
                    `;
                    notificationsList.appendChild(eventItem);
                    this.notifiedEvents.add(event.eventData.id);
                    hasNewNotifications = true;
                }
            });
        }

        if (upcomingEvents.length > 0) {
            const upcomingItem = document.createElement('li');
            upcomingItem.innerHTML = `<strong>Événements à venir</strong>`;
            notificationsList.appendChild(upcomingItem);

            upcomingEvents.forEach(event => {
                if (!this.notifiedEvents.has(event.eventData.id)) {
                    const eventItem = document.createElement('li');
                    eventItem.innerHTML = `
                        <span>${event.eventData.title}</span>
                        <span>Début: ${new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(event.eventData.start))}</span>
                    `;
                    notificationsList.appendChild(eventItem);
                    this.notifiedEvents.add(event.eventData.id);
                    hasNewNotifications = true;
                }
            });
        }

        if (hasNewNotifications) {
            this.showNotificationBadge();
        }
    }

    showNotificationBadge() {
        const notificationBadge = document.getElementById('notification-badge');
        notificationBadge.style.display = 'block';
    }

    hideNotificationBadge() {
        const notificationBadge = document.getElementById('notification-badge');
        notificationBadge.style.display = 'none';
    }

    markEventsAsSeen() {
        this.hideNotificationBadge();
    }

    clearNotifications() {
        this.notifiedEvents.clear();
    }
}

export default Notifications;
