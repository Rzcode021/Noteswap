'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { auth } from '../../../firebase/firebase.config'
import {
    
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth'

export default function OTPPage() {
  const router                         = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [step, setStep]               = useState('phone')  // 'phone' | 'otp'
  const [phone, setPhone]             = useState('')
  const [otp, setOtp]                 = useState(['', '', '', '', '', ''])
  const [sending, setSending]         = useState(false)
  const [verifying, setVerifying]     = useState(false)
  const [error, setError]             = useState('')
  const [countdown, setCountdown]     = useState(0)
  const [confirmation, setConfirmation] = useState(null)

  const otpRefs  = useRef([])
  const timerRef = useRef(null)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) router.replace('/home')
  }, [user, authLoading])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [countdown])

  // Setup recaptcha
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible' }
      )
    }
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')

    // Validate phone
    const cleaned = phone.replace(/\s/g, '')
    if (!cleaned || cleaned.length < 10) {
      setError('Please enter a valid phone number.')
      return
    }

    // Format phone number with country code
    const formattedPhone = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`

    setSending(true)
    try {
      setupRecaptcha()
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      )
      setConfirmation(confirmationResult)
      setStep('otp')
      setCountdown(60)
    } catch (err) {
      console.error('Send OTP error:', err)
      setError(getFriendlyError(err.code))
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally {
      setSending(false)
    }
  }

  const handleOTPChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOTPKeyDown = (index, e) => {
    // Backspace — go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOTPPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      const newOtp = [...otp]
      pasted.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setOtp(newOtp)
      // Focus last filled input
      const lastIndex = Math.min(pasted.length, 5)
      otpRefs.current[lastIndex]?.focus()
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP.')
      return
    }

    if (!confirmation) {
      setError('Session expired. Please request a new OTP.')
      return
    }

    setVerifying(true)
    try {
      await confirmation.confirm(otpCode)
      // AuthContext onAuthStateChanged will fire and redirect
    } catch (err) {
      console.error('Verify OTP error:', err)
      setError(getFriendlyError(err.code))
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setOtp(['', '', '', '', '', ''])
    setError('')

    // Reset recaptcha
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = null
    }

    setSending(true)
    try {
      setupRecaptcha()
      const cleaned      = phone.replace(/\s/g, '')
      const formattedPhone = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      )
      setConfirmation(confirmationResult)
      setCountdown(60)
    } catch (err) {
      console.error('Resend OTP error:', err)
      setError(getFriendlyError(err.code))
    } finally {
      setSending(false)
    }
  }

  const getFriendlyError = (code) => {
    switch (code) {
      case 'auth/invalid-phone-number':    return 'Invalid phone number. Please check and try again.'
      case 'auth/too-many-requests':       return 'Too many attempts. Please try again later.'
      case 'auth/invalid-verification-code': return 'Incorrect OTP. Please check and try again.'
      case 'auth/code-expired':            return 'OTP expired. Please request a new one.'
      case 'auth/missing-phone-number':    return 'Please enter your phone number.'
      case 'auth/quota-exceeded':          return 'SMS quota exceeded. Please try again later.'
      default:                             return `Error: ${code}`
    }
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Invisible recaptcha container */}
      <div id="recaptcha-container" />

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

      {/* PAGE CONTENT */}
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

          <div style={{ fontSize: '4rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            {step === 'phone' ? '📱' : '🔐'}
          </div>

          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900,
            color: 'white', lineHeight: 1.2, marginBottom: '0.8rem',
            position: 'relative', zIndex: 1, letterSpacing: '-0.5px',
          }}>
            {step === 'phone' ? 'Login with\nPhone OTP 📲' : 'Enter the\nOTP code 🔑'}
          </h2>

          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7, marginBottom: '2rem', fontWeight: 600,
            position: 'relative', zIndex: 1, whiteSpace: 'pre-line',
          }}>
            {step === 'phone'
              ? 'Enter your mobile number and we\'ll send you a 6-digit OTP to verify your identity.'
              : `We've sent a 6-digit OTP to\n+91 ${phone}\n\nEnter it below to login.`
            }
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            {['📱 No Password', '🔒 Secure', '⚡ Instant'].map(p => (
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

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
            {['Enter Phone', 'Verify OTP'].map((label, i) => {
              const isActive = (step === 'phone' && i === 0) || (step === 'otp' && i === 1)
              const isDone   = step === 'otp' && i === 0
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 900,
                    background: isDone ? 'var(--green)' : isActive ? 'var(--orange)' : 'var(--bg)',
                    color: isDone || isActive ? 'white' : 'var(--muted)',
                    boxShadow: isActive ? '0 3px 0 var(--orange-dark)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 700,
                    color: isActive ? 'var(--dark)' : 'var(--muted)',
                  }}>{label}</span>
                  {i === 0 && (
                    <div style={{
                      width: '30px', height: '2px', borderRadius: '1px',
                      background: step === 'otp' ? 'var(--green)' : 'var(--bg)',
                      transition: 'all 0.3s',
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* ===== PHONE STEP ===== */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>
                Enter your phone
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.8rem', fontWeight: 600 }}>
                We'll send a 6-digit OTP to verify your number
              </p>

              {error && (
                <div className="toast-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="field-label">Phone number <span style={{ color: 'var(--orange)' }}>*</span></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Country code */}
                  <div style={{
                    padding: '11px 14px', borderRadius: '12px',
                    border: '2px solid #E5E7EB', background: 'var(--bg)',
                    fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark)',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    whiteSpace: 'nowrap',
                  }}>
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    className="input-clay"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    required
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, marginTop: '5px' }}>
                  Enter your 10-digit Indian mobile number
                </div>
              </div>

              <button
                type="submit"
                disabled={sending || phone.length < 10}
                style={{
                  width: '100%', padding: '13px', borderRadius: '50px', border: 'none',
                  background: (sending || phone.length < 10) ? '#ccc' : 'var(--orange)',
                  color: 'white', fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.95rem', fontWeight: 800,
                  cursor: (sending || phone.length < 10) ? 'not-allowed' : 'pointer',
                  borderBottom: `3px solid ${(sending || phone.length < 10) ? '#aaa' : 'var(--orange-dark)'}`,
                  boxShadow: (sending || phone.length < 10) ? 'none' : '0 6px 20px rgba(245,166,35,0.35)',
                  transition: 'all 0.2s', marginBottom: '1.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {sending ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '3px' }} />
                    Sending OTP...
                  </>
                ) : '📱 Send OTP'}
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '1.2rem',
              }}>
                <div style={{ flex: 1, height: '1.5px', background: '#E5E7EB' }} />
                or login with
                <div style={{ flex: 1, height: '1.5px', background: '#E5E7EB' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                <Link href="/login" style={{ flex: 1, textDecoration: 'none' }}>
                  <button type="button" style={{
                    width: '100%', padding: '10px', borderRadius: '12px',
                    border: '2px solid #E5E7EB', background: 'white',
                    fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem',
                    fontWeight: 800, color: 'var(--dark)', cursor: 'pointer',
                    boxShadow: '0 3px 0 rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  }}>📧 Email</button>
                </Link>
                <Link href="/login" style={{ flex: 1, textDecoration: 'none' }}>
                  <button type="button" style={{
                    width: '100%', padding: '10px', borderRadius: '12px',
                    border: '2px solid #E5E7EB', background: 'white',
                    fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem',
                    fontWeight: 800, color: 'var(--dark)', cursor: 'pointer',
                    boxShadow: '0 3px 0 rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  }}>🌐 Google</button>
                </Link>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 700 }}>
                Don't have an account?{' '}
                <Link href="/signup" style={{ color: 'var(--orange)', fontWeight: 800, textDecoration: 'none' }}>
                  Sign up free
                </Link>
              </p>
            </form>
          )}

          {/* ===== OTP STEP ===== */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>
                Enter OTP
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.8rem', fontWeight: 600 }}>
                Enter the 6-digit code sent to <strong style={{ color: 'var(--dark)' }}>+91 {phone}</strong>
              </p>

              {error && (
                <div className="toast-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>
              )}

              {/* OTP Input boxes */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOTPChange(i, e.target.value)}
                    onKeyDown={e => handleOTPKeyDown(i, e)}
                    onPaste={i === 0 ? handleOTPPaste : undefined}
                    style={{
                      width: '48px', height: '56px', borderRadius: '14px',
                      border: digit ? '2px solid var(--orange)' : '2px solid #E5E7EB',
                      background: digit ? 'var(--orange-light)' : '#FAFAFA',
                      textAlign: 'center', fontSize: '1.4rem', fontWeight: 900,
                      color: 'var(--dark)', outline: 'none',
                      boxShadow: digit ? '0 0 0 3px rgba(245,166,35,0.1)' : 'none',
                      transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={verifying || otp.join('').length !== 6}
                style={{
                  width: '100%', padding: '13px', borderRadius: '50px', border: 'none',
                  background: (verifying || otp.join('').length !== 6) ? '#ccc' : 'var(--orange)',
                  color: 'white', fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.95rem', fontWeight: 800,
                  cursor: (verifying || otp.join('').length !== 6) ? 'not-allowed' : 'pointer',
                  borderBottom: `3px solid ${(verifying || otp.join('').length !== 6) ? '#aaa' : 'var(--orange-dark)'}`,
                  boxShadow: (verifying || otp.join('').length !== 6) ? 'none' : '0 6px 20px rgba(245,166,35,0.35)',
                  transition: 'all 0.2s', marginBottom: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {verifying ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '3px' }} />
                    Verifying...
                  </>
                ) : '🔐 Verify OTP'}
              </button>

              {/* Resend OTP */}
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                {countdown > 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 700 }}>
                    Resend OTP in <strong style={{ color: 'var(--orange)' }}>{countdown}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={sending}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.82rem', color: 'var(--orange)',
                      fontWeight: 800, textDecoration: 'underline',
                    }}
                  >
                    {sending ? '⏳ Sending...' : '🔄 Resend OTP'}
                  </button>
                )}
              </div>

              {/* Change phone */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone')
                    setOtp(['', '', '', '', '', ''])
                    setError('')
                    setConfirmation(null)
                    if (window.recaptchaVerifier) {
                      window.recaptchaVerifier.clear()
                      window.recaptchaVerifier = null
                    }
                  }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.82rem', color: 'var(--mid)', fontWeight: 700,
                  }}
                >← Change phone number</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}