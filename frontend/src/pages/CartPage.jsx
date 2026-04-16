import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

function CartPage() {
  const { isAuthenticated } = useAuth()
  const { cart, loading, updateItem, removeItem, clearCart } = useCart()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <section className="page">
        <h1>Cart</h1>
        <p>Please <Link to="/login">login</Link> to manage your cart.</p>
      </section>
    )
  }

  const hasItems = cart.items && cart.items.length > 0

  return (
    <section className="page">
      <h1>Cart</h1>
      {loading ? <p>Loading cart...</p> : null}

      {!loading && !hasItems ? <p>Your cart is empty.</p> : null}

      {hasItems ? (
        <>
          <div className="cart-list">
            {cart.items.map((item) => (
              <article key={item._id} className="cart-item">
                <h3>{item.productId?.name || 'Product'}</h3>
                <p>${Number(item.price).toFixed(2)}</p>
                <label htmlFor={`qty-${item._id}`}>Quantity</label>
                <input
                  id={`qty-${item._id}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(item._id, Number(event.target.value))
                  }
                />
                <button type="button" onClick={() => removeItem(item._id)}>
                  Remove
                </button>
              </article>
            ))}
          </div>

          <p className="cart-total">
            Total: <strong>${Number(cart.totalPrice || 0).toFixed(2)}</strong>
          </p>

          <div className="cart-actions">
            <button type="button" onClick={clearCart}>
              Clear Cart
            </button>
            <button type="button" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}

export default CartPage
