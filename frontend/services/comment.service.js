import api from './api'

export const getComments  = (noteId) => api.get(`/comments/${noteId}`)
export const addComment   = (noteId, text) => api.post(`/comments/${noteId}`, { text })
export const deleteComment = (id)    => api.delete(`/comments/${id}`)
export const likeComment  = (id)     => api.post(`/comments/${id}/like`)
export const editComment  = (id, text) => api.put(`/comments/${id}`, { text })