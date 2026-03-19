"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getNotes } from "../../services/note.service";
import { getSubjects } from "../../services/subject.service";
import { logout } from "../../firebase/auth.firebase";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState("All");
  const [activeSection, setActiveSection] = useState("Home");
  const [search, setSearch] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);

  // ✅ Handle auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("🏠 No user — redirecting to login");
      router.replace("/login");
    }
  }, [user, authLoading]);

  // ✅ Only fetch data AFTER user is confirmed
  useEffect(() => {
    if (!authLoading && user) {
      console.log("🏠 User confirmed — fetching data");
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    setNotesLoading(true);
    try {
      const [notesRes, subjectsRes] = await Promise.all([
        getNotes({ limit: 9 }),
        getSubjects(),
      ]);
      setNotes(notesRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (err) {
      console.error("🏠 Fetch error:", err);
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchNotesBySubject = async (subjectId, subjectName) => {
    setActiveSubject(subjectName);
    setNotesLoading(true);
    try {
      const params = subjectId
        ? { subject: subjectId, limit: 9 }
        : { limit: 9 };
      const res = await getNotes(params);
      setNotes(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setNotesLoading(true);
    try {
      const res = await getNotes({ search, limit: 9 });
      setNotes(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const subjectColors = [
    "var(--orange)",
    "var(--teal)",
    "var(--green)",
    "var(--pink)",
    "var(--orange)",
    "var(--teal)",
    "var(--green)",
    "var(--pink)",
  ];
  const subjectBgs = [
    "var(--orange-light)",
    "var(--teal-light)",
    "var(--green-light)",
    "var(--pink-light)",
    "var(--orange-light)",
    "var(--teal-light)",
    "var(--green-light)",
    "var(--pink-light)",
  ];

  // ✅ Show spinner while auth loads or user not confirmed yet
  if (authLoading || (!authLoading && !user)) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: "1rem",
          background: "var(--bg)",
        }}
      >
        <div className="spinner" />
        <p
          style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.9rem" }}
        >
          Loading NoteSwap...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* NAVBAR */}
      <nav
        style={{
          background: "white",
          borderBottom: "2px solid rgba(255,255,255,0.8)",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link
          href="/home"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "9px",
              background: "var(--orange)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              border: "var(--clay-border)",
              boxShadow: "0 3px 0 var(--orange-dark)",
            }}
          >
            📚
          </div>
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "1.2rem",
              fontWeight: 900,
              color: "var(--dark)",
            }}
          >
            Note<span style={{ color: "var(--orange)" }}>Swap</span>
          </span>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg)",
            border: "var(--clay-border)",
            borderRadius: "50px",
            padding: "8px 18px",
            width: "300px",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ color: "var(--muted)", fontSize: "13px" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, subjects..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontFamily: "Nunito, sans-serif",
              fontSize: "0.86rem",
              color: "var(--dark)",
              width: "100%",
              fontWeight: 600,
            }}
          />
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/upload">
            <button
              className="btn-orange"
              style={{ padding: "8px 18px", fontSize: "0.84rem" }}
            >
              + Upload Notes
            </button>
          </Link>
          <div
            className="clay-circle"
            style={{
              width: "34px",
              height: "34px",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            🔔
          </div>
          <Link href="/profile">
            <div
              className="clay-circle"
              style={{
                width: "34px",
                height: "34px",
                background: "var(--orange-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "var(--orange-dark)",
                cursor: "pointer",
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </Link>
        </div>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          minHeight: "calc(100vh - 60px)",
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            background: "white",
            borderRight: "2px solid rgba(255,255,255,0.8)",
            padding: "1.5rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            boxShadow: "4px 0 16px rgba(0,0,0,0.04)",
            position: "sticky",
            top: "60px",
            height: "calc(100vh - 60px)",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              fontWeight: 900,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--muted)",
              padding: "0.5rem 0.75rem",
              marginTop: "0.8rem",
            }}
          >
            Menu
          </div>

          {/* Menu Items */}
          {[
            { icon: "🏠", label: "Home", href: "/home" },
            { icon: "📖", label: "Browse Notes", href: "/home" },
            { icon: "🔖", label: "Bookmarks", href: "/profile" },
            { icon: "❤️", label: "Liked Notes", href: "/profile" },
            { icon: "👤", label: "My Profile", href: "/profile" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{ textDecoration: "none" }}
              onClick={() => setActiveSection(item.label)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  transition: "all 0.15s",
                  background:
                    activeSection === item.label
                      ? "var(--orange-light)"
                      : "transparent",
                  color:
                    activeSection === item.label
                      ? "var(--orange-dark)"
                      : "var(--mid)",
                  border:
                    activeSection === item.label
                      ? "2px solid rgba(255,255,255,0.9)"
                      : "2px solid transparent",
                  boxShadow:
                    activeSection === item.label
                      ? "0 3px 0 rgba(0,0,0,0.04)"
                      : "none",
                }}
              >
                <span style={{ fontSize: "15px" }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}

          <div
            style={{
              fontSize: "0.65rem",
              fontWeight: 900,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--muted)",
              padding: "0.5rem 0.75rem",
              marginTop: "0.8rem",
            }}
          >
            Subjects
          </div>

          {subjects.slice(0, 6).map((s, i) => (
            <div
              key={s._id}
              onClick={() => {
                fetchNotesBySubject(s._id, s.name);
                setActiveSection(s.name);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "0.84rem",
                fontWeight: 700,
                transition: "all 0.15s",
                background:
                  activeSection === s.name
                    ? "var(--orange-light)"
                    : "transparent",
                color:
                  activeSection === s.name
                    ? "var(--orange-dark)"
                    : "var(--mid)",
                border:
                  activeSection === s.name
                    ? "2px solid rgba(255,255,255,0.9)"
                    : "2px solid transparent",
                boxShadow:
                  activeSection === s.name
                    ? "0 3px 0 rgba(0,0,0,0.04)"
                    : "none",
              }}
            >
              <span
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: subjectColors[i % subjectColors.length],
                  minWidth: "9px",
                  display: "inline-block",
                  border: "2px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.08)",
                }}
              />
              <span style={{ flex: 1 }}>{s.name}</span>
              <span
                style={{
                  background: activeSection === s.name ? "white" : "var(--bg)",
                  borderRadius: "20px",
                  padding: "2px 8px",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color:
                    activeSection === s.name ? "var(--orange)" : "var(--muted)",
                }}
              >
                {s.notesCount || 0}
              </span>
            </div>
          ))}

          {/* View all */}
          <div
            onClick={() => {
              fetchNotesBySubject(null, "All");
              setActiveSection("Home");
            }}
            style={{
              color: "var(--orange)",
              fontSize: "0.8rem",
              padding: "0.5rem 0.75rem",
              cursor: "pointer",
              fontWeight: 800,
              marginTop: "4px",
            }}
          >
            + View all subjects
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: "1rem",
              borderTop: "1.5px solid #F0F1F8",
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "12px",
                border: "var(--clay-border)",
                background: "#FEF2F2",
                color: "#991B1B",
                fontFamily: "Nunito, sans-serif",
                fontSize: "0.82rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 2px 0 #FECACA",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ padding: "1.8rem", overflowY: "auto" }}>
          {/* Welcome Banner */}
          <div
            style={{
              background: "var(--orange)",
              borderRadius: "20px",
              padding: "1.6rem 2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              border: "var(--clay-border)",
              boxShadow:
                "0 8px 0 var(--orange-dark), 0 14px 32px rgba(245,166,35,0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                right: "-40px",
                top: "-50px",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
                right: "120px",
                bottom: "-30px",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 900,
                  color: "white",
                  marginBottom: "3px",
                }}
              >
                Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
              </h2>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 600,
                }}
              >
                Discover new notes added today across all subjects
              </p>
            </div>
            <Link href="/upload" style={{ position: "relative", zIndex: 1 }}>
              <button
                style={{
                  background: "white",
                  color: "var(--orange)",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: "50px",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: "0.84rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 0 rgba(0,0,0,0.08)",
                }}
              >
                Upload Notes
              </button>
            </Link>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "1.5rem",
            }}
          >
            {[
              {
                label: "Notes uploaded",
                val: user?.totalUploads || 0,
                sub: "Your contributions",
                color: "var(--orange)",
              },
              {
                label: "Total downloads",
                val: user?.totalDownloads || 0,
                sub: "On your notes",
                color: "var(--green)",
              },
              {
                label: "Bookmarked",
                val: user?.bookmarks?.length || 0,
                sub: "Saved for later",
                color: "var(--teal)",
              },
              {
                label: "Subjects",
                val: subjects.length,
                sub: "Available",
                color: "var(--pink)",
              },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--muted)",
                    fontWeight: 700,
                    marginBottom: "3px",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "1.4rem",
                    fontWeight: 900,
                    color: "var(--dark)",
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    marginTop: "2px",
                    color: s.color,
                  }}
                >
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Section Header */}
          <div className="section-header" style={{ marginBottom: "0.8rem" }}>
            <div className="section-title">
              Trending Notes
              <span
                style={{
                  background: "var(--orange)",
                  color: "white",
                  fontSize: "0.65rem",
                  fontWeight: 900,
                  padding: "3px 9px",
                  borderRadius: "20px",
                  borderBottom: "2px solid var(--orange-dark)",
                }}
              >
                🔥 Hot
              </span>
            </div>
            <span className="see-all">See all →</span>
          </div>

          {/* Subject Filter Pills */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "1.2rem",
            }}
          >
            <button
              onClick={() => fetchNotesBySubject(null, "All")}
              className={
                activeSubject === "All" ? "subject-pill-active" : "subject-pill"
              }
            >
              All
            </button>
            {subjects.slice(0, 5).map((s) => (
              <button
                key={s._id}
                onClick={() => fetchNotesBySubject(s._id, s.name)}
                className={
                  activeSubject === s.name
                    ? "subject-pill-active"
                    : "subject-pill"
                }
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Notes Grid */}
          {notesLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "3rem",
              }}
            >
              <div className="spinner" />
            </div>
          ) : notes.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem",
                background: "white",
                borderRadius: "20px",
                border: "var(--clay-border)",
                boxShadow: "var(--clay-shadow-sm)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
              <h3
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 900,
                  marginBottom: "0.5rem",
                }}
              >
                No notes found
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                }}
              >
                Be the first to upload notes for this subject!
              </p>
              <Link href="/upload">
                <button
                  className="btn-orange"
                  style={{ marginTop: "1rem", padding: "10px 24px" }}
                >
                  Upload Notes
                </button>
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {notes.map((note, i) => (
                <NoteCard key={note._id} note={note} index={i} />
              ))}
            </div>
          )}

          {/* Subject-wise Sections */}
          {subjects.slice(0, 3).map((subject, si) => (
            <SubjectSection
              key={subject._id}
              subject={subject}
              color={subjectColors[si % subjectColors.length]}
              bg={subjectBgs[si % subjectBgs.length]}
            />
          ))}
        </main>
      </div>
    </div>
  );
}

