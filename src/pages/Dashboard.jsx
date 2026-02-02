import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from '../components/MapView'
import MeetingList from '../components/MeetingList'
import { useToast } from '../context/ToastContext'

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
  const { toast } = useToast()
  const [events, setEvents] = useState([])
  const [locations, setLocations] = useState({})
  const [lateResponses, setLateResponses] = useState({})
  const [businessLocation, setBusinessLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [businessSet, setBusinessSet] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  const loadUser = useCallback(async () => {
    const res = await fetch(`${API}/auth/me`, { credentials: 'include' })
    if (!res.ok) {
      navigate('/login')
      return null
    }
    const u = await res.json()
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
    setLastRefresh(new Date())
    if (data?.length) {
      const ids = data.map(e => e.id).join(',')
      const [locRes, lateRes] = await Promise.all([
        fetch(`${API}/locations/for-events?ids=${ids}`),
        fetch(`${API}/locations/late-responses?ids=${ids}`)
      ])
      if (locRes.ok) {
        const locs = await locRes.json()
        setLocations(locs)
      }
      if (lateRes.ok) {
        const late = await lateRes.json()
        setLateResponses(late)
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

  // רענון אוטומטי כל 30 שניות כשנמצאים בחלון המיקום
  useEffect(() => {
    if (!events.some(e => e.inLocationWindow)) return
    const interval = setInterval(loadEvents, 30000)
    return () => clearInterval(interval)
  }, [events, loadEvents])

  // התראות כשמגיע זמן לשלוח קישור
  useEffect(() => {
    const checkForNotifications = () => {
      const now = new Date()
      events.forEach(event => {
        const eventTime = new Date(event.start)
        const timeUntilEvent = eventTime.getTime() - now.getTime()
        const thirtyMinutes = 30 * 60 * 1000
        
        // התראה 30 דקות לפני (בדיוק)
        if (timeUntilEvent > 0 && timeUntilEvent <= thirtyMinutes + 60000 && 
            timeUntilEvent >= thirtyMinutes - 60000 && !event.location) {
          if (Notification.permission === 'granted') {
            new Notification('mikodem - זמן לשלוח קישור', {
              body: `פגישה "${event.summary}" בעוד 30 דקות. שלח קישור ללקוח.`,
              icon: '/vite.svg'
            })
          }
        }
      })
    }

    // בקשת הרשאה להתראות
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const interval = setInterval(checkForNotifications, 60000) // בדיקה כל דקה
    return () => clearInterval(interval)
  }, [events])

  const setMyLocation = () => {
    if (!navigator.geolocation) {
      toast('הדפדפן לא תומך במיקום', 'error')
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
          toast('מיקום העסק נשמר בהצלחה', 'success')
        } else {
          toast('שגיאה בשמירת המיקום', 'error')
        }
      },
      () => toast('לא הצלחנו לקבל את המיקום - בדוק הרשאות', 'error')
    )
  }

  const logout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' })
    navigate('/login')
  }

  const eventsWithDistances = events.map(e => {
    const loc = locations[e.id]
    const lateResp = lateResponses[e.id]
    let distanceKm = null
    if (businessLocation && loc) {
      distanceKm = parseFloat(calcDistance(
        businessLocation.lat, businessLocation.lng,
        loc.lat, loc.lng
      ).toFixed(1))
    }
    const shareUrl = `${window.location.origin}/share/${e.id}`
    return { ...e, location: loc, distanceKm, shareUrl, lateResponse: lateResp }
  }).sort((a, b) => {
    const timeA = new Date(a.start).getTime()
    const timeB = new Date(b.start).getTime()
    if (a.inLocationWindow && b.inLocationWindow && businessLocation) {
      const distA = a.distanceKm ?? Infinity
      const distB = b.distanceKm ?? Infinity
      if (distA !== distB) return distA - distB
    }
    return timeA - timeB
  })

  if (loading) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>mikodem</h1>
        </header>
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>טוען פגישות...</p>
        </div>
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
          onRefresh={loadEvents}
          lastRefresh={lastRefresh}
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
