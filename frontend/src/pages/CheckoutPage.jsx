import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { createOrder } from '../services/orderService'

function CheckoutPage() {
  const { isAuthenticated } = useAuth()
  const { cart, refreshCart } = useCart()
  const [shippingAddress, setShippingAddress] = useState('')
  const [loading, setLoading] = useState(false)
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
      })
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
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={loading || !cart.items?.length}>
          {loading ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </section>
  )
}

export default CheckoutPage
