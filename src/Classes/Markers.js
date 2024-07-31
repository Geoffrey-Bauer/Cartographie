import mapboxgl from 'mapbox-gl'

class Markers {
    constructor(app) {
        this.markers = []
        this.app = app
    }

    addMarker(lngLat, eventData) {
        const color = this.getMarkerColor(eventData.end)
        const marker = new mapboxgl.Marker({ color })
            .setLngLat(lngLat)
            .setPopup(new mapboxgl.Popup().setHTML(this.createPopupContent(eventData)))
            .addTo(this.app.map) // Assurez-vous que `this.app.map` est votre instance de carte Mapbox

        this.markers.push({ marker, eventData })
        return marker
    }

    removeMarker(eventId) {
        const index = this.markers.findIndex(m => m.eventData.id === eventId)
        if (index !== -1) {
            this.markers[index].marker.remove() // Supprime le marqueur de la carte
            this.markers.splice(index, 1) // Supprime le marqueur de la liste
        }
    }

    getMarkers() {
        return this.markers
    }

    getMarkerColor(eventEnd) {
        const now = new Date()
        const diffDays = (new Date(eventEnd) - now) / (1000 * 60 * 60 * 24)

        if (diffDays < 0) return '#ff0000' // Rouge
        if (diffDays <= 3) return '#ffa500' // Orange
        return '#00ff00' // Vert
    }

    createPopupContent(eventData) {
        const now = new Date();
        const startDate = new Date(eventData.start);
        const endDate = new Date(eventData.end);
        const diffTimeStart = startDate - now;
        const diffTimeEnd = endDate - now;
        const diffDaysStart = Math.floor(diffTimeStart / (1000 * 60 * 60 * 24));
        const diffHoursStart = Math.floor((diffTimeStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        let notificationText = '';
        let notificationClass = '';
        if (diffDaysStart < 0 && diffTimeEnd > 0) {
            notificationText = "Événement en cours ! Vous avez encore le temps d'y aller !";
            notificationClass = "alert-info";
        } else if (diffDaysStart < 0) {
            notificationText = "Quel dommage ! Vous avez raté cet événement !";
            notificationClass = "alert-danger";
        } else if (diffDaysStart <= 3) {
            notificationText = `Attention, commence dans ${diffDaysStart} jours et ${diffHoursStart} heures`;
            notificationClass = "alert-warning";
        }

        const formattedStartDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(startDate);
        const formattedEndDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(endDate);

        return `
            <div class="popup-content">
                <button type="button" class="mapboxgl-popup-close-button" aria-label="Close">&times;</button>
                <h3>${eventData.title}</h3>
                <div class="description">${eventData.description}</div>
                <p><strong>Type:</strong> <span class="badge badge-info">${eventData.type}</span></p>
                <div class="date-time">
                    <p><strong>Début:</strong> ${formattedStartDate}</p>
                    <p><strong>Fin:</strong> ${formattedEndDate}</p>
                </div>
                ${notificationText ? `<div class="alert ${notificationClass}">${notificationText}</div>` : ''}
                <div>
                    <button class="btn btn-edit" onclick="app.editEvent('${eventData.id}')">Modifier</button>
                    <button class="btn btn-delete" onclick="app.deleteEvent('${eventData.id}')">Supprimer</button>
                </div>
            </div>
        `;
    }
}

export default Markers
