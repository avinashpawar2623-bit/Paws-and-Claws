import api from './api'

export const fetchAdminDashboard = async () => {
  const { data } = await api.get('/dashboard/admin')
  return data
}

export const fetchVendorDashboard = async () => {
  const { data } = await api.get('/dashboard/vendor')
  return data
}