// ===== NOTE CARD =====
function NoteCard({ note, index }) {
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
  const color = colors[index % colors.length];
  const bg = bgs[index % bgs.length];

  return (
    <Link href={`/notes/${note._id}`} style={{ textDecoration: "none" }}>
      <div className="note-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 900,
              padding: "4px 11px",
              borderRadius: "50px",
              background: bg,
              color: color,
              border: "1.5px solid rgba(255,255,255,0.9)",
            }}
          >
            {note.subject?.name || "General"}
          </span>
        </div>
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: "0.88rem",
            fontWeight: 800,
            color: "var(--dark)",
            marginBottom: "3px",
            lineHeight: 1.3,
          }}
        >
          {note.title}
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--muted)",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          {note.unit} · Sem {note.semester?.replace("Semester ", "")} ·{" "}
          {note.fileType?.toUpperCase()}
        </div>
        <div
          style={{
            background: "var(--bg)",
            borderRadius: "10px",
            padding: "0.7rem",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            marginBottom: "8px",
          }}
        >
          {[100, 78, 88].map((w, i) => (
            <div
              key={i}
              style={{
                height: "6px",
                borderRadius: "3px",
                background: "#DDE0EC",
                width: `${w}%`,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "8px",
            borderTop: "1.5px solid #F0F1F8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.58rem",
                fontWeight: 800,
                color: "white",
                border: "var(--clay-border)",
                boxShadow: "0 2px 0 rgba(0,0,0,0.08)",
              }}
            >
              {note.uploadedBy?.name?.charAt(0) || "U"}
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--mid)",
                fontWeight: 700,
              }}
            >
              {note.uploadedBy?.name?.split(" ")[0] || "Student"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--pink)",
                fontWeight: 700,
              }}
            >
              ❤️ {note.likesCount || 0}
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--muted)",
                fontWeight: 700,
              }}
            >
              ⬇ {note.downloadsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ===== SUBJECT SECTION =====
function SubjectSection({ subject, color, bg }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await getNotes({ subject: subject._id, limit: 3 });
        setNotes(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [subject._id]);

  if (loading || notes.length === 0) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "0.8rem",
          paddingBottom: "0.7rem",
          borderBottom: "2px solid rgba(255,255,255,0.8)",
        }}
      >
        <div
          className="clay-sm"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            background: bg,
          }}
        >
          {subject.icon || "📚"}
        </div>
        <div>
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "0.92rem",
              fontWeight: 900,
              color: "var(--dark)",
            }}
          >
            {subject.name}
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--muted)",
              fontWeight: 700,
            }}
          >
            {subject.notesCount || 0} notes
          </div>
        </div>
        <span className="see-all" style={{ marginLeft: "auto" }}>
          View all →
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
      >
        {notes.map((note, i) => (
          <NoteCard key={note._id} note={note} index={i} />
        ))}
      </div>
    </div>
  );
}
