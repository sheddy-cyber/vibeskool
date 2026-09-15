import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { Home, BookOpen, Terminal, Users, Sparkles, User, Settings, BarChart3, School2, PenLine, Puzzle } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useStore();
  const { currentUser } = useAuth();
  const location = useLocation();

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  const handleNavClick = () => {
    if (window.innerWidth <= 768 && sidebarOpen) {
      toggleSidebar();
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {sidebarOpen && (
        <div className={styles.backdrop} onClick={toggleSidebar}></div>
      )}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.navSection}>
          <div className={styles.nav}>
            <NavLink to="/app/dashboard" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
              <span className={`${styles.navIcon} ${styles.iconSapphire}`}><Home size={17} /></span>
              <span className={styles.navLabel}>Home</span>
            </NavLink>
            <NavLink to="/app/paths" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
              <span className={`${styles.navIcon} ${styles.iconEmerald}`}><BookOpen size={17} /></span>
              <span className={styles.navLabel}>Courses</span>
            </NavLink>
            <NavLink to="/app/lab" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
              <span className={`${styles.navIcon} ${styles.iconAmethyst}`}><Terminal size={17} /></span>
              <span className={styles.navLabel}>Playground</span>
            </NavLink>
            <NavLink to="/app/classrooms" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
              <span className={`${styles.navIcon} ${styles.iconAmber}`}><Users size={17} /></span>
              <span className={styles.navLabel}>Classrooms</span>
            </NavLink>
            <NavLink to="/app/showcase" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
              <span className={`${styles.navIcon} ${styles.iconCoral}`}><Sparkles size={17} /></span>
              <span className={styles.navLabel}>Showcase</span>
            </NavLink>
            
            <div className={styles.divider}></div>

            <NavLink to="/app/profile" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
              <span className={`${styles.navIcon} ${styles.iconSlate}`}><User size={17} /></span>
              <span className={styles.navLabel}>Profile</span>
            </NavLink>
            <NavLink to="/app/settings" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
              <span className={`${styles.navIcon} ${styles.iconSlate}`}><Settings size={17} /></span>
              <span className={styles.navLabel}>Settings</span>
            </NavLink>

            {isTeacher && (
              <>
                <div className={styles.sectionLabel}>Instruction</div>
                <NavLink to="/app/teacher/dashboard" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
                  <span className={`${styles.navIcon} ${styles.iconSapphire}`}><BarChart3 size={17} /></span>
                  <span className={styles.navLabel}>Dashboard</span>
                </NavLink>
                <NavLink to="/app/teacher/classrooms" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
                  <span className={`${styles.navIcon} ${styles.iconEmerald}`}><School2 size={17} /></span>
                  <span className={styles.navLabel}>My Classes</span>
                </NavLink>
                <NavLink to="/app/teacher/cms" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
                  <span className={`${styles.navIcon} ${styles.iconAmethyst}`}><PenLine size={17} /></span>
                  <span className={styles.navLabel}>Content Editor</span>
                </NavLink>
                <NavLink to="/app/teacher/exercises" className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem} onClick={handleNavClick}>
                  <span className={`${styles.navIcon} ${styles.iconAmber}`}><Puzzle size={17} /></span>
                  <span className={styles.navLabel}>Exercises</span>
                </NavLink>
              </>
            )}
          </div>
        </div>

        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {getInitials(currentUser?.name || currentUser?.username)}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userCardName}>{currentUser?.name || currentUser?.username || 'User'}</div>
            <div className={styles.userCardRole}>{currentUser?.role || 'Student'}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
