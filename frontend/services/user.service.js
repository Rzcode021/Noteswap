import api from './api'

export const getProfile      = ()       => api.get('/api/users/profile')
export const updateProfile   = (data)   => api.put('/api/users/profile', data)
export const getBookmarks    = ()       => api.get('/api/users/bookmarks')
export const getLikedNotes   = ()       => api.get('/api/users/liked')
export const toggleBookmark  = (noteId) => api.post(`/api/users/bookmarks/${noteId}`)
export const getUserById     = (id)     => api.get(`/api/users/profile/${id}`)