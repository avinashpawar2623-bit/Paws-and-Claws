import api from './api'

export const fetchAdminDashboard = async () => {
  const { data } = await api.get('/dashboard/admin')
  return data
}

export const fetchVendorDashboard = async () => {
  const { data } = await api.get('/dashboard/vendor')
  return data
}

export const fetchUsers = async () => {
  const { data } = await api.get('/users')
  return data
}

export const updateUserStatus = async (id, payload) => {
  const { data } = await api.put(`/users/${id}/status`, payload)
  return data
}

export const fetchAuditLogs = async () => {
  const { data } = await api.get('/users/audit-logs')
  return data
}
