import api from '../api'

export const getSubjects = () => api.get('/api/subjects')
export const getSubjectBySlug = (slug) => api.get(`/api/subjects/${slug}`)