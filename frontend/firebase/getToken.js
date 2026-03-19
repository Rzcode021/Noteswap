import { auth } from './firebase.config'

export const getIdToken = async () => {
  const user = auth.currentUser
  if (!user) return null
  return await user.getIdToken()
}