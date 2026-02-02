import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapView({ events, businessLocation }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstanceRef.current) return
    mapInstanceRef.current = L.map(mapRef.current).setView([32.0853, 34.7818], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(mapInstanceRef.current)
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    const markers = []
    const locs = events.filter(e => e.location).map(e => e.location)
    const allLocs = businessLocation ? [businessLocation, ...locs] : locs
    if (allLocs.length === 0) return
    allLocs.forEach((loc, i) => {
      const isBusiness = i === 0 && businessLocation
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin ${isBusiness ? 'business' : 'client'}"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
      const m = L.marker([loc.lat, loc.lng], { icon }).addTo(map)
      markers.push(m)
    })
    const group = L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.2))
    return () => markers.forEach(m => m.remove())
  }, [events, businessLocation])

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
      <div className="map-legend">
        {businessLocation && <span className="legend-item"><span className="pin business" /> מיקום העסק</span>}
        <span className="legend-item"><span className="pin client" /> לקוח</span>
      </div>
    </div>
  )
}
