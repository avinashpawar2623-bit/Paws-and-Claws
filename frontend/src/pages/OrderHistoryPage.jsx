import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchOrders } from '../services/orderService'
import { useAuth } from '../hooks/useAuth'
import { io } from 'socket.io-client'

function OrderHistoryPage() {
  const { isAuthenticated, accessToken } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchOrders()
      setOrders(response.orders || [])
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Failed to load orders.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshOrders()
  }, [refreshOrders])

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const socketBase = apiBase.replace(/\/api\/?$/, '')

    const socket = io(socketBase, {
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    const onOrderEvent = async () => {
      await refreshOrders()
    }

    socket.on('order.created', onOrderEvent)
    socket.on('order.updated', onOrderEvent)

    return () => {
      socket.off('order.created', onOrderEvent)
      socket.off('order.updated', onOrderEvent)
      socket.disconnect()
    }
  }, [isAuthenticated, accessToken, refreshOrders])

  return (
    <section className="page">
      <h1>Order History</h1>
      {loading ? <p>Loading orders...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error && orders.length === 0 ? <p>No orders yet.</p> : null}

      <div className="order-list">
        {orders.map((order) => (
          <article key={order._id} className="product-card">
            <p>Order ID: {order._id}</p>
            <p>Status: {order.status}</p>
            <p>Payment: {order.paymentStatus}</p>
            <p>Total: ${Number(order.totalPrice || 0).toFixed(2)}</p>
            <Link to={`/orders/${order._id}`}>View details</Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default OrderHistoryPage
