'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { uploadNote } from '../../services/note.service'
import { getSubjects } from '../../services/subject.service'

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [subjects, setSubjects]     = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [customSubject, setCustomSubject] = useState(false)
  const [customUnit, setCustomUnit]       = useState(false)
  const [dragOver, setDragOver]     = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    unit: '',
    semester: '',
    year: '',
    college: '',
    tags: '',
  })

  const [units, setUnits] = useState([])

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading])

  // Fetch subjects
  useEffect(() => {
    if (!authLoading && user) fetchSubjects()
  }, [user, authLoading])

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects()
      setSubjects(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch subjects:', err)
    }
  }

  // When subject changes, load its units
 const handleSubjectChange = (e) => {
  const subjectId = e.target.value
  if (subjectId === '__custom__') {
    setCustomSubject(true)
    setForm({ ...form, subject: '', unit: '' })
    setUnits([])
    return
  }
  setForm({ ...form, subject: subjectId, unit: '' })
  const subject = subjects.find(s => s._id === subjectId)
  setUnits(subject?.units || [])
}

  const handleChange = (e) => {
  const { name, value } = e.target
  if (name === 'unit' && value === '__custom__') {
    setCustomUnit(true)
    setForm({ ...form, unit: '' })
    return
  }
  setForm({ ...form, [name]: value })
}

  // File selection
  const handleFileSelect = (file) => {
    if (!file) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    if (!allowed.includes(file.type)) {
      setError('Only PDF, JPG, PNG, DOCX, PPTX files are allowed.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB.')
      return
    }
    setError('')
    setSelectedFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) { setError('Please select a file to upload.'); return }
    if (!form.title.trim()) { setError('Please enter a title.'); return }
   if (!form.subject && !form.subjectCustom?.trim()) {
  setError('Please select or enter a subject.')
  return
}
    if (!form.semester) { setError('Please select a semester.'); return }
    if (!form.college.trim()) { setError('Please enter your college name.'); return }

    setError('')
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('subject', customSubject ? (form.subjectCustom || '').trim() : form.subject)
     formData.append('unit', form.unit || 'General')
      formData.append('semester', form.semester)
     
