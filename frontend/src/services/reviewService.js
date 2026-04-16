import api from './api'

export const fetchProductReviews = async (productId) => {
  const { data } = await api.get(`/products/${productId}/reviews`)
  return data
}

export const createReview = async (productId, payload) => {
  const { data } = await api.post(`/products/${productId}/reviews`, payload)
  return data
}

export const deleteReview = async (reviewId) => {
  const { data } = await api.delete(`/reviews/${reviewId}`)
  return data
}
