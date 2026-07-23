import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import apiClient from '../../utils/api';
import styles from '../../styles/Tournaments.module.css';

export default function TournamentsPage() {
  const router = useRouter();
  const auth = useContext(AuthContext) || {};
  const { token, user, loading: authLoading, isAuthenticated } = auth;
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🔍 useEffect triggered - authLoading:', authLoading, 'token:', token);
    
    if (authLoading) {
      console.log('⏳ Still loading auth...');
      return;
    }
    
    if (!token || !isAuthenticated) {
      console.log('❌ No token found, redirecting to login');
      router.push('/auth/login');
      return;
    }
    
    console.log('✅ Token found, fetching tournaments');
    fetchTournaments();
  }, [token, authLoading, isAuthenticated, router]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching tournaments...');
      const data = await apiClient.tournaments.list();
      console.log('✅ Tournaments loaded:', data);
      setTournaments(data);
    } catch (err) {
      console.error('❌ Error loading tournaments:', err);
      setError('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tournament?')) return;
    
    try {
      await apiClient.tournaments.delete(id);
      setTournaments(tournaments.filter(t => t.id !== id));
    } catch (err) {
      console.error('❌ Error deleting tournament:', err);
      setError('Failed to delete tournament');
    }
  };

  if (authLoading) {
    return (
      <>
        <Head>
          <title>Loading... - Tournament Platform</title>
        </Head>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>⏳ Initializing...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Tournaments - Tournament Platform</title>
      </Head>

      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>🏆 Tournaments</h1>
          <Link href="/tournaments/create">
            <a className="btn btn-primary">➕ Create Tournament</a>
          </Link>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>⏳ Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <div className={styles.empty}>
            <p>📭 No tournaments yet</p>
            <Link href="/tournaments/create">
              <a className="btn btn-primary">Create your first tournament</a>
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {tournaments.map((tournament) => (
              <div key={tournament.id} className={styles.card}>
                <h3>{tournament.title || tournament.name}</h3>
                <p className={styles.description}>{tournament.description}</p>
                
                <div className={styles.details}>
                  <span>👥 {tournament.max_participants} spots</span>
                  <span>💰 ₹{tournament.entry_fee}</span>
                </div>

                <div className={styles.status}>
                  <span className={`${styles.badge} ${styles[`status-${tournament.status?.toLowerCase()}` ]}`}>
                    {tournament.status || 'active'}
                  </span>
                </div>

                <div className={styles.actions}>
                  <Link href={`/tournaments/${tournament.id}`}>
                    <a className="btn btn-secondary">👁️ View</a>
                  </Link>
                  {user && user.id === tournament.organizer_id && (
                    <>
                      <Link href={`/tournaments/${tournament.id}/edit`}>
                        <a className="btn btn-secondary">✏️ Edit</a>
                      </Link>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(tournament.id)}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
