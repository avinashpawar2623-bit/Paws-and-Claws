import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchProductById,
  fetchProductQrCode,
  fetchProductRecommendations,
} from '../services/productService'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { usePageMeta } from '../hooks/usePageMeta'
import { addToWishlist } from '../services/wishlistService'
import {
  createReview,
  deleteReview,
  fetchProductReviews,
} from '../services/reviewService'

function ProductDetailPage() {
  const { isAuthenticated, user } = useAuth()
  const { addItem } = useCart()
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [savingWishlist, setSavingWishlist] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')

  usePageMeta({
    title: product?.name || 'Product',
    description:
      product?.description ||
      'Explore pet product details, pricing, stock, reviews, and recommendations.',
  })
  const handleAddToCart = async () => {
    if (!isAuthenticated) return
    setAdding(true)
    try {
      await addItem(product._id, 1)
    } finally {
      setAdding(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) return
    setSavingWishlist(true)
    try {
      await addToWishlist(product._id)
    } finally {
      setSavingWishlist(false)
    }
  }


  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetchProductById(id)
        setProduct(response.item)
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message || 'Failed to load product.'
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetchProductReviews(id)
        setReviews(response.reviews || [])
      } catch {
        setReviews([])
      }
    }
    loadReviews()
  }, [id])

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await fetchProductRecommendations(id)
        setRecommendations(response.recommendations || [])
      } catch {
        setRecommendations([])
      }
    }

    loadRecommendations()
  }, [id])

  useEffect(() => {
    const loadQrCode = async () => {
      try {
        const response = await fetchProductQrCode(id)
        setQrCodeDataUrl(response.qrCodeDataUrl || '')
      } catch {
        setQrCodeDataUrl('')
      }
    }

    loadQrCode()
  }, [id])

  const handleCreateReview = async (event) => {
    event.preventDefault()
    await createReview(id, {
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment,
    })
    const refreshed = await fetchProductReviews(id)
    setReviews(refreshed.reviews || [])
    setReviewForm({ rating: 5, comment: '' })
  }

  const handleDeleteReview = async (reviewId) => {
    await deleteReview(reviewId)
    const refreshed = await fetchProductReviews(id)
    setReviews(refreshed.reviews || [])
  }

  if (loading) {
    return <section className="page">Loading product...</section>
  }

  if (error) {
    return <section className="page form-error">{error}</section>
  }

  if (!product) {
    return <section className="page">Product not found.</section>
  }

  return (
    <section className="page">
      <Link to="/products">← Back to products</Link>
      <h1>{product.name}</h1>
      {product.cloudinaryUrl ? (
        <img src={product.cloudinaryUrl} alt={product.name} className="product-image" />
      ) : null}
      <p>{product.description || 'No description available.'}</p>
      <p>
        Category: <strong>{product.category}</strong>
      </p>
      <p>
        Price: <strong>${product.price?.toFixed(2)}</strong>
      </p>
      <p>
        Stock: <strong>{product.stock}</strong>
      </p>
      <p>
        Rating: <strong>{Number(product.rating || 0).toFixed(1)}</strong>
      </p>
      {qrCodeDataUrl ? (
        <>
          <h3>Share product</h3>
          <img src={qrCodeDataUrl} alt={`${product.name} QR code`} className="inline-image" />
        </>
      ) : null}
      {isAuthenticated ? (
        <div className="filters-row">
          <button type="button" onClick={handleAddToCart} disabled={adding}>
            {adding ? 'Adding...' : 'Add to cart'}
          </button>
          <button
            type="button"
            onClick={handleAddToWishlist}
            disabled={savingWishlist}
          >
            {savingWishlist ? 'Saving...' : 'Add to wishlist'}
          </button>
        </div>
      ) : (
        <p>
          <Link to="/login">Login</Link> to add this item to cart or wishlist.
        </p>
      )}

      <hr />
      <h3>You may also like</h3>
      {recommendations.length === 0 ? (
        <p>No recommendations available yet.</p>
      ) : (
        <div className="product-grid">
          {recommendations.map((p) => (
            <article key={p._id} className="product-card">
              {p.cloudinaryUrl ? (
                <img
                  src={p.cloudinaryUrl}
                  alt={p.name}
                  className="product-image"
                />
              ) : null}
              <h3>{p.name}</h3>
              <p>${Number(p.price || 0).toFixed(2)}</p>
              <p>Rating: {Number(p.rating || 0).toFixed(1)}</p>
              <Link to={`/products/${p._id}`}>View details</Link>
            </article>
          ))}
        </div>
      )}

      <hr />
      <h3>Reviews</h3>
      {reviews.length === 0 ? <p>No reviews yet.</p> : null}
      <ul>
        {reviews.map((review) => (
          <li key={review._id}>
            <strong>{review.userId?.name || 'User'}</strong> - {review.rating}/5
            <p>{review.comment}</p>
            {(user?.id === review.userId?._id || user?.role === 'admin') && (
              <button type="button" onClick={() => handleDeleteReview(review._id)}>
                Delete review
              </button>
            )}
          </li>
        ))}
      </ul>

      {isAuthenticated ? (
        <form className="auth-form" onSubmit={handleCreateReview}>
          <label htmlFor="review-rating">Rating</label>
          <select
            id="review-rating"
            value={reviewForm.rating}
            onChange={(event) =>
              setReviewForm((prev) => ({ ...prev, rating: event.target.value }))
            }
          >
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
          <label htmlFor="review-comment">Comment</label>
          <input
            id="review-comment"
            value={reviewForm.comment}
            onChange={(event) =>
              setReviewForm((prev) => ({ ...prev, comment: event.target.value }))
            }
          />
          <button type="submit">Submit review</button>
        </form>
      ) : null}
    </section>
  )
}

export default ProductDetailPage
