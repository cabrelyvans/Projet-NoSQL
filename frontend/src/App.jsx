import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import OfferDetailPage from './pages/OfferDetailPage.jsx'
import RecoPage from './pages/RecoPage.jsx'
import './App.css'

function RequireAuth() {
  return localStorage.getItem('token')
    ? <><Navbar /><main className="container"><Outlet /></main></>
    : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/offers/:id" element={<OfferDetailPage />} />
          <Route path="/reco" element={<RecoPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
