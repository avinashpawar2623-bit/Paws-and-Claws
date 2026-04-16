import api from './api'

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export const logoutUser = async (refreshToken) => {
  const { data } = await api.post('/auth/logout', { refreshToken })
  return data
}

export const refreshAccessToken = async (refreshToken) => {
  const { data } = await api.post('/auth/refresh-token', { refreshToken })
  return data
}

export const fetchProfile = async () => {
  const { data } = await api.get('/users/profile')
  return data
}
