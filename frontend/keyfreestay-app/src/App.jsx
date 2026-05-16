import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import PasswordResetPage from './pages/auth/PasswordResetPage'
import PasswordResetSentPage from './pages/auth/PasswordResetSentPage'
import PasswordNewPage from './pages/auth/PasswordNewPage'
import PassportUploadPage from './pages/auth/PassportUploadPage'

import HomePage from './pages/user/HomePage'
import PropertyPage from './pages/user/PropertyPage'
import BookingPage from './pages/user/BookingPage'
import PaymentPage from './pages/user/PaymentPage'
import BookingSuccessPage from './pages/user/BookingSuccessPage'
import MyBookingsPage from './pages/user/MyBookingsPage'
import FavoritesPage from './pages/user/FavoritesPage'
import ProfilePage from './pages/user/ProfilePage'
import ProfileEditPage from './pages/user/ProfileEditPage'
import PaymentMethodsPage from './pages/user/PaymentMethodsPage'
import NotificationsPage from './pages/user/NotificationsPage'
import SupportPage from './pages/user/SupportPage'

import PropertiesPage from './pages/owner/PropertiesPage'
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage'
import OwnerBookingDetailPage from './pages/owner/OwnerBookingDetailPage'
import FinancePage from './pages/owner/FinancePage'
import OwnerProfilePage from './pages/owner/OwnerProfilePage'
import NewPropertyPage from './pages/owner/NewPropertyPage'
import OwnerEditPage from './pages/owner/OwnerEditPage'
import OwnerStatsPage from './pages/owner/OwnerStatsPage'

function RoleRedirect() {
  const { user, viewRole, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={viewRole === 'owner' ? '/owner' : '/app'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route path="/password-reset/sent" element={<PasswordResetSentPage />} />
      <Route path="/password-reset/new" element={<PasswordNewPage />} />
      <Route path="/passport" element={<ProtectedRoute><PassportUploadPage /></ProtectedRoute>} />

      <Route path="/app" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/app/p/:id" element={<ProtectedRoute><PropertyPage /></ProtectedRoute>} />
      <Route path="/app/p/:id/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
      <Route path="/app/p/:id/pay" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
      <Route path="/app/booking/:id/success" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
      <Route path="/app/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/app/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
      <Route path="/app/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/app/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
      <Route path="/app/profile/payments" element={<ProtectedRoute><PaymentMethodsPage /></ProtectedRoute>} />
      <Route path="/app/profile/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/app/profile/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

      <Route path="/owner" element={<ProtectedRoute><PropertiesPage /></ProtectedRoute>} />
      <Route path="/owner/p/new" element={<ProtectedRoute><NewPropertyPage /></ProtectedRoute>} />
      <Route path="/owner/p/:id" element={<ProtectedRoute><OwnerEditPage /></ProtectedRoute>} />
      <Route path="/owner/p/:id/stats" element={<ProtectedRoute><OwnerStatsPage /></ProtectedRoute>} />
      <Route path="/owner/bookings" element={<ProtectedRoute><OwnerBookingsPage /></ProtectedRoute>} />
      <Route path="/owner/bookings/:id" element={<ProtectedRoute><OwnerBookingDetailPage /></ProtectedRoute>} />
      <Route path="/owner/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
      <Route path="/owner/profile" element={<ProtectedRoute><OwnerProfilePage /></ProtectedRoute>} />

      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  )
}
