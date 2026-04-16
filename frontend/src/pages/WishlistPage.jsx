import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchWishlist, removeFromWishlist } from '../services/wishlistService'

function WishlistPage() {
  const [items, setItems] = useState([])
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadWishlist = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchWishlist()
      setItems(data.items || [])
      setLoyaltyPoints(data.loyaltyPoints || 0)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Failed to load wishlist.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()
  }, [])

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId)
    await loadWishlist()
  }

  return (
    <section className="page">
      <h1>Wishlist</h1>
      <p>Loyalty Points: {loyaltyPoints}</p>
      <p>Points are earned when successful payments complete.</p>

      {loading ? <p>Loading wishlist...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p>No wishlist items yet.</p>
      ) : null}

      <div className="product-grid">
        {items.map((entry) => {
          const product = entry.productId
          if (!product) return null
          return (
            <article key={product._id} className="product-card">
              {product.cloudinaryUrl ? (
                <img
                  src={product.cloudinaryUrl}
                  alt={product.name}
                  className="product-image"
                />
              ) : null}
              <h3>{product.name}</h3>
              <p>${Number(product.price || 0).toFixed(2)}</p>
              <p>
                Added at: ${Number(entry.priceWhenAdded || 0).toFixed(2)}
              </p>
              <p>
                Price drop: {entry.priceDrop ? 'Yes' : 'No'}
              </p>
              <Link to={`/products/${product._id}`}>View details</Link>
              <button type="button" onClick={() => handleRemove(product._id)}>
                Remove
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default WishlistPage
