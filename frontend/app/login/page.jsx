'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginWithEmail, loginWithGoogle } from '../../firebase/auth.firebase'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const router                         = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail]              = useState('')
  const [password, setPassword]        = useState('')
  const [submitting, setSubmitting]    = useState(false)
  const [error, setError]              = useState('')

  console.log('🔐 Login page render — authLoading:', authLoading, 'user:', user?.email || 'null')

  useEffect(() => {
    console.log('🔐 Login useEffect — authLoading:', authLoading, 'user:', user?.email || 'null')
    if (!authLoading && user) {
      console.log('🔐 Redirecting to /home...')
      router.replace('/home')
    }
  }, [user, authLoading])

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: '1rem',
      }}>
        <div className="spinner" />
        <p style={{ color: 'var(--muted)', fontWeight: 700, fontSize: '0.9rem' }}>Loading...</p>
      </div>
    )
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      console.log('🔐 Attempting email login...')
      await loginWithEmail(email, password)
      console.log('🔐 Firebase login success — waiting for AuthContext...')
      // Do NOT push here — useEffect handles redirect
    } catch (err) {
      console.error('🔐 Login error:', err.code, err.message)
      setError(getFriendlyError(err.code))
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setSubmitting(true)
    try {
      console.log('🔐 Attempting Google login...')
      await loginWithGoogle()
      console.log('🔐 Google popup closed — waiting for AuthContext...')
    } catch (err) {
      console.error('🔐 Google error:', err.code, err.message)
      setError(getFriendlyError(err.code))
      setSubmitting(false)
    }
  }

  const getFriendlyError = (code) => {
    switch (code) {
      case 'auth/user-not-found':         return 'No account found with this email.'
      case 'auth/wrong-password':         return 'Incorrect password. Please try again.'
      case 'auth/invalid-credential':     return 'Invalid email or password.'
      case 'auth/invalid-email':          return 'Please enter a valid email address.'
      case 'auth/too-many-requests':      return 'Too many attempts. Try again later.'
      case 'auth/popup-closed-by-user':   return 'Google sign-in was cancelled.'
      case 'auth/popup-blocked':          return 'Popup blocked. Please allow popups for this site.'
      case 'auth/network-request-failed': return 'Network error. Check your connection.'
      default:                            return `Error: ${code}`
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* NAV */}
      <div style={{ padding: '1rem 2rem' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'white', borderRadius: '60px', padding: '0.7rem 1.5rem',
          border: 'var(--clay-border)',
          boxShadow: '0 4px 0 rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'var(--orange)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.9rem',
              border: 'var(--clay-border)', boxShadow: '0 3px 0 var(--orange-dark)',
            }}>📚</div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: 'var(--dark)' }}>
              Note<span style={{ color: 'var(--orange)' }}>Swap</span>
            </span>
          </Link>
          <Link href="/">
            <button className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '2rem',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '3rem', alignItems: 'center',
        minHeight: 'calc(100vh - 100px)',
      }}>

        {/* LEFT PANEL */}
        <div style={{
          background: 'var(--orange)', borderRadius: '28px', padding: '2.5rem',
          border: 'var(--clay-border)',
          boxShadow: '0 10px 0 var(--orange-dark), 0 20px 48px rgba(245,166,35,0.3)',
          position: 'relative', overflow: 'hidden',
          animation: 'floatCard 4s ease-in-out infinite',
        }}>
          {[
            { w: 180, h: 180, top: '-60px', right: '-40px' },
            { w: 120, h: 120, bottom: '-30px', left: '-20px' },
            { w: 80,  h: 80,  top: '40%',   right: '20px'  },
          ].map((b, i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              width: b.w, height: b.h,
              top: b.top, right: b.right,
              bottom: b.bottom, left: b.left,
            }} />
          ))}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '2rem', position: 'relative', zIndex: 1,
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 900, color: 'white',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', boxShadow: '0 3px 0 rgba(0,0,0,0.1)',
            }}>📚</div>
            Note<span style={{ color: 'rgba(255,255,255,0.8)' }}>Swap</span>
          </div>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900,
            color: 'white', lineHeight: 1.2, marginBottom: '0.8rem',
            position: 'relative', zIndex: 1, letterSpacing: '-0.5px',
          }}>
            Welcome back,<br />student! 👋
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7, marginBottom: '2rem', fontWeight: 600,
            position: 'relative', zIndex: 1,
          }}>
            Login to access thousands of verified notes organised by subject, unit and semester.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            {['📚 12K+ Notes', '🎓 200+ Subjects', '🔒 Free Forever'].map(p => (
              <div key={p} style={{
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                color: 'white', fontSize: '0.75rem', fontWeight: 800,
                padding: '6px 14px', borderRadius: '50px',
              }}>{p}</div>
            ))}
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="clay" style={{ background: 'white', borderRadius: '28px', padding: '2.5rem' }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg)', borderRadius: '14px',
            padding: '4px', marginBottom: '2rem', border: 'var(--clay-border)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
          }}>
            <button style={{
              flex: 1, padding: '10px', borderRadius: '11px', border: 'none',
              fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 800,
              cursor: 'pointer', background: 'white', color: 'var(--dark)',
              boxShadow: '0 3px 0 rgba(0,0,0,0.06)',
            }}>Login</button>
            <Link href="/signup" style={{ flex: 1, textDecoration: 'none' }}>
              <button style={{
                width: '100%', padding: '10px', borderRadius: '11px', border: 'none',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 800,
                cursor: 'pointer', background: 'transparent', color: 'var(--muted)',
              }}>Sign Up</button>
            </Link>
          </div>

          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.8rem', fontWeight: 600 }}>
            Login to access your notes and bookmarks
          </p>

          {error && (
            <div className="toast-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>
          )}

          {submitting && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--orange-light)', borderRadius: '12px',
              padding: '12px 16px', marginBottom: '1rem',
              fontSize: '0.85rem', fontWeight: 700, color: 'var(--orange-dark)',
            }}>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />
              Logging you in...
            </div>
          )}

          <form onSubmit={handleEmailLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Email address <span>*</span></label>
              <input
                type="email" className="input-clay" placeholder="you@college.edu"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label className="field-label">Password <span>*</span></label>
              <input
                type="password" className="input-clay" placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>
            <div style={{ textAlign: 'right', marginBottom: '1.2rem' }}>
              <Link href="/login/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--orange)', fontWeight: 800, textDecoration: 'none' }}>
  Forgot password?
</Link>
            </div>
            <button type="submit" disabled={submitting} style={{
              width: '100%', padding: '13px', borderRadius: '50px', border: 'none',
              background: submitting ? '#ccc' : 'var(--orange)',
              color: 'white', fontFamily: 'Nunito, sans-serif',
              fontSize: '0.95rem', fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer',
              borderBottom: `3px solid ${submitting ? '#aaa' : 'var(--orange-dark)'}`,
              boxShadow: submitting ? 'none' : '0 6px 20px rgba(245,166,35,0.35)',
              transition: 'all 0.2s', marginBottom: '1.2rem',
            }}>
              {submitting ? '⏳ Logging in...' : 'Login to NoteSwap'}
            </button>
          </form>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '1.2rem',
          }}>
            <div style={{ flex: 1, height: '1.5px', background: '#E5E7EB' }} />
            or continue with
            <div style={{ flex: 1, height: '1.5px', background: '#E5E7EB' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <button onClick={handleGoogleLogin} disabled={submitting} style={{
              flex: 1, padding: '10px', borderRadius: '12px',
              border: '2px solid #E5E7EB', background: 'white',
              fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem',
              fontWeight: 800, color: 'var(--dark)', cursor: 'pointer',
              boxShadow: '0 3px 0 rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            }}>🌐 Google</button>
            <Link href="/login/otp" style={{ flex: 1, textDecoration: 'none' }}>
              <button disabled style={{
                width: '100%', padding: '10px', borderRadius: '12px',
                border: '2px solid #E5E7EB', background: 'white',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem',
                fontWeight: 800, color: 'var(--dark)', cursor: 'pointer',
                boxShadow: '0 3px 0 rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              }}>📱 OTP (SOON) </button>
            </Link>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 700 }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--orange)', fontWeight: 800, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}