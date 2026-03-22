import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from './firebase.config'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export const loginWithEmail  = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const signupWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password)
export const loginWithGoogle = ()                => signInWithPopup(auth, googleProvider)
export const logout          = ()                => signOut(auth)
export const onAuthChange    = (cb)              => onAuthStateChanged(auth, cb)
export const loginWithPhone  = (phoneNumber, appVerifier) => signInWithPhoneNumber(auth, phoneNumber, appVerifier)
export const setupRecaptcha   = (containerId)    => new RecaptchaVerifier(containerId, {}, auth)
export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email)


export { auth }