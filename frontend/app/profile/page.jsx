'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { getProfile, updateProfile, getBookmarks, getLikedNotes } from '../../services/user.service'
import { getMyNotes } from '../../services/note.service'

export default function ProfilePage() {
  const { user, loading: authLoading, setUser } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab]     = useState('notes')
  const [myNotes, setMyNotes]         = useState([])
  const [bookmarks, setBookmarks]     = useState([])
  const [likedNotes, setLikedNotes]   = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [editMode, setEditMode]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [form, setForm] = useState({
    name:     '',
    college:  '',
    semester: '',
    year:     '',
    bio:      '',
    phone:    '',
  })

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading])

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile()
      fetchMyNotes()
    }
  }, [user, authLoading])

  const fetchProfile = async () => {
    try {
      const res = await getProfile()
      const u   = res.data.data
      setForm({
        name:     u.name     || '',
        college:  u.college  || '',
        semester: u.semester || '',
        year:     u.year     || '',
        bio:      u.bio      || '',
        phone:    u.phone    || '',
      })
    } catch (err) {
      console.error('Fetch profile error:', err)
    }
  }

  const fetchMyNotes = async () => {
    setPageLoading(true)
    try {
      const res = await getMyNotes()
      setMyNotes(res.data.data || [])
    } catch (err) {
      console.error('Fetch notes error:', err)
    } finally {
      setPageLoading(false)
    }
  }

  const fetchBookmarks = async () => {
    try {
      const res = await getBookmarks()
      setBookmarks(res.data.data || [])
    } catch (err) {
      console.error('Fetch bookmarks error:', err)
    }
  }

  const fetchLiked = async () => {
    try {
      const res = await getLikedNotes()
      setLikedNotes(res.data.data || [])
    } catch (err) {
      console.error('Fetch liked error:', err)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'bookmarks' && bookmarks.length === 0) fetchBookmarks()
    if (tab === 'liked'     && likedNotes.length === 0) fetchLiked()
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateProfile(form)
      setUser(res.data.data)
      setEditMode(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Save profile error:', err)
    } finally {
      setSaving(false)
    }
  }

  const getStatusStyle = (status) => {
    if (status === 'approved') return { bg: 'var(--green-light)',  color: 'var(--green)',      label: '✅ Live'     }
    if (status === 'rejected') return { bg: '#FEF2F2',             color: '#991B1B',           label: '✗ Rejected' }
    return                             { bg: 'var(--orange-light)', color: 'var(--orange-dark)', label: '⏳ Pending'  }
  }

  const colors = ['var(--orange)', 'var(--teal)', 'var(--green)', 'var(--pink)']
  const bgs    = ['var(--orange-light)', 'var(--teal-light)', 'var(--green-light)', 'var(--pink-light)']

  const stats = [
    { val: myNotes.length,                                         label: 'Notes Uploaded' },
    { val: myNotes.reduce((a, n) => a + (n.downloadsCount || 0), 0), label: 'Total Downloads' },
    { val: myNotes.reduce((a, n) => a + (n.likesCount || 0), 0),     label: 'Total Likes'     },
    { val: user?.bookmarks?.length || 0,                             label: 'Bookmarks'       },
  ]

  if (authLoading || (!authLoading && !user)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        .profile-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 1.5rem;
          align-items: start;
        }
        .stats-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 1.5rem;
        }
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 1rem;
        }
        .tabs-container {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          padding-top: 0.8rem;
          position: relative;
          z-index: 1;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
        }
        .tabs-container::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }

        @media (max-width: 900px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
          .stats-strip {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 600px) {
          .profile-layout {
            padding: 1rem;
          }
          .notes-grid {
            grid-template-columns: 1fr;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .profile-nav {
            padding: 0 1rem !important;
          }
          .upload-btn {
            display: none !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .profile-hero {
            padding: 1.5rem 1rem 0 !important;
          }
          .profile-hero-inner {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 1rem !important;
          }
          .profile-hero-info {
            padding-bottom: 1.5rem !important;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .profile-hero-header {
            justify-content: center !important;
          }
          .profile-hero-tags {
            justify-content: center !important;
          }
        }
      `}</style>
      {/* NAVBAR */}
      <nav className="profile-nav nav-glass" style={{
        padding: '0 2rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '60px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'var(--orange)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.85rem',
            border: 'var(--clay-border)', boxShadow: '0 3px 0 var(--orange-dark)',
          }}>📚</div>
          <span className="brand-text" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: 'var(--dark)' }}>
            Note<span style={{ color: 'var(--orange)' }}>Swap</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/home">
            <button className="btn-outline home-btn" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
              ← Home
            </button>
          </Link>
          <Link href="/upload">
            <button className="btn-orange upload-btn" style={{ padding: '8px 18px', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
              + Upload<span className="hide-on-mobile">&nbsp;Notes</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* PROFILE HERO */}
      <div className="profile-hero" style={{
        background: 'var(--orange)', padding: '2rem 2rem 0',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Bubbles */}
        {[
          { w: 260, h: 260, top: '-80px', right: '-60px'  },
          { w: 160, h: 160, bottom: '-50px', left: '40%'  },
          { w: 100, h: 100, top: '20px', right: '200px'   },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            width: b.w, height: b.h,
            top: b.top, right: b.right,
            bottom: b.bottom, left: b.left,
          }} />
        ))}

        <div className="profile-hero-inner" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
          {/* Avatar */}
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            background: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: 'Outfit, sans-serif',
            fontSize: '1.8rem', fontWeight: 900, color: 'var(--orange)',
            border: '3px solid rgba(255,255,255,0.9)',
            boxShadow: '0 6px 0 rgba(0,0,0,0.1)', flexShrink: 0,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* Info */}
          <div className="profile-hero-info" style={{ flex: 1, paddingBottom: '1.5rem' }}>
            <div className="profile-hero-header" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '4px', flexWrap: 'wrap',
            }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>
                {user?.name}
              </h1>
              <span style={{
                background: 'rgba(255,255,255,0.2)', color: 'white',
                fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px',
                borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)',
              }}>✓ Verified</span>
              {user?.role === 'admin' && (
                <span style={{
                  background: 'rgba(0,0,0,0.3)', color: 'white',
                  fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px',
                  borderRadius: '20px',
                }}>⚙️ Admin</span>
              )}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: '0.6rem' }}>
              {user?.email || user?.phone}
            </div>
            <div className="profile-hero-tags" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[user?.college, user?.semester, user?.year].filter(Boolean).map((tag, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.2)', color: 'white',
                  fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px',
                  borderRadius: '50px', border: '1px solid rgba(255,255,255,0.3)',
                }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Edit Button */}
          <div style={{ paddingBottom: '1.5rem' }}>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                background: editMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                color: editMode ? 'var(--orange-dark)' : 'white',
                border: '1.5px solid rgba(255,255,255,0.4)',
                padding: '8px 20px', borderRadius: '50px',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >{editMode ? '✕ Cancel' : '✏️ Edit Profile'}</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          {[
            { tab: 'notes',     label: 'My Notes',    count: myNotes.length       },
            { tab: 'bookmarks', label: 'Bookmarks',   count: user?.bookmarks?.length || 0 },
            { tab: 'liked',     label: 'Liked Notes', count: null                 },
            { tab: 'settings',  label: 'Settings',    count: null                 },
          ].map(t => (
            <button
              key={t.tab}
              onClick={() => handleTabChange(t.tab)}
              style={{
                padding: '12px 20px', border: 'none', background: 'transparent',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.2s',
                color: activeTab === t.tab ? 'white' : 'rgba(255,255,255,0.6)',
                borderBottom: activeTab === t.tab ? '3px solid white' : '3px solid transparent',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {t.label}
              {t.count !== null && (
                <span style={{
                  background: activeTab === t.tab ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                  borderRadius: '20px', padding: '2px 8px',
                  fontSize: '0.65rem', fontWeight: 900, color: 'white',
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* PAGE BODY */}
      <div className="profile-layout">

        {/* LEFT */}
        <div>

          {/* Success toast */}
          {saveSuccess && (
            <div className="toast-success" style={{ marginBottom: '1rem' }}>
              ✅ Profile updated successfully!
            </div>
          )}

          {/* Edit Form */}
          {editMode && (
            <div className="clay" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '1.2rem' }}>
                ✏️ Edit Profile
              </div>

              <div className="form-grid">
                <div>
                  <label className="field-label">Full Name</label>
                  <input className="input-clay" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </div>
                <div>
                  <label className="field-label">Phone</label>
                  <input className="input-clay" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="field-label">College / University</label>
                <input className="input-clay" value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} placeholder="AKTU, Lucknow" />
              </div>

              <div className="form-grid">
                <div>
                  <label className="field-label">Semester</label>
                  <select className="input-clay" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} style={{ cursor: 'pointer' }}>
                    <option value="">Select semester</option>
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <option key={n} value={`Semester ${n}`}>Semester {n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Year</label>
                  <select className="input-clay" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} style={{ cursor: 'pointer' }}>
                    <option value="">Select year</option>
                    {['1st Year','2nd Year','3rd Year','4th Year'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label className="field-label">Bio</label>
                <textarea
                  className="input-clay"
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell others about yourself..."
                  style={{ resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>
                  {form.bio.length}/300
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '12px 32px', borderRadius: '50px', border: 'none',
                  background: saving ? '#ccc' : 'var(--orange)',
                  color: 'white', fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.92rem', fontWeight: 800,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  borderBottom: `3px solid ${saving ? '#aaa' : 'var(--orange-dark)'}`,
                  boxShadow: saving ? 'none' : '0 5px 16px rgba(245,166,35,0.35)',
                }}
              >
                {saving ? '⏳ Saving...' : '✓ Save Changes'}
              </button>
            </div>
          )}

          {/* Stats Strip */}
          <div className="stats-strip">
            {stats.map(s => (
              <div key={s.label} className="clay-sm" style={{ background: 'white', borderRadius: '14px', padding: '0.9rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 900, color: 'var(--dark)' }}>{s.val}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700, marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* MY NOTES TAB */}
          {activeTab === 'notes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, color: 'var(--dark)' }}>
                  My Uploaded Notes
                </div>
                <Link href="/upload">
                  <button className="btn-orange" style={{ padding: '7px 16px', fontSize: '0.8rem' }}>
                    + Upload New
                  </button>
                </Link>
              </div>

              {pageLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <div className="spinner" />
                </div>
              ) : myNotes.length === 0 ? (
                <div className="clay-sm" style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem' }}>No notes yet</div>
                  <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                    Start sharing your knowledge with other students!
                  </p>
                  <Link href="/upload">
                    <button className="btn-orange" style={{ padding: '10px 24px' }}>Upload Your First Note</button>
                  </Link>
                </div>
              ) : (
                <div className="notes-grid">
                  {myNotes.map((note, i) => {
                    const s = getStatusStyle(note.status)
                    return (
                      <Link key={note._id} href={note.status === 'approved' ? `/notes/${note._id}` : '#'} style={{ textDecoration: 'none' }}>
                        <div className="note-card" style={{ opacity: note.status === 'rejected' ? 0.7 : 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 900, padding: '3px 10px',
                              borderRadius: '50px', background: bgs[i % bgs.length],
                              color: colors[i % colors.length],
                              border: '1.5px solid rgba(255,255,255,0.9)',
                            }}>{note.subject?.name || 'General'}</span>
                            <span style={{
                              fontSize: '0.67rem', fontWeight: 800, padding: '3px 9px',
                              borderRadius: '20px', background: s.bg, color: s.color,
                            }}>{s.label}</span>
                          </div>
                          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.86rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '3px', lineHeight: 1.3 }}>
                            {note.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '8px' }}>
                            {note.unit} · {note.semester}
                          </div>
                          {note.status === 'rejected' && note.rejectionReason && (
                            <div style={{
                              background: '#FEF2F2', borderRadius: '8px',
                              padding: '6px 10px', fontSize: '0.72rem',
                              color: '#991B1B', fontWeight: 600, marginBottom: '8px',
                            }}>
                              ✗ Reason: {note.rejectionReason}
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '7px', borderTop: '1.5px solid #F0F1F8', fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>
                            <span>❤️ {note.likesCount || 0}</span>
                            <span>⬇ {note.downloadsCount || 0}</span>
                            <span>{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* BOOKMARKS TAB */}
          {activeTab === 'bookmarks' && (
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '1rem' }}>
                Bookmarked Notes
              </div>
              {bookmarks.length === 0 ? (
                <div className="clay-sm" style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem' }}>No bookmarks yet</div>
                  <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>
                    Browse notes and bookmark the ones you want to revisit!
                  </p>
                </div>
              ) : (
                <div className="notes-grid">
                  {bookmarks.map((note, i) => (
                    <Link key={note._id} href={`/notes/${note._id}`} style={{ textDecoration: 'none' }}>
                      <div className="note-card">
                        <div style={{ marginBottom: '7px' }}>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 900, padding: '3px 10px',
                            borderRadius: '50px', background: bgs[i % bgs.length],
                            color: colors[i % colors.length],
                            border: '1.5px solid rgba(255,255,255,0.9)',
                          }}>{note.subject?.name || 'General'}</span>
                        </div>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.86rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '3px', lineHeight: 1.3 }}>
                          {note.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '8px' }}>
                          {note.unit} · {note.semester}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '7px', borderTop: '1.5px solid #F0F1F8', fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>
                          <span>by {note.uploadedBy?.name?.split(' ')[0]}</span>
                          <span>❤️ {note.likesCount || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LIKED TAB */}
          {activeTab === 'liked' && (
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '1rem' }}>
                Liked Notes
              </div>
              {likedNotes.length === 0 ? (
                <div className="clay-sm" style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem' }}>No liked notes yet</div>
                  <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>
                    Like notes to show appreciation to fellow students!
                  </p>
                </div>
              ) : (
                <div className="notes-grid">
                  {likedNotes.map((note, i) => (
                    <Link key={note._id} href={`/notes/${note._id}`} style={{ textDecoration: 'none' }}>
                      <div className="note-card">
                        <div style={{ marginBottom: '7px' }}>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 900, padding: '3px 10px',
                            borderRadius: '50px', background: bgs[i % bgs.length],
                            color: colors[i % colors.length],
                            border: '1.5px solid rgba(255,255,255,0.9)',
                          }}>{note.subject?.name || 'General'}</span>
                        </div>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.86rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '3px', lineHeight: 1.3 }}>
                          {note.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '8px' }}>
                          {note.unit} · {note.semester}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '7px', borderTop: '1.5px solid #F0F1F8', fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>
                          <span>by {note.uploadedBy?.name?.split(' ')[0]}</span>
                          <span>❤️ {note.likesCount || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '1rem' }}>
                Account Settings
              </div>
              <div className="clay-sm" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
                {[
                  { icon: '🔒', title: 'Change Password',     desc: 'Update your login password',           action: 'coming soon' },
                  { icon: '📱', title: 'Phone Number',        desc: user?.phone || 'Not added yet',          action: 'edit'        },
                  { icon: '🔔', title: 'Notifications',       desc: 'Manage notification preferences',       action: 'coming soon' },
                  { icon: '🗑', title: 'Delete Account',      desc: 'Permanently delete your account',       action: 'danger'      },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '1rem 1.4rem', borderBottom: '2px solid var(--bg)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: item.action === 'danger' ? '#FEF2F2' : 'var(--bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', minWidth: '40px',
                      border: 'var(--clay-border)', boxShadow: 'var(--clay-shadow-sm)',
                    }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: item.action === 'danger' ? '#991B1B' : 'var(--dark)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>{item.desc}</div>
                    </div>
                    <button style={{
                      padding: '6px 16px', borderRadius: '50px',
                      border: 'var(--clay-border)',
                      background: item.action === 'danger' ? '#FEF2F2' : 'var(--bg)',
                      color: item.action === 'danger' ? '#991B1B' : 'var(--mid)',
                      fontFamily: 'Nunito, sans-serif', fontSize: '0.76rem', fontWeight: 700,
                      cursor: 'pointer', boxShadow: 'var(--clay-shadow-sm)',
                    }}>
                      {item.action === 'coming soon' ? '🔜 Soon' : item.action === 'danger' ? '🗑 Delete' : '✏️ Edit'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ position: 'sticky', top: '80px' }}>

          {/* Profile Info */}
          <div className="clay-sm" style={{ background: 'white', borderRadius: '18px', padding: '1.2rem', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.8rem' }}>
              👤 Profile Info
            </div>
            {[
              { label: 'Email',    val: user?.email    },
              { label: 'Phone',    val: user?.phone    },
              { label: 'College',  val: user?.college  },
              { label: 'Semester', val: user?.semester },
              { label: 'Year',     val: user?.year     },
              { label: 'Joined',   val: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : null },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: '1.5px solid #F0F1F8', fontSize: '0.76rem',
              }}>
                <span style={{ color: 'var(--muted)', fontWeight: 700 }}>{r.label}</span>
                <span style={{ color: 'var(--dark)', fontWeight: 700, maxWidth: '160px', textAlign: 'right', wordBreak: 'break-all' }}>{r.val}</span>
              </div>
            ))}

            {/* Bio */}
            {user?.bio && (
              <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--mid)', lineHeight: 1.6, fontWeight: 600 }}>
                {user.bio}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="clay-sm" style={{ background: 'white', borderRadius: '18px', padding: '1.2rem', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.8rem' }}>
              🔗 Quick Links
            </div>
            {[
              { icon: '🏠', label: 'Home Feed',     href: '/home'   },
              { icon: '📤', label: 'Upload Notes',  href: '/upload' },
              { icon: '🔖', label: 'My Bookmarks',  tab: 'bookmarks' },
              { icon: '❤️', label: 'Liked Notes',   tab: 'liked'    },
            ].map((item, i) => (
              item.href ? (
                <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 0', borderBottom: '1.5px solid #F0F1F8',
                    fontSize: '0.8rem', color: 'var(--mid)', fontWeight: 700,
                    cursor: 'pointer', transition: 'color 0.15s',
                  }}>
                    <span>{item.icon}</span>{item.label}
                    <span style={{ marginLeft: 'auto', color: 'var(--muted)' }}>→</span>
                  </div>
                </Link>
              ) : (
                <div key={i}
                  onClick={() => handleTabChange(item.tab)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 0', borderBottom: '1.5px solid #F0F1F8',
                    fontSize: '0.8rem', color: 'var(--mid)', fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>{item.icon}</span>{item.label}
                  <span style={{ marginLeft: 'auto', color: 'var(--muted)' }}>→</span>
                </div>
              )
            ))}
          </div>

          {/* Login Provider */}
          <div className="clay-sm" style={{ background: 'white', borderRadius: '18px', padding: '1.2rem' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.6rem' }}>
              🔐 Login Method
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>
                {user?.loginProvider === 'google' ? '🌐' : user?.loginProvider === 'phone' ? '📱' : '📧'}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--mid)', textTransform: 'capitalize' }}>
                {user?.loginProvider || 'Email'} Login
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}