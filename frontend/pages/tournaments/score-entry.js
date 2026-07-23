import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import apiClient from '../../utils/api';
import styles from '../../styles/ScoreEntry.module.css';

export default function ScoreEntryPage() {
  const router = useRouter();
  const { matchId } = router.query;
  const auth = useContext(AuthContext) || {};
  const { token, user, loading: authLoading } = auth;

  const [match, setMatch] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !token || !matchId) return;
    
    fetchMatchData();
    fetchParticipants();
  }, [token, authLoading, matchId]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      // Get match details from tournament
      // This would need a dedicated endpoint or derive from tournament data
      console.log('📊 Loading match:', matchId);
    } catch (err) {
      console.error('❌ Error loading match:', err);
      setError('Failed to load match data');
    }
  };

  const fetchParticipants = async () => {
    try {
      // Get participants and initialize scores array
      const participantsList = [
        { id: 1, freefire_uid: 'Player1', user_id: 1 },
        { id: 2, freefire_uid: 'Player2', user_id: 2 },
        { id: 3, freefire_uid: 'Player3', user_id: 3 }
      ];
      
      setParticipants(participantsList);
      
      // Initialize scores array
      const initialScores = participantsList.map(p => ({
        participant_id: p.id,
        kills: 0,
        position: 0,
        is_booyah: false
      }));
      setScores(initialScores);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching participants:', err);
      setError('Failed to load participants');
      setLoading(false);
    }
  };

  const handleScoreChange = (index, field, value) => {
    const newScores = [...scores];
    
    if (field === 'is_booyah') {
      newScores[index][field] = !newScores[index][field];
    } else if (field === 'position') {
      newScores[index][field] = parseInt(value);
    } else {
      newScores[index][field] = parseInt(value);
    }
    
    setScores(newScores);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSubmitting(true);

      // Validate scores
      if (scores.length === 0) {
        setError('No participants to score');
        return;
      }

      const validScores = scores.filter(s => s.kills > 0 || s.position > 0);
      
      if (validScores.length === 0) {
        setError('Please enter at least one score');
        return;
      }

      // Submit scores
      const result = await apiClient.tournaments.enterMatchScores(matchId, scores);

      if (result) {
        setSuccess('✅ Scores submitted successfully!');
        setTimeout(() => {
          router.push(`/tournaments/${router.query.tournamentId}`);
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Error submitting scores:', err);
      setError(err.message || 'Failed to submit scores');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Loading... - Score Entry</title>
        </Head>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>⏳ Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>📊 Enter Match Scores</title>
      </Head>

      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>📊 Enter Match Scores</h1>
          <p className={styles.subtitle}>Match ID: {matchId}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>❌ {error}</div>}
          {success && <div className={styles.success}>✅ {success}</div>}

          <div className={styles.scoresContainer}>
            <table className={styles.scoresTable}>
              <thead>
                <tr>
                  <th>👤 Player</th>
                  <th>🔫 Kills</th>
                  <th>📊 Position</th>
                  <th>👑 Booyah?</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr key={index} className={score.is_booyah ? styles.booyahRow : ''}>
                    <td className={styles.playerName}>
                      {participants[index]?.freefire_uid || `Player ${index + 1}`}
                    </td>
                    
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={score.kills}
                        onChange={(e) => handleScoreChange(index, 'kills', e.target.value)}
                        className={styles.input}
                        placeholder="0"
                      />
                    </td>
                    
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={score.position}
                        onChange={(e) => handleScoreChange(index, 'position', e.target.value)}
                        className={styles.input}
                        placeholder="0"
                      />
                    </td>
                    
                    <td>
                      <button
                        type="button"
                        onClick={() => handleScoreChange(index, 'is_booyah', null)}
                        className={`${styles.booyahBtn} ${score.is_booyah ? styles.active : ''}`}
                      >
                        {score.is_booyah ? '👑 YES' : '✗ NO'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.info}>
            <p>💡 <strong>Booyah:</strong> Mark as "YES" if this player won the match</p>
            <p>💡 <strong>Position:</strong> Their final ranking (1st, 2nd, 3rd, etc.)</p>
            <p>💡 <strong>Kills:</strong> Number of enemies eliminated</p>
          </div>

          <div className={styles.actions}>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? '⏳ Submitting...' : '✅ Submit Scores'}
            </button>
            <Link href={`/tournaments/${router.query.tournamentId}`}>
              <a className={styles.cancelBtn}>← Cancel</a>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
