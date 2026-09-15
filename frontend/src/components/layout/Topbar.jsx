import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { BrandLogo } from '@/components/ui';
import { Sun, Moon } from 'lucide-react';
import styles from './Topbar.module.css';

export default function Topbar() {
  const { currentUser, signOut, updateUserSettings } = useAuth();
  const { sidebarOpen, toggleSidebar, settings, updateSettings } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeTheme = settings?.theme || 'light';
  const isDark = activeTheme === 'dark' || (activeTheme === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
    if (updateUserSettings) updateUserSettings({ theme: nextTheme });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.topbar}>
      <button 
        className={styles.menuBtn} 
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <Link to="/app/dashboard" className={styles.brand}>
        <BrandLogo size={24} showText={true} />
      </Link>

      <div className={styles.actionsSection}>
        <button 
          className={styles.themeToggleBtn}
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className={styles.userSection} ref={dropdownRef}>
          <button 
            className={styles.avatarBtn}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="User menu"
          >
            {currentUser?.avatar || 'U'}
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.userName}>{currentUser?.name || 'User'}</div>
                <div className={styles.userRole}>{currentUser?.role || 'Student'}</div>
              </div>
              
              <Link to="/app/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Profile
              </Link>
              
              <Link to="/app/settings" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Settings
              </Link>

              <button 
                className={styles.dropdownItem} 
                onClick={() => {
                  toggleTheme();
                }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                {isDark ? 'Light Theme' : 'Dark Theme'}
              </button>
              
              <div className={styles.dropdownDivider}></div>
              
              <button 
                className={`${styles.dropdownItem} ${styles.signOutBtn}`}
                onClick={() => {
                  setDropdownOpen(false);
                  signOut();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
