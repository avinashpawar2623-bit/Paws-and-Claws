import api from './api'

const randomIdempotencyKey = () => {
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID()
  return `key_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export const createPayment = async ({ orderId, provider, currency = 'usd' }) => {
  const idempotencyKey = randomIdempotencyKey()
  const { data } = await api.post(
    '/payments',
    { orderId, provider, currency },
    {
      headers: {
        'x-idempotency-key': idempotencyKey,
      },
    }
  )
  return data
}

export const fetchPayments = async () => {
  const { data } = await api.get('/payments')
  return data
}

export const fetchPaymentByOrderId = async (orderId) => {
  const { data } = await api.get(`/payments/order/${orderId}`)
  return data
}

export const fetchReceipt = async (providerPaymentId) => {
  const { data } = await api.get(`/payments/receipt/${providerPaymentId}`)
  return data
}

export const requestRefund = async ({ paymentId, reason }) => {
  const { data } = await api.post('/payments/refund', { paymentId, reason })
  return data
}
