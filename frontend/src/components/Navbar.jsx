import { NavLink, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand">STH Travel Hub</span>
      <div className="navbar-links">
        <NavLink to="/search">Offres</NavLink>
        <NavLink to="/reco">Recommandations</NavLink>
      </div>
      <div className="navbar-user">
        <span>{userId}</span>
        <button onClick={logout}>Deconnexion</button>
      </div>
    </nav>
  )
}
