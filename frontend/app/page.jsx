import Link from "next/link";
import { getSubjects } from "../services/subject.service";

// SSG — built once at deploy time
export const revalidate = 3600; // rebuild every 1 hour

async function getSubjectsData() {
  try {
    const res = await getSubjects();
    return res.data.data;
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const subjects = await getSubjectsData();

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* ===== FLOATING NAVBAR ===== */}
      <div style={{ padding: "1rem 2rem", position: "relative", zIndex: 100 }}>
        <nav
          className="navbar-float"
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                border: "var(--clay-border)",
                boxShadow: "0 3px 0 var(--orange-dark)",
              }}
            >
              📚
            </div>
            <span
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "1.25rem",
                fontWeight: 900,
                color: "var(--dark)",
              }}
            >
              Note<span style={{ color: "var(--orange)" }}>Swap</span>
            </span>
          </div>

          {/* Nav Links */}
          <ul
            style={{
              display: "flex",
              gap: "1.8rem",
              listStyle: "none",
              margin: 0,
              padding: 0,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {[
              { label: "Home", href: "#" },
              { label: "Features", href: "#features" },
              { label: "How it Works", href: "#how-it-works" },
              { label: "Reviews", href: "#reviews" },
            ].map((item) => (
              <li key={item.label}>
                <a href={item.href} className="nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <Link href="/login">
            <button
              className="btn-orange"
              style={{ padding: "10px 22px", fontSize: "0.88rem" }}
            >
              Get Started Free
            </button>
          </Link>
        </nav>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          paddingBottom: "3rem",
        }}
      >
        {/* Animated Bubbles */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {[
            {
              w: 260,
              h: 260,
              color: "rgba(245,166,35,0.12)",
              top: "-70px",
              left: "-50px",
              anim: "animate-bubble1",
            },
            {
              w: 160,
              h: 160,
              color: "rgba(16,185,129,0.08)",
              top: "80px",
              left: "200px",
              anim: "animate-bubble2",
            },
            {
              w: 110,
              h: 110,
              color: "rgba(14,165,233,0.08)",
              top: "30px",
              right: "280px",
              anim: "animate-bubble3",
            },
            {
              w: 320,
              h: 320,
              color: "rgba(244,63,94,0.06)",
              top: "-90px",
              right: "-70px",
              anim: "animate-bubble4",
            },
            {
              w: 90,
              h: 90,
              color: "rgba(245,166,35,0.1)",
              top: "220px",
              right: "160px",
              anim: "animate-bubble5",
            },
            {
              w: 180,
              h: 180,
              color: "rgba(16,185,129,0.06)",
              bottom: "-50px",
              left: "360px",
              anim: "animate-bubble1",
            },
          ].map((b, i) => (
            <div
              key={i}
              className={b.anim}
              style={{
                position: "absolute",
                borderRadius: "50%",
                width: b.w,
                height: b.h,
                background: b.color,
                opacity: 0.6,
                top: b.top,
                left: b.left,
                right: b.right,
                bottom: b.bottom,
              }}
            />
          ))}
        </div>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2.5rem 2rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Hero Left */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "white",
                padding: "6px 16px",
                borderRadius: "50px",
                fontSize: "0.76rem",
                fontWeight: 800,
                color: "var(--mid)",
                marginBottom: "1.2rem",
                border: "var(--clay-border)",
                boxShadow:
                  "0 3px 0 rgba(0,0,0,0.05), 0 6px 14px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "var(--orange)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  color: "white",
                  boxShadow: "0 2px 0 var(--orange-dark)",
                }}
              >
                ⭐
              </div>
              #1 Notes Platform for College Students
            </div>

            <h1
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "3rem",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: "1.2rem",
                letterSpacing: "-1.5px",
              }}
            >
              <span style={{ color: "var(--dark)", display: "block" }}>
                Your Notes,
              </span>
              <span style={{ color: "var(--orange)", display: "block" }}>
                Shared Smarter,
              </span>
              <span style={{ color: "var(--dark)", display: "block" }}>
                Study Better.
              </span>
            </h1>

            <p
              style={{
                fontSize: "0.98rem",
                color: "var(--mid)",
                lineHeight: 1.75,
                marginBottom: "1.8rem",
                fontWeight: 600,
                maxWidth: "430px",
              }}
            >
              Access thousands of verified student notes organised by subject,
              unit, and semester. Upload yours and help others ace their exams.
            </p>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "2.5rem",
                flexWrap: "wrap",
              }}
            >
              <Link href="/home">
                <button className="btn-orange" style={{ padding: "13px 26px" }}>
                  📚 Browse Notes
                </button>
              </Link>
              <Link href="/upload">
                <button className="btn-white" style={{ padding: "11px 22px" }}>
                  ⬇ Upload Notes
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: "2.5rem",
                paddingTop: "1.5rem",
                borderTop: "2px solid rgba(255,255,255,0.6)",
              }}
            >
              {[
                { val: "12K+", label: "Notes Shared" },
                { val: "3.8K", label: "Students" },
                { val: "200+", label: "Subjects" },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      color: "var(--dark)",
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted)",
                      fontWeight: 700,
                      marginTop: "2px",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Right — Floating Card */}
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "var(--orange-light)",
                top: "-20px",
                left: "-10px",
                zIndex: 0,
                opacity: 0.8,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "var(--green-light)",
                bottom: "-10px",
                right: "-10px",
                zIndex: 0,
                opacity: 0.8,
              }}
            />

            <div
              className="clay animate-float"
              style={{
                background: "white",
                borderRadius: "28px",
                padding: "1.4rem",
                width: "340px",
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #FFF3E0, #FFF8E8, #FFFDE7)",
                  borderRadius: "18px",
                  height: "220px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.6)",
                    top: "-20px",
                    left: "-20px",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.5)",
                    bottom: "-15px",
                    right: "-15px",
                  }}
                />
                <div
                  style={{
                    fontSize: "4rem",
                    position: "relative",
                    zIndex: 1,
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))",
                  }}
                >
                  📚📗📘
                </div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    color: "var(--mid)",
                    marginTop: "0.6rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Thousands of notes waiting for you
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 900,
                    padding: "4px 12px",
                    borderRadius: "50px",
                    background: "var(--orange-light)",
                    color: "var(--orange-dark)",
                    border: "1.5px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 2px 0 rgba(180,100,0,0.1)",
                  }}
                >
                  Software Engg.
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "var(--pink)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  ❤️ 148 likes
                </span>
              </div>
            </div>

            {/* Popup tags */}
            {[
              {
                style: { top: "-18px", right: "-18px" },
                icon: "✅",
                iconBg: "var(--green-light)",
                title: "Admin Verified",
                sub: "Quality guaranteed",
              },
              {
                style: { bottom: "80px", left: "-24px" },
                icon: "⬇",
                iconBg: "var(--orange-light)",
                title: "348 Downloads",
                sub: "This week",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="clay-pill"
                style={{
                  position: "absolute",
                  background: "white",
                  padding: "9px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  zIndex: 3,
                  ...p.style,
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "9px",
                    background: p.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  {p.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      color: "var(--dark)",
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--muted)",
                      fontWeight: 700,
                    }}
                  >
                    {p.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY NOTESWAP ===== */}
      <section
        id="features"
        style={{
          background: "white",
          padding: "4rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "2rem",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                marginBottom: "0.5rem",
              }}
            >
              Why Choose NoteSwap?
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--mid)",
                fontWeight: 600,
              }}
            >
              Built specifically for Indian college students — quality, privacy,
              and ease all in one place.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.2rem",
            }}
          >
            {[
              {
                icon: "✅",
                title: "Admin Verified",
                desc: "Every note reviewed before going live. Quality and privacy guaranteed always.",
              },
              {
                icon: "📄",
                title: "All File Types",
                desc: "PDF, images, Word, PowerPoint — share any type of study material easily.",
              },
              {
                icon: "🎓",
                title: "Unit-wise Organised",
                desc: "Notes grouped by subject, unit, semester and college for easy discovery.",
              },
              {
                icon: "🔒",
                title: "Free Forever",
                desc: "No subscription, no paywall. 100% free for every student always.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="clay-sm"
                style={{
                  background: "var(--bg)",
                  borderRadius: "20px",
                  padding: "1.8rem 1.4rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    fontSize: "1.4rem",
                    background: "var(--orange)",
                    border: "var(--clay-border)",
                    boxShadow: "0 4px 0 var(--orange-dark)",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: 800,
                    marginBottom: "0.4rem",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--mid)",
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        id="how-it-works"
        style={{
          background: "var(--bg)",
          padding: "4rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            className="clay"
            style={{
              background: "white",
              borderRadius: "28px",
              padding: "3rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "5px",
                background:
                  "linear-gradient(90deg, var(--orange), #FFD580, var(--green), var(--teal))",
                borderRadius: "28px 28px 0 0",
              }}
            />
            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <h2
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 900,
                  letterSpacing: "-0.5px",
                  marginBottom: "0.5rem",
                }}
              >
                How It Works
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--mid)",
                  fontWeight: 600,
                }}
              >
                Three simple steps to start sharing and discovering notes.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "2rem",
                marginTop: "2.5rem",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "46px",
                  left: "22%",
                  right: "22%",
                  height: "2px",
                  borderTop: "2.5px dashed #E5E7EB",
                  zIndex: 0,
                }}
              />
              {[
                {
                  icon: "👤",
                  num: "01",
                  numBg: "var(--orange)",
                  bg: "var(--orange-light)",
                  title: "Create Account",
                  desc: "Sign up with email, Google, or phone OTP in seconds. No credit card needed.",
                },
                {
                  icon: "📤",
                  num: "02",
                  numBg: "var(--teal)",
                  bg: "var(--teal-light)",
                  title: "Upload Notes",
                  desc: "Select subject, unit, semester and upload your PDF, images, Word or PPT.",
                },
                {
                  icon: "🎯",
                  num: "03",
                  numBg: "var(--green)",
                  bg: "var(--green-light)",
                  title: "Discover & Download",
                  desc: "Browse admin-verified notes, filter by subject and download instantly.",
                },
              ].map((s) => (
                <div key={s.title} style={{ textAlign: "center", zIndex: 1 }}>
                  <div
                    className="clay-circle"
                    style={{
                      width: "92px",
                      height: "92px",
                      borderRadius: "50%",
                      margin: "0 auto 1.2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.2rem",
                      position: "relative",
                      background: s.bg,
                    }}
                  >
                    {s.icon}
                    <div
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: s.numBg,
                        color: "white",
                        fontSize: "0.65rem",
                        fontWeight: 900,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}
                    >
                      {s.num}
                    </div>
                  </div>
                  <h3
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      marginBottom: "0.4rem",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--mid)",
                      lineHeight: 1.6,
                      fontWeight: 600,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SUBJECTS ===== */}
      <section style={{ background: "white", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "2rem",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                marginBottom: "0.5rem",
              }}
            >
              Find Notes by Subject
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--mid)",
                fontWeight: 600,
              }}
            >
              Every subject organised with unit-wise notes so you find exactly
              what you need.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.2rem",
            }}
          >
            {(subjects.length > 0
              ? subjects.slice(0, 4)
              : [
                  {
                    name: "Software Engineering",
                    notesCount: 24,
                    color: "var(--orange)",
                    icon: "📚",
                  },
                  {
                    name: "Data Structures",
                    notesCount: 18,
                    color: "var(--teal)",
                    icon: "📊",
                  },
                  {
                    name: "DBMS",
                    notesCount: 15,
                    color: "var(--green)",
                    icon: "🗄️",
                  },
                  {
                    name: "Computer Networks",
                    notesCount: 12,
                    color: "var(--pink)",
                    icon: "🌐",
                  },
                ]
            ).map((s, i) => {
              const colors = [
                "var(--orange)",
                "var(--teal)",
                "var(--green)",
                "var(--pink)",
              ];
              const bgs = [
                "var(--orange-light)",
                "var(--teal-light)",
                "var(--green-light)",
                "var(--pink-light)",
              ];
              const color = s.color || colors[i % colors.length];
              const bg = bgs[i % bgs.length];
              return (
                <Link
                  href="/home"
                  key={s.name || s._id}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="clay-sm"
                    style={{
                      background: "var(--bg)",
                      borderRadius: "20px",
                      padding: "1.4rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      borderTop: `4px solid ${color}`,
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.4rem",
                        marginBottom: "0.8rem",
                        background: bg,
                        border: "var(--clay-border)",
                        boxShadow: "0 3px 0 rgba(0,0,0,0.07)",
                      }}
                    >
                      {s.icon || "📚"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 800,
                        marginBottom: "3px",
                        color: "var(--dark)",
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--muted)",
                        fontWeight: 700,
                        marginBottom: "0.8rem",
                      }}
                    >
                      {s.notesCount || 0} notes
                    </div>
                    <div
                      style={{
                        height: "5px",
                        borderRadius: "3px",
                        background: "#E5E7EB",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "3px",
                          background: color,
                          width: `${Math.min((s.notesCount / 30) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section
        id="reviews"
        style={{
          background: "var(--bg)",
          padding: "4rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "2rem",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                marginBottom: "0.5rem",
              }}
            >
              Loved by Students Across India
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--mid)",
                fontWeight: 600,
              }}
            >
              Don't just take our word for it. Here's what students say about
              NoteSwap.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.2rem",
            }}
          >
            {[
              {
                name: "Riya Sharma",
                role: "B.Tech CSE · AKTU Lucknow",
                av: "RS",
                avBg: "linear-gradient(135deg,var(--orange),#FF8C00)",
                stars: 5,
                featured: false,
                text: '"NoteSwap completely changed how I study. Found amazing Software Engineering notes just before my end sem. Absolutely love this platform!"',
              },
              {
                name: "Arjun Kumar",
                role: "B.Tech IT · AKTU Lucknow",
                av: "AK",
                avBg: "rgba(255,255,255,0.3)",
                stars: 5,
                featured: true,
                text: '"Admin verification means I can trust every note. My DBMS notes got 200+ downloads — feels amazing helping fellow students pass their exams!"',
              },
              {
                name: "Priya Mehta",
                role: "B.Tech CSE · Mumbai University",
                av: "PM",
                avBg: "linear-gradient(135deg,var(--teal),var(--green))",
                stars: 4,
                featured: false,
                text: '"The unit-wise organisation is brilliant. I find exactly Unit 3 DBMS notes in seconds. No other platform does this as well as NoteSwap!"',
              },
            ].map((r) => (
              <div
                key={r.name}
                className="clay-sm"
                style={{
                  background: r.featured ? "var(--orange)" : "white",
                  borderRadius: "22px",
                  padding: "1.8rem",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: "1rem",
                    marginBottom: "1rem",
                    letterSpacing: "2px",
                    color: r.featured ? "white" : "var(--orange)",
                  }}
                >
                  {"★".repeat(r.stars)}
                  {"☆".repeat(5 - r.stars)}
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                    marginBottom: "1.5rem",
                    fontWeight: 600,
                    color: r.featured ? "rgba(255,255,255,0.88)" : "var(--mid)",
                  }}
                >
                  {r.text}
                </p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      color: "white",
                      background: r.avBg,
                      border: "var(--clay-border)",
                      boxShadow: "0 3px 0 rgba(0,0,0,0.1)",
                    }}
                  >
                    {r.av}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: r.featured ? "white" : "var(--dark)",
                      }}
                    >
                      {r.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: r.featured
                          ? "rgba(255,255,255,0.65)"
                          : "var(--muted)",
                      }}
                    >
                      {r.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: "2rem 2rem 4rem" }}>
        <div
          className="clay"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            background: "white",
            borderRadius: "28px",
            padding: "4rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {[
            {
              w: 200,
              h: 200,
              bg: "var(--orange-light)",
              top: "-70px",
              left: "-60px",
              opacity: 0.6,
            },
            {
              w: 160,
              h: 160,
              bg: "var(--green-light)",
              bottom: "-50px",
              right: "-50px",
              opacity: 0.6,
            },
            {
              w: 100,
              h: 100,
              bg: "var(--teal-light)",
              top: "30px",
              right: "200px",
              opacity: 0.4,
            },
          ].map((b, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                borderRadius: "50%",
                width: b.w,
                height: b.h,
                background: b.bg,
                top: b.top,
                left: b.left,
                right: b.right,
                bottom: b.bottom,
                opacity: b.opacity,
              }}
            />
          ))}
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "20px",
              background: "var(--orange-light)",
              margin: "0 auto 1.4rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              position: "relative",
              zIndex: 1,
              border: "var(--clay-border)",
              boxShadow: "0 5px 0 rgba(180,100,0,0.15)",
            }}
          >
            📚
          </div>
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "2.2rem",
              fontWeight: 900,
              color: "var(--dark)",
              marginBottom: "0.8rem",
              letterSpacing: "-0.5px",
              position: "relative",
              zIndex: 1,
            }}
          >
            Ready to Study Smarter?
          </h2>
          <p
            style={{
              fontSize: "0.93rem",
              color: "var(--mid)",
              marginBottom: "2rem",
              maxWidth: "480px",
              marginLeft: "auto",
              marginRight: "auto",
              fontWeight: 600,
              lineHeight: 1.7,
              position: "relative",
              zIndex: 1,
            }}
          >
            Join 3,800+ students already sharing notes and acing their exams
            together on NoteSwap.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "2rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Link href="/home">
              <button className="btn-orange" style={{ padding: "14px 32px" }}>
                📚 Browse Notes Free
              </button>
            </Link>
            <Link href="/signup">
              <button className="btn-white" style={{ padding: "12px 28px" }}>
                👤 Create Account
              </button>
            </Link>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            {[
              "✅ Admin Verified",
              "🔒 Free Forever",
              "🎓 200+ Subjects",
              "📚 12K+ Notes",
              "👤 3.8K Students",
            ].map((c) => (
              <span
                key={c}
                className="clay-pill"
                style={{
                  background: "var(--bg)",
                  color: "var(--mid)",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  padding: "6px 14px",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <div style={{ padding: "0 2rem 2rem" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            background: "#1a1f36",
            borderRadius: "28px",
            border: "2px solid rgba(255,255,255,0.05)",
            boxShadow: "0 8px 0 rgba(0,0,0,0.15), 0 16px 40px rgba(0,0,0,0.2)",
            overflow: "hidden",
          }}
        >
          {/* Footer Main */}
          <div
            style={{
              padding: "3rem",
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "3rem",
            }}
          >
            {/* Brand */}
            <div>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "9px",
                    background: "var(--orange)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    border: "2px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 3px 0 var(--orange-dark)",
                  }}
                >
                  📚
                </div>
                Note<span style={{ color: "var(--orange)" }}>Swap</span>
              </div>

              <p
                style={{
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.75,
                  marginBottom: "1.2rem",
                  fontWeight: 600,
                }}
              >
                India's leading student notes sharing platform — verified,
                organised, and completely free for all college students.
              </p>

              <div style={{ display: "flex", gap: "8px" }}>
                {["f", "X", "in", "ig"].map((s) => (
                  <div key={s} className="social-btn">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                head: "Platform",
                links: [
                  "Browse Notes",
                  "Upload Notes",
                  "Subjects",
                  "How it Works",
                ],
              },
              {
                head: "Company",
                links: ["About Us", "Blog", "Careers", "Contact"],
              },
              {
                head: "Legal",
                links: [
                  "Privacy Policy",
                  "Terms of Service",
                  "Report Issue",
                  "Help Center",
                ],
              },
            ].map((col) => (
              <div key={col.head}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: "1rem",
                  }}
                >
                  {col.head}
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "9px",
                  }}
                >
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="footer-link">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer Bottom Bar */}
          <div
            style={{
              padding: "1rem 3rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.2)",
              fontWeight: 700,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span>© 2026 NoteSwap. All rights reserved.</span>
            <span>Built with ❤️ for students across India</span>
          </div>
        </div>
      </div>
    </main>
  );
}
