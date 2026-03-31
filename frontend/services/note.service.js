import api from './api'

export const getNotes      = (params) => api.get('/api/notes', { params })
export const getNoteById   = (id)     => api.get(`/api/notes/${id}`)
export const getMyNotes    = ()       => api.get('/api/notes/user/my')
export const likeNote      = (id)     => api.post(`/api/notes/${id}/like`)
export const downloadNote  = (id)     => api.post(`/api/notes/${id}/download`)
export const deleteNote    = (id)     => api.delete(`/api/notes/${id}`)

export const uploadNote = (formData) =>
  api.post('/api/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })