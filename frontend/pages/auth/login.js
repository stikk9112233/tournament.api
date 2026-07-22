import Head from 'next/head';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import apiClient from '../../utils/api';
import styles from '../../styles/Auth.module.css';

export default function Login() {
  const router = useRouter();
  const auth = useContext(AuthContext) || {};
const { login } = auth;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.auth.login(formData.email, formData.password);
      
      if (response.access_token) {
        login(response.access_token, response.user);
        router.push('/');
      } else {
        setError(response.detail || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Tournament Platform</title>
      </Head>

      <Navbar />

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>🔐 Login</h1>
          
          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">📧 Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">🔑 Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? '⏳ Logging in...' : '✅ Login'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>Don't have an account? <Link href="/auth/register"><a>Register here</a></Link></p>
          </div>
        </div>
      </div>
    </>
  );
};
