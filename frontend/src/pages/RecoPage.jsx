import { useState } from 'react'
import { getReco } from '../api/client.js'

export default function RecoPage() {
  const [city, setCity] = useState('')
  const [k, setK] = useState(3)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await getReco(city.toUpperCase(), k)
      setResults(response.data.data || response.data || [])
      setSearched(true)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Erreur lors de la recherche.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h2>Recommandations</h2>
      <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
        Destinations proches d'une ville via le graphe de relations.
      </p>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="form-row">
          <input
            placeholder="Ville  (ex : PAR)"
            value={city}
            onChange={e => setCity(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Nombre de resultats (k)"
            value={k}
            min={1}
            max={20}
            onChange={e => setK(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Recherche...' : 'Trouver des destinations'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {searched && results.length === 0 && !loading && (
        <p className="empty">Aucune recommandation pour cette ville.</p>
      )}

      {results.length > 0 && (
        <div className="reco-list">
          {results.map((item, i) => (
            <div key={item.city ?? i} className="reco-card">
              <span className="reco-rank">#{i + 1}</span>
              <span className="reco-city">{item.city}</span>
              {item.score !== undefined && (
                <span className="reco-score">Score : {item.score}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
