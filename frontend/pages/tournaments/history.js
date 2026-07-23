import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import apiClient from '../../utils/api';
import styles from '../../styles/History.module.css';

export default function HistoryPage() {
  const router = useRouter();
  const auth = useContext(AuthContext) || {};
  const { token, user, loading: authLoading } = auth;
  
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTournament, setExpandedTournament] = useState(null);

  useEffect(() => {
    if (authLoading || !token || !user) return;
    
    fetchPlayingHistory();
  }, [token, authLoading, user]);

  const fetchPlayingHistory = async () => {
    try {
      setLoading(true);
      const data = await apiClient.tournaments.getPlayingHistory(user.id);
      setHistory(data);
    } catch (err) {
      console.error('❌ Error loading history:', err);
      setError('Failed to load playing history');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Loading... - Playing History</title>
        </Head>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>⏳ Loading history...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Playing History</title>
        </Head>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </>
    );
  }

  const toggleExpand = (tournamentId) => {
    setExpandedTournament(
      expandedTournament === tournamentId ? null : tournamentId
    );
  };

  return (
    <>
      <Head>
        <title>📜 Playing History - My Tournaments</title>
      </Head>

      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>📜 My Playing History</h1>
          <p className={styles.subtitle}>Track all your tournament participation</p>
        </div>

        {history && history.history && history.history.length > 0 ? (
          <>
            <div className={styles.summaryCard}>
              <div className={styles.summaryItem}>
                <span className={styles.label}>🎮 Total Tournaments</span>
                <span className={styles.value}>{history.total_tournaments}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>💰 Total Earnings</span>
                <span className={styles.value}>₹{history.total_earnings.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.tournamentsContainer}>
              {history.history.map((tournament) => (
                <div key={tournament.tournament_id} className={styles.tournamentCard}>
                  <div 
                    className={styles.tournamentHeader}
                    onClick={() => toggleExpand(tournament.tournament_id)}
                  >
                    <div className={styles.tournamentInfo}>
                      <h3>{tournament.tournament_name}</h3>
                      <p className={styles.tournamentMeta}>
                        Entry Fee: ₹{tournament.entry_fee} | 
                        Matches: {tournament.matches_played}
                      </p>
                    </div>
                    <div className={styles.tournamentStats}>
                      <div className={styles.stat}>
                        <span>🔫</span> {tournament.total_kills} kills
                      </div>
                      <div className={styles.stat}>
                        <span>👑</span> {tournament.total_booyahs} booyahs
                      </div>
                      <div className={styles.stat}>
                        <span>💰</span> ₹{tournament.total_earnings.toFixed(2)}
                      </div>
                      <span className={styles.expandIcon}>
                        {expandedTournament === tournament.tournament_id ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>

                  {expandedTournament === tournament.tournament_id && (
                    <div className={styles.matchesContainer}>
                      <h4>Match Details:</h4>
                      {tournament.matches && tournament.matches.length > 0 ? (
                        <div className={styles.matchesList}>
                          {tournament.matches.map((match, idx) => (
                            <div key={idx} className={styles.matchItem}>
                              <div className={styles.matchBasic}>
                                <span className={styles.matchNum}>Match {idx + 1}</span>
                                {match.is_booyah && (
                                  <span className={styles.booyahBadge}>👑 BOOYAH</span>
                                )}
                              </div>
                              <div className={styles.matchStats}>
                                <p>🔫 Kills: <strong>{match.kills}</strong></p>
                                <p>📊 Position: <strong>#{match.position}</strong></p>
                                <p>💰 Prize: <strong>₹{match.prize_earned.toFixed(2)}</strong></p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.noMatches}>No match details available</p>
                      )}
                    </div>
                  )}

                  <div className={styles.tournamentDate}>
                    📅 {new Date(tournament.joined_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <p>📭 You haven't participated in any tournaments yet</p>
            <Link href="/tournaments">
              <a className="btn btn-primary">Browse Tournaments</a>
            </Link>
          </div>
        )}

        <div className={styles.actions}>
          <Link href="/tournaments">
            <a className="btn btn-secondary">← Back to Tournaments</a>
          </Link>
          <Link href="/dashboard">
            <a className="btn btn-primary">📊 View Dashboard</a>
          </Link>
        </div>
      </div>
    </>
  );
}
