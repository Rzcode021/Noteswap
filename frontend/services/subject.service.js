import api from './api'

export const getSubjects      = ()     => api.get('/subjects')
export const getSubjectBySlug = (slug) => api.get(`/subjects/${slug}`)