import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchOrderById } from '../services/orderService'
import { fetchPaymentByOrderId } from '../services/paymentService'
import { useAuth } from '../hooks/useAuth'
import { io } from 'socket.io-client'

function OrderDetailPage() {
  const { id } = useParams()
  const { isAuthenticated, accessToken } = useAuth()
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshOrder = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchOrderById(id)
      setOrder(response.order)

      try {
        const paymentResponse = await fetchPaymentByOrderId(id)
        setPayment(paymentResponse.payment || null)
        setInvoice(paymentResponse.invoice || null)
      } catch {
        setPayment(null)
        setInvoice(null)
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Failed to load order.'
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    refreshOrder()
  }, [refreshOrder])

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const socketBase = apiBase.replace(/\/api\/?$/, '')

    const socket = io(socketBase, {
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    const onOrderEvent = async (payload) => {
      if (payload?.orderId?.toString() !== id.toString()) return
      await refreshOrder()
    }

    socket.on('order.created', onOrderEvent)
    socket.on('order.updated', onOrderEvent)

    return () => {
      socket.off('order.created', onOrderEvent)
      socket.off('order.updated', onOrderEvent)
      socket.disconnect()
    }
  }, [isAuthenticated, accessToken, id, refreshOrder])

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
      <p>Payment Method: {order.paymentMethod || '-'}</p>
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

      <h3>Payment Details</h3>
      {invoice ? (
        <div className="wallet-card">
          <p>Invoice: {invoice.invoiceNumber}</p>
          <p>Invoice Status: {invoice.status}</p>
          <p>
            Amount: ${Number(invoice.amount || 0).toFixed(2)} {invoice.currency || 'usd'}
          </p>
        </div>
      ) : payment ? (
        <div className="wallet-card">
          <p>Payment Provider: {payment.provider}</p>
          <p>Payment Status: {payment.status}</p>
        </div>
      ) : (
        <p>No payment record yet.</p>
      )}
    </section>
  )
}

export default OrderDetailPage
