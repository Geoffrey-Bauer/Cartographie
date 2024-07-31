// Import config de mapbox
import config from '../../app.config.json'

// Import librairie mapbox
import mapboxgl from 'mapbox-gl'

// Import librairies de bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'

// Import icon bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css'

// Import css mapbox
import 'mapbox-gl/dist/mapbox-gl.css'

// Import notre style
import '../assets/style.css'
import Markers from "./Markers.js";

// Création de la Classe App
class App {
    // ---- Propriétés ----
    elDivMap
    map
    markers
    currentLngLat = null

    // Création de la fonction start
    start() {
        this.loadDom()
        this.initMap()
        this.markers = new Markers(this)
        this.loadFromLocalStorage()
        this.initEventForm()

        // Rendre les méthodes accessibles globalement
        window.app = this
    }

    // Création de la fonction loadDom (Chargement du DOM)
    loadDom() {
        const app = document.getElementById('app')

        this.elDivMap = document.createElement('div')
        this.elDivMap.id = 'map'
        app.appendChild(this.elDivMap)

        const sidebar = document.createElement('div')
        sidebar.id = 'sidebar'
        sidebar.innerHTML = `
            <h2 class="text-center text-primary mb-4">Ajouter un événement</h2>
            <form id="event-form" class="w-100">
                <input type="hidden" id="id" name="id">
                <div class="form-group mb-3">
                    <label for="title" class="form-label">Titre</label>
                    <input type="text" id="title" name="title" class="form-control" placeholder="Titre" required>
                </div>
                <div class="form-group mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea id="description" name="description" class="form-control" placeholder="Description"></textarea>
                </div>
                <div class="form-group mb-3">
                    <label for="start" class="form-label">Début de l'événement</label>
                    <input type="datetime-local" id="start" name="start" class="form-control" required>
                </div>
                <div class="form-group mb-3">
                    <label for="end" class="form-label">Fin de l'événement</label>
                    <input type="datetime-local" id="end" name="end" class="form-control" required>
                </div>
                <div class="form-group mb-3">
                    <label for="lat" class="form-label">Latitude</label>
                    <input type="text" id="lat" name="lat" class="form-control" placeholder="Latitude" readonly>
                </div>
                <div class="form-group mb-3">
                    <label for="lng" class="form-label">Longitude</label>
                    <input type="text" id="lng" name="lng" class="form-control" placeholder="Longitude" readonly>
                </div>
                <div class="form-group mb-3">
                    <label for="event-type" class="form-label">Type d'événement</label>
                    <select id="event-type" name="event-type" class="form-select" required>
                        <option value="">Sélectionnez un type</option>
                        <option value="concert">Concert</option>
                        <option value="festival">Festival</option>
                        <option value="exposition">Exposition</option>
                        <option value="conference">Conférence</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary w-100">Ajouter/Modifier l'événement</button>
            </form>
        `
        app.appendChild(sidebar)
    }

    // Création de la fonction initMap (Initialisation de la Map)
    initMap() {
        mapboxgl.accessToken = config.apis.mapbox_gl.apiKey

        this.map = new mapboxgl.Map({
            container: this.elDivMap,
            style: config.apis.mapbox_gl.map_styles.streets,
            center: [2.79, 42.68],
            zoom: 15,
        })

        const nav = new mapboxgl.NavigationControl()
        this.map.addControl(nav, 'top-left')

        this.map.on('dblclick', this.handleClickMap.bind(this))
    }

    // Création d'une fonction handleClickMap (Clic sur la Map)
    handleClickMap(event) {
        event.preventDefault() // Empêche le zoom par défaut sur double-clic
        this.currentLngLat = event.lngLat
        this.updateFormCoordinates(this.currentLngLat)
    }

    // Mise à jour des coordonnées dans le formulaire
    updateFormCoordinates(lngLat) {
        document.getElementById('lat').value = lngLat.lat.toFixed(6)
        document.getElementById('lng').value = lngLat.lng.toFixed(6)
    }

    // Initialisation du formulaire d'événement
    initEventForm() {
        const form = document.getElementById('event-form')
        form.addEventListener('submit', this.handleFormSubmit.bind(this))
    }

    // Gestionnaire de soumission du formulaire
    handleFormSubmit(event) {
        event.preventDefault()

        if (!this.currentLngLat) {
            alert("Veuillez sélectionner un emplacement sur la carte.")
            return
        }

        const formData = new FormData(event.target)
        const eventData = {
            id: formData.get('id') || Date.now().toString(),
            title: formData.get('title'),
            description: formData.get('description'),
            start: formData.get('start'),
            end: formData.get('end'),
            type: formData.get('event-type'),
            lng: this.currentLngLat.lng,
            lat: this.currentLngLat.lat
        }

        if (formData.get('id')) {
            this.markers.removeMarker(formData.get('id'))
        }

        const marker = this.markers.addMarker(this.currentLngLat, eventData)
        marker.addTo(this.map)
        this.saveToLocalStorage()
        event.target.reset()
        this.currentLngLat = null
    }

    // Enregistrement des événements dans le localStorage
    saveToLocalStorage() {
        const events = this.markers.getMarkers().map(m => m.eventData)
        localStorage.setItem('mapEvents', JSON.stringify(events))
    }

    // Chargement des événements depuis le localStorage
    loadFromLocalStorage() {
        const events = JSON.parse(localStorage.getItem('mapEvents')) || []
        events.forEach(eventData => {
            const marker = this.markers.addMarker([eventData.lng, eventData.lat], eventData)
            marker.addTo(this.map)
        })
    }

    // Remplissage du formulaire avec les données de l'événement
    fillFormWithEventData(eventData) {
        document.getElementById('id').value = eventData.id
        document.getElementById('title').value = eventData.title
        document.getElementById('description').value = eventData.description
        document.getElementById('start').value = eventData.start
        document.getElementById('end').value = eventData.end
        document.getElementById('event-type').value = eventData.type
        document.getElementById('lat').value = eventData.lat.toFixed(6)
        document.getElementById('lng').value = eventData.lng.toFixed(6)
        this.currentLngLat = { lng: eventData.lng, lat: eventData.lat }
    }

    // Édition d'un événement
    editEvent(eventId) {
        const event = this.markers.getMarkers().find(m => m.eventData.id === eventId)
        if (event) {
            this.fillFormWithEventData(event.eventData)
        }
    }

    // Suppression d'un événement
    deleteEvent(eventId) {
        this.markers.removeMarker(eventId)
        this.saveToLocalStorage()
    }
}

const app = new App()
export default app
