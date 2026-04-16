import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchBlogPostBySlug } from '../services/blogService'
import { usePageMeta } from '../hooks/usePageMeta'

function BlogDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  usePageMeta({
    title: post?.seoTitle || post?.title || 'Blog Article',
    description:
      post?.seoDescription ||
      post?.excerpt ||
      'Read helpful pet care content from Paws and Claws.',
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchBlogPostBySlug(slug)
        setPost(data.post)
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message || 'Failed to load blog post.'
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) return <section className="page">Loading article...</section>
  if (error) return <section className="page form-error">{error}</section>
  if (!post) return <section className="page">Article not found.</section>

  return (
    <section className="page">
      <Link to="/blog">← Back to blog</Link>
      <h1>{post.title}</h1>
      <p>{post.excerpt}</p>
      <p>Category: {post.category}</p>
      <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
      <article style={{ whiteSpace: 'pre-wrap' }}>{post.content}</article>
    </section>
  )
}

export default BlogDetailPage
