import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { RestaurantBookingsPage } from './pages/RestaurantBookingsPage'
import { RestaurantFormPage } from './pages/RestaurantFormPage'
import { RestaurantHallsPage } from './pages/RestaurantHallsPage'
import { RestaurantMenuPage } from './pages/RestaurantMenuPage'
import { RestaurantsListPage } from './pages/RestaurantsListPage'

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
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/restaurants" replace />} />
      </Routes>
    </AuthProvider>
  )
}
