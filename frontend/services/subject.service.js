import api from './api'

export const getSubjects = (params = {}) => api.get('/api/subjects', { params })
export const getSubjectBySlug = (slug) => api.get(`/api/subjects/${slug}`)