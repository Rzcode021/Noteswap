'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import {
  getStats,
  getPending,
  getAllNotes,
  getAllUsers,
  approveNote,
  rejectNote,
  deleteUser,
    deleteNoteAdmin,
  disableUser,
  enableUser,
} from '../../services/admin.service'

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab]         = useState('dashboard')
  const [stats, setStats]                 = useState(null)
  const [pendingNotes, setPendingNotes]   = useState([])
  const [allNotes, setAllNotes]           = useState([])
  const [allUsers, setAllUsers]           = useState([])
  const [pageLoading, setPageLoading]     = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectModal, setRejectModal]     = useState(null)
  const [rejectReason, setRejectReason]   = useState('')
  const [filterStatus, setFilterStatus]   = useState('pending')
  const [previewNote, setPreviewNote]     = useState(null)

  // Auth check — admin only
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
    if (!authLoading && user && user.role !== 'admin') router.replace('/home')
  }, [user, authLoading])

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchDashboardData()
    }
  }, [user, authLoading])

  const fetchDashboardData = async () => {
    setPageLoading(true)
    try {
      const [statsRes, pendingRes] = await Promise.all([
        getStats(),
        getPending(),
      ])
      setStats(statsRes.data.data)
      setPendingNotes(pendingRes.data.data || [])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setPageLoading(false)
    }
  }

  const fetchAllNotes = async (status = 'pending') => {
    try {
      const res = await getAllNotes({ status, limit: 20 })
      setAllNotes(res.data.data || [])
    } catch (err) {
      console.error('Notes fetch error:', err)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const res = await getAllUsers({ limit: 20 })
      setAllUsers(res.data.data || [])
    } catch (err) {
      console.error('Users fetch error:', err)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'notes') fetchAllNotes(filterStatus)
    if (tab === 'users') fetchAllUsers()
  }

  const handleApprove = async (noteId) => {
    setActionLoading(noteId)
    try {
      await approveNote(noteId)
      setPendingNotes(prev => prev.filter(n => n._id !== noteId))
      setAllNotes(prev => prev.filter(n => n._id !== noteId))
      fetchDashboardData()
    } catch (err) {
      console.error('Approve error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setActionLoading(rejectModal)
    try {
      await rejectNote(rejectModal, rejectReason)
      setPendingNotes(prev => prev.filter(n => n._id !== rejectModal))
      setAllNotes(prev => prev.filter(n => n._id !== rejectModal))
      setRejectModal(null)
      setRejectReason('')
      fetchDashboardData()
    } catch (err) {
      console.error('Reject error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDisableUser = async (userId, isDisabled) => {
    setActionLoading(userId)
    try {
      if (isDisabled) await enableUser(userId)
      else await disableUser(userId)
      fetchAllUsers()
    } catch (err) {
      console.error('Disable user error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    setActionLoading(userId)
    try {
      await deleteUser(userId)
      fetchAllUsers()
    } catch (err) {
      console.error('Delete user error:', err)
    } finally {
      setActionLoading(null)
    }
  }

const handleDeleteNote = async (noteId) => {
  if (!confirm('Are you sure you want to delete this note? This cannot be undone.')) return
  setActionLoading(noteId)
  try {
    await deleteNoteAdmin(noteId)
    setPendingNotes(prev => prev.filter(n => n._id !== noteId))
    setAllNotes(prev => prev.filter(n => n._id !== noteId))
    setPreviewNote(null)
    fetchDashboardData()
  } catch (err) {
    console.error('Delete note error:', err)
  } finally {
    setActionLoading(null)
  }
}

  const handlePreview = (note) => setPreviewNote(note)

  const getPreviewUrl = (note) => {
  if (!note?.fileUrl) return null
  if (note.fileType === 'image') return note.fileUrl
  return `https://docs.google.com/viewer?url=${encodeURIComponent(note.fileUrl)}&embedded=true`
}
const handleDownload = async (note) => {
  try {
    const url      = note.fileUrl
    const filename = note.originalName || `${note.title}.${note.fileType}`

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      window.open(url, '_blank')
      return
    }

    const response = await fetch(url)
    const blob     = await response.blob()
    const blobUrl  = window.URL.createObjectURL(blob)
    const link     = document.createElement('a')
    link.href      = blobUrl
    link.download  = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (err) {
    console.error('Download error:', err)
    window.open(note.fileUrl, '_blank')
  }
}
// ✅ New — get proper download URL


  const getFileTypeBg = (type) => {
    if (type === 'pdf')   return { bg: 'var(--orange-light)', color: 'var(--orange-dark)' }
    if (type === 'image') return { bg: 'var(--pink-light)',   color: 'var(--pink)'        }
    if (type === 'docx')  return { bg: 'var(--teal-light)',   color: 'var(--teal)'        }
    if (type === 'pptx')  return { bg: 'var(--green-light)',  color: 'var(--green)'       }
    return { bg: 'var(--bg)', color: 'var(--mid)' }
  }

  if (authLoading || (!authLoading && !user)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Loading...</p>
      </div>
    )
  }

  if (user?.role !== 'admin') return null

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .admin-main-wrapper {
          display: flex;
          flex: 1;
        }
        .admin-sidebar {
          width: 220px;
          min-height: 100vh;
          background: #1a1f36;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .mobile-admin-header {
          display: none;
        }
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .admin-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.4rem;
        }
        .admin-main-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }
        @media (max-width: 900px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .admin-main-wrapper {
            flex-direction: column;
          }
          .admin-main-content {
            padding: 1rem;
          }
          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0,0,0,0.5);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .mobile-admin-header {
            display: flex;
            align-items: center;
            background: white;
            padding: 0.8rem 1.2rem;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .admin-header-row {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
        }
        @media (max-width: 600px) {
          .admin-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      {/* Mobile Top Header */}
      <div className="mobile-admin-header nav-glass">
        <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', marginRight: '1rem', color: 'var(--dark)' }}>☰</button>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: 'var(--dark)' }}>Admin Panel</div>
      </div>

      <div className="admin-main-wrapper">
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999,
            opacity: isSidebarOpen ? 1 : 0, pointerEvents: isSidebarOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* ===== SIDEBAR ===== */}
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '1.5rem 1.2rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', boxShadow: '0 3px 0 var(--orange-dark)' }}>📚</div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 900, color: 'white' }}>
                  Note<span style={{ color: 'var(--orange)' }}>Swap</span>
                </div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Panel</div>
              </div>
            </Link>
            <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--muted)', cursor: 'pointer', paddingRight: '1rem', display: isSidebarOpen && typeof window !== 'undefined' && window.innerWidth <= 768 ? 'block' : 'none' }}>✕</button>
          </div>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }} />

        {/* Nav Items */}
        <nav style={{ padding: '1rem 0.8rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '0.5rem 0.6rem', marginTop: '0.5rem' }}>Overview</div>

          {[
            { icon: '📊', label: 'Dashboard',        tab: 'dashboard' },
            { icon: '⏳', label: 'Pending Approvals', tab: 'pending',  count: pendingNotes.length },
            { icon: '📚', label: 'All Notes',         tab: 'notes'    },
            { icon: '👥', label: 'All Users',         tab: 'users'    },
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => { handleTabChange(item.tab); setIsSidebarOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '12px', border: 'none',
                cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                fontSize: '0.82rem', fontWeight: 700, width: '100%', textAlign: 'left',
                transition: 'all 0.15s',
                background: activeTab === item.tab ? 'var(--orange)' : 'transparent',
                color: activeTab === item.tab ? 'white' : 'rgba(255,255,255,0.55)',
                boxShadow: activeTab === item.tab ? '0 3px 0 var(--orange-dark)' : 'none',
              }}
            >
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count > 0 && (
                <span style={{
                  background: 'rgba(255,255,255,0.2)', borderRadius: '20px',
                  padding: '2px 8px', fontSize: '0.65rem', fontWeight: 900, color: 'white',
                }}>{item.count}</span>
              )}
            </button>
          ))}

          <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '0.5rem 0.6rem', marginTop: '0.8rem' }}>Quick Actions</div>

          <Link href="/home" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '12px',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              color: 'rgba(255,255,255,0.55)',
            }}>
              🏠 Back to App
            </div>
          </Link>
        </nav>

        {/* Admin info */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: 'white', minWidth: '32px' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'white' }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Administrator</div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="admin-main-content">

        {/* ===== DASHBOARD TAB ===== */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
                Welcome back, {user?.name?.split(' ')[0]}! Here's what's happening on NoteSwap.
              </p>
            </div>

            {pageLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" />
              </div>
            ) : (
              <>
                {/* Stats Row */}
                <div className="admin-stats-grid">
                  {[
                    { label: 'Pending',    val: stats?.pendingNotes   || pendingNotes.length || 0, icon: '⏳', color: 'var(--orange)', bg: 'var(--orange-light)' },
                    { label: 'Live Notes', val: stats?.approvedNotes  || 0, icon: '✅', color: 'var(--green)',  bg: 'var(--green-light)'  },
                    { label: 'Users',      val: stats?.totalUsers     || 0, icon: '👥', color: 'var(--teal)',   bg: 'var(--teal-light)'   },
                    { label: 'Downloads',  val: stats?.totalDownloads || 0, icon: '⬇️', color: 'var(--pink)',   bg: 'var(--pink-light)'   },
                  ].map(s => (
                    <div key={s.label} className="clay-sm" style={{ background: 'white', borderRadius: '16px', padding: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>{s.label}</div>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{s.icon}</div>
                      </div>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 900, color: 'var(--dark)' }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Pending Notes Section */}
                <div className="clay-sm hover-float" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
                  <div className="admin-header-row" style={{ borderBottom: '2px solid var(--bg)' }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.92rem', fontWeight: 900, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Pending Approvals
                      {pendingNotes.length > 0 && (
                        <span style={{ background: 'var(--orange-light)', color: 'var(--orange-dark)', fontSize: '0.65rem', fontWeight: 900, padding: '3px 10px', borderRadius: '20px' }}>
                          {pendingNotes.length} waiting
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleTabChange('pending')}
                      style={{ background: 'none', border: 'none', color: 'var(--orange)', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                    >View all →</button>
                  </div>

                  {pendingNotes.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🎉</div>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>All caught up!</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>No pending notes to review.</div>
                    </div>
                  ) : (
                    pendingNotes.slice(0, 5).map(note => (
                      <PendingNoteRow
                        key={note._id}
                        note={note}
                        actionLoading={actionLoading}
                        onApprove={handleApprove}
                        onReject={(id) => { setRejectModal(id); setRejectReason('') }}
                        onPreview={handlePreview}
                        getFileTypeBg={getFileTypeBg}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== PENDING TAB ===== */}
        {activeTab === 'pending' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>
                Pending Approvals
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
                Review and approve or reject submitted notes.
              </p>
            </div>

            <div className="clay-sm hover-float" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
            {/* ✅ Simple header — no filters needed */}
<div className="admin-header-row" style={{ borderBottom: '2px solid var(--bg)' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--mid)' }}>
      Showing all pending notes
    </span>
    {pendingNotes.length > 0 && (
      <span style={{
        background: 'var(--orange-light)', color: 'var(--orange-dark)',
        fontSize: '0.65rem', fontWeight: 900,
        padding: '3px 10px', borderRadius: '20px',
      }}>{pendingNotes.length} waiting</span>
    )}
  </div>
  <button
    onClick={fetchDashboardData}
    style={{
      background: 'none', border: 'none',
      color: 'var(--orange)', fontSize: '0.78rem',
      fontWeight: 800, cursor: 'pointer',
    }}
  >🔄 Refresh</button>
</div>

              {pendingNotes.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>📭</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)' }}>No notes found</div>
                </div>
              ) : (
                pendingNotes.map(note => (
                  <PendingNoteRow
                    key={note._id}
                    note={note}
                    actionLoading={actionLoading}
                    onApprove={handleApprove}
                    onReject={(id) => { setRejectModal(id); setRejectReason('') }}
                    onPreview={handlePreview}
                    getFileTypeBg={getFileTypeBg}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ===== NOTES TAB ===== */}
        {activeTab === 'notes' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>
                All Notes
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
                Manage all notes on the platform.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {['pending', 'approved', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => { setFilterStatus(status); fetchAllNotes(status) }}
                  style={{
                    padding: '7px 16px', borderRadius: '50px',
                    border: 'var(--clay-border)',
                    fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', fontWeight: 800,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: filterStatus === status ? 'var(--orange)' : 'white',
                    color: filterStatus === status ? 'white' : 'var(--mid)',
                    boxShadow: filterStatus === status ? '0 3px 0 var(--orange-dark)' : 'var(--clay-shadow-sm)',
                  }}
                >{status.charAt(0).toUpperCase() + status.slice(1)}</button>
              ))}
            </div>

            <div className="clay-sm" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
              {allNotes.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>📭</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)' }}>No notes found</div>
                </div>
              ) : (
                allNotes.map(note => (
                  <PendingNoteRow
                    key={note._id}
                    note={note}
                    actionLoading={actionLoading}
                    onApprove={handleApprove}
                    onReject={(id) => { setRejectModal(id); setRejectReason('') }}
                    onPreview={handlePreview}
                    onDelete={handleDeleteNote} 
                    getFileTypeBg={getFileTypeBg}
                    showStatus
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ===== USERS TAB ===== */}
        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>
                All Users
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
                Manage all registered users.
              </p>
            </div>

            <div className="clay-sm" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
              {allUsers.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>👥</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)' }}>No users found</div>
                </div>
              ) : (
                allUsers.map(u => (
                  <div key={u._id} style={{
                    padding: '1rem 1.4rem', borderBottom: '2px solid var(--bg)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: 'var(--orange-light)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 800, color: 'var(--orange-dark)',
                      minWidth: '40px', border: 'var(--clay-border)',
                    }}>
                      {u.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--dark)' }}>{u.name}</div>
                        {u.role === 'admin' && (
                          <span style={{ background: 'var(--dark)', color: 'white', fontSize: '0.6rem', fontWeight: 900, padding: '2px 8px', borderRadius: '20px' }}>ADMIN</span>
                        )}
                        {u.isDisabled && (
                          <span style={{ background: '#FEF2F2', color: '#991B1B', fontSize: '0.6rem', fontWeight: 900, padding: '2px 8px', borderRadius: '20px' }}>DISABLED</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span>{u.email || u.phone || 'No contact'}</span>
                        <span>📚 {u.totalUploads || 0} uploads</span>
                        <span>🎓 {u.college || 'No college'}</span>
                      </div>
                    </div>
                    {u.role !== 'admin' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleDisableUser(u._id, u.isDisabled)}
                          disabled={actionLoading === u._id}
                          style={{
                            padding: '6px 14px', borderRadius: '50px', border: 'none',
                            fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', fontWeight: 800,
                            cursor: 'pointer',
                            background: u.isDisabled ? 'var(--green-light)' : 'var(--orange-light)',
                            color: u.isDisabled ? 'var(--green)' : 'var(--orange-dark)',
                          }}
                        >
                          {actionLoading === u._id ? '...' : u.isDisabled ? '✓ Enable' : '⊘ Disable'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={actionLoading === u._id}
                          style={{
                            padding: '6px 14px', borderRadius: '50px', border: 'none',
                            fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', fontWeight: 800,
                            cursor: 'pointer', background: '#FEF2F2', color: '#991B1B',
                          }}
                        >🗑 Delete</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
      </div>
      {/* End admin-main-wrapper */}
      
      {/* ===== PREVIEW MODAL ===== */}
      {previewNote && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: 'white', borderRadius: '20px',
            width: '90%', maxWidth: '900px', height: '85vh',
            display: 'flex', flexDirection: 'column',
            border: 'var(--clay-border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1rem 1.4rem', borderBottom: '2px solid var(--bg)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '2px' }}>
                  {previewNote.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span>{previewNote.subject?.name}</span>
                  <span>·</span>
                  <span>{previewNote.unit}</span>
                  <span>·</span>
                  <span style={{ textTransform: 'uppercase' }}>{previewNote.fileType}</span>
                  <span>·</span>
                  <span>by {previewNote.uploadedBy?.name}</span>
                </div>
              </div>
             {/* Modal Header buttons */}
<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

  {/* ✅ Open in new tab — opens Google Docs viewer in new tab */}
  <a
    href={getPreviewUrl(previewNote)}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      padding: '7px 16px', borderRadius: '50px',
      background: 'var(--bg)', color: 'var(--mid)',
      fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', fontWeight: 800,
      textDecoration: 'none', border: 'var(--clay-border)',
      boxShadow: 'var(--clay-shadow-sm)',
    }}
  >↗ Open in tab</a>

  {/* ✅ Download — uses proper Cloudinary download URL */}
  <button
  onClick={() => handleDownload(previewNote)}
  style={{
    padding: '7px 16px', borderRadius: '50px',
    background: 'var(--orange-light)', color: 'var(--orange-dark)',
    fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', fontWeight: 800,
    border: 'var(--clay-border)', cursor: 'pointer',
    boxShadow: '0 2px 0 rgba(180,100,0,0.1)',
  }}
>⬇ Download</button>

  {/* Close button */}
  <button
    onClick={() => setPreviewNote(null)}
    style={{
      width: '32px', height: '32px', borderRadius: '50%',
      border: 'var(--clay-border)', background: 'var(--bg)',
      cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700,
      color: 'var(--mid)', boxShadow: 'var(--clay-shadow-sm)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
  >×</button>
</div>
            </div>

            {/* Preview Content */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              {previewNote.fileType === 'image' ? (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#f8f8f8', padding: '1rem',
                }}>
                  <img
                    src={previewNote.fileUrl}
                    alt={previewNote.title}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  />
                </div>
              ) : (
                <iframe
                  src={getPreviewUrl(previewNote)}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={previewNote.title}
                />
              )}
            </div>

            {/* Modal Footer — approve/reject from preview */}
            {previewNote.status === 'pending' && (
              <div style={{
                padding: '0.8rem 1.4rem', borderTop: '2px solid var(--bg)',
                display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0,
              }}>
                <button
                  onClick={() => { handleApprove(previewNote._id); setPreviewNote(null) }}
                  style={{
                    padding: '9px 24px', borderRadius: '50px', border: 'none',
                    background: 'var(--green-light)', color: '#065F46',
                    fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 800,
                    cursor: 'pointer', boxShadow: '0 3px 0 #A7F3D0',
                  }}
                >✓ Approve Note</button>
                <button
                  onClick={() => { setRejectModal(previewNote._id); setRejectReason(''); setPreviewNote(null) }}
                  style={{
                    padding: '9px 24px', borderRadius: '50px', border: 'none',
                    background: '#FEF2F2', color: '#991B1B',
                    fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 800,
                    cursor: 'pointer', boxShadow: '0 3px 0 #FECACA',
                  }}
                >✗ Reject Note</button>
              </div>
            )}
             {/* ✅ Show delete for approved notes */}
  {previewNote.status === 'approved' && (
    <button
      onClick={() => { handleDeleteNote(previewNote._id); setPreviewNote(null) }}
      style={{
        padding: '9px 24px', borderRadius: '50px', border: 'none',
        background: '#FEF2F2', color: '#991B1B',
        fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 800,
        cursor: 'pointer', boxShadow: '0 3px 0 #FECACA',
      }}
    >🗑 Delete Note</button>
  )}
          </div>
        </div>
      )}

      {/* ===== REJECT MODAL ===== */}
      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1001, padding: '1rem',
        }}>
          <div className="clay" style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem' }}>
              Reject Note
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.2rem', fontWeight: 600 }}>
              Please provide a reason so the student can improve their submission.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. File is blurry, incorrect subject, plagiarised content..."
              className="input-clay"
              style={{ resize: 'vertical', minHeight: '100px', lineHeight: 1.6, marginBottom: '1.2rem' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                style={{
                  flex: 1, padding: '11px', borderRadius: '50px', border: 'none',
                  background: '#EF4444', color: 'white',
                  fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', fontWeight: 800,
                  cursor: 'pointer', boxShadow: '0 4px 0 #DC2626',
                }}
              >
                {actionLoading ? '...' : '✗ Confirm Reject'}
              </button>
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                style={{
                  flex: 1, padding: '11px', borderRadius: '50px',
                  border: 'var(--clay-border)', background: 'white',
                  fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', fontWeight: 800,
                  cursor: 'pointer', boxShadow: 'var(--clay-shadow-sm)', color: 'var(--mid)',
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== PENDING NOTE ROW COMPONENT =====
function PendingNoteRow({ note, actionLoading, onApprove, onReject, onPreview,onDelete, getFileTypeBg, showStatus }) {
  const ft = getFileTypeBg(note.fileType)

  return (
    <div style={{
      padding: '1rem 1.4rem', borderBottom: '2px solid var(--bg)',
      display: 'flex', gap: '12px', alignItems: 'flex-start',
    }}>
      {/* File type badge */}
      <div style={{
        width: '44px', height: '50px', borderRadius: '10px',
        background: ft.bg, color: ft.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.65rem', fontWeight: 900, minWidth: '44px',
        border: 'var(--clay-border)', boxShadow: 'var(--clay-shadow-sm)',
        textTransform: 'uppercase',
      }}>
        {note.fileType || 'PDF'}
      </div>

      {/* Note info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '4px' }}>
          {note.title}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
          {[note.subject?.name, note.unit, note.semester, note.college].filter(Boolean).map((chip, i) => (
            <span key={i} style={{
              fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: '6px', background: 'var(--bg)', color: 'var(--mid)',
            }}>{chip}</span>
          ))}
          {showStatus && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 900, padding: '2px 10px', borderRadius: '20px',
              background: note.status === 'approved' ? 'var(--green-light)' : note.status === 'rejected' ? '#FEF2F2' : 'var(--orange-light)',
              color: note.status === 'approved' ? 'var(--green)' : note.status === 'rejected' ? '#991B1B' : 'var(--orange-dark)',
            }}>{note.status}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 800, color: 'white', minWidth: '20px' }}>
            {note.uploadedBy?.name?.charAt(0) || 'U'}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>
            {note.uploadedBy?.name || 'Unknown'} · {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end', minWidth: '120px' }}>
        <button
          onClick={() => onPreview(note)}
          style={{
            padding: '5px 12px', borderRadius: '50px',
            border: 'var(--clay-border)', background: 'white',
            fontFamily: 'Nunito, sans-serif', fontSize: '0.72rem', fontWeight: 700,
            cursor: 'pointer', boxShadow: 'var(--clay-shadow-sm)',
            color: 'var(--mid)', width: '100%',
          }}
        >👁 Preview</button>

        {note.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(note._id)}
              disabled={actionLoading === note._id}
              style={{
                padding: '6px 14px', borderRadius: '50px', border: 'none',
                background: 'var(--green-light)', color: '#065F46',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.76rem', fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 2px 0 #A7F3D0', width: '100%',
              }}
            >
              {actionLoading === note._id ? '...' : '✓ Approve'}
            </button>
            <button
              onClick={() => onReject(note._id)}
              disabled={actionLoading === note._id}
              style={{
                padding: '6px 14px', borderRadius: '50px', border: 'none',
                background: '#FEF2F2', color: '#991B1B',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.76rem', fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 2px 0 #FECACA', width: '100%',
              }}
            >✗ Reject</button>
          </>
        )}
        {/* ✅ Delete — only for approved notes */}
  {note.status === 'approved' && (
    <button
      onClick={() => onDelete(note._id)}
      disabled={actionLoading === note._id}
      style={{
        padding: '6px 14px', borderRadius: '50px', border: 'none',
        background: '#FEF2F2', color: '#991B1B',
        fontFamily: 'Nunito, sans-serif', fontSize: '0.76rem', fontWeight: 800,
        cursor: 'pointer', boxShadow: '0 2px 0 #FECACA', width: '100%',
      }}
    >
      {actionLoading === note._id ? '...' : '🗑 Delete'}
    </button>
  )}
      </div>
    </div>
  )
}