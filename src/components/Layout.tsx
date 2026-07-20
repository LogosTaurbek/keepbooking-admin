import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function Layout() {
  const { logout, profile } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/restaurants" className="text-lg font-semibold text-gray-900">
              KeepBooking Admin
            </Link>
            {profile?.role === 'ROLE_SUPER_ADMIN' && (
              <>
                <Link to="/admin/companies" className="text-sm text-gray-600 hover:text-gray-900">
                  Companies
                </Link>
                <Link to="/admin/restaurants" className="text-sm text-gray-600 hover:text-gray-900">
                  Restaurant moderation
                </Link>
              </>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
