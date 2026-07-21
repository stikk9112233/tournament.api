import Head from 'next/head';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/auth';
import Navbar from '../../components/Navbar';
import apiClient from '../../utils/api';
import styles from '../../styles/CreateTournament.module.css';

export default function CreateTournamentPage() {
  const router = useRouter();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game: '',
    max_participants: 16,
    prize_pool: 0,
    registration_deadline: '',
    start_date: '',
  });

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.game) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const tournament = await apiClient.tournaments.create(formData);
      
      // Success
      router.push(`/tournaments/${tournament.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Tournament - Tournament Platform</title>
      </Head>

      <Navbar />

      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1>➕ Create Tournament</h1>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Tournament Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Summer Gaming Championship"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your tournament..."
                rows="5"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="game">Game Title *</label>
              <input
                type="text"
                id="game"
                name="game"
                value={formData.game}
                onChange={handleChange}
                placeholder="e.g., Counter-Strike 2, Valorant, Dota 2"
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="max_participants">Max Participants</label>
                <input
                  type="number"
                  id="max_participants"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleChange}
                  min="2"
                  max="1000"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="prize_pool">Prize Pool ($)</label>
                <input
                  type="number"
                  id="prize_pool"
                  name="prize_pool"
                  value={formData.prize_pool}
                  onChange={handleChange}
                  min="0"
                  step="100"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="registration_deadline">Registration Deadline</label>
                <input
                  type="datetime-local"
                  id="registration_deadline"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="start_date">Tournament Start Date</label>
                <input
                  type="datetime-local"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => router.back()}
              >
                ← Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '⏳ Creating...' : '✅ Create Tournament'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
