'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { getUniversityBySlug, getUniversityNotes } from '../../../services/university.service'

const CATEGORIES = [
  { value: null,                  icon: '📚', label: 'All'           },
  { value: 'notes',               icon: '📝', label: 'Notes'         },
  { value: 'pyq',                 icon: '📋', label: 'PYQ Papers'    },
  { value: 'important-questions', icon: '⭐', label: 'Imp Questions' },
  { value: 'lab',                 icon: '🧪', label: 'Lab Files'     },
  { value: 'reference',           icon: '📚', label: 'Reference'     },
]

const YEARS    = [null, '1st Year', '2nd Year', '3rd Year', '4th Year']
const BRANCHES = [null, 'CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'MCA', 'MBA']

export default function UniversityPage({ params }) {
  const { slug }                       = use(params)
  const { user, loading: authLoading } = useAuth()
  const router                         = useRouter()

  const [university, setUniversity]   = useState(null)
  const [notes, setNotes]             = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(false)

  const [selectedCourse,   setSelectedCourse]   = useState(null)
  const [selectedYear,     setSelectedYear]     = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedBranch,   setSelectedBranch]   = useState(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading])

  useEffect(() => {
    if (!authLoading && user) fetchUniversity()
  }, [user, authLoading, slug])

  useEffect(() => {
    if (university) fetchNotes()
  }, [university, selectedCourse, selectedYear, selectedCategory, selectedBranch])

  const fetchUniversity = async () => {
    setPageLoading(true)
    try {
      const res = await getUniversityBySlug(slug)
      setUniversity(res.data.data)
    } catch (err) {
      console.error('Fetch university error:', err)
    } finally {
      setPageLoading(false)
    }
  }

  const fetchNotes = async () => {
    setNotesLoading(true)
    try {
      const params = {}
      if (selectedCourse)   params.course    = selectedCourse
      if (selectedYear)     params.year      = selectedYear
      if (selectedCategory) params.category  = selectedCategory
      if (selectedBranch)   params.branch    = selectedBranch
      const res = await getUniversityNotes(slug, params)
      setNotes(res.data.data || [])
    } catch (err) {
      console.error('Fetch notes error:', err)
    } finally {
      setNotesLoading(false)
    }
  }

  const getFileIcon = (type) => {
    if (type === 'pdf')   return '📕'
    if (type === 'image') return '🖼️'
    if (type === 'docx')  return '📘'
    if (type === 'pptx')  return '📊'
    return '📄'
  }

  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getCategoryLabel = (cat) => {
    const found = CATEGORIES.find(c => c.value === cat)
    return found ? `${found.icon} ${found.label}` : cat
  }

  const noteColors = ['var(--orange)', 'var(--teal)', 'var(--green)', 'var(--pink)']
  const noteBgs    = ['var(--orange-light)', 'var(--teal-light)', 'var(--green-light)', 'var(--pink-light)']

  if (authLoading || (!authLoading && !user)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Loading university...</p>
      </div>
    )
  }

  if (!university) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🏛️</div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)' }}>University not found</h2>
        <Link href="/universities"><button className="btn-orange" style={{ padding: '10px 24px' }}>← All Universities</button></Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        .uni-notes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .filter-scroll {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        @media (max-width: 1024px) {
          .uni-notes-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .uni-notes-grid { grid-template-columns: 1fr; }
          .uni-hero { padding: 1.2rem !important; }
          .uni-stats { gap: 1rem !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        background: 'white', borderBottom: '2px solid rgba(255,255,255,0.8)',
        padding: '0 2rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '60px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 700 }}>
          <Link href="/universities" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Universities</Link>
          <span>›</span>
          <span style={{ color: 'var(--dark)' }}>{university.shortName}</span>
        </div>

        <Link href="/universities">
          <button className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>← Back</button>
        </Link>
      </nav>

      {/* HERO */}
      <div className="uni-hero" style={{
        background: 'var(--orange)', padding: '2rem 2rem 0',
        position: 'relative', overflow: 'hidden',
      }}>
        {[
          { w: 200, h: 200, top: '-60px', right: '-40px'   },
          { w: 120, h: 120, bottom: '-30px', left: '-20px' },
          { w: 80,  h: 80,  top: '30%',  right: '15%'     },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            width: b.w, height: b.h,
            top: b.top, right: b.right, bottom: b.bottom, left: b.left,
          }} />
        ))}

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', border: '2px solid rgba(255,255,255,0.3)',
              flexShrink: 0,
            }}>🏛️</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem',
                fontWeight: 900, color: 'rgba(255,255,255,0.7)',
                letterSpacing: '1px', textTransform: 'uppercase',
                marginBottom: '4px',
              }}>{university.shortName}</div>
              <h1 style={{
                fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem',
                fontWeight: 900, color: 'white', lineHeight: 1.2,
                marginBottom: '6px',
              }}>{university.name}</h1>
              {university.location && (
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                  📍 {university.location}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="uni-stats" style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>
                {university.totalNotes || 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Total Notes</div>
            </div>
            {(university.categoryStats || []).filter(c => c.notesCount > 0).map(c => (
              <div key={c.category}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>
                  {c.notesCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
                  {getCategoryLabel(c.category)}
                </div>
              </div>
            ))}
          </div>

          {/* Course Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCourse(null)}
              style={{
                padding: '8px 18px', border: 'none', background: 'transparent',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.2s',
                color: !selectedCourse ? 'white' : 'rgba(255,255,255,0.6)',
                borderBottom: !selectedCourse ? '3px solid white' : '3px solid transparent',
              }}
            >All Courses</button>
            {(university.courses || []).map(course => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                style={{
                  padding: '8px 18px', border: 'none', background: 'transparent',
                  fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', fontWeight: 800,
                  cursor: 'pointer', transition: 'all 0.2s',
                  color: selectedCourse === course ? 'white' : 'rgba(255,255,255,0.6)',
                  borderBottom: selectedCourse === course ? '3px solid white' : '3px solid transparent',
                }}
              >{course}</button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* FILTERS */}
        <div style={{ marginBottom: '1.5rem' }}>

          {/* Year filter */}
          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Year</div>
            <div className="filter-scroll">
              {YEARS.map((year, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedYear(year)}
                  style={{
                    padding: '6px 14px', borderRadius: '50px',
                    border: 'var(--clay-border)',
                    fontFamily: 'Nunito, sans-serif', fontSize: '0.76rem', fontWeight: 800,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedYear === year ? 'var(--orange)' : 'white',
                    color: selectedYear === year ? 'white' : 'var(--mid)',
                    boxShadow: selectedYear === year ? '0 3px 0 var(--orange-dark)' : 'var(--clay-shadow-sm)',
                  }}
                >{year === null ? 'All Years' : year}</button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Category</div>
            <div className="filter-scroll">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCategory(cat.value)}
                  style={{
                    padding: '6px 14px', borderRadius: '50px',
                    border: 'var(--clay-border)',
                    fontFamily: 'Nunito, sans-serif', fontSize: '0.76rem', fontWeight: 800,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedCategory === cat.value ? 'var(--teal)' : 'white',
                    color: selectedCategory === cat.value ? 'white' : 'var(--mid)',
                    boxShadow: selectedCategory === cat.value ? '0 3px 0 rgba(0,0,0,0.15)' : 'var(--clay-shadow-sm)',
                  }}
                >{cat.icon} {cat.label}</button>
              ))}
            </div>
          </div>

          {/* Branch filter */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Branch</div>
            <div className="filter-scroll">
              {BRANCHES.map((branch, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedBranch(branch)}
                  style={{
                    padding: '6px 14px', borderRadius: '50px',
                    border: 'var(--clay-border)',
                    fontFamily: 'Nunito, sans-serif', fontSize: '0.76rem', fontWeight: 800,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedBranch === branch ? 'var(--dark)' : 'white',
                    color: selectedBranch === branch ? 'white' : 'var(--mid)',
                    boxShadow: selectedBranch === branch ? '0 3px 0 rgba(0,0,0,0.2)' : 'var(--clay-shadow-sm)',
                  }}
                >{branch === null ? 'All Branches' : branch}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters summary */}
        {(selectedCourse || selectedYear || selectedCategory || selectedBranch) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '1rem', flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>Filtering by:</span>
            {[
              selectedCourse,
              selectedYear,
              selectedCategory ? getCategoryLabel(selectedCategory) : null,
              selectedBranch,
            ].filter(Boolean).map((f, i) => (
              <span key={i} style={{
                fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px',
                borderRadius: '20px', background: 'var(--orange-light)',
                color: 'var(--orange-dark)', border: 'var(--clay-border)',
              }}>{f}</span>
            ))}
            <button
              onClick={() => {
                setSelectedCourse(null)
                setSelectedYear(null)
                setSelectedCategory(null)
                setSelectedBranch(null)
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700,
              }}
            >✕ Clear all</button>
          </div>
        )}

        {/* Section header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '1rem',
        }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 900, color: 'var(--dark)' }}>
            {notes.length} Notes found
          </div>
        </div>

        {/* Notes Grid */}
        {notesLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : notes.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem',
            background: 'white', borderRadius: '20px',
            border: 'var(--clay-border)', boxShadow: 'var(--clay-shadow-sm)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem' }}>
              No notes found
            </h3>
            <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '1.2rem' }}>
              No notes match your current filters. Try changing the filters or upload the first note!
            </p>
            <Link href="/upload">
              <button className="btn-orange" style={{ padding: '10px 24px' }}>Upload Notes</button>
            </Link>
          </div>
        ) : (
          <div className="uni-notes-grid">
            {notes.map((note, i) => {
              const color = noteColors[i % noteColors.length]
              const bg    = noteBgs[i % noteBgs.length]
              return (
                <Link key={note._id} href={`/notes/${note._id}`} style={{ textDecoration: 'none' }}>
                  <div className="note-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 900, padding: '4px 11px',
                        borderRadius: '50px', background: bg, color: color,
                        border: '1.5px solid rgba(255,255,255,0.9)',
                      }}>{note.subject?.name || 'General'}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)' }}>
                        {getFileIcon(note.fileType)} {note.fileType?.toUpperCase()}
                      </span>
                    </div>

                    {/* Category badge */}
                    {note.category && note.category !== 'notes' && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 800,
                        padding: '2px 9px', borderRadius: '20px',
                        background: 'var(--teal-light)', color: 'var(--teal)',
                        display: 'inline-block', marginBottom: '6px',
                        alignSelf: 'flex-start',
                      }}>{getCategoryLabel(note.category)}</span>
                    )}

                    {/* Title */}
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
                      fontWeight: 800, color: 'var(--dark)',
                      marginBottom: '4px', lineHeight: 1.3,
                    }}>{note.title}</div>

                    {/* Meta */}
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '8px' }}>
                      {note.unit} · {note.semester} · {note.year}
                    </div>

                    {/* Branch + Course */}
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {note.branch && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 800,
                          padding: '2px 8px', borderRadius: '20px',
                          background: 'var(--teal-light)', color: 'var(--teal)',
                        }}>{note.branch}</span>
                      )}
                      {note.course && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 800,
                          padding: '2px 8px', borderRadius: '20px',
                          background: 'var(--bg)', color: 'var(--muted)',
                        }}>{note.course}</span>
                      )}
                    </div>

                    {/* Info strip */}
                    <div style={{
                      background: 'var(--bg)', borderRadius: '10px',
                      padding: '0.6rem', marginBottom: '8px', flex: 1,
                      display: 'flex', flexDirection: 'column', gap: '5px',
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--mid)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>👁</span><span>{note.viewsCount || 0} views</span>
                      </div>
                      {note.fileSize > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--mid)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>📦</span><span>{formatSize(note.fileSize)}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', paddingTop: '8px',
                      borderTop: '1.5px solid #F0F1F8',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: color, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '0.55rem',
                          fontWeight: 800, color: 'white',
                        }}>
                          {note.uploadedBy?.name?.charAt(0) || 'U'}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--mid)', fontWeight: 700 }}>
                          {note.uploadedBy?.name?.split(' ')[0] || 'Student'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--pink)', fontWeight: 700 }}>❤️ {note.likesCount || 0}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700 }}>⬇ {note.downloadsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
