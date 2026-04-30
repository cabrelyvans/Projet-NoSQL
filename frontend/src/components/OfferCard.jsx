import { useNavigate } from 'react-router-dom'

export default function OfferCard({ offer }) {
  const navigate = useNavigate()
  const id = offer.id ?? offer._id

  return (
    <div className="offer-card" onClick={() => navigate(`/offers/${id}`)}>
      <div className="offer-route">{offer.from} &rarr; {offer.to}</div>
      <div className="offer-provider">{offer.provider}</div>
      <div className="offer-price">{offer.price} {offer.currency}</div>
      {offer.departDate && (
        <div className="offer-extra">
          {new Date(offer.departDate).toLocaleDateString('fr-FR')}
        </div>
      )}
      {offer.hotel && <div className="offer-extra">Hotel : {offer.hotel.name}</div>}
      {offer.activity && <div className="offer-extra">Activite : {offer.activity.title}</div>}
    </div>
  )
}
