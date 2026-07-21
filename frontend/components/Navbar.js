import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../pages/_app';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/">
          <a className={styles.logo}>
            🎮 TOURNAMENT
          </a>
        </Link>

        {/* Nav Links */}
        <div className={styles.links}>
          <Link href="/tournaments">
            <a className={styles.link}>🏆 Tournaments</a>
          </Link>

          {user ? (
            <>
              <Link href="/tournaments/create">
                <a className={styles.link}>➕ Create</a>
              </Link>
              <Link href="/dashboard">
                <a className={styles.link}>👤 Dashboard</a>
              </Link>
              <button onClick={logout} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <a className={styles.link}>🔐 Login</a>
              </Link>
              <Link href="/auth/register">
                <a className={styles.link}>📝 Register</a>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
