import api from '../api'

export const syncUser = (extraData = {}) => api.post('/api/auth/sync', extraData)
export const getMe = () => api.get('/api/auth/me')
export const logoutUser = () => api.post('/api/auth/logout')