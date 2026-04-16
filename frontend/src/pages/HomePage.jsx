import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTrendingProducts } from '../services/productService'
import { fetchBlogPosts } from '../services/blogService'
import { usePageMeta } from '../hooks/usePageMeta'

function HomePage() {
  usePageMeta({
    title: 'Home',
    description:
      'Shop trending pet products, explore trusted vendors, and read the latest pet care articles.',
  })
  const [trending, setTrending] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHome = async () => {
      setLoading(true)
      setError('')
      try {
        const [trendingData, blogData] = await Promise.all([
          fetchTrendingProducts(6),
          fetchBlogPosts({ limit: 3 }),
        ])
        setTrending(trendingData.trending || [])
        setPosts(blogData.posts || [])
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            'Unable to load home page data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadHome()
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

      <h2>From the blog</h2>
      {!loading && !error && posts.length === 0 ? <p>No articles yet.</p> : null}
      {!loading && !error ? (
        <div className="product-grid">
          {posts.map((post) => (
            <article key={post.slug} className="product-card">
              <h3>{post.title}</h3>
              <p>{post.excerpt || 'Read our latest pet-care advice.'}</p>
              <Link to={`/blog/${post.slug}`}>Read article</Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default HomePage
