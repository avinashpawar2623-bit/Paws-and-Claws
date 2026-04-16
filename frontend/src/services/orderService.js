import api from './api'

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload)
  return data
}

export const fetchOrders = async (params = {}) => {
  const { data } = await api.get('/orders', { params })
  return data
}

export const fetchOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`)
  return data
}

export const updateOrderStatus = async (id, payload) => {
  const { data } = await api.put(`/orders/${id}/status`, payload)
  return data
}
