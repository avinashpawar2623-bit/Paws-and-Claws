import api from './api'

export const fetchBlogPosts = async (params = {}) => {
  const { data } = await api.get('/blog', { params })
  return data
}

export const fetchBlogPostBySlug = async (slug) => {
  const { data } = await api.get(`/blog/${slug}`)
  return data
}
