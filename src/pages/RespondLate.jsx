import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Logo from '../components/Logo'

const API = '/api'
const CHOICES = { postpone: 'דחייה', reschedule: 'תור חדש' }

export default function RespondLate() {
  const { eventId, choice } = useParams()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)

  const isValid = choice === 'postpone' || choice === 'reschedule'

  const submitChoice = async () => {
    try {
      await fetch(`${API}/locations/late-response/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice })
      })
    } catch (e) {
      // Continue anyway - show confirmation
    }
    setSubmitted(true)
  }

  if (!isValid) {
    return (
      <div className="share-page">
        <div className="share-card">
          <Logo size={80} />
          <h1 className="logo-small">mikodem</h1>
          <p className="error">קישור לא תקין</p>
          <button className="btn-secondary" onClick={() => window.history.back()}>חזרה</button>
        </div>
      </div>
    )
  }

  const label = CHOICES[choice]
  const message = choice === 'postpone'
    ? 'בחרת לדחות את התור למועד מאוחר יותר. בעל העסק יצור איתך קשר לתאום מועד חלופי.'
    : 'בחרת לקבוע תור חדש. בעל העסק יצור איתך קשר בהקדם.'

  return (
    <div className="share-page">
      <div className="share-card">
        <Logo size={80} />
        <h1 className="logo-small">mikodem</h1>
        {!submitted ? (
          <>
            <h2>מה תעדיף?</h2>
            <p>את/ה בחרת: <strong>{label}</strong></p>
            <p className="desc-respond">{message}</p>
            <button className="btn-primary" onClick={submitChoice}>
              אישור הבחירה
            </button>
          </>
        ) : (
          <>
            <div className="success-icon">✓</div>
            <p className="success">הבחירה נשלחה בהצלחה</p>
            <p className="desc-respond">בעל העסק יצור איתך קשר בהקדם</p>
          </>
        )}
      </div>
    </div>
  )
}
