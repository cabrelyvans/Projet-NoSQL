import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOffer } from '../api/client.js'

export default function OfferDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setOffer(null)
    setError('')
    getOffer(id)
      .then((response) => setOffer(response.data.data || response.data))
      .catch(err => setError(err.response?.data?.detail ?? 'Offre introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page"><p className="loading-msg">Chargement...</p></div>
  if (error)   return <div className="page"><p className="error">{error}</p><button className="back-btn" onClick={() => navigate(-1)}>Retour</button></div>
  if (!offer)  return null

  const fmt = iso => iso ? new Date(iso).toLocaleDateString('fr-FR') : '—'

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>Retour</button>

      <div className="offer-detail">
        <h2>{offer.from} &rarr; {offer.to}</h2>

        <div className="detail-meta">
          <p><strong>Fournisseur</strong><br />{offer.provider}</p>
          <p><strong>Prix total</strong><br />{offer.price} {offer.currency}</p>
          <p><strong>Depart</strong><br />{fmt(offer.departDate)}</p>
          <p><strong>Retour</strong><br />{fmt(offer.returnDate)}</p>
        </div>

        {offer.legs?.length > 0 && (
          <>
            <h3>Vols</h3>
            <table className="legs-table">
              <thead>
                <tr><th>Num vol</th><th>Depart</th><th>Arrivee</th><th>Duree</th></tr>
              </thead>
              <tbody>
                {offer.legs.map((leg, i) => (
                  <tr key={i}>
                    <td>{leg.flightNum}</td>
                    <td>{leg.dep}</td>
                    <td>{leg.arr}</td>
                    <td>{leg.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {offer.hotel && (
          <>
            <h3>Hotel</h3>
            <div className="extra-block">
              {offer.hotel.name} &mdash; {offer.hotel.nights} nuit(s) &mdash; {offer.hotel.price} {offer.currency}
            </div>
          </>
        )}

        {offer.activity && (
          <>
            <h3>Activite</h3>
            <div className="extra-block">
              {offer.activity.title} &mdash; {offer.activity.price} {offer.currency}
            </div>
          </>
        )}

        {offer.relatedOffers?.length > 0 && (
          <>
            <h3>Offres similaires  (Neo4j)</h3>
            <div className="related-offers">
              {offer.relatedOffers.map(relId => (
                <button
                  key={relId}
                  className="related-btn"
                  onClick={() => navigate(`/offers/${relId}`)}
                >
                  Offre {relId}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
