import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const API = '/api'

export default function ShareLocation() {
  const { eventId } = useParams()
  const [status, setStatus] = useState('loading') // loading | ready | sharing | done | error
  const [error, setError] = useState('')

  useEffect(() => {
    setStatus('ready')
  }, [])

  const shareLocation = () => {
    setStatus('sharing')
    setError('')
    if (!navigator.geolocation) {
      setError('הדפדפן לא תומך במיקום')
      setStatus('error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`${API}/locations/share/${eventId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            })
          })
          if (!res.ok) throw new Error('שגיאה בשמירה')
          setStatus('done')
        } catch (e) {
          setError(e.message || 'שגיאה')
          setStatus('error')
        }
      },
      () => {
        setError('לא הצלחנו לקבל את המיקום שלך')
        setStatus('error')
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <div className="share-page">
      <div className="share-card">
        <h1 className="logo-small">mikodem</h1>
        {status === 'loading' && <p>טוען...</p>}
        {status === 'ready' && (
          <>
            <h2>שיתוף מיקום לפגישה</h2>
            <p>בעל העסק מבקש לדעת את המיקום שלך כדי לאמוד הגעה</p>
            <button className="btn-primary" onClick={shareLocation}>
              שתף את המיקום שלי
            </button>
          </>
        )}
        {status === 'sharing' && <p>מקבלים מיקום...</p>}
        {status === 'done' && (
          <p className="success">המיקום נשלח בהצלחה</p>
        )}
        {status === 'error' && (
          <>
            <p className="error">{error}</p>
            <button className="btn-secondary" onClick={() => setStatus('ready')}>נסה שוב</button>
          </>
        )}
      </div>
    </div>
  )
}
