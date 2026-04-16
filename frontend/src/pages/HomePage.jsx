import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTrendingProducts } from '../services/productService'

function HomePage() {
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTrending = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchTrendingProducts(6)
        setTrending(data.trending || [])
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            'Unable to load trending products.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadTrending()
  }, [])

  return (
    <section className="page">
      <h1>Welcome to Paws and Claws</h1>
      <p>
        Your pet supplies storefront is now running on React and ready for MERN
        feature integration.
      </p>

      <h2>Trending now</h2>
      {loading ? <p>Loading trending products...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error && trending.length === 0 ? (
        <p>No trending data yet.</p>
      ) : null}

      {!loading && !error ? (
        <div className="product-grid">
          {trending.map((entry) => {
            const product = entry.product?.[0] || entry.product
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
                <p>Units sold: {entry.unitsSold || 0}</p>
                <Link to={`/products/${product._id}`}>View details</Link>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

export default HomePage
