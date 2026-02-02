import { useState } from 'react'
import { useToast } from '../context/ToastContext'

function formatTimeAgo(date) {
  if (!date) return ''
  const sec = Math.floor((new Date() - date) / 1000)
  if (sec < 10) return 'עכשיו'
  if (sec < 60) return `לפני ${sec} שניות`
  const min = Math.floor(sec / 60)
  if (min === 1) return 'לפני דקה'
  return `לפני ${min} דקות`
}

export default function MeetingList({ events, businessSet, onSetBusinessLocation, onRefresh, lastRefresh }) {
  const { toast } = useToast()
  const [lateModalEvent, setLateModalEvent] = useState(null)

  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  }

  const copyLink = (url) => {
    navigator.clipboard.writeText(url)
    toast('הועתק! שלח את הקישור ללקוח', 'success')
  }

  const shareViaWhatsApp = (url, summary) => {
    const text = `שלום, בבקשה שתף את המיקום שלך לפני הפגישה "${summary}":\n${url}`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')
  }

  const getLateMessage = (event) => {
    const base = window.location.origin
    const postponeUrl = `${base}/respond/${event.id}/postpone`
    const rescheduleUrl = `${base}/respond/${event.id}/reschedule`
    return `שלום, נראה שיהיה קשה להגיע לפגישה "${event.summary}" בזמן.\n\nמה תעדיף?\n1️⃣ לדחות את התור למועד מאוחר יותר\n2️⃣ לקבוע תור חדש\n\nלבחירת דחייה: ${postponeUrl}\nלבחירת תור חדש: ${rescheduleUrl}\n\nנשמח לתאם איתך.`
  }

  const sendLateMessage = (event) => {
    setLateModalEvent(event)
  }

  const copyLateMessage = () => {
    if (!lateModalEvent) return
    const msg = getLateMessage(lateModalEvent)
    navigator.clipboard.writeText(msg)
    toast('ההודעה הועתקה! שלח ללקוח', 'success')
    setLateModalEvent(null)
  }

  const shareLateViaWhatsApp = () => {
    if (!lateModalEvent) return
    const msg = getLateMessage(lateModalEvent)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
    toast('WhatsApp נפתח עם ההודעה', 'success')
    setLateModalEvent(null)
  }

  return (
    <aside className="meeting-list">
      <div className="meeting-list-header">
        <h2>פגישות קרובות</h2>
        {onRefresh && (
          <button className="btn-refresh" onClick={onRefresh} title="רענן">
            ⟳
          </button>
        )}
      </div>
      <p className="hint">
        30 דקות לפני כל פגישה תוכל לראות את מיקום הלקוח
        {lastRefresh && (
          <span className="last-updated"> • {formatTimeAgo(lastRefresh)}</span>
        )}
      </p>
      {!businessSet && (
        <button className="btn-set-location-inline" onClick={onSetBusinessLocation}>
          הגדר מיקום העסק כדי לחשב מרחקים
        </button>
      )}
      <ul>
        {events.map(event => (
          <li key={event.id} className={event.inLocationWindow ? 'in-window' : ''}>
            <div className="meeting-time">{formatTime(event.start)}</div>
            <div className="meeting-summary">{event.summary}</div>
            {event.lateResponse && (
              <div className="meeting-late-response">
                ✓ הלקוח בחר: {event.lateResponse.choice === 'postpone' ? 'דחיית התור' : 'תור חדש'}
              </div>
            )}
            {event.location ? (
              <div className="meeting-location">
                מיקום: מעודכן
                {event.distanceKm != null && (
                  <strong> • {event.distanceKm} ק״מ</strong>
                )}
              </div>
            ) : event.inLocationWindow ? (
              <div className="meeting-no-location">הלקוח עדיין לא שיתף מיקום</div>
            ) : null}
            {event.inLocationWindow && !event.location && (
              <div className="share-buttons">
                <button
                  className="btn-copy-link"
                  onClick={() => copyLink(event.shareUrl)}
                >
                  העתק קישור
                </button>
                <button
                  className="btn-whatsapp"
                  onClick={() => shareViaWhatsApp(event.shareUrl, event.summary)}
                >
                  שלח ב-WhatsApp
                </button>
              </div>
            )}
            {event.inLocationWindow && (
              <button
                className="btn-late"
                onClick={() => sendLateMessage(event)}
                title="הלקוח לא יגיע בזמן"
              >
                לא יגיע בזמן – שלח הודעה
              </button>
            )}
          </li>
        ))}
      </ul>
      {lateModalEvent && (
        <div className="modal-overlay" onClick={() => setLateModalEvent(null)}>
          <div className="modal-content late-modal" onClick={e => e.stopPropagation()}>
            <h3>פנייה ללקוח – לא יגיע בזמן</h3>
            <p className="modal-hint">שלח את ההודעה הבאה ללקוח (WhatsApp / SMS):</p>
            <div className="modal-message">
              {getLateMessage(lateModalEvent)}
            </div>
            <div className="modal-actions">
              <button className="btn-copy-link" onClick={copyLateMessage}>
                העתק הודעה
              </button>
              <button className="btn-whatsapp" onClick={shareLateViaWhatsApp}>
                שלח ב-WhatsApp
              </button>
              <button className="btn-modal-close" onClick={() => setLateModalEvent(null)}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
      {events.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>אין פגישות קרובות</h3>
          <p>פגישות בטווח של שעתיים יוצגו כאן. 30 דקות לפני כל פגישה תוכל לראות את מיקום הלקוח.</p>
        </div>
      )}
    </aside>
  )
}
