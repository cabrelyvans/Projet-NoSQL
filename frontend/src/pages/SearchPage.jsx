import { useState } from 'react'
import { searchOffers } from '../api/client.js'
import OfferCard from '../components/OfferCard.jsx'

export default function SearchPage() {
  const [form, setForm] = useState({ from: '', to: '', limit: 10, q: '' })
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await searchOffers(
        form.from.toUpperCase(),
        form.to.toUpperCase(),
        form.limit,
        form.q || undefined
      )
      setOffers(response.data.data || response.data || [])
      setSearched(true)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Erreur lors de la recherche.')
    } finally {
      setLoading(false)
    }
  }

  function clearSearch() {
    setForm({ from: '', to: '', limit: 10, q: '' })
    setOffers([])
    setSearched(false)
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Rechercher des offres</h2>
        {searched && (
          <button className="back-btn" onClick={clearSearch} style={{ alignSelf: 'auto', marginTop: 0 }}>
            Effacer
          </button>
        )}
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="form-row">
          <input
            placeholder="De  (ex : PAR)"
            value={form.from}
            onChange={set('from')}
            required
          />
          <input
            placeholder="Vers  (ex : TYO)"
            value={form.to}
            onChange={set('to')}
            required
          />
          <input
            type="number"
            placeholder="Limite"
            value={form.limit}
            min={1}
            max={100}
            onChange={set('limit')}
          />
          <input
            placeholder="Recherche texte  (ex : hotel)"
            value={form.q}
            onChange={set('q')}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {searched && offers.length === 0 && !loading && (
        <p className="empty">Aucune offre trouvee pour ce trajet.</p>
      )}

      <div className="offers-grid">
        {offers.map(offer => (
          <OfferCard key={offer.id ?? offer._id} offer={offer} />
        ))}
      </div>
    </div>
  )
}