formData.append('year', form.year || 'Not specified')
      formData.append('college', form.college)
      formData.append('tags', form.tags)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) { clearInterval(progressInterval); return prev }
          return prev + 10
        })
      }, 300)

      await uploadNote(formData)
      clearInterval(progressInterval)
      setUploadProgress(100)
      setSuccess(true)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file) => {
    if (!file) return '📄'
    if (file.type === 'application/pdf') return '📕'
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type.includes('word')) return '📘'
    if (file.type.includes('presentation') || file.type.includes('powerpoint')) return '📊'
    return '📄'
  }

  const getFileType = (file) => {
    if (!file) return ''
    if (file.type === 'application/pdf') return 'PDF'
    if (file.type.startsWith('image/')) return 'IMAGE'
    if (file.type.includes('word')) return 'DOCX'
    if (file.type.includes('presentation') || file.type.includes('powerpoint')) return 'PPTX'
    return 'FILE'
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Checklist
const checklist = [
  { label: 'File uploaded',     done: !!selectedFile },
  { label: 'Title added',       done: form.title.trim().length > 0 },
  { label: 'Subject selected',  done: !!form.subject || !!form.subjectCustom?.trim() },
  { label: 'Semester selected', done: !!form.semester },
  { label: 'College entered',   done: form.college.trim().length > 0 },
]
  const checklistDone = checklist.filter(c => c.done).length

  if (authLoading || (!authLoading && !user)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  // Success screen
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="clay" style={{
          background: 'white', borderRadius: '28px', padding: '3rem',
          textAlign: 'center', maxWidth: '480px', width: '100%', margin: '2rem',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem' }}>
            Notes Submitted!
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--mid)', fontWeight: 600, lineHeight: 1.7, marginBottom: '2rem' }}>
            Your notes have been submitted for admin review. They'll be live within 24–48 hours once approved!
          </p>
          <div style={{
            background: 'var(--orange-light)', borderRadius: '14px',
            padding: '1rem 1.2rem', marginBottom: '2rem',
            border: '1.5px solid rgba(245,166,35,0.2)',
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--orange-dark)', marginBottom: '0.3rem' }}>
              📋 What happens next?
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--mid)', fontWeight: 600, lineHeight: 1.6 }}>
              Admin will review your notes for quality and accuracy. You'll be able to see the status in your profile.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link href="/home">
              <button className="btn-orange" style={{ padding: '11px 24px' }}>
                🏠 Go to Home
              </button>
            </Link>
            <button
              onClick={() => { setSuccess(false); setSelectedFile(null); setForm({ title: '', description: '', subject: '', unit: '', semester: '', year: '', college: '', tags: '' }); setUploadProgress(0) }}
              className="btn-white"
              style={{ padding: '11px 24px' }}
            >
              + Upload More
            </button>
          </div>
        </div>
      </div>
    )
  }

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

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 700 }}>
          <Link href="/home" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Home</Link>
          <span>›</span>
          <span style={{ color: 'var(--dark)' }}>Upload Notes</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/home">
            <button className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
              ← Back to Home
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

      {/* PAGE */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.3rem' }}>
            Upload Notes 📤
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 600 }}>
            Share your notes with students across India. All uploads are reviewed by admin before going live.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

          {/* LEFT — Main Form */}
          <div>

            {/* File Upload Card */}
            <div className="clay" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                File Upload
                <div style={{ flex: 1, height: '1.5px', background: '#E5E7EB' }} />
              </div>

              {/* Drop Zone */}
              {!selectedFile ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2.5px dashed ${dragOver ? 'var(--orange)' : 'rgba(245,166,35,0.35)'}`,
                    borderRadius: '16px', padding: '2.5rem 1.5rem',
                    textAlign: 'center', cursor: 'pointer',
                    background: dragOver ? '#FFEECE' : 'var(--orange-light)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div className="clay-sm" style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: 'white', margin: '0 auto 1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>📄</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 800, color: 'var(--orange-dark)', marginBottom: '0.3rem' }}>
                    {dragOver ? 'Drop it here!' : 'Drag & drop your file here'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--mid)', fontWeight: 600, marginBottom: '1rem' }}>
                    or click to browse from your device
                  </div>
                  <button
                    type="button"
                    className="btn-orange"
                    style={{ padding: '8px 20px', fontSize: '0.84rem' }}
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                  >
                    Choose File
                  </button>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                    {[
                      { label: 'PDF', bg: 'var(--orange-light)', color: 'var(--orange-dark)' },
                      { label: 'JPG/PNG', bg: 'var(--pink-light)', color: 'var(--pink)' },
                      { label: 'DOCX', bg: 'var(--teal-light)', color: 'var(--teal)' },
                      { label: 'PPTX', bg: 'var(--green-light)', color: 'var(--green)' },
                    ].map(t => (
                      <span key={t.label} style={{
                        fontSize: '0.68rem', fontWeight: 900, padding: '3px 10px',
                        borderRadius: '20px', background: t.bg, color: t.color,
                        border: '1.5px solid rgba(255,255,255,0.9)',
                      }}>{t.label}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, marginTop: '0.5rem' }}>
                    Max file size: 20MB
                  </div>
                </div>
              ) : (
                /* File Preview */
                <div>
                  <div style={{
                    background: 'var(--bg)', borderRadius: '12px',
                    padding: '12px 16px', display: 'flex',
                    alignItems: 'center', gap: '12px',
                    border: 'var(--clay-border)', boxShadow: 'var(--clay-shadow-sm)',
                  }}>
                    <div style={{
                      width: '42px', height: '48px', borderRadius: '10px',
                      background: 'var(--orange-light)', color: 'var(--orange-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', minWidth: '42px',
                      border: 'var(--clay-border)', boxShadow: 'var(--clay-shadow-sm)',
                    }}>{getFileIcon(selectedFile)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '2px' }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{getFileType(selectedFile)}</span>
                        <span>·</span>
                        <span>{formatFileSize(selectedFile.size)}</span>
                      </div>
                      {uploading && (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ height: '4px', borderRadius: '2px', background: '#E5E7EB', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '2px',
                              background: 'var(--orange)',
                              width: `${uploadProgress}%`,
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--orange)', fontWeight: 700, marginTop: '3px' }}>
                            Uploading {uploadProgress}%
                          </div>
                        </div>
                      )}
                    </div>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setUploadProgress(0) }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--muted)', fontSize: '1.2rem', padding: '4px',
                        }}
                      >×</button>
                    )}
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        marginTop: '8px', fontSize: '0.78rem', color: 'var(--orange)',
                        fontWeight: 800, background: 'none', border: 'none',
                        cursor: 'pointer', textDecoration: 'underline',
                      }}
                    >Change file</button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files[0])}
              />
            </div>

            {/* Note Details Card */}
            <div className="clay" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Note Details
                <div style={{ flex: 1, height: '1.5px', background: '#E5E7EB' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="field-label">Note title <span style={{ color: 'var(--orange)' }}>*</span></label>
                <input
                  name="title" className="input-clay"
                  placeholder="e.g. SDLC Models — Waterfall, Agile & Spiral"
                  value={form.title} onChange={handleChange} required
                />
              </div>

              <div style={{ marginBottom: '0.3rem' }}>
                <label className="field-label">Description <span style={{ color: 'var(--muted)', fontWeight: 600 }}>(optional)</span></label>
                <textarea
                  name="description" className="input-clay"
                  placeholder="Briefly describe what these notes cover, exam tips, important topics..."
                  value={form.description} onChange={handleChange}
                  style={{ resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, marginTop: '2px' }}>
                  {form.description.length} / 300
                </div>
              </div>
            </div>

            {/* Classification Card */}
            <div className="clay" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Classification
                <div style={{ flex: 1, height: '1.5px', background: '#E5E7EB' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
  <div>
    <label className="field-label">Subject <span style={{ color: 'var(--orange)' }}>*</span></label>
    {!customSubject ? (
      <select
        name="subject" className="input-clay"
        value={form.subject} onChange={handleSubjectChange}
        style={{ cursor: 'pointer' }}
      >
        <option value="">Select subject...</option>
        {subjects.map(s => (
          <option key={s._id} value={s._id}>{s.name}</option>
        ))}
        <option value="__custom__">+ Type manually...</option>
      </select>
    ) : (
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          name="subjectCustom"
          className="input-clay"
          placeholder="Type subject name..."
          value={form.subjectCustom || ''}
          onChange={e => setForm({ ...form, subjectCustom: e.target.value })}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => { setCustomSubject(false); setForm({ ...form, subject: '', subjectCustom: '' }) }}
          style={{
            padding: '0 12px', borderRadius: '12px',
            border: 'var(--clay-border)', background: 'white',
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
            color: 'var(--muted)', boxShadow: 'var(--clay-shadow-sm)',
            whiteSpace: 'nowrap',
          }}
        >← Back</button>
      </div>
    )}
    {!customSubject && (
      <div
        onClick={() => setCustomSubject(true)}
        style={{ fontSize: '0.72rem', color: 'var(--orange)', fontWeight: 700, marginTop: '4px', cursor: 'pointer' }}
      >
        ✏️ Not in list? Type manually
      </div>
    )}
  </div>

  <div>
    <label className="field-label">Unit / Chapter</label>
    {!customUnit ? (
      <select
        name="unit" className="input-clay"
        value={form.unit} onChange={handleChange}
        style={{ cursor: 'pointer' }}
        disabled={!form.subject && !customSubject}
      >
        <option value="">Select unit...</option>
        {units.map((u, i) => (
          <option key={i} value={u.name || u}>{u.name || u}</option>
        ))}
        <option value="__custom__">+ Type manually...</option>
      </select>
    ) : (
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          name="unit"
          className="input-clay"
          placeholder="e.g. Unit 2 — SDLC Models"
          value={form.unit === '__custom__' ? '' : form.unit}
          onChange={e => setForm({ ...form, unit: e.target.value })}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => { setCustomUnit(false); setForm({ ...form, unit: '' }) }}
          style={{
            padding: '0 12px', borderRadius: '12px',
            border: 'var(--clay-border)', background: 'white',
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
            color: 'var(--muted)', boxShadow: 'var(--clay-shadow-sm)',
            whiteSpace: 'nowrap',
          }}
        >← Back</button>
      </div>
    )}
    {!customUnit && (
      <div
        onClick={() => setCustomUnit(true)}
        style={{ fontSize: '0.72rem', color: 'var(--orange)', fontWeight: 700, marginTop: '4px', cursor: 'pointer' }}
      >
        ✏️ Not in list? Type manually
      </div>
    )}
  </div>
</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                <div>
                  <label className="field-label">Semester <span style={{ color: 'var(--orange)' }}>*</span></label>
                  <select
                    name="semester" className="input-clay"
                    value={form.semester} onChange={handleChange}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select semester...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={`Semester ${n}`}>Semester {n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Year</label>
                  <select
                    name="year" className="input-clay"
                    value={form.year} onChange={handleChange}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select year...</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="field-label">College / University <span style={{ color: 'var(--orange)' }}>*</span></label>
                <input
                  name="college" className="input-clay"
                  placeholder="e.g. AKTU, Lucknow"
                  value={form.college} onChange={handleChange}
                />
              </div>

              <div>
                <label className="field-label">Tags <span style={{ color: 'var(--muted)', fontWeight: 600 }}>(optional, comma separated)</span></label>
                <input
                  name="tags" className="input-clay"
                  placeholder="e.g. SDLC, Agile, Waterfall, exam notes"
                  value={form.tags} onChange={handleChange}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="toast-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading}
              style={{
                width: '100%', padding: '14px',
                borderRadius: '50px', border: 'none',
                background: uploading ? '#ccc' : 'var(--orange)',
                color: 'white', fontFamily: 'Nunito, sans-serif',
                fontSize: '0.95rem', fontWeight: 800,
                cursor: uploading ? 'not-allowed' : 'pointer',
                borderBottom: `3px solid ${uploading ? '#aaa' : 'var(--orange-dark)'}`,
                boxShadow: uploading ? 'none' : '0 6px 20px rgba(245,166,35,0.35)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {uploading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '3px' }} />
                  Submitting for Approval...
                </>
              ) : '📤 Submit for Approval →'}
            </button>
          </div>

          {/* RIGHT — Sidebar */}
          <div>

            {/* Approval Banner */}
            <div style={{
              background: 'var(--orange-light)', borderRadius: '16px',
              padding: '1rem 1.2rem', marginBottom: '1.2rem',
              border: '1.5px solid rgba(245,166,35,0.25)',
            }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900, color: 'var(--orange-dark)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ Admin approval required
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--mid)', fontWeight: 600, lineHeight: 1.5 }}>
                Your notes will be reviewed by admin before publishing. This usually takes 24–48 hours.
              </div>
            </div>

            {/* Checklist */}
            <div className="clay-sm" style={{ background: 'white', borderRadius: '18px', padding: '1.2rem', marginBottom: '1.2rem' }}>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900,
                color: 'var(--dark)', marginBottom: '0.8rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>✅ Upload checklist</span>
                <span style={{
                  background: checklistDone === checklist.length ? 'var(--green-light)' : 'var(--orange-light)',
                  color: checklistDone === checklist.length ? 'var(--green)' : 'var(--orange)',
                  fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px',
                }}>{checklistDone}/{checklist.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {checklist.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', minWidth: '20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px',
                      background: item.done ? 'var(--green-light)' : 'var(--bg)',
                      color: item.done ? 'var(--green)' : 'transparent',
                      border: item.done ? 'none' : '2px solid #DDE0EC',
                    }}>
                      {item.done ? '✓' : ''}
                    </div>
                    <div style={{
                      fontSize: '0.8rem', fontWeight: 600,
                      color: item.done ? 'var(--green)' : 'var(--mid)',
                    }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="clay-sm" style={{ background: 'white', borderRadius: '18px', padding: '1.2rem', marginBottom: '1.2rem' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.8rem' }}>
                💡 Tips for quick approval
              </div>
              {[
                'Use a clear, descriptive title so students can find your notes easily.',
                'Make sure the file is readable — not blurry or cut off.',
                'Select the correct subject and unit for accurate discovery.',
                'Only upload your own original notes — no plagiarised content.',
                'Higher quality notes get more downloads and likes!',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--orange)', minWidth: '6px', marginTop: '6px' }} />
                  <div style={{ fontSize: '0.78rem', color: 'var(--mid)', lineHeight: 1.5, fontWeight: 600 }}>{tip}</div>
                </div>
              ))}
            </div>

            {/* Save as Draft */}
            <button
              type="button"
              disabled={uploading}
              style={{
                width: '100%', padding: '12px', borderRadius: '50px',
                background: 'white', color: 'var(--mid)',
                border: 'var(--clay-border)', cursor: uploading ? 'not-allowed' : 'pointer',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                boxShadow: 'var(--clay-shadow-sm)', transition: 'all 0.2s',
              }}
            >
              💾 Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}