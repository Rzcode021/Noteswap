import api from './api'

export const getStats        = ()           => api.get('/admin/stats')
export const getPending      = (params)     => api.get('/admin/pending', { params })
export const getAllNotes      = (params)     => api.get('/admin/notes', { params })
export const getAllUsers      = (params)     => api.get('/admin/users', { params })
export const approveNote     = (id)         => api.put(`/admin/${id}/approve`)
export const rejectNote      = (id, reason) => api.put(`/admin/${id}/reject`, { reason })
export const deleteUser      = (id)         => api.delete(`/admin/users/${id}`)
export const disableUser     = (id)         => api.put(`/admin/users/${id}/disable`)
export const enableUser      = (id)         => api.put(`/admin/users/${id}/enable`)