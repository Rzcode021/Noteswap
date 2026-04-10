'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'


// ===== MODAL CONTENT =====
const getModalContent = (styles) => ({
  about: {
    title: '📚 About NoteSwap',
    content: (
      <div>
        <p className={styles.policyText} style={{ marginBottom: '1rem' }}>
          NoteSwap is India's leading student notes sharing platform, built specifically for college students across India. We believe quality education should be accessible to every student, regardless of their college or location.
        </p>
        <p className={styles.policyText} style={{ marginBottom: '1rem' }}>
          Founded in 2026 by <b>Raunak khan</b> student from RGPV, NoteSwap started as a small project to help classmates share notes. Today we serve thousands of students across hundreds of colleges in India.
        </p>
        <div className={styles.modalStats}>
          {[
            { val: '12K+', label: 'Notes Shared' },
            { val: '3.8K+', label: 'Students' },
            { val: '200+', label: 'Subjects' },
            { val: '100%', label: 'Free Forever' },
          ].map(s => (
            <div key={s.label} className={styles.modalStatBox}>
              <div className={styles.modalStatVal}>{s.val}</div>
              <div className={styles.modalStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  blog: {
    title: '📝 Blog',
    content: (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem' }}>Coming Soon!</h3>
        <p className={styles.policyText}>We're working on study tips, exam strategies and platform updates. Stay tuned!</p>
      </div>
    ),
  },
  careers: {
    title: '💼 Careers',
    content: (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍💻</div>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.5rem' }}>Join Our Team!</h3>
        <p className={styles.policyText} style={{ marginBottom: '1.5rem' }}>
          We're a small passionate team of students building for students. If you're excited about EdTech, reach out!
        </p>
        <div style={{ background: 'var(--orange-light)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--orange-dark)' }}>📧 careers@noteswap.in</div>
        </div>
        <p className={styles.policyText}>We're hiring developers, designers and content writers!</p>
      </div>
    ),
  },
  contact: {
    title: '📬 Contact Us',
    content: (
      <div>
        <p className={styles.policyText} style={{ marginBottom: '1.5rem' }}>Have a question, suggestion or issue? We'd love to hear from you!</p>
        {[
          { icon: '📧', label: 'Email', val: 'support@noteswap.in' },
          { icon: '📱', label: 'WhatsApp', val: '+91 98765 43210' },
          { icon: '🐦', label: 'Twitter', val: '@noteswap_in' },
          { icon: '📸', label: 'Instagram', val: '@noteswap.in' },
        ].map(c => (
          <div key={c.label} className={styles.modalContactItem}>
            <div style={{ fontSize: '1.2rem' }}>{c.icon}</div>
            <div>
              <div className={styles.modalContactLabel}>{c.label}</div>
              <div className={styles.modalContactVal}>{c.val}</div>
            </div>
          </div>
        ))}
        <p className={styles.policyText} style={{ marginTop: '1rem', textAlign: 'center' }}>We typically respond within 24 hours 🕐</p>
      </div>
    ),
  },
  privacy: {
    title: '🔒 Privacy Policy',
    content: (
      <div className={styles.scrollableContent}>
        {[
          { heading: '1. Information We Collect', text: 'We collect information you provide directly to us, such as your name, email address, phone number, and college details when you create an account.' },
          { heading: '2. How We Use Your Information', text: 'We use the information we collect to provide and improve our services, send you notifications about your uploaded notes, and communicate with you about platform updates.' },
          { heading: '3. Information Sharing', text: 'We do not sell, trade, or rent your personal information to third parties. Your name and college may be visible on notes you upload, but your email and phone number remain private.' },
          { heading: '4. Data Security', text: 'We use Firebase Authentication and industry-standard encryption to protect your data. Files are stored securely on Cloudinary servers.' },
          { heading: '5. Cookies', text: 'We use Firebase session cookies for authentication purposes only. We do not use tracking or advertising cookies.' },
          { heading: '6. Your Rights', text: 'You can request deletion of your account and all associated data at any time by contacting us at support@noteswap.in.' },
          { heading: '7. Contact', text: 'If you have any questions about this Privacy Policy, please contact us at support@noteswap.in.' },
        ].map(s => (
          <div key={s.heading} className={styles.policySection}>
            <h4 className={styles.policyHeading}>{s.heading}</h4>
            <p className={styles.policyText}>{s.text}</p>
          </div>
        ))}
      </div>
    ),
  },
  terms: {
    title: '📄 Terms of Service',
    content: (
      <div className={styles.scrollableContent}>
        {[
          { heading: '1. Acceptance of Terms', text: 'By using NoteSwap, you agree to these terms. If you disagree with any part, you may not use our service.' },
          { heading: '2. User Accounts', text: 'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account.' },
          { heading: '3. Content Guidelines', text: 'You may only upload notes that you have created yourself or have permission to share. Plagiarised or inappropriate content is strictly prohibited.' },
          { heading: '4. Admin Review', text: 'All uploaded notes go through admin review before being published. We reserve the right to reject any content that does not meet our quality standards.' },
          { heading: '5. Intellectual Property', text: 'You retain ownership of notes you upload. By uploading, you grant NoteSwap a license to display and distribute your notes on the platform.' },
          { heading: '6. Prohibited Activities', text: 'You may not use NoteSwap for any illegal purpose, upload malicious content, attempt to hack the platform, or harass other users.' },
          { heading: '7. Termination', text: 'We reserve the right to terminate accounts that violate these terms. You may delete your account at any time.' },
          { heading: '8. Limitation of Liability', text: 'NoteSwap is provided as-is. We are not liable for any damages arising from your use of the platform.' },
        ].map(s => (
          <div key={s.heading} className={styles.policySection}>
            <h4 className={styles.policyHeading}>{s.heading}</h4>
            <p className={styles.policyText}>{s.text}</p>
          </div>
        ))}
      </div>
    ),
  },
  report: {
    title: '🚩 Report an Issue',
    content: (
      <div>
        <p className={styles.policyText} style={{ marginBottom: '1.5rem' }}>Found a bug, inappropriate content, or have a complaint? Let us know!</p>
        {[
          { icon: '🐛', label: 'Bug Report', desc: 'Something broken on the platform' },
          { icon: '⚠️', label: 'Inappropriate Content', desc: 'Report offensive or wrong notes' },
          { icon: '📋', label: 'Copyright Issue', desc: 'Your content was used without permission' },
          { icon: '💡', label: 'Feature Request', desc: 'Suggest a new feature or improvement' },
        ].map(r => (
          <div key={r.label} className={styles.modalContactItem} style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '1.3rem' }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--dark)' }}>{r.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>{r.desc}</div>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>→</span>
          </div>
        ))}
        <div style={{ background: 'var(--orange-light)', borderRadius: '12px', padding: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--orange-dark)' }}>📧 report@noteswap.in</div>
        </div>
      </div>
    ),
  },
  help: {
    title: '❓ Help Center',
    content: (
      <div className={styles.scrollableContent}>
        {[
          { q: 'How do I upload notes?', a: 'Click "Upload Notes" in the navbar, fill in the details, select your file and submit. Admin will review within 24-48 hours.' },
          { q: 'What file types are supported?', a: 'We support PDF, JPG, PNG, DOCX and PPTX files up to 20MB.' },
          { q: 'How long does approval take?', a: 'Usually 24-48 hours. Track status in Profile → My Notes.' },
          { q: 'Why was my note rejected?', a: 'Check Profile → My Notes for the rejection reason. Common reasons: blurry file, wrong subject, plagiarised content.' },
          { q: 'Is NoteSwap really free?', a: 'Yes! 100% free forever. No subscription, no hidden charges.' },
          { q: 'How do I reset my password?', a: 'Click "Forgot Password?" on the login page. We\'ll send a reset link to your email.' },
          { q: 'Can I delete my notes?', a: 'Contact us at support@noteswap.in for deletion requests.' },
          { q: 'How do I report content?', a: 'Click "Report this note" on the note detail page or email report@noteswap.in.' },
        ].map((faq, i) => (
          <div key={i} className={styles.faqItem}>
            <div className={styles.faqQ}>Q: {faq.q}</div>
            <div className={styles.faqA}>A: {faq.a}</div>
          </div>
        ))}
      </div>
    ),
  },
})

const colors = ['var(--orange)', 'var(--teal)', 'var(--green)', 'var(--pink)']
const bgs = ['var(--orange-light)', 'var(--teal-light)', 'var(--green-light)', 'var(--pink-light)']

export default function LandingClient({ subjects }) {
  const [modal, setModal] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const modalContent = getModalContent(styles)

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ===== MODAL ===== */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modalContent[modal]?.title}</h2>
              <button className={styles.modalCloseBtn} onClick={() => setModal(null)}>×</button>
            </div>
            {modalContent[modal]?.content}
          </div>
        </div>
      )}

      {/* ===== MOBILE MENU ===== */}
      <div className={`${styles.mobileMenuOverlay} ${menuOpen ? styles.open : ''}`} onClick={() => setMenuOpen(false)}>
        <div className={styles.mobileMenuPanel} onClick={e => e.stopPropagation()}>
          <div className={styles.mobileMenuLogo}>
            Note<span style={{ color: 'var(--orange)' }}>Swap</span>
          </div>
          {[
            { label: 'Home', href: '#' },
            { label: 'Features', href: '#features' },
            { label: 'How it Works', href: '#how-it-works' },
            { label: 'Reviews', href: '#reviews' },
          ].map(item => (
            <a key={item.label} href={item.href} className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <div className={styles.mobileMenuFooter}>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <button className="btn-orange" style={{ width: '100%', padding: '12px' }}>Get Started Free</button>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== NAVBAR ===== */}
      <div className={styles.navWrapper}>
        <nav className="navbar-float" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} >
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: 'var(--clay-border)', boxShadow: '0 3px 0 var(--orange-dark)' }}>📚</div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: 'var(--dark)' }}>
                Note<span style={{ color: 'var(--orange)' }}>Swap</span>
              </span>
            </Link>
          </div>

          <ul className={styles.navLinks}>
            {[
              { label: 'Home', href: '#' },
              { label: 'Features', href: '#features' },
              { label: 'How it Works', href: '#how-it-works' },
              { label: 'Reviews', href: '#reviews' },
            ].map(item => (
              <li key={item.label}>
                <a href={item.href} className="nav-link">{item.label}</a>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* ✅ Hidden on mobile */}
            <div className={styles.navGetStarted}>
              <Link href="/login">
                <button className="btn-orange" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>Get Started Free →</button>
              </Link>
            </div>
            <button className={styles.mobileMenuBtn} onClick={() => setMenuOpen(true)}>
              {[0, 1, 2].map(i => <div key={i} className={styles.mobileMenuBtnBar} />)}
            </button>
          </div>
        </nav>
      </div>

      {/* ===== HERO ===== */}
      <section className={styles.heroSection}>
        <div className={styles.bubblesContainer}>
          {[
            { w: 260, h: 260, color: 'rgba(245,166,35,0.12)', top: '-70px', left: '-50px', anim: 'animate-bubble1' },
            { w: 160, h: 160, color: 'rgba(16,185,129,0.08)', top: '80px', left: '200px', anim: 'animate-bubble2' },
            { w: 110, h: 110, color: 'rgba(14,165,233,0.08)', top: '30px', right: '280px', anim: 'animate-bubble3' },
            { w: 320, h: 320, color: 'rgba(244,63,94,0.06)', top: '-90px', right: '-70px', anim: 'animate-bubble4' },
            { w: 90, h: 90, color: 'rgba(245,166,35,0.10)', top: '220px', right: '160px', anim: 'animate-bubble5' },
          ].map((b, i) => (
            <div key={i} className={b.anim} style={{ position: 'absolute', borderRadius: '50%', width: b.w, height: b.h, background: b.color, opacity: 0.6, top: b.top, left: b.left, right: b.right }} />
          ))}
        </div>

        <div className={styles.heroGrid}>
          {/* Hero Left */}
          <div>
            <div className={styles.heroBadge}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', boxShadow: '0 2px 0 var(--orange-dark)' }}>⭐</div>
              #1 Notes Platform for College Students
            </div>

            <h1 className={styles.heroTitle}>
              <span style={{ color: 'var(--dark)', display: 'block' }}>Your Notes,</span>
              <span style={{ color: 'var(--orange)', display: 'block' }}>Shared Smarter,</span>
              <span style={{ color: 'var(--dark)', display: 'block' }}>Study Better.</span>
            </h1>

            <p className={styles.heroDesc}>
              Access thousands of verified student notes organised by subject, unit, and semester.
              Upload yours and help others ace their exams.
            </p>

            <div className={styles.heroBtns}>
              <Link href="/home">
                <button className="btn-orange" style={{ padding: '13px 26px' }}>📚 Browse Notes</button>
              </Link>
              <Link href="/upload">
                <button className="btn-white" style={{ padding: '11px 22px' }}>⬆ Upload Notes</button>
              </Link>
            </div>

            <div className={styles.heroStats}>
              {[
                { val: '12K+', label: 'Notes Shared' },
                { val: '3.8K', label: 'Students' },
                { val: '200+', label: 'Subjects' },
              ].map(s => (
                <div key={s.label}>
                  <div className={styles.heroStatVal}>{s.val}</div>
                  <div className={styles.heroStatLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Right */}
          <div className={styles.heroRight}>
            <div style={{ position: 'absolute', width: '90px', height: '90px', borderRadius: '50%', background: 'var(--orange-light)', top: '-20px', left: '-10px', zIndex: 0, opacity: 0.8 }} />
            <div style={{ position: 'absolute', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--green-light)', bottom: '-10px', right: '-10px', zIndex: 0, opacity: 0.8 }} />
            <div className="clay animate-float" style={{ background: 'white', borderRadius: '28px', padding: '1.4rem', width: '340px', position: 'relative', zIndex: 2 }}>
              <div style={{ background: 'linear-gradient(135deg,#FFF3E0,#FFF8E8,#FFFDE7)', borderRadius: '18px', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))' }}>📚📗📘</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--mid)', marginTop: '0.6rem' }}>Thousands of notes waiting for you</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, padding: '4px 12px', borderRadius: '50px', background: 'var(--orange-light)', color: 'var(--orange-dark)', border: '1.5px solid rgba(255,255,255,0.9)' }}>Software Engg.</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--pink)' }}>❤️ 148 likes</span>
              </div>
            </div>
            {[
              { style: { top: '-18px', right: '-18px' }, icon: '✅', iconBg: 'var(--green-light)', title: 'Admin Verified', sub: 'Quality guaranteed' },
              { style: { bottom: '80px', left: '-24px' }, icon: '⬇', iconBg: 'var(--orange-light)', title: '348 Downloads', sub: 'This week' },
            ].map((p, i) => (
              <div key={i} className="clay-pill" style={{ position: 'absolute', background: 'white', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '9px', zIndex: 3, ...p.style }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: p.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>{p.icon}</div>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--dark)' }}>{p.title}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700 }}>{p.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Choose NoteSwap?</h2>
            <p className={styles.sectionDesc}>Built specifically for Indian college students — quality, privacy, and ease all in one place.</p>
          </div>

          {/* ✅ Remove clay-sm from grid div — only on individual cards */}
          <div className={styles.featuresGrid}>
            {[
              { icon: '✅', title: 'Admin Verified', desc: 'Every note reviewed before going live. Quality and privacy guaranteed always.' },
              { icon: '📄', title: 'All File Types', desc: 'PDF, images, Word, PowerPoint — share any type of study material easily.' },
              { icon: '🎓', title: 'Unit-wise Organised', desc: 'Notes grouped by subject, unit, semester and college for easy discovery.' },
              { icon: '🔒', title: 'Free Forever', desc: 'No subscription, no paywall. 100% free for every student always.' },
            ].map(f => (
              /* ✅ clay-sm only on individual card */
              <div key={f.title} className={`${styles.featureCard} clay-sm hover-float`}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className={styles.howSection} id="how-it-works">
        <div className={styles.howInner}>
          <div className={`${styles.howCard} clay`}>
            <div className={styles.howGradientBar} />
            <div className={styles.sectionHeader} style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              <h2 className={styles.sectionTitle}>How It Works</h2>
              <p className={styles.sectionDesc}>Three simple steps to start sharing and discovering notes.</p>
            </div>
            <div className={styles.stepsGrid}>
              <div className={styles.stepsLine} />
              {[
                { icon: '👤', num: '01', numBg: 'var(--orange)', bg: 'var(--orange-light)', title: 'Create Account', desc: 'Sign up with email or Google in seconds. No credit card needed.' },
                { icon: '📤', num: '02', numBg: 'var(--teal)', bg: 'var(--teal-light)', title: 'Upload Notes', desc: 'Select subject, unit, semester and upload your PDF, images, Word or PPT.' },
                { icon: '🎯', num: '03', numBg: 'var(--green)', bg: 'var(--green-light)', title: 'Discover & Download', desc: 'Browse admin-verified notes, filter by subject and download instantly.' },
              ].map(s => (
                <div key={s.title} className={styles.stepItem}>
                  <div className={`${styles.stepCircle} clay-circle`} style={{ background: s.bg }}>
                    {s.icon}
                    <div className={styles.stepNum} style={{ background: s.numBg }}>{s.num}</div>
                  </div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SUBJECTS ===== */}
      <section className={styles.subjectsSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Find Notes by Subject</h2>
            <p className={styles.sectionDesc}>Every subject organised with unit-wise notes so you find exactly what you need.</p>
          </div>
          <div className={styles.subjectsGrid}>
            {(subjects.length > 0 ? subjects.slice(0, 4) : [
              { name: 'Software Engineering', notesCount: 24, color: 'var(--orange)', icon: '📚' },
              { name: 'Data Structures', notesCount: 18, color: 'var(--teal)', icon: '📊' },
              { name: 'DBMS', notesCount: 15, color: 'var(--green)', icon: '🗄️' },
              { name: 'Computer Networks', notesCount: 12, color: 'var(--pink)', icon: '🌐' },
            ]).map((s, i) => {
              const color = s.color || colors[i % colors.length]
              const bg = bgs[i % bgs.length]
              return (
                <Link href="/home" key={s.name || s._id} style={{ textDecoration: 'none' }}>
                  <div className={`${styles.subjectCard} clay-sm hover-float`} style={{ borderTop: `4px solid ${color}` }}>
                    <div className={styles.subjectIcon} style={{ background: bg }}>{s.icon || '📚'}</div>
                    <div className={styles.subjectName}>{s.name}</div>
                    <div className={styles.subjectCount}>{s.notesCount || 0} notes</div>
                    <div className={styles.subjectBar}>
                    <div className={styles.subjectBarFill} style={{ background: color, width: `${Math.min((s.notesCount / 30) * 100, 100)}%` }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className={styles.reviewsSection} id="reviews">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Loved by Students Across India</h2>
            <p className={styles.sectionDesc}>Don't just take our word for it. Here's what students say about NoteSwap.</p>
          </div>
          <div className={styles.reviewsGrid}>
            {[
              { name: 'Riya Sharma', role: 'B.Tech CSE · RGPV Bhopal', av: 'RS', avBg: 'linear-gradient(135deg,var(--orange),#FF8C00)', stars: 5, featured: false, text: '"NoteSwap completely changed how I study. Found amazing Software Engineering notes just before my end sem. Absolutely love this platform!"' },
              { name: 'Arjun Kumar', role: 'B.Tech IT · AKTU Lucknow', av: 'AK', avBg: 'rgba(255,255,255,0.3)', stars: 5, featured: true, text: '"Admin verification means I can trust every note. My DBMS notes got 200+ downloads — feels amazing helping fellow students pass their exams!"' },
              { name: 'Priya Mehta', role: 'B.Tech CSE · Mumbai University', av: 'PM', avBg: 'linear-gradient(135deg,var(--teal),var(--green))', stars: 4, featured: false, text: '"The unit-wise organisation is brilliant. I find exactly Unit 3 DBMS notes in seconds. No other platform does this as well as NoteSwap!"' },
            ].map(r => (
              <div key={r.name} className={`${styles.reviewCard} clay-sm hover-float`} style={{ background: r.featured ? 'var(--orange)' : 'white' }}>
                <div className={styles.reviewStars} style={{ color: r.featured ? 'white' : 'var(--orange)' }}>
                  {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                </div>
                <p className={styles.reviewText} style={{ color: r.featured ? 'rgba(255,255,255,0.88)' : 'var(--mid)' }}>{r.text}</p>
                <div className={styles.reviewAuthor}>
                  <div className={styles.reviewAvatar} style={{ background: r.avBg }}>{r.av}</div>
                  <div>
                    <div className={styles.reviewName} style={{ color: r.featured ? 'white' : 'var(--dark)' }}>{r.name}</div>
                    <div className={styles.reviewRole} style={{ color: r.featured ? 'rgba(255,255,255,0.65)' : 'var(--muted)' }}>{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className={styles.ctaSection}>
        <div className={`${styles.ctaCard} clay`}>
          {[
            { w: 200, h: 200, bg: 'var(--orange-light)', top: '-70px', left: '-60px' },
            { w: 160, h: 160, bg: 'var(--green-light)', bottom: '-50px', right: '-50px' },
            { w: 100, h: 100, bg: 'var(--teal-light)', top: '30px', right: '200px' },
          ].map((b, i) => (
            <div key={i} style={{ position: 'absolute', borderRadius: '50%', width: b.w, height: b.h, background: b.bg, top: b.top, left: b.left, right: b.right, bottom: b.bottom, opacity: 0.6 }} />
          ))}
          <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'var(--orange-light)', margin: '0 auto 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', position: 'relative', zIndex: 1, border: 'var(--clay-border)', boxShadow: '0 5px 0 rgba(180,100,0,0.15)' }}>📚</div>
          <h2 className={styles.ctaTitle}>Ready to Study Smarter?</h2>
          <p className={styles.ctaDesc}>Join 3,800+ students already sharing notes and acing their exams together on NoteSwap.</p>
          <div className={styles.ctaBtns}>
            <Link href="/home"><button className="btn-orange" style={{ padding: '14px 32px' }}>📚 Browse Notes Free</button></Link>
            <Link href="/signup"><button className="btn-white" style={{ padding: '12px 28px' }}>👤 Create Account</button></Link>
          </div>
          <div className={styles.ctaBadges}>
            {['✅ Admin Verified', '🔒 Free Forever', '🎓 200+ Subjects', '📚 12K+ Notes', '👤 3.8K Students'].map(c => (
              <span key={c} className="clay-pill" style={{ background: 'var(--bg)', color: 'var(--mid)', fontSize: '0.72rem', fontWeight: 800, padding: '6px 14px' }}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <div className={styles.footerWrapper}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            {/* Brand */}
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 3px 0 var(--orange-dark)' }}>📚</div>
                Note<span style={{ color: 'var(--orange)' }}>Swap</span>
              </div>
              <p className={styles.footerBrandDesc}>India's leading student notes sharing platform — verified, organised, and completely free for all college students.</p>
              <div className={styles.footerSocials}>
                {[
                  { label: 'f', href: 'https://facebook.com' },
                  { label: 'X', href: 'https://twitter.com' },
                  { label: 'in', href: 'https://linkedin.com' },
                  { label: 'ig', href: 'https://instagram.com' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="social-btn">{s.label}</a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <div className={styles.footerColHead}>Platform</div>
              <ul className={styles.footerLinks}>
                {[
                  { label: 'Browse Notes', href: '/home' },
                  { label: 'Upload Notes', href: '/upload' },
                  { label: 'Subjects', href: '/home' },
                  { label: 'How it Works', href: '#how-it-works' },
                ].map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className={styles.footerPageLink}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className={styles.footerColHead}>Company</div>
              <ul className={styles.footerLinks}>
                {[
                  { label: 'About Us', key: 'about' },
                  { label: 'Blog', key: 'blog' },
                  { label: 'Careers', key: 'careers' },
                  { label: 'Contact', key: 'contact' },
                ].map(l => (
                  <li key={l.label}>
                    <button onClick={() => setModal(l.key)} className={styles.footerLinkBtn}>{l.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className={styles.footerColHead}>Legal</div>
              <ul className={styles.footerLinks}>
                {[
                  { label: 'Privacy Policy', key: 'privacy' },
                  { label: 'Terms of Service', key: 'terms' },
                  { label: 'Report Issue', key: 'report' },
                  { label: 'Help Center', key: 'help' },
                ].map(l => (
                  <li key={l.label}>
                    <button onClick={() => setModal(l.key)} className={styles.footerLinkBtn}>{l.label}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>© 2026 NoteSwap. All rights reserved.</span>
            <span>Built with ❤️ for students across India</span>
          </div>
        </div>
      </div>
    </main>
  )
}