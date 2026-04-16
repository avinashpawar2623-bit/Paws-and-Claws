import api from './api'

export const fetchMyVendorShop = async () => {
  const { data } = await api.get('/vendor-shops/me')
  return data
}

export const updateMyVendorShop = async (payload) => {
  const { data } = await api.put('/vendor-shops/me', payload)
  return data
}

export const fetchVendorShopBySlug = async (slug) => {
  const { data } = await api.get(`/vendor-shops/${slug}`)
  return data
}
