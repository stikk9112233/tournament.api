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
  const auth = useContext(AuthContext) || {};
  const { login } = auth;
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
      console.log('Registering user:', formData);
      
      // ✅ Register करो
      const registerResponse = await apiClient.auth.register(
        formData.email,
        formData.username,
        formData.password,
        formData.freefire_uid
      );
      
      console.log('Register response:', registerResponse);
      
      // ✅ सही तरीके से response check करो
      if (registerResponse && registerResponse.id) {
        console.log('Registration successful, logging in...');
        
        try {
          // ✅ Auto-login करो registration के बाद
          const loginResponse = await apiClient.auth.login(
            formData.email, 
            formData.password
          );
          
          console.log('Login response:', loginResponse);
          
          if (loginResponse && loginResponse.access_token) {
            console.log('Login successful, storing token...');
            
            // ✅ Token और user info store करो
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', loginResponse.access_token);
              localStorage.setItem('user', JSON.stringify(loginResponse.user));
            }
            
            // ✅ Auth context को update करो
            if (login) {
              login(loginResponse.access_token, loginResponse.user);
            }
            
            // ✅ Home page पर redirect करो
            router.push('/');
          } else {
            setError('Login failed after registration. Please login manually.');
            router.push('/auth/login');
          }
        } catch (loginErr) {
          console.error('Auto-login error:', loginErr);
          setError('Registration successful but auto-login failed. Please login manually.');
          router.push('/auth/login');
        }
      } else {
        console.error('Invalid register response:', registerResponse);
        setError(registerResponse?.detail || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // ✅ विभिन्न error types को handle करो
      if (err.response?.status === 400) {
        setError(err.response.data?.detail || 'Email or username already exists.');
      } else if (err.message === 'Network Error') {
        setError('Connection error. Please check your internet and try again.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Server took too long to respond.');
      } else {
        setError('Connection error. Please try again.');
      }
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
