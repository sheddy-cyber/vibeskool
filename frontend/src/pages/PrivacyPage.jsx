import React from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'
import styles from './LegalPage.module.css'

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <BrandLogo size={28} showText={true} />
          </Link>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className={styles.body}>
            <p>
              At VibeSkool (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you access or use the VibeSkool platform.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways when you use the platform:</p>
            <ul>
              <li><strong>Account Information:</strong> When you register an account, we collect your name, email address, password hash (for direct signups), profile picture, and role (learner or tutor).</li>
              <li><strong>Google OAuth Information:</strong> If you sign up or sign in using Google Identity Services, we receive your Google User ID (sub), primary email address, display name, and avatar picture provided by Google.</li>
              <li><strong>Learning &amp; Code Progress:</strong> Lesson completions, coding exercises submitted, execution outputs, sandbox interactions, and classroom participation metrics.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Provide, maintain, and improve the VibeSkool learning environment and web sandboxes.</li>
              <li>Authenticate your identity and manage your session across sessions.</li>
              <li>Track curriculum progress, streak counts, and auto-graded challenge results.</li>
              <li>Enable collaborative multiplayer pairing and mentor classroom interactions.</li>
              <li>Respond to support requests and administrative inquiries.</li>
            </ul>

            <h2>3. Google User Data Policy</h2>
            <p>
              VibeSkool&apos;s use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. We only access basic identity scopes (<code>email</code>, <code>profile</code>, and <code>openid</code>) solely to authenticate you and create or link your VibeSkool profile. We do not sell your personal data or transfer Google user data to third parties for advertising.
            </p>

            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard administrative, technical, and physical security measures to safeguard your personal information, including encrypted tokens (JWT) and secure HTTPS connections.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at support@vibeskool.com.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
