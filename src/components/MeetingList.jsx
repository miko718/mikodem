export default function MeetingList({ events, businessSet, onSetBusinessLocation, onRefresh }) {
  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  }

  const copyLink = (url, summary) => {
    navigator.clipboard.writeText(url)
    alert(`הקישור הועתק ללוח!\n\nשלח ללקוח:\n${url}`)
  }

  const shareViaWhatsApp = (url, summary) => {
    const text = `שלום, בבקשה שתף את המיקום שלך לפני הפגישה "${summary}":\n${url}`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')
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
              <div className="meeting-no-location">הלקוח עדיין לא שיתף מיקום</div>
            ) : null}
            {event.inLocationWindow && !event.location && (
              <div className="share-buttons">
                <button
                  className="btn-copy-link"
                  onClick={() => copyLink(event.shareUrl, event.summary)}
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
          </li>
        ))}
      </ul>
      {events.length === 0 && <p className="empty">אין פגישות בטווח הזמן</p>}
    </aside>
  )
}
