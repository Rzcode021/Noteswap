import api from './api'

export const syncUser   = (extraData = {}) => api.post('/auth/sync', extraData)
export const getMe      = ()               => api.get('/auth/me')
export const logoutUser = ()               => api.post('/auth/logout')