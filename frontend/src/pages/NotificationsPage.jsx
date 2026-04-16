import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService'

function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchNotifications()
      setNotifications(data.notifications || [])
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Failed to load notifications.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkRead = async (id) => {
    await markNotificationRead(id)
    await loadNotifications()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    await loadNotifications()
  }

  return (
    <section className="page">
      <h1>Notifications</h1>
      <button type="button" onClick={handleMarkAllRead}>
        Mark all as read
      </button>

      {loading ? <p>Loading notifications...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error && notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : null}

      <div className="order-list">
        {notifications.map((notification) => (
          <article key={notification._id} className="product-card">
            <p>
              <strong>{notification.title}</strong>
            </p>
            <p>{notification.message}</p>
            <p>Status: {notification.isRead ? 'Read' : 'Unread'}</p>
            {notification.referenceType === 'Order' && notification.referenceId ? (
              <p>
                <Link to={`/orders/${notification.referenceId}`}>Open order</Link>
              </p>
            ) : null}
            {!notification.isRead ? (
              <button
                type="button"
                onClick={() => handleMarkRead(notification._id)}
              >
                Mark as read
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export default NotificationsPage
