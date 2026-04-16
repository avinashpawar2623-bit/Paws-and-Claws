import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBlogPosts } from '../services/blogService'
import { usePageMeta } from '../hooks/usePageMeta'

function BlogPage() {
  usePageMeta({
    title: 'Blog',
    description:
      'Read pet care guides, nutrition advice, training tips, and marketplace updates from Paws and Claws.',
  })
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchBlogPosts()
        setPosts(data.posts || [])
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message || 'Failed to load blog posts.'
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="page">
      <h1>Pet Care Blog</h1>
      {loading ? <p>Loading blog posts...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error && posts.length === 0 ? <p>No blog posts yet.</p> : null}

      <div className="product-grid">
        {posts.map((post) => (
          <article key={post.slug} className="product-card">
            <h3>{post.title}</h3>
            <p>{post.excerpt || 'Read the latest guidance from Paws and Claws.'}</p>
            <p>Category: {post.category}</p>
            <Link to={`/blog/${post.slug}`}>Read article</Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default BlogPage
