import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchOrderById } from '../services/orderService'

function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetchOrderById(id)
        setOrder(response.order)
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message || 'Failed to load order.'
        )
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [id])

  if (loading) return <section className="page">Loading order...</section>
  if (error) return <section className="page form-error">{error}</section>
  if (!order) return <section className="page">Order not found.</section>

  return (
    <section className="page">
      <Link to="/orders">← Back to orders</Link>
      <h1>Order Details</h1>
      <p>Order ID: {order._id}</p>
      <p>Status: {order.status}</p>
      <p>Payment: {order.paymentStatus}</p>
      <p>Shipping: {order.shippingAddress || '-'}</p>
      <p>Total: ${Number(order.totalPrice || 0).toFixed(2)}</p>

      <h3>Items</h3>
      <ul>
        {order.items.map((item, index) => (
          <li key={`${item.productId}-${index}`}>
            {item.name} x {item.quantity} - ${Number(item.price).toFixed(2)}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default OrderDetailPage
