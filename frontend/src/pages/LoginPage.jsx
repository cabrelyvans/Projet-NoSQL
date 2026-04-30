import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/client.js'

export default function LoginPage() {
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await login(userId)
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', userId)
      navigate('/search')
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>STH</h1>
        <p>SupDeVinci Travel Hub</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User ID  (ex : u42)"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
            autoFocus
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
