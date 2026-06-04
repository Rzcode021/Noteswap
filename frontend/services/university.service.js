import api from './api'

export const getUniversities     = ()              => api.get('/api/universities')
export const getUniversityBySlug = (slug)          => api.get(`/api/universities/${slug}`)
export const getUniversityNotes  = (slug, params)  => api.get(`/api/universities/${slug}/notes`, { params })
export const createUniversity    = (data)          => api.post('/api/universities', data)
export const updateUniversity    = (id, data)      => api.put(`/api/universities/${id}`, data)
export const deleteUniversity    = (id)            => api.delete(`/api/universities/${id}`)