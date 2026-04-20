'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange } from '../firebase/auth.firebase'
import { syncUser } from '../services/auth.service'
import { connectSocket, disconnectSocket } from '../lib/socket'

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
          const pendingData = localStorage.getItem('pendingProfileData')
          const extraData   = pendingData ? JSON.parse(pendingData) : {}
          const res         = await syncUser(extraData)
          setUser(res.data.data)

          // ✅ Connect socket with MongoDB user ID
          connectSocket(res.data.data._id)

          if (pendingData) localStorage.removeItem('pendingProfileData')
        } catch (err) {
          console.error('syncUser failed:', err.message)
          setUser({
            _id:   fbUser.uid,
            name:  fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
            email: fbUser.email,
            photo: fbUser.photoURL,
          })
        }
      } else {
        setUser(null)
        // ✅ Disconnect socket on logout
        disconnectSocket()
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