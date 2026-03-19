'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange } from '../firebase/auth.firebase'
import { syncUser } from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]                 = useState(null)
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        try {
          const res = await syncUser()
          setUser(res.data.data)
        } catch (err) {
          console.error('🔥 syncUser failed:', err.message)
          // ✅ Fallback — use Firebase user directly so login still works
          setUser({
            _id:   fbUser.uid,
            name:  fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
            email: fbUser.email,
            photo: fbUser.photoURL,
          })
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)