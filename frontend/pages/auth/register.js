import Head from 'next/head';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import apiClient from '../../utils/api';
import styles from '../../styles/Auth.module.css';

export default function Register() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    freefire_uid: '',
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
      const response = await apiClient.auth.register(
        formData.email,
        formData.username,
        formData.password,
        formData.freefire_uid
      );
      
      if (response.id) {
        // Auto-login after registration
        const loginResponse = await apiClient.auth.login(formData.email, formData.password);
        if (loginResponse.access_token) {
          login(loginResponse.access_token, loginResponse.user);
          router.push('/');
        }
      } else {
        setError(response.detail || 'Registration failed');
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
        <title>Register - Tournament Platform</title>
      </Head>

      <Navbar />

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>📝 Register</h1>
          
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
              <label htmlFor="username">👤 Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="sunny123"
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
                placeholder="Strong password"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="freefire_uid">🎮 Free Fire UID:</label>
              <input
                type="text"
                id="freefire_uid"
                name="freefire_uid"
                value={formData.freefire_uid}
                onChange={handleChange}
                placeholder="1234567890"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? '⏳ Registering...' : '✅ Register'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>Already have an account? <Link href="/auth/login"><a>Login here</a></Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
