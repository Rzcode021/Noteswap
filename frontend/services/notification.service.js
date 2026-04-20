import api from './api'

export const getNotifications  = ()   => api.get('/api/notifications')
export const markAsRead        = (id) => api.put(`/api/notifications/${id}/read`)
export const markAllAsRead     = ()   => api.put('/api/notifications/read-all')
export const deleteNotification = (id) => api.delete(`/api/notifications/${id}`)
export const clearAllNotifications = () => api.delete('/api/notifications/clear-all')