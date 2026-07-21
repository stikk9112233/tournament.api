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
  const { token, user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchTournaments();
  }, [token]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.tournaments.list();
      setTournaments(data);
    } catch (err) {
      setError('Failed to load tournaments');
      console.error(err);
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
      setError('Failed to delete tournament');
    }
  };

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
                <h3>{tournament.name}</h3>
                <p className={styles.description}>{tournament.description}</p>
                
                <div className={styles.details}>
                  <span>👥 {tournament.max_participants} spots</span>
                  <span>🎮 {tournament.game}</span>
                </div>

                <div className={styles.status}>
                  <span className={`${styles.badge} ${styles[`status-${tournament.status.toLowerCase()}` ]}`}>
                    {tournament.status}
                  </span>
                </div>

                <div className={styles.actions}>
                  <Link href={`/tournaments/${tournament.id}`}>
                    <a className="btn btn-secondary">👁️ View</a>
                  </Link>
                  {user.id === tournament.organizer_id && (
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
