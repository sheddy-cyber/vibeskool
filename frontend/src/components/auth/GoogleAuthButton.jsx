import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import styles from './GoogleAuthButton.module.css';

export default function GoogleAuthButton({ isSignUp = false, role = 'student' }) {
  const { signInWithGoogle, authLoading } = useAuth();
  const buttonRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Load Google Identity Services script dynamically if not present
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Initialize and render Google button when script and DOM container are ready
  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            signInWithGoogle({ credential: response.credential, role });
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear previous button child nodes before re-rendering
      buttonRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: isSignUp ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: buttonRef.current.offsetWidth || 340,
      });
    } catch (err) {
      console.error('Failed to render Google Sign-In button:', err);
    }
  }, [scriptLoaded, clientId, isSignUp, role, signInWithGoogle]);

  return (
    <div className={styles.container}>
      {clientId ? (
        <div 
          ref={buttonRef} 
          className={styles.googleBtnWrapper} 
          style={{ opacity: authLoading ? 0.6 : 1, pointerEvents: authLoading ? 'none' : 'auto' }} 
        />
      ) : (
        <div className={styles.devNotice}>
          <strong>Google Auth Configuration:</strong>
          <span> Add your Google OAuth Client ID to your environment:</span>
          <code className={styles.devNoticeCode}>VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</code>
        </div>
      )}

      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>or continue with email</span>
        <div className={styles.dividerLine} />
      </div>
    </div>
  );
}
