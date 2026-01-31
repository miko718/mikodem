import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from '../components/MapView'
import MeetingList from '../components/MeetingList'

const API = '/api'

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [locations, setLocations] = useState({})
  const [businessLocation, setBusinessLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [businessSet, setBusinessSet] = useState(false)

  const loadUser = useCallback(async () => {
    const res = await fetch(`${API}/auth/me`, { credentials: 'include' })
    if (!res.ok) {
      navigate('/login')
      return null
    }
    const u = await res.json()
    setUser(u)
    return u
  }, [navigate])

  const loadBusinessLocation = useCallback(async () => {
    const res = await fetch(`${API}/locations/business`)
    if (res.ok) {
      const data = await res.json()
      if (data?.lat) {
        setBusinessLocation(data)
        setBusinessSet(true)
        return data
      }
    }
    return null
  }, [])

  const loadEvents = useCallback(async () => {
    const res = await fetch(`${API}/calendar/events`, { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    setEvents(data)
    if (data?.length && data.some(e => e.inLocationWindow)) {
      const ids = data.map(e => e.id).join(',')
      const locRes = await fetch(`${API}/locations/for-events?ids=${ids}`)
      if (locRes.ok) {
        const locs = await locRes.json()
        setLocations(locs)
      }
    }
  }, [])

  useEffect(() => {
    (async () => {
      const u = await loadUser()
      if (!u) return
      await Promise.all([loadBusinessLocation(), loadEvents()])
      setLoading(false)
    })()
  }, [loadUser, loadBusinessLocation, loadEvents])

  const setMyLocation = () => {
    if (!navigator.geolocation) {
      alert('הדפדפן לא תומך במיקום')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await fetch(`${API}/locations/business`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        })
        if (res.ok) {
          const data = await res.json()
          setBusinessLocation(data)
          setBusinessSet(true)
        }
      },
      () => alert('לא הצלחנו לקבל את המיקום')
    )
  }

  const logout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' })
    navigate('/login')
  }

  const eventsWithDistances = events.map(e => {
    const loc = locations[e.id]
    let distanceKm = null
    if (businessLocation && loc) {
      distanceKm = calcDistance(
        businessLocation.lat, businessLocation.lng,
        loc.lat, loc.lng
      ).toFixed(1)
    }
    const shareUrl = `${window.location.origin}/share/${e.id}`
    return { ...e, location: loc, distanceKm, shareUrl }
  }).sort((a, b) => new Date(a.start) - new Date(b.start))

  if (loading) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>mikodem</h1>
        </header>
        <div className="loading">טוען...</div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>mikodem</h1>
        <div className="header-actions">
          {!businessSet && (
            <button className="btn-set-location" onClick={setMyLocation}>
              הגדר מיקום העסק שלי
            </button>
          )}
          {businessSet && (
            <span className="business-set">מיקום העסק מוגדר</span>
          )}
          <button className="btn-logout" onClick={logout}>יציאה</button>
        </div>
      </header>
      <main className="dashboard-main">
        <MeetingList
          events={eventsWithDistances}
          onSetBusinessLocation={setMyLocation}
          businessSet={businessSet}
        />
        <MapView
          events={eventsWithDistances}
          businessLocation={businessLocation}
          onSetBusinessLocation={setMyLocation}
        />
      </main>
    </div>
  )
}
