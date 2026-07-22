import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Auth.module.css';

export default function Reset() {
  const router = useRouter();
  const { token: queryToken } = router.query;
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (queryToken) setToken(queryToken);
  }, [queryToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password reset successful. Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 1500);
      } else {
        setMessage(data.detail || 'Failed to reset password');
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
      <Head><title>Reset Password - Tournament Platform</title></Head>
      <Navbar />
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1>🔑 Reset Password</h1>
          {message && <div className={styles.info}>{message}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Reset Token (from email)</label>
              <input type="text" value={token} onChange={e => setToken(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
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
