'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { getNoteById, likeNote, downloadNote } from '../../../services/note.service'
import { toggleBookmark } from '../../../services/user.service'
import { getComments, addComment, deleteComment, likeComment } from '../../../services/comment.service'

export default function NoteDetailPage({ params }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { id } = use(params)

  const [note, setNote] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [actionLoading, setActionLoading] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading])

  useEffect(() => {
    if (!authLoading && user && id) {
      fetchNote()
      fetchComments()
    }
  }, [user, authLoading, id])

  const fetchNote = async () => {
    setLoading(true)
    try {
      const res = await getNoteById(id)
      const n = res.data.data
      setNote(n)
      setLikesCount(n.likesCount || 0)
      setLiked(n.likes?.includes(user?._id) || false)
      setBookmarked(user?.bookmarks?.includes(n._id) || false)
    } catch (err) {
      console.error('Fetch note error:', err)
      setError('Note not found or not available.')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await getComments(id)
      setComments(res.data.data || [])
    } catch (err) {
      console.error('Fetch comments error:', err)
    }
  }

  const handleLike = async () => {
    if (actionLoading) return

    setActionLoading('like')

    // ✅ Optimistic UI
    const prevLiked = liked
    const prevCount = likesCount

    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1)

    try {
      await likeNote(id)
    } catch (err) {
      console.error('Like error:', err)

      // ❗ rollback
      setLiked(prevLiked)
      setLikesCount(prevCount)
    } finally {
      setActionLoading('')
    }
  }

  const handleBookmark = async () => {
    if (actionLoading) return
    setActionLoading('bookmark')
    try {
      await toggleBookmark(id)
      setBookmarked(prev => !prev)
    } catch (err) {
      console.error('Bookmark error:', err)
    } finally {
      setActionLoading('')
    }
  }

  const handleDownload = async () => {
  if (actionLoading) return
  setActionLoading('download')
  try {
    const res = await downloadNote(id)
    const fileUrl  = res.data.fileUrl
    const filename = res.data.originalName || `${note.title}.${note.fileType}`

    // ✅ For mobile — open directly in new tab with proper URL
    // Mobile browsers handle downloads better via direct navigation
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      window.open(fileUrl, '_blank')
      return
    }

    // ✅ For desktop — use fetch + blob for clean filename
    try {
      const response = await fetch(fileUrl)
      const blob     = await response.blob()
      const blobUrl  = window.URL.createObjectURL(blob)
      const link     = document.createElement('a')
      link.href      = blobUrl
      link.download  = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      // Fallback if fetch fails
      window.open(fileUrl, '_blank')
    }

  } catch (err) {
    console.error('Download error:', err)
    if (note?.fileUrl) window.open(note.fileUrl, '_blank')
  } finally {
    setActionLoading('')
  }
}

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const tempComment = {
      _id: Date.now(),
      text: commentText,
      user: { name: user.name, _id: user._id },
      likesCount: 0,
      createdAt: new Date()
    }

    // ✅ instant UI update
    setComments(prev => [tempComment, ...prev])
    setCommentText('')
    setCommentLoading(true)

    try {
      const res = await addComment(id, tempComment.text)

      // replace temp with real
      setComments(prev =>
        prev.map(c => c._id === tempComment._id ? res.data.data : c)
      )

    } catch (err) {
      console.error('Add comment error:', err)

      // rollback
      setComments(prev => prev.filter(c => c._id !== tempComment._id))
    } finally {
      setCommentLoading(false)
    }
  }


  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId)
      setComments(prev => prev.filter(c => c._id !== commentId))
    } catch (err) {
      console.error('Delete comment error:', err)
    }
  }

  const handleLikeComment = async (commentId) => {

    // ✅ instant UI update
    setComments(prev =>
      prev.map(c =>
        c._id === commentId
          ? { ...c, likesCount: (c.likesCount || 0) + 1 }
          : c
      )
    )

    try {
      await likeComment(commentId)
    } catch (err) {
      console.error('Like comment error:', err)

      // rollback
      setComments(prev =>
        prev.map(c =>
          c._id === commentId
            ? { ...c, likesCount: (c.likesCount || 1) - 1 }
            : c
        )
      )
    }
  }

  const getFileIcon = (type) => {
    if (type === 'pdf') return '📕'
    if (type === 'image') return '🖼️'
    if (type === 'docx') return '📘'
    if (type === 'pptx') return '📊'
    return '📄'
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const colors = ['var(--orange)', 'var(--teal)', 'var(--green)', 'var(--pink)']
  const bgs = ['var(--orange-light)', 'var(--teal-light)', 'var(--green-light)', 'var(--pink-light)']

  if (authLoading || (!authLoading && !user)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Loading note...</p>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '4rem' }}>📭</div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)' }}>Note not found</h2>
        <p style={{ color: 'var(--muted)', fontWeight: 600 }}>This note may have been removed or is not available.</p>
        <Link href="/home">
          <button className="btn-orange" style={{ padding: '10px 24px' }}>← Back to Home</button>
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ===== RESPONSIVE STYLES ===== */}
      <style>{`
        .detail-nav {
          background: white; border-bottom: 2px solid rgba(255,255,255,0.8);
          padding: 0 2rem; display: flex; align-items: center;
          justify-content: space-between; height: 60px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          position: sticky; top: 0; z-index: 100;
        }
        .detail-breadcrumb {
          display: flex; align-items: center; gap: 6px; 
          font-size: 0.82rem; color: var(--muted); font-weight: 700;
        }
        .detail-wrapper {
          max-width: 1100px; margin: 0 auto; padding: 2rem; 
          display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; align-items: start;
        }
        .detail-sidebar {
          position: sticky; top: 80px;
        }
        .uploader-layout {
          display: flex; align-items: center; gap: 12px;
          background: var(--orange-light); border-radius: 14px;
          padding: 1rem 1.2rem; margin-bottom: 1.2rem;
          border: 1.5px solid rgba(245,166,35,0.2);
        }
        .action-grid {
          display: flex; gap: 8px; margin-bottom: 1.5rem; flex-wrap: wrap;
        }
        .preview-inner {
          background: white; border-radius: 16px;
          padding: 3rem; text-align: center;
          border: var(--clay-border); box-shadow: var(--clay-shadow-sm);
        }
        .preview-actions {
          display: flex; gap: 10px; justify-content: center;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .detail-wrapper {
            grid-template-columns: 1fr;
            padding: 1.5rem 1rem;
          }
          .detail-sidebar {
            position: static;
          }
          .detail-breadcrumb {
            display: none; 
          }
        }

        @media (max-width: 600px) {
          .detail-nav {
            padding: 0 1rem;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .uploader-layout {
            flex-direction: column;
            align-items: flex-start;
          }
          .action-grid {
            flex-direction: column;
          }
          .action-grid > * {
            width: 100%;
            justify-content: center;
          }
          .preview-inner {
            padding: 1.5rem;
          }
          .preview-actions {
            flex-direction: column;
          }
          .preview-actions > * {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="detail-nav">
        <Link href="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'var(--orange)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.85rem',
            border: 'var(--clay-border)', boxShadow: '0 3px 0 var(--orange-dark)',
          }}>📚</div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: 'var(--dark)' }}>
            Note<span style={{ color: 'var(--orange)' }}>Swap</span>
          </span>
        </Link>

        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <Link href="/home" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Home</Link>
          <span>›</span>
          <span style={{ color: 'var(--mid)' }}>{note.subject?.name}</span>
          <span>›</span>
          <span style={{ color: 'var(--dark)' }}
          >{note.title.length > 30 ? note.title.slice(0, 30) + '...' : note.title}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/upload">
            <button className="btn-orange" style={{ padding: '8px 18px', fontSize: '0.84rem' }}>
              + Upload<span style={{ display: 'inline-block', marginLeft: '4px' }} className="hide-on-mobile">Notes</span>
            </button>
          </Link>
          <Link href="/profile">
            <div className="clay-circle" style={{
              width: '34px', height: '34px', background: 'var(--orange-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 800, color: 'var(--orange-dark)', cursor: 'pointer',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </Link>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="detail-wrapper">

        {/* LEFT — Main Content */}
        <div>

          {/* Tags Row */}
          <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[
              { label: note.subject?.name, bg: 'var(--orange-light)', color: 'var(--orange-dark)' },
              { label: note.unit, bg: 'var(--bg)', color: 'var(--mid)' },
              { label: note.semester, bg: 'var(--bg)', color: 'var(--mid)' },
              { label: '✅ Verified', bg: 'var(--green-light)', color: 'var(--green)' },
              { label: note.fileType?.toUpperCase(), bg: 'var(--bg)', color: 'var(--mid)' },
            ].filter(t => t.label).map((t, i) => (
              <span key={i} style={{
                fontSize: '0.72rem', fontWeight: 900, padding: '5px 14px',
                borderRadius: '50px', background: t.bg, color: t.color,
                border: 'var(--clay-border)', boxShadow: 'var(--clay-shadow-sm)',
              }}>{t.label}</span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem',
            fontWeight: 900, color: 'var(--dark)', lineHeight: 1.2,
            marginBottom: '0.8rem', letterSpacing: '-0.5px',
          }}>{note.title}</h1>

          {/* Description */}
          {note.description && (
            <p style={{
              fontSize: '0.92rem', color: 'var(--mid)',
              lineHeight: 1.75, fontWeight: 600, marginBottom: '1rem',
            }}>{note.description}</p>
          )}

          {/* Meta Row */}
          <div style={{
            display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
            padding: '1rem 0', borderTop: '2px solid #F0F1F8',
            borderBottom: '2px solid #F0F1F8', marginBottom: '1.2rem',
          }}>
            {[
              { icon: '🎓', label: note.college },
              { icon: '📅', label: note.year },
              { icon: '📄', label: formatFileSize(note.fileSize) },
              { icon: '👁', label: `${note.viewsCount || 0} views` },
              { icon: '📅', label: new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
            ].filter(m => m.label).map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--mid)', fontWeight: 700 }}>
                <span>{m.icon}</span><span>{m.label}</span>
              </div>
            ))}
          </div>

          {/* Uploader Card */}
          <div className="uploader-layout">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'var(--orange)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: 'white',
                border: 'var(--clay-border)', boxShadow: '0 3px 0 var(--orange-dark)', minWidth: '44px',
              }}>
                {note.uploadedBy?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, color: 'var(--orange-dark)' }}>
                  {note.uploadedBy?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--mid)', fontWeight: 600 }}>
                  {note.uploadedBy?.college} · {note.uploadedBy?.semester}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {[
                { val: note.uploadedBy?.totalUploads || 0, label: 'Notes' },
                { val: note.uploadedBy?.totalDownloads || 0, label: 'Downloads' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 900, color: 'var(--orange-dark)' }}>{s.val}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--mid)', fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-grid">
            <button
              onClick={handleDownload}
              disabled={actionLoading === 'download'}
              className="btn-orange"
              style={{ padding: '11px 24px' }}
            >
              {actionLoading === 'download' ? '⏳ Downloading...' : '⬇ Download Notes'}
            </button>

            <button
              onClick={handleLike}
              disabled={actionLoading === 'like'}
              style={{
                padding: '10px 18px', borderRadius: '50px',
                border: 'var(--clay-border)',
                background: liked ? 'var(--pink-light)' : 'white',
                color: liked ? 'var(--pink)' : 'var(--mid)',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer', boxShadow: 'var(--clay-shadow-sm)',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s',
              }}
            >❤️ {likesCount}</button>

            <button
              onClick={handleBookmark}
              disabled={actionLoading === 'bookmark'}
              style={{
                padding: '10px 18px', borderRadius: '50px',
                border: 'var(--clay-border)',
                background: bookmarked ? 'var(--orange-light)' : 'white',
                color: bookmarked ? 'var(--orange-dark)' : 'var(--mid)',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer', boxShadow: 'var(--clay-shadow-sm)',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s',
              }}
            >{bookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}</button>
            <a
              href={`https://docs.google.com/viewer?url=${encodeURIComponent(note.fileUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '10px 18px', borderRadius: '50px',
                border: 'var(--clay-border)', background: 'white',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer', boxShadow: 'var(--clay-shadow-sm)',
                color: 'var(--mid)', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >👁 Preview</a>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('Link copied!')
              }}
              style={{
                padding: '10px 18px', borderRadius: '50px',
                border: 'var(--clay-border)', background: 'white',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer', boxShadow: 'var(--clay-shadow-sm)',
                color: 'var(--mid)', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >↗ Share</button>
          </div>

          {/* File Preview Card */}
          <div className="clay-sm" style={{ background: 'white', borderRadius: '18px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{
              padding: '0.9rem 1.4rem', borderBottom: '2px solid var(--bg)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900, color: 'var(--dark)' }}>
                📄 File Preview
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--bg)' }}>
              {note.fileType === 'image' ? (
                <img
                  src={note.fileUrl}
                  alt={note.title}
                  style={{ width: '100%', borderRadius: '12px', border: 'var(--clay-border)' }}
                />
              ) : (
                <div className="preview-inner">
                  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                    {getFileIcon(note.fileType)}
                  </div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>
                    {note.originalName || note.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '1.5rem' }}>
                    {note.fileType?.toUpperCase()} · {formatFileSize(note.fileSize)}
                  </div>
                  <div className="preview-actions">
                    <button
                      onClick={handleDownload}
                      className="btn-orange"
                      style={{ padding: '10px 24px' }}
                    >⬇ Download to view</button>
                    <a
                      href={`https://docs.google.com/viewer?url=${encodeURIComponent(note.fileUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 20px', borderRadius: '50px',
                        border: 'var(--clay-border)', background: 'white',
                        fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                        cursor: 'pointer', boxShadow: 'var(--clay-shadow-sm)',
                        color: 'var(--mid)', textDecoration: 'none',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                      }}
                    >👁 Preview online</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="clay-sm" style={{ background: 'white', borderRadius: '18px', overflow: 'hidden' }}>
            <div style={{
              padding: '0.9rem 1.4rem', borderBottom: '2px solid var(--bg)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900, color: 'var(--dark)' }}>
                💬 Comments <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 600 }}>{comments.length}</span>
              </div>
            </div>

            {/* Comment Input */}
            <div style={{ padding: '0.9rem 1.4rem', borderBottom: '2px solid var(--bg)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--orange)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'white',
                minWidth: '32px', border: 'var(--clay-border)', boxShadow: '0 2px 0 var(--orange-dark)',
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <form onSubmit={handleAddComment} style={{ flex: 1, display: 'flex', gap: '8px' }}>
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="input-clay"
                  style={{ flex: 1, borderRadius: '50px', padding: '9px 16px' }}
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    border: 'none', background: commentText.trim() ? 'var(--orange)' : 'var(--bg)',
                    cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', boxShadow: commentText.trim() ? '0 3px 0 var(--orange-dark)' : 'none',
                    transition: 'all 0.2s', color: 'white',
                  }}
                >→</button>
              </form>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
                  No comments yet. Be the first to comment!
                </div>
              </div>
            ) : (
              comments.map(c => (
                <div key={c._id} style={{
                  padding: '0.9rem 1.4rem', borderBottom: '2px solid var(--bg)',
                  display: 'flex', gap: '10px',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--teal)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'white',
                    minWidth: '32px', border: 'var(--clay-border)', boxShadow: '0 2px 0 rgba(0,0,0,0.08)',
                  }}>
                    {c.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--dark)' }}>
                        {c.user?.name || 'Student'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 600 }}>
                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--mid)', lineHeight: 1.6, fontWeight: 600, marginBottom: '6px' }}>
                      {c.text}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleLikeComment(c._id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '3px', padding: 0,
                        }}
                      >❤️ {c.likesCount || 0}</button>
                      {c.user?._id === user?._id && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, padding: 0,
                          }}
                        >🗑 Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT — Sidebar */}
        <div className="detail-sidebar">

          {/* Note Details Card */}
          <div className="clay-sm" style={{ background: 'white', borderRadius: '18px', padding: '1.2rem', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.8rem' }}>
              📋 Note Details
            </div>
            {[
              { label: 'Subject', val: note.subject?.name },
              { label: 'Unit', val: note.unit },
              { label: 'Semester', val: note.semester },
              { label: 'Year', val: note.year },
              { label: 'College', val: note.college },
              { label: 'Type', val: note.fileType?.toUpperCase() },
              { label: 'Size', val: formatFileSize(note.fileSize) },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: '1.5px solid #F0F1F8', fontSize: '0.78rem',
              }}>
                <span style={{ color: 'var(--muted)', fontWeight: 700 }}>{r.label}</span>
                <span style={{ color: 'var(--dark)', fontWeight: 700 }}>{r.val}</span>
              </div>
            ))}
          </div>

          {/* Stats Card */}
          <div className="clay-sm" style={{ background: 'white', borderRadius: '18px', padding: '1.2rem', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.8rem' }}>
              📊 Note Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { val: note.viewsCount || 0, label: 'Views', bg: 'var(--orange-light)', color: 'var(--orange-dark)' },
                { val: note.downloadsCount || 0, label: 'Downloads', bg: 'var(--green-light)', color: 'var(--green)' },
                { val: likesCount, label: 'Likes', bg: 'var(--pink-light)', color: 'var(--pink)' },
                { val: comments.length, label: 'Comments', bg: 'var(--teal-light)', color: 'var(--teal)' },
              ].map(s => (
                <div key={s.label} style={{
                  borderRadius: '10px', padding: '0.8rem', textAlign: 'center',
                  background: s.bg,
                }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: s.color }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: s.color, marginTop: '1px' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div className="clay-sm" style={{ background: 'white', borderRadius: '18px', padding: '1.2rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.8rem' }}>
                🏷️ Tags
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {note.tags.map((tag, i) => (
                  <span key={i} style={{
                    fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px',
                    borderRadius: '50px', background: bgs[i % bgs.length],
                    color: colors[i % colors.length],
                    border: 'var(--clay-border)', boxShadow: 'var(--clay-shadow-sm)',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Report */}
          <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 700,
            }}>🚩 Report this note</button>
          </div>
        </div>
      </div>
    </div>
  )
}