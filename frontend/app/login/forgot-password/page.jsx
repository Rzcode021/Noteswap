'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '../../../firebase/auth.firebase'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      console.error('Reset password error:', err)
      setError(getFriendlyError(err.code))
    } finally {
      setSending(false)
    }
  }

  const getFriendlyError = (code) => {
    switch (code) {
      case 'auth/user-not-found':   return 'No account found with this email address.'
      case 'auth/invalid-email':    return 'Please enter a valid email address.'
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.'
      default:                      return `Error: ${code}`
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
          <Link href="/login">
            <button className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
              ← Back to Login
            </button>
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{
        maxWidth: '480px', margin: '0 auto',
        padding: '3rem 2rem',
      }}>

        {sent ? (
          /* ===== SUCCESS STATE ===== */
          <div className="clay" style={{
            background: 'white', borderRadius: '28px',
            padding: '3rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem',
              fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem',
            }}>Check your email!</h2>
            <p style={{
              fontSize: '0.88rem', color: 'var(--mid)',
              lineHeight: 1.7, fontWeight: 600, marginBottom: '0.5rem',
            }}>
              We've sent a password reset link to
            </p>
            <div style={{
              background: 'var(--orange-light)', borderRadius: '10px',
              padding: '10px 16px', marginBottom: '1.5rem',
              fontSize: '0.9rem', fontWeight: 800, color: 'var(--orange-dark)',
            }}>
              {email}
            </div>
            <p style={{
              fontSize: '0.82rem', color: 'var(--muted)',
              fontWeight: 600, marginBottom: '2rem', lineHeight: 1.6,
            }}>
              Click the link in the email to reset your password.
              The link will expire in 1 hour.
              Check your spam folder if you don't see it.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                style={{
                  padding: '11px', borderRadius: '50px',
                  border: 'var(--clay-border)', background: 'var(--bg)',
                  fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem',
                  fontWeight: 700, cursor: 'pointer', color: 'var(--mid)',
                  boxShadow: 'var(--clay-shadow-sm)',
                }}
              >🔄 Send again</button>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%', padding: '11px', borderRadius: '50px',
                  border: 'none', background: 'var(--orange)',
                  fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem',
                  fontWeight: 800, cursor: 'pointer', color: 'white',
                  borderBottom: '3px solid var(--orange-dark)',
                  boxShadow: '0 5px 16px rgba(245,166,35,0.35)',
                }}>← Back to Login</button>
              </Link>
            </div>
          </div>

        ) : (
          /* ===== FORM STATE ===== */
          <div className="clay" style={{
            background: 'white', borderRadius: '28px', padding: '2.5rem',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>🔑</div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem',
              fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem',
              textAlign: 'center',
            }}>Forgot Password?</h2>
            <p style={{
              fontSize: '0.85rem', color: 'var(--muted)',
              marginBottom: '2rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.6,
            }}>
              No worries! Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="toast-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="field-label">
                  Email address <span style={{ color: 'var(--orange)' }}>*</span>
                </label>
                <input
                  type="email"
                  className="input-clay"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending || !email}
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: '50px', border: 'none',
                  background: (sending || !email) ? '#ccc' : 'var(--orange)',
                  color: 'white', fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.95rem', fontWeight: 800,
                  cursor: (sending || !email) ? 'not-allowed' : 'pointer',
                  borderBottom: `3px solid ${(sending || !email) ? '#aaa' : 'var(--orange-dark)'}`,
                  boxShadow: (sending || !email) ? 'none' : '0 6px 20px rgba(245,166,35,0.35)',
                  transition: 'all 0.2s', marginBottom: '1.2rem',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px',
                }}
              >
                {sending ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '3px' }} />
                    Sending reset link...
                  </>
                ) : '📧 Send Reset Link'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 700 }}>
              Remember your password?{' '}
              <Link href="/login" style={{ color: 'var(--orange)', fontWeight: 800, textDecoration: 'none' }}>
                Login here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}