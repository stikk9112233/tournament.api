import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import apiClient from '../../utils/api';
import styles from '../../styles/Leaderboard.module.css';

export default function LeaderboardPage() {
  const router = useRouter();
  const { tournamentId } = router.query;
  const auth = useContext(AuthContext) || {};
  const { token, user, loading: authLoading } = auth;
  
  const [leaderboard, setLeaderboard] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !token || !tournamentId) return;
    
    fetchLeaderboard();
    fetchTournament();
  }, [token, authLoading, tournamentId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await apiClient.tournaments.getLeaderboard(tournamentId, user.id);
      setLeaderboard(data);
    } catch (err) {
      console.error('❌ Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchTournament = async () => {
    try {
      const data = await apiClient.tournaments.getDetails(tournamentId);
      setTournament(data);
    } catch (err) {
      console.error('❌ Error loading tournament:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Loading... - Leaderboard</title>
        </Head>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>⏳ Loading leaderboard...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Leaderboard</title>
        </Head>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>🏆 My Leaderboard - {tournament?.title}</title>
      </Head>

      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>🏆 My Leaderboard</h1>
          {tournament && <p className={styles.subtitle}>{tournament.title}</p>}
        </div>

        {leaderboard ? (
          <div className={styles.leaderboardCard}>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>🔫 Total Kills</span>
                <span className={styles.statValue}>{leaderboard.total_kills}</span>
              </div>
              
              <div className={styles.statBox}>
                <span className={styles.statLabel}>👑 Total Booyahs</span>
                <span className={styles.statValue}>{leaderboard.total_booyahs}</span>
              </div>
              
              <div className={styles.statBox}>
                <span className={styles.statLabel}>💰 Total Earnings</span>
                <span className={styles.statValue}>₹{leaderboard.total_earnings.toFixed(2)}</span>
              </div>
              
              <div className={styles.statBox}>
                <span className={styles.statLabel}>🎮 Matches Played</span>
                <span className={styles.statValue}>{leaderboard.matches_played}</span>
              </div>
            </div>

            <div className={styles.additionalInfo}>
              <p>📅 Joined: {new Date(leaderboard.joined_at).toLocaleDateString()}</p>
              <p>⏱️ Time: {new Date(leaderboard.joined_at).toLocaleTimeString()}</p>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <p>📭 No leaderboard data available</p>
          </div>
        )}

        <div className={styles.actions}>
          <Link href={`/tournaments/${tournamentId}`}>
            <a className="btn btn-secondary">← Back to Tournament</a>
          </Link>
          <Link href={`/tournaments/${tournamentId}/history`}>
            <a className="btn btn-primary">📜 View Playing History</a>
          </Link>
        </div>
      </div>
    </>
  );
}
