import api from './api'

export const fetchWallet = async () => {
  const { data } = await api.get('/payments/wallet')
  return data
}

export const topUpWallet = async (amount) => {
  const { data } = await api.post('/payments/wallet/topup', { amount })
  return data
}
