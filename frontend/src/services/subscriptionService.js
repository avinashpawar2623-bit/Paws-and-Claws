import api from './api'

export const fetchSubscriptions = async () => {
  const { data } = await api.get('/subscriptions')
  return data
}

export const createSubscription = async (plan) => {
  const { data } = await api.post('/subscriptions', { plan })
  return data
}

export const cancelSubscription = async (id) => {
  const { data } = await api.put(`/subscriptions/${id}/cancel`)
  return data
}

