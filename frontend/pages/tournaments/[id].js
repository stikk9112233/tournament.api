import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import apiClient from '../../utils/api';
import styles from '../../styles/TournamentDetail.module.css';

export default function TournamentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { token, user } = useContext(AuthContext);
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const data = await apiClient.tournaments.get(id);
      setTournament(data);
      
      // Fetch participants
      const participants = await apiClient.tournaments.getParticipants(id);
      setParticipants(participants);
      
      // Check if user is registered
      const registered = participants.some(p => p.user_id === user?.id);
      setIsRegistered(registered);
    } catch (err) {
      setError('Failed to load tournament');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      setRegistering(true);
      await apiClient.tournaments.register(id);
      setIsRegistered(true);
      fetchTournament();
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!confirm('Unregister from this tournament?')) return;

    try {
      setRegistering(true);
      await apiClient.tournaments.unregister(id);
      setIsRegistered(false);
      fetchTournament();
    } catch (err) {
      setError(err.message || 'Failed to unregister');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Tournament - Tournament Platform</title>
        </Head>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>⏳ Loading tournament...</div>
        </div>
      </>
    );
  }

  if (error || !tournament) {
    return (
      <>
        <Head>
          <title>Tournament Not Found - Tournament Platform</title>
        </Head>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.error}>{error || 'Tournament not found'}</div>
          <Link href="/tournaments">
            <a className="btn btn-primary">← Back to Tournaments</a>
          </Link>
        </div>
      </>
    );
  }

  const spotsAvailable = tournament.max_participants - participants.length;
  const isFull = spotsAvailable <= 0;
  const isOrganizer = user?.id === tournament.organizer_id;

  return (
    <>
      <Head>
        <title>{tournament.name} - Tournament Platform</title>
      </Head>

      <Navbar />

      <div className={styles.container}>
        <Link href="/tournaments">
          <a className={styles.backLink}>← Back to Tournaments</a>
        </Link>

        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>🏆 {tournament.name}</h1>
            <span className={`${styles.badge} ${styles[`status-${tournament.status.toLowerCase()}`]}`}>
              {tournament.status}
            </span>
          </div>

          {isOrganizer && (
            <div className={styles.organiserActions}>
              <Link href={`/tournaments/${id}/edit`}>
                <a className="btn btn-secondary">✏️ Edit</a>
              </Link>
              <Link href={`/tournaments/${id}/manage`}>
                <a className="btn btn-secondary">⚙️ Manage</a>
              </Link>
            </div>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.content}>
          <div className={styles.main}>
            <section className={styles.section}>
              <h2>📋 About</h2>
              <p>{tournament.description}</p>
            </section>

            <section className={styles.section}>
              <h2>📊 Details</h2>
              <div className={styles.details}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Game:</span>
                  <span className={styles.value}>{tournament.game}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Prize Pool:</span>
                  <span className={styles.value}>${tournament.prize_pool}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Max Participants:</span>
                  <span className={styles.value}>{tournament.max_participants}</span>
                </div>
                {tournament.registration_deadline && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Registration Closes:</span>
                    <span className={styles.value}>
                      {new Date(tournament.registration_deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {tournament.start_date && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Tournament Starts:</span>
                    <span className={styles.value}>
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </section>

            <section className={styles.section}>
              <h2>👥 Participants ({participants.length}/{tournament.max_participants})</h2>
              
              {participants.length === 0 ? (
                <p className={styles.empty}>No participants yet</p>
              ) : (
                <div className={styles.participantsList}>
                  {participants.map((participant, index) => (
                    <div key={participant.id} className={styles.participant}>
                      <span className={styles.rank}>#{index + 1}</span>
                      <span className={styles.name}>{participant.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.registerCard}>
              <h3>⚡ Registration</h3>
              
              <div className={styles.spots}>
                <p>Spots Available: <strong>{Math.max(0, spotsAvailable)}</strong></p>
                <div className={styles.spotsBar}>
                  <div 
                    className={styles.spotsFilled}
                    style={{ width: `${(participants.length / tournament.max_participants) * 100}%` }}
                  />
                </div>
              </div>

              {isRegistered ? (
                <>
                  <div className={styles.registered}>
                    ✅ You are registered!
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={handleUnregister}
                    disabled={registering}
                  >
                    {registering ? '⏳ Unregistering...' : '❌ Unregister'}
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleRegister}
                  disabled={registering || isFull}
                >
                  {registering ? '⏳ Registering...' : isFull ? '🔴 Tournament Full' : '✅ Register Now'}
                </button>
              )}
            </div>

            {isOrganizer && (
              <div className={styles.organiserInfo}>
                <h3>🎯 Organizer</h3>
                <p>You are the organizer of this tournament</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
