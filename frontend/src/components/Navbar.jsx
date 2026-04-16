import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { fetchNotifications } from '../services/notificationService'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount } = useCart()
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      if (!isAuthenticated) {
        setUnreadCount(0)
        return
      }
      try {
        const data = await fetchNotifications()
        setUnreadCount(data.unreadCount || 0)
      } catch {
        setUnreadCount(0)
      }
    }

    loadNotifications()
  }, [isAuthenticated])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        Paws and Claws
      </NavLink>
      <button
        type="button"
        className="menu-toggle"
        aria-label="Toggle navigation"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        Menu
      </button>
      <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" onClick={() => setMenuOpen(false)}>
          Home
        </NavLink>
        <NavLink to="/blog" onClick={() => setMenuOpen(false)}>
          Blog
        </NavLink>
        <NavLink to="/products" onClick={() => setMenuOpen(false)}>
          Products
        </NavLink>
        <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
          Cart ({itemCount})
        </NavLink>
        {isAuthenticated ? (
          <>
            {(user?.role === 'admin' || user?.role === 'vendor') && (
              <>
                <NavLink to="/vendor/products/new" onClick={() => setMenuOpen(false)}>
                  Add Product
                </NavLink>
                <NavLink to="/vendor/dashboard" onClick={() => setMenuOpen(false)}>
                  Vendor Dashboard
                </NavLink>
              </>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin/dashboard" onClick={() => setMenuOpen(false)}>
                Admin Dashboard
              </NavLink>
            )}
            <NavLink to="/orders" onClick={() => setMenuOpen(false)}>
              Orders
            </NavLink>
            <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>
              Wishlist
            </NavLink>
            <NavLink to="/notifications" onClick={() => setMenuOpen(false)}>
              Notifications ({unreadCount})
            </NavLink>
            <NavLink to="/wallet" onClick={() => setMenuOpen(false)}>
              Wallet
            </NavLink>
            <NavLink to="/subscriptions" onClick={() => setMenuOpen(false)}>
              Subscriptions
            </NavLink>
            <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
              {user?.name || 'Profile'}
            </NavLink>
            <button
              type="button"
              className="logout-button"
              onClick={() => {
                setMenuOpen(false)
                logout()
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" onClick={() => setMenuOpen(false)}>
            Login
          </NavLink>
        )}
      </nav>
    </header>
  )
}

export default Navbar
