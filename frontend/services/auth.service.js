import api from './api'

export const syncUser = () => api.post('/auth/sync')
export const getMe    = () => api.get('/auth/me')
export const logoutUser = () => api.post('/auth/logout')