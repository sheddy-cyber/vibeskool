import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-base)',
      color: 'var(--text-primary)',
      padding: '24px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '80px', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '8px', color: 'var(--accent)', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Page Not Found</h2>
      <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '400px', lineHeight: '1.6' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button variant="primary" size="lg" icon={<ArrowLeft size={18} />}>Go Home</Button>
      </Link>
    </div>
  )
}
