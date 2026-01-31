export default function MeetingList({ events, businessSet, onSetBusinessLocation }) {
  const inWindow = events.filter(e => e.inLocationWindow)
  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  }

  const copyLink = (url, summary) => {
    navigator.clipboard.writeText(url)
    alert(`הקישור לשיתוף מיקום copied ללוח!\n\nשלח ללקוח:\n${url}`)
  }

  return (
    <aside className="meeting-list">
      <h2>פגישות קרובות</h2>
      <p className="hint">30 דקות לפני כל פגישה תוכל לראות את מיקום הלקוח</p>
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
            {event.location ? (
              <div className="meeting-location">
                מיקום: מעודכן
                {event.distanceKm != null && (
                  <strong> • {event.distanceKm} ק״מ</strong>
                )}
              </div>
            ) : event.inLocationWindow ? (
              <div className="meeting-no-location">
                הלקוח עדיין לא שיתף מיקום
                <button
                  className="btn-share-link"
                  onClick={() => copyLink(event.shareUrl, event.summary)}
                >
                  העתק קישור לשליחה
                </button>
              </div>
            ) : null}
            {event.inLocationWindow && !event.location && (
              <button
                className="btn-copy-link"
                onClick={() => copyLink(event.shareUrl, event.summary)}
              >
                העתק קישור ל-SMS/WhatsApp
              </button>
            )}
          </li>
        ))}
      </ul>
      {events.length === 0 && <p className="empty">אין פגישות בטווח הזמן</p>}
    </aside>
  )
}
