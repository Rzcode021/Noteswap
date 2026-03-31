import api from './api'

export const getComments  = (noteId) => api.get(`/api/comments/${noteId}`)
export const addComment   = (noteId, text) => api.post(`/api/comments/${noteId}`, { text })
export const deleteComment = (id)    => api.delete(`/api/comments/${id}`)
export const likeComment  = (id)     => api.post(`/api/comments/${id}/like`)
export const editComment  = (id, text) => api.put(`/api/comments/${id}`, { text })