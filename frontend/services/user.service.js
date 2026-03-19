import api from './api'

export const getProfile      = ()       => api.get('/users/profile')
export const updateProfile   = (data)   => api.put('/users/profile', data)
export const getBookmarks    = ()       => api.get('/users/bookmarks')
export const getLikedNotes   = ()       => api.get('/users/liked')
export const toggleBookmark  = (noteId) => api.post(`/users/bookmarks/${noteId}`)
export const getUserById     = (id)     => api.get(`/users/profile/${id}`)