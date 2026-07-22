import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Auth.module.css';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        // For dev/testing we may return token in response; show friendly message
        setMessage('If the email exists, a reset link was sent. (In dev the token may be shown below.)\n' + (data.reset_token ? `Token: ${data.reset_token}` : ''));
      } else {
        setMessage(data.detail || 'Error sending reset link');
      }
    } catch (err) {
      console.error(err);
      setMessage('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Forgot Password - Tournament Platform</title></Head>
      <Navbar />
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1>🔐 Forgot Password</h1>
          {message && <div className={styles.info}>{message}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
          <p style={{ marginTop: '10px' }}>
            <Link href="/auth/login"><a>Back to login</a></Link>
          </p>
        </div>
      </div>
    </>
  );
}
