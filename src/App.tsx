import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { RestaurantAnalyticsPage } from './pages/RestaurantAnalyticsPage'
import { RestaurantBookingsPage } from './pages/RestaurantBookingsPage'
import { RestaurantFormPage } from './pages/RestaurantFormPage'
import { RestaurantHallsPage } from './pages/RestaurantHallsPage'
import { RestaurantMenuPage } from './pages/RestaurantMenuPage'
import { RestaurantPhotosPage } from './pages/RestaurantPhotosPage'
import { RestaurantReviewsPage } from './pages/RestaurantReviewsPage'
import { RestaurantsListPage } from './pages/RestaurantsListPage'
import { RestaurantTeamPage } from './pages/RestaurantTeamPage'
import { RestaurantWorkingHoursPage } from './pages/RestaurantWorkingHoursPage'
import { SuperAdminCompaniesPage } from './pages/SuperAdminCompaniesPage'
import { SuperAdminRestaurantsPage } from './pages/SuperAdminRestaurantsPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/restaurants" element={<RestaurantsListPage />} />
            <Route path="/restaurants/new" element={<RestaurantFormPage />} />
            <Route path="/restaurants/:id/edit" element={<RestaurantFormPage />} />
            <Route path="/restaurants/:id/bookings" element={<RestaurantBookingsPage />} />
            <Route path="/restaurants/:id/halls" element={<RestaurantHallsPage />} />
            <Route path="/restaurants/:id/menu" element={<RestaurantMenuPage />} />
            <Route path="/restaurants/:id/hours" element={<RestaurantWorkingHoursPage />} />
            <Route path="/restaurants/:id/analytics" element={<RestaurantAnalyticsPage />} />
            <Route path="/restaurants/:id/reviews" element={<RestaurantReviewsPage />} />
            <Route path="/restaurants/:id/photos" element={<RestaurantPhotosPage />} />
            <Route path="/restaurants/:id/team" element={<RestaurantTeamPage />} />
            <Route path="/admin/companies" element={<SuperAdminCompaniesPage />} />
            <Route path="/admin/restaurants" element={<SuperAdminRestaurantsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/restaurants" replace />} />
      </Routes>
    </AuthProvider>
  )
}
