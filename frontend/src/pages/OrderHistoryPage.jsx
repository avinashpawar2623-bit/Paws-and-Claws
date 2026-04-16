import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchOrders } from '../services/orderService'

function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
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
    }
    loadOrders()
  }, [])

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
