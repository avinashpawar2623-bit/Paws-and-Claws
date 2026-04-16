import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { fetchNotifications } from '../services/notificationService'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount } = useCart()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadNotifications = async () => {
      if (!isAuthenticated) {
        setUnreadCount(0)
        return
      }
      try {
        const data = await fetchNotifications()
        setUnreadCount(data.unreadCount || 0)
      } catch (_error) {
        setUnreadCount(0)
      }
    }

    loadNotifications()
  }, [isAuthenticated])

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        Paws and Claws
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/cart">Cart ({itemCount})</NavLink>
        {isAuthenticated ? (
          <>
            {(user?.role === 'admin' || user?.role === 'vendor') && (
              <>
                <NavLink to="/vendor/products/new">Add Product</NavLink>
                <NavLink to="/vendor/dashboard">Vendor Dashboard</NavLink>
              </>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>
            )}
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/notifications">Notifications ({unreadCount})</NavLink>
            <NavLink to="/wallet">Wallet</NavLink>
            <NavLink to="/subscriptions">Subscriptions</NavLink>
            <NavLink to="/profile">{user?.name || 'Profile'}</NavLink>
            <button type="button" className="logout-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </nav>
    </header>
  )
}

export default Navbar
