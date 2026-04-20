"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getNotes, getBranches } from "../../services/note.service";
import { getSubjects } from "../../services/subject.service";
import { logout } from "../../firebase/auth.firebase";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} from '../../services/notification.service';
import { getSocket } from '../../lib/socket'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeSection, setActiveSection] = useState("Home");
  const [search, setSearch] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAllHomeNotes, setShowAllHomeNotes] = useState(false);

  // ✅ Progressive Disclosure States
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); // null = all branches
  const [selectedSubject, setSelectedSubject] = useState(null); // null = all subjects
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  const [notifications, setNotifications]       = useState([])
  const [unreadCount, setUnreadCount]           = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [newNoteToast, setNewNoteToast] = useState(null)


  // Handle auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("🏠 No user — redirecting to login");
      router.replace("/login");
    }
  }, [user, authLoading]);

  // Only fetch data AFTER user is confirmed
  useEffect(() => {
    if (!authLoading && user) {
      console.log("🏠 User confirmed — fetching data");
      fetchData();
      fetchNotifications();
    }
  }, [user, authLoading]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.data.data || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (err) {
      console.error('Fetch notifications error:', err)
    }
  }

useEffect(() => {
  if (!user) return

  const socket = getSocket()

  // ✅ Existing — real-time notifications
  socket.on('new_notification', (notification) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
  })

  // ✅ New — instantly add approved note to feed
  socket.on('new_note_available', (note) => {
    console.log('📚 New note available:', note.title)

    // Only add if it matches current filters
    const branchMatch   = !selectedBranch  || note.branch   === selectedBranch
    const subjectMatch  = !selectedSubject || note.subject?._id === selectedSubject?._id

    if (branchMatch && subjectMatch) {
      // Add to top of notes list
      setNotes(prev => {
        // Avoid duplicates
        const exists = prev.find(n => n._id === note._id)
        if (exists) return prev
        return [note, ...prev]
      })

      // ✅ Show a subtle "new note" toast
      setNewNoteToast(note)
      setTimeout(() => setNewNoteToast(null), 4000)
    }
  })

  return () => {
    socket.off('new_notification')
    socket.off('new_note_available')
  }
}, [user, selectedBranch, selectedSubject])

  const fetchData = async () => {
    setNotesLoading(true);
    try {
      const [notesRes, subjectsRes, branchesRes] = await Promise.all([
        getNotes({ limit: 9 }),
        getSubjects(),
        getBranches(),
      ]);
      setNotes(notesRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
      setBranches(branchesRes.data.data || []);
      
      // Reset filters on fresh fetch
      setSelectedBranch(null);
      setSelectedSubject(null);
      setFilteredSubjects([]);
    } catch (err) {
      console.error("🏠 Fetch error:", err);
    } finally {
      setNotesLoading(false);
    }
  };

  // ✅ 1. Auto-Read Logic on Dropdown Toggle
  const handleToggleDropdown = async () => {
    const isOpening = !showNotifications;
    setShowNotifications(isOpening);

    if (isOpening) {
      fetchNotifications(); // Refresh data just in case

      if (unreadCount > 0) {
        try {
          // Optimistic UI Update: Make it feel instant
          setUnreadCount(0);
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          
          // Background DB Sync
          await markAllAsRead();
        } catch (error) {
          console.error("Failed to mark notifications as read", error);
        }
      }
    }
  };

  // ✅ 2. Clear All Logic
  const handleClearAll = async () => {
    try {
      // Optimistic UI Update: Clear instantly
      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);

      // Background DB Sync
      await clearAllNotifications();
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id)
      setNotifications(prev =>
        prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'note_liked':      return '❤️'
      case 'note_downloaded': return '⬇️'
      case 'note_approved':   return '✅'
      case 'note_rejected':   return '❌'
      case 'note_commented':  return '💬'
      default:                return '🔔'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'note_liked':      return { bg: 'var(--pink-light)',   color: 'var(--pink)'        }
      case 'note_downloaded': return { bg: 'var(--teal-light)',   color: 'var(--teal)'        }
      case 'note_approved':   return { bg: 'var(--green-light)',  color: 'var(--green)'       }
      case 'note_rejected':   return { bg: '#FEF2F2',             color: '#991B1B'            }
      case 'note_commented':  return { bg: 'var(--orange-light)', color: 'var(--orange-dark)' }
      default:                return { bg: 'var(--bg)',           color: 'var(--mid)'         }
    }
  }

  // ✅ Handle Branch Selection
  const handleBranchSelect = async (branchName) => {
    setSelectedBranch(branchName);
    setSelectedSubject(null); 
    setActiveSection(branchName || "Home"); 

    if (!branchName) {
      setFilteredSubjects([]);
      fetchData(); 
      return;
    }

    const filtered = subjects.filter(s => s.branch === branchName || s.branches?.includes(branchName));
    setFilteredSubjects(filtered);

    setNotesLoading(true);
    try {
      const res = await getNotes({ branch: branchName, limit: 9 });
      setNotes(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setNotesLoading(false);
    }
  };

  // ✅ Handle Subject Selection
  const handleSubjectSelect = async (subjectObj) => {
    setSelectedSubject(subjectObj);
    if (subjectObj) setActiveSection(subjectObj.name);

    setNotesLoading(true);
    try {
      let params = { limit: 9 };
      if (subjectObj) {
        params.subject = subjectObj._id;
      } else if (selectedBranch) {
        params.branch = selectedBranch;
      }
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
    "var(--orange)", "var(--teal)", "var(--green)", "var(--pink)",
    "var(--orange)", "var(--teal)", "var(--green)", "var(--pink)",
  ];
  const subjectBgs = [
    "var(--orange-light)", "var(--teal-light)", "var(--green-light)", "var(--pink-light)",
    "var(--orange-light)", "var(--teal-light)", "var(--green-light)", "var(--pink-light)",
  ];

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
        <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.9rem" }}>
          Loading NoteSwap...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`
        .home-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          min-height: calc(100vh - 60px);
        }
        .home-sidebar {
          background: white;
          border-right: 2px solid rgba(255,255,255,0.8);
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 3px;
          box-shadow: 4px 0 16px rgba(0,0,0,0.04);
          position: sticky;
          top: 60px;
          height: calc(100vh - 60px);
          overflow-y: auto;
        }
        .home-main {
          padding: 1.8rem;
          overflow-y: auto;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 1.5rem;
        }
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .home-sidebar {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-right: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
          z-index: 10;
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--dark);
          padding: 0;
          margin-right: 12px;
        }
        .sidebar-overlay {
          display: none;
        }
        .mobile-close-btn {
          display: none;
        }
        
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .notes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .home-layout {
            grid-template-columns: 1fr;
          }
          .home-nav {
            padding: 0 1rem !important;
          }
          .home-nav form {
            width: auto !important;
            flex: 1;
            margin: 0 10px;
          }
          .home-nav form input {
            width: 80px !important;
          }
          .mobile-menu-btn {
            display: block;
            margin-right: 16px;
          }
          .mobile-close-btn {
            display: block !important;
          }
          .nav-right-actions {
            gap: 6px !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .upload-btn {
            display: none !important;
          }
          .home-sidebar {
            position: fixed;
            top: 0;
            left: -300px;
            width: 260px;
            height: 100vh;
            z-index: 1000;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            box-shadow: 4px 0 24px rgba(0,0,0,0.15);
            padding-top: 1rem;
          }
          .home-sidebar.open {
            left: 0;
          }
          .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 999;
            backdrop-filter: blur(2px);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }
          .sidebar-overlay.open {
            display: block;
            opacity: 1;
            pointer-events: auto;
          }
          .home-main {
            padding: 1rem;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .notes-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 500px) {
          .hide-on-small {
            display: none !important;
          }
          .home-nav form {
            display: none !important;
          }
        }
          /* 👇 NOTIFICATION CSS 👇 */
        .notification-dropdown {
          position: absolute;
          top: 42px;
          right: 0;
          background: white;
          border-radius: 20px;
          width: 320px;
          z-index: 100;
          border: var(--clay-border);
          box-shadow: 0 8px 0 rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.12);
          overflow: hidden;
          max-height: 480px;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .notification-dropdown {
            position: fixed;
            top: 70px;
            left: 15px;
            right: 15px;
            width: auto; 
            max-height: calc(100vh - 100px);
          }
        }
      `}</style>
      
      {/* NAVBAR */}
      <nav
        className="home-nav nav-glass"
        style={{
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
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
        </div>

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

        <div className="nav-right-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/upload">
            <button
              className="btn-orange upload-btn"
              style={{ padding: "8px 18px", fontSize: "0.84rem", whiteSpace: "nowrap" }}
            >
              +Upload<span className="hide-on-mobile">Notes</span>
            </button>
          </Link>
          
          {/* ===== NOTIFICATION BELL ===== */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={handleToggleDropdown} // ✅ Updated to use our new logic
              className="clay-circle"
              style={{
                width: '34px', height: '34px', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', cursor: 'pointer', position: 'relative',
              }}
            >
              🔔
              {/* Unread badge */}
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: 'var(--pink)', border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.55rem', fontWeight: 900, color: 'white',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>

            {/* Dropdown */}
            {showNotifications && (
              <>
                {/* Overlay to close */}
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  onClick={() => setShowNotifications(false)}
                />
                
                <div className="notification-dropdown">

                  {/* Header */}
                  <div style={{
                    padding: '0.9rem 1.1rem',
                    borderBottom: '2px solid var(--bg)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexShrink: 0, // ✅ Prevents header from squishing
                  }}>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
                      fontWeight: 900, color: 'var(--dark)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      🔔 Notifications
                      {unreadCount > 0 && (
                        <span style={{
                          background: 'var(--orange)', color: 'white',
                          fontSize: '0.62rem', fontWeight: 900,
                          padding: '2px 8px', borderRadius: '20px',
                          whiteSpace: 'nowrap' // ✅ Prevents the oval badge issue
                        }}>{unreadCount} new</span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* ✅ Removed "Mark all read" button */}
                      
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700,
                            padding: '4px 8px' // Better touch target
                          }}
                        >Clear all</button>
                      )}
                    </div>
                  </div>

                  {/* Notification list */}
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🔔</div>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--dark)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                          All caught up!
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>
                          No notifications yet
                        </div>
                      </div>
                    ) : (
                      notifications.map(n => {
                        const { bg, color } = getNotificationColor(n.type)
                        return (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              padding: '0.8rem 1.1rem',
                              borderBottom: '1.5px solid var(--bg)',
                              display: 'flex', gap: '10px', alignItems: 'flex-start',
                              cursor: 'pointer',
                              background: n.isRead ? 'white' : 'rgba(245,166,35,0.04)',
                              transition: 'background 0.15s',
                            }}
                          >
                            {/* Icon - ✅ Added flexShrink: 0 */}
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '10px',
                              background: bg, display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              fontSize: '1rem', minWidth: '36px', flexShrink: 0,
                            }}>
                              {getNotificationIcon(n.type)}
                            </div>

                            {/* Content - ✅ Added minWidth: 0 so long text wraps properly */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: '0.78rem', fontWeight: n.isRead ? 600 : 800,
                                color: 'var(--dark)', marginBottom: '2px', lineHeight: 1.4,
                                wordWrap: 'break-word',
                              }}>
                                {n.message}
                              </div>
                              {n.rejectionReason && (
                                <div style={{
                                  fontSize: '0.7rem', color: '#991B1B',
                                  fontWeight: 600, marginBottom: '2px',
                                  background: '#FEF2F2', padding: '3px 8px',
                                  borderRadius: '6px', marginTop: '3px',
                                  wordWrap: 'break-word',
                                }}>
                                  Reason: {n.rejectionReason}
                                </div>
                              )}
                              <div style={{
                                fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600,
                              }}>
                                {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </div>
                            </div>

                            {/* Unread dot - ✅ Added flexShrink: 0 */}
                            {!n.isRead && (
                              <div style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: 'var(--orange)', minWidth: '8px', marginTop: '4px',
                                flexShrink: 0,
                              }} />
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div style={{
                      padding: '0.7rem', textAlign: 'center',
                      borderTop: '2px solid var(--bg)', flexShrink: 0,
                      fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600,
                    }}>
                      Showing last {notifications.length} notifications
                    </div>
                  )}
                </div>
              </>
            )}
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

      <div className="home-layout">
        {/* Overlay for mobile sidebar */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* SIDEBAR */}
        <aside className={`home-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', padding: '0 0.75rem' }}>
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 900,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              Menu
            </div>
            <button 
              className="mobile-close-btn"
              onClick={() => setIsSidebarOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--muted)', cursor: 'pointer' }}
            >✕</button>
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
              onClick={() => { setActiveSection(item.label); setIsSidebarOpen(false); }}
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

          {/* ✅ Sidebar subjects — show filtered if branch selected, else all */}
          {(selectedBranch ? filteredSubjects : subjects).slice(0, 6).map((s, i) => (
            <div
              key={s._id}
              onClick={() => {
                handleSubjectSelect(s)
                setIsSidebarOpen(false)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '12px',
                cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700,
                transition: 'all 0.15s',
                background: activeSection === s.name ? 'var(--orange-light)' : 'transparent',
                color: activeSection === s.name ? 'var(--orange-dark)' : 'var(--mid)',
                border: activeSection === s.name ? 'var(--clay-border)' : '2px solid transparent',
              }}
            >
              <span style={{
                width: '9px', height: '9px', borderRadius: '50%',
                background: subjectColors[i % subjectColors.length],
                minWidth: '9px',
              }} />
              <span style={{ flex: 1 }}>{s.name}</span>
              <span style={{
                background: activeSection === s.name ? 'white' : 'var(--bg)',
                borderRadius: '20px', padding: '2px 8px',
                fontSize: '0.68rem', fontWeight: 800,
                color: activeSection === s.name ? 'var(--orange)' : 'var(--muted)',
              }}>{s.notesCount || 0}</span>
            </div>
          ))}

          {/* Logout & Admin Footer */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1.5px solid #F0F1F8' }}>
            {user?.role === 'admin' && (
              <Link href="/admin" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '12px',
                  cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700,
                  color: 'var(--orange-dark)',
                  background: 'var(--orange-light)',
                  border: 'var(--clay-border)',
                  boxShadow: '0 3px 0 rgba(0,0,0,0.04)',
                  marginBottom: '8px',
                }}>
                  <span>⚙️</span>
                  Admin Panel
                </div>
              </Link>
            )}

            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '12px',
                border: 'var(--clay-border)', background: '#FEF2F2',
                color: '#991B1B', fontFamily: 'Nunito, sans-serif',
                fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 2px 0 #FECACA',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="home-main">
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
          <div className="stats-grid">
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
              <div key={s.label} className="stat-card hover-float">
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

          {/* ===== PROGRESSIVE FILTERS SECTION ===== */}
          <div style={{ marginBottom: '1.5rem' }}>
            
            {/* Section header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1rem',
            }}>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem',
                fontWeight: 900, color: 'var(--dark)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                🔥 Trending Notes
                {selectedBranch && (
                  <span style={{
                    background: 'var(--orange)', color: 'white',
                    fontSize: '0.65rem', fontWeight: 900,
                    padding: '3px 9px', borderRadius: '20px',
                    borderBottom: '2px solid var(--orange-dark)',
                  }}>{selectedBranch}</span>
                )}
                {selectedSubject && (
                  <span style={{
                    background: 'var(--teal-light)', color: 'var(--teal)',
                    fontSize: '0.65rem', fontWeight: 900,
                    padding: '3px 9px', borderRadius: '20px',
                  }}>{selectedSubject.name}</span>
                )}
              </div>

              {/* Right side actions: See All Toggle & Clear Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {notes.length > 4 && (
                  <span
                    onClick={() => setShowAllHomeNotes(!showAllHomeNotes)}
                    style={{
                      cursor: 'pointer', fontSize: '0.78rem',
                      color: 'var(--orange)', fontWeight: 800,
                      userSelect: 'none', transition: 'opacity 0.2s'
                    }}
                  >
                    {showAllHomeNotes ? 'See less ↑' : 'See all →'}
                  </span>
                )}

                {/* Reset filters button */}
                {(selectedBranch || selectedSubject) && (
                  <button
                    onClick={() => {
                      setSelectedBranch(null)
                      setSelectedSubject(null)
                      setActiveSection("Home")
                      setFilteredSubjects([])
                      fetchData()
                    }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                  >✕ Clear filters</button>
                )}
              </div>
            </div>

            {/* ===== BRANCH PILLS ===== */}
            {branches.length > 0 && (
              <div style={{ marginBottom: selectedBranch ? '0.8rem' : '0' }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem',
                }}>Select Branch</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

                  {/* All branches pill */}
                  <button
                    onClick={() => handleBranchSelect(null)}
                    style={{
                      padding: '7px 16px', borderRadius: '50px',
                      border: 'var(--clay-border)',
                      fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', fontWeight: 800,
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: !selectedBranch ? 'var(--dark)' : 'white',
                      color: !selectedBranch ? 'white' : 'var(--mid)',
                      boxShadow: !selectedBranch ? '0 3px 0 rgba(0,0,0,0.2)' : 'var(--clay-shadow-sm)',
                    }}
                  >All</button>

                  {/* Branch pills */}
                  {branches.map(b => (
                    <button
                      key={b.name}
                      onClick={() => handleBranchSelect(b.name)}
                      style={{
                        padding: '7px 16px', borderRadius: '50px',
                        border: 'var(--clay-border)',
                        fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', fontWeight: 800,
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: selectedBranch === b.name ? 'var(--orange)' : 'white',
                        color: selectedBranch === b.name ? 'white' : 'var(--mid)',
                        boxShadow: selectedBranch === b.name
                          ? '0 3px 0 var(--orange-dark)'
                          : 'var(--clay-shadow-sm)',
                      }}
                    >
                      {b.name}
                      <span style={{
                        marginLeft: '5px', fontSize: '0.65rem',
                        opacity: selectedBranch === b.name ? 0.8 : 0.6,
                      }}>({b.notesCount})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ===== SUBJECT PILLS — only visible when branch selected ===== */}
            {selectedBranch && filteredSubjects.length > 0 && (
              <div style={{
                background: 'white', borderRadius: '16px',
                padding: '0.8rem 1rem',
                border: 'var(--clay-border)',
                boxShadow: 'var(--clay-shadow-sm)',
                animation: 'fadeIn 0.2s ease',
              }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.6rem',
                }}>Select Subject in {selectedBranch}</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

                  {/* All subjects in branch */}
                  <button
                    onClick={() => handleSubjectSelect(null)}
                    style={{
                      padding: '6px 14px', borderRadius: '50px',
                      border: 'var(--clay-border)',
                      fontFamily: 'Nunito, sans-serif', fontSize: '0.76rem', fontWeight: 800,
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: !selectedSubject ? 'var(--orange-light)' : 'var(--bg)',
                      color: !selectedSubject ? 'var(--orange-dark)' : 'var(--mid)',
                    }}
                  >All {selectedBranch} subjects</button>

                  {/* Subject pills */}
                  {filteredSubjects.map((s, i) => {
                    const color = subjectColors[i % subjectColors.length]
                    const bg    = subjectBgs[i % subjectBgs.length]

                    return (
                      <button
                        key={s._id}
                        onClick={() => handleSubjectSelect(s)}
                        style={{
                          padding: '6px 14px', borderRadius: '50px',
                          border: 'var(--clay-border)',
                          fontFamily: 'Nunito, sans-serif', fontSize: '0.76rem', fontWeight: 800,
                          cursor: 'pointer', transition: 'all 0.2s',
                          background: selectedSubject?._id === s._id ? bg : 'var(--bg)',
                          color: selectedSubject?._id === s._id ? color : 'var(--mid)',
                          boxShadow: selectedSubject?._id === s._id ? `0 2px 0 rgba(0,0,0,0.06)` : 'none',
                        }}
                      >
                        {s.name}
                        <span style={{ marginLeft: '4px', fontSize: '0.62rem', opacity: 0.7 }}>
                          ({s.notesCount || 0})
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ===== NO SUBJECTS MESSAGE ===== */}
            {selectedBranch && filteredSubjects.length === 0 && (
              <div style={{
                background: 'white', borderRadius: '16px',
                padding: '0.8rem 1rem', border: 'var(--clay-border)',
                fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600,
                textAlign: 'center',
              }}>
                No subjects found for {selectedBranch} yet. Be the first to upload!
              </div>
            )}
          </div>


          {/* ===== NEW NOTE TOAST ===== */}
{newNoteToast && (
  <div style={{
    background: 'var(--green)',
    borderRadius: '50px',
    padding: '10px 20px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
    animation: 'slideDown 0.3s ease',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '1rem' }}>📚</span>
      <div>
        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'white' }}>
          New note just added: {newNoteToast.title}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', marginLeft: '8px', fontWeight: 600 }}>
          by {newNoteToast.uploadedBy?.name}
        </span>
      </div>
    </div>
    <button
      onClick={() => setNewNoteToast(null)}
      style={{
        background: 'rgba(255,255,255,0.2)', border: 'none',
        borderRadius: '50%', width: '24px', height: '24px',
        cursor: 'pointer', color: 'white', fontSize: '0.9rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >×</button>
  </div>
)}

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
                Be the first to upload notes for this selection!
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
            <>
              <div className="notes-grid" style={{ marginBottom: notes.length > 4 ? "1rem" : "2rem" }}>
                {notes.slice(0, showAllHomeNotes ? notes.length : 4).map((note, i) => (
                  <NoteCard key={note._id} note={note} index={i} />
                ))}
              </div>
            </>
          )}

          {/* Subject-wise Sections */}
          {!selectedBranch && subjects.slice(0, 3).map((subject, si) => (
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
  const colors = ['var(--orange)', 'var(--teal)', 'var(--green)', 'var(--pink)']
  const bgs    = ['var(--orange-light)', 'var(--teal-light)', 'var(--green-light)', 'var(--pink-light)']
  const color  = colors[index % colors.length]
  const bg     = bgs[index % bgs.length]

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

  return (
    <Link href={`/notes/${note._id}`} style={{ textDecoration: 'none' }}>
      <div className="note-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Top — subject + file type */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 900, padding: '4px 11px',
            borderRadius: '50px', background: bg, color: color,
            border: '1.5px solid rgba(255,255,255,0.9)',
          }}>{note.subject?.name || 'General'}</span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 800,
            color: 'var(--muted)', display: 'flex',
            alignItems: 'center', gap: '3px',
          }}>
            {getFileIcon(note.fileType)}
            <span style={{ textTransform: 'uppercase' }}>{note.fileType}</span>
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
          fontWeight: 800, color: 'var(--dark)',
          marginBottom: '4px', lineHeight: 1.3,
        }}>
          {note.title}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '10px' }}>
          {note.unit} · Sem {note.semester?.replace('Semester ', '')} · {note.college}
        </div>

        {/* Branch tag */}
        {note.branch && note.branch !== 'Other' && (
          <span style={{
            fontSize: '0.65rem', fontWeight: 800,
            padding: '2px 9px', borderRadius: '20px',
            background: 'var(--teal-light)', color: 'var(--teal)',
            border: '1.5px solid rgba(255,255,255,0.9)',
            display: 'inline-block', marginBottom: '8px',
          }}>{note.branch}</span>
        )}

        {/* Info strip */}
        <div style={{
          background: 'var(--bg)', borderRadius: '10px',
          padding: '0.7rem', marginBottom: '10px', flex: 1,
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--mid)', fontWeight: 700 }}>
            <span>📅</span>
            <span>{note.year || 'Year not specified'}</span>
          </div>
          {note.fileSize > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--mid)', fontWeight: 700 }}>
              <span>📦</span>
              <span>{formatSize(note.fileSize)}</span>
            </div>
          )}
          {note.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
              {note.tags.slice(0, 3).map((tag, i) => (
                <span key={i} style={{
                  fontSize: '0.62rem', fontWeight: 700,
                  padding: '2px 7px', borderRadius: '20px',
                  background: 'white', color: 'var(--muted)',
                  border: '1.5px solid #E5E7EB',
                }}>{tag}</span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--mid)', fontWeight: 700 }}>
            <span>👁</span>
            <span>{note.viewsCount || 0} views</span>
          </div>
        </div>

        {/* Bottom — uploader + stats */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', paddingTop: '8px',
          borderTop: '1.5px solid #F0F1F8',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: color, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.58rem',
              fontWeight: 800, color: 'white',
              border: 'var(--clay-border)', boxShadow: '0 2px 0 rgba(0,0,0,0.08)',
            }}>
              {note.uploadedBy?.name?.charAt(0) || 'U'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--mid)', fontWeight: 700 }}>
              {note.uploadedBy?.name?.split(' ')[0] || 'Student'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--pink)', fontWeight: 700 }}>❤️ {note.likesCount || 0}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>⬇ {note.downloadsCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  )
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
      <div className="notes-grid">
        {notes.map((note, i) => (
          <NoteCard key={note._id} note={note} index={i} />
        ))}
      </div>
    </div>
  );
}