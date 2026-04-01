import api from './api'

export const getStats        = ()           => api.get('/api/admin/stats')
export const getPending      = (params)     => api.get('/api/admin/pending', { params })
export const getAllNotes      = (params)     => api.get('/api/admin/notes', { params })
export const getAllUsers      = (params)     => api.get('/api/admin/users', { params })
export const approveNote     = (id)         => api.put(`/api/admin/${id}/approve`)
export const rejectNote      = (id, reason) => api.put(`/api/admin/${id}/reject`, { reason })
export const deleteUser      = (id)         => api.delete(`/api/admin/users/${id}`)
export const deleteNoteAdmin = (id) => api.delete(`/api/admin/notes/${id}`)
export const disableUser     = (id)         => api.put(`/api/admin/users/${id}/disable`)
export const enableUser      = (id)         => api.put(`/api/admin/users/${id}/enable`)