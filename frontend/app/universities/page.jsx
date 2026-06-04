import Link from 'next/link'

export const metadata = {
  title: 'Universities — NoteSwap',
  description: 'Browse notes by university — RGPV, AKTU, Mumbai University and more',
}

async function getUniversities() {
  try {
    const res = await fetch(
      `${process.env.API_URL}/api/universities`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch (err) {
    console.error('Fetch universities error:', err)
    return []
  }
}

export default async function UniversitiesPage() {
  const universities = await getUniversities()

  const categoryIcons = {
    'notes':               '📝',
    'pyq':                 '📋',
    'important-questions': '⭐',
    'lab':                 '🧪',
    'reference':           '📚',
  }

  const colors = ['var(--orange)', 'var(--teal)', 'var(--green)', 'var(--pink)']
  const bgs    = ['var(--orange-light)', 'var(--teal-light)', 'var(--green-light)', 'var(--pink-light)']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

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
          <Link href="/home" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Home</Link>
          <span>›</span>
          <span style={{ color: 'var(--dark)' }}>Universities</span>
        </div>

        <Link href="/home">
          <button className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
            ← Back
          </button>
        </Link>
      </nav>

      {/* PAGE CONTENT */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem',
            fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem',
            letterSpacing: '-0.5px',
          }}>
            🏛️ Browse by University
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 600 }}>
            Find notes specific to your university — organised by course, year, subject and category
          </p>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
          marginBottom: '2rem', padding: '1rem 1.4rem',
          background: 'white', borderRadius: '16px',
          border: 'var(--clay-border)', boxShadow: 'var(--clay-shadow-sm)',
        }}>
          <div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: 'var(--orange)' }}>
              {universities.length}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, marginLeft: '6px' }}>Universities</span>
          </div>
          <div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: 'var(--teal)' }}>
              {universities.reduce((a, u) => a + (u.notesCount || 0), 0)}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, marginLeft: '6px' }}>Total Notes</span>
          </div>
          <div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: 'var(--green)' }}>
              {new Set(universities.flatMap(u => u.courses || [])).size}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, marginLeft: '6px' }}>Courses</span>
          </div>
        </div>

        {/* University Grid */}
        {universities.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem',
            background: 'white', borderRadius: '20px',
            border: 'var(--clay-border)', boxShadow: 'var(--clay-shadow-sm)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem' }}>
              No universities yet
            </h3>
            <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '0.88rem' }}>
              Admin can add universities from the admin panel.
            </p>
          </div>
        ) : (
          <>
            <style>{`
              .uni-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1.2rem;
              }
              @media (max-width: 1024px) {
                .uni-grid { grid-template-columns: repeat(2, 1fr); }
              }
              @media (max-width: 640px) {
                .uni-grid { grid-template-columns: 1fr; }
              }
              .uni-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 0 rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.1) !important;
              }
            `}</style>
            <div className="uni-grid">
              {universities.map((u, i) => {
                const color = colors[i % colors.length]
                const bg    = bgs[i % bgs.length]
                return (
                  <Link key={u._id} href={`/universities/${u.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="uni-card clay-sm" style={{
                      background: 'white', borderRadius: '20px',
                      padding: '1.5rem', cursor: 'pointer',
                      transition: 'all 0.2s', borderTop: `4px solid ${color}`,
                    }}>
                      {/* Icon + Short name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.8rem' }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '14px',
                          background: bg, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '1.4rem',
                          border: 'var(--clay-border)', boxShadow: '0 3px 0 rgba(0,0,0,0.06)',
                          flexShrink: 0,
                        }}>🏛️</div>
                        <div>
                          <div style={{
                            fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem',
                            fontWeight: 900, color: color,
                          }}>{u.shortName}</div>
                          {u.location && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                              📍 {u.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Full name */}
                      <div style={{
                        fontSize: '0.85rem', fontWeight: 800,
                        color: 'var(--dark)', marginBottom: '0.8rem',
                        lineHeight: 1.3,
                      }}>{u.name}</div>

                      {/* Note count */}
                      <div style={{
                        fontFamily: 'Outfit, sans-serif', fontSize: '1rem',
                        fontWeight: 900, color: color, marginBottom: '0.8rem',
                      }}>
                        {u.notesCount || 0}
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, marginLeft: '4px' }}>notes</span>
                      </div>

                      {/* Courses */}
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {(u.courses || []).slice(0, 4).map(course => (
                          <span key={course} style={{
                            fontSize: '0.65rem', fontWeight: 800,
                            padding: '2px 9px', borderRadius: '20px',
                            background: bg, color: color,
                            border: '1.5px solid rgba(255,255,255,0.9)',
                          }}>{course}</span>
                        ))}
                        {(u.courses || []).length > 4 && (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 800,
                            padding: '2px 9px', borderRadius: '20px',
                            background: 'var(--bg)', color: 'var(--muted)',
                          }}>+{u.courses.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}