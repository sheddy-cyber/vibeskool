import React from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'
import { useEnforceLightTheme } from '@/lib/theme'
import styles from './LegalPage.module.css'

export default function TermsPage() {
  useEnforceLightTheme()
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
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className={styles.body}>
            <p>
              Welcome to VibeSkool. By accessing or using our website, services, and online coding interactive environment, you agree to be bound by these Terms of Service.
            </p>

            <h2>1. User Accounts &amp; Authentication</h2>
            <p>
              You may register using traditional credentials or via authorized third-party OAuth providers such as Google. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h2>2. Acceptable Use of Sandboxes and Execution Environments</h2>
            <p>
              VibeSkool provides in-browser WebContainer sandboxes, terminals, and code editors for educational and collaborative purposes. You agree not to:
            </p>
            <ul>
              <li>Use execution environments for cryptomining, network attacks, or malware generation.</li>
              <li>Attempt to bypass platform rate limits or security sandboxes.</li>
              <li>Harass, abuse, or disrupt other learners or mentors in collaborative classrooms.</li>
            </ul>

            <h2>3. Intellectual Property</h2>
            <p>
              You retain ownership of any original code, solutions, and projects you author on VibeSkool. The VibeSkool platform, branding, curriculum exercises, documentation, and interface designs are the intellectual property of VibeSkool.
            </p>

            <h2>4. Termination</h2>
            <p>
              We reserve the right to suspend or terminate access to our platform for conduct that violates these Terms or harms the learning community.
            </p>

            <h2>5. Contact Information</h2>
            <p>
              For legal inquiries or questions regarding these Terms, please reach out to us at legal@vibeskool.com.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
