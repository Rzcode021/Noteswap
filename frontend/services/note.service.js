import api from './api'

export const getNotes      = (params) => api.get('/notes', { params })
export const getNoteById   = (id)     => api.get(`/notes/${id}`)
export const getMyNotes    = ()       => api.get('/notes/user/my')
export const likeNote      = (id)     => api.post(`/notes/${id}/like`)
export const downloadNote  = (id)     => api.post(`/notes/${id}/download`)
export const deleteNote    = (id)     => api.delete(`/notes/${id}`)

export const uploadNote = (formData) =>
  api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })