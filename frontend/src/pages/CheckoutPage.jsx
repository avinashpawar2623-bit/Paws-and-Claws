import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { createOrder } from '../services/orderService'
import { createPayment } from '../services/paymentService'

function CheckoutPage() {
  const { isAuthenticated } = useAuth()
  const { cart, refreshCart } = useCart()
  const [shippingAddress, setShippingAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handlePlaceOrder = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await createOrder({
        shippingAddress,
        paymentStatus: 'pending',
        paymentMethod,
      })

      if (paymentMethod !== 'cod') {
        await createPayment({
          orderId: response.order._id,
          provider: paymentMethod,
        })
      }

      await refreshCart()
      navigate(`/orders/${response.order._id}`)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to place order.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page">
      <h1>Checkout</h1>
      <p>
        Order total: <strong>${Number(cart.totalPrice || 0).toFixed(2)}</strong>
      </p>
      <form className="auth-form" onSubmit={handlePlaceOrder}>
        <label htmlFor="shipping-address">Shipping Address</label>
        <input
          id="shipping-address"
          value={shippingAddress}
          onChange={(event) => setShippingAddress(event.target.value)}
          required
        />
        <label htmlFor="payment-method">Payment Method</label>
        <select
          id="payment-method"
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
        >
          <option value="cod">Cash on Delivery</option>
          <option value="wallet">Wallet</option>
          <option value="stripe">Card (Stripe - demo)</option>
          <option value="razorpay">UPI/Card (Razorpay - demo)</option>
        </select>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={loading || !cart.items?.length}>
          {loading ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </section>
  )
}

export default CheckoutPage
