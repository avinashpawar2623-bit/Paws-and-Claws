import api from './api'

export const getCart = async () => {
  const { data } = await api.get('/cart')
  return data
}

export const addCartItem = async (payload) => {
  const { data } = await api.post('/cart/add', payload)
  return data
}

export const updateCartItem = async (itemId, payload) => {
  const { data } = await api.put(`/cart/update/${itemId}`, payload)
  return data
}

export const removeCartItem = async (itemId) => {
  const { data } = await api.delete(`/cart/${itemId}`)
  return data
}

export const clearCart = async () => {
  const { data } = await api.delete('/cart')
  return data
}
