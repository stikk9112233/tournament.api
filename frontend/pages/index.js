import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './_app';
import Navbar from '../components/Navbar';
import apiClient from '../utils/api';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { user, token } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const data = await apiClient.tournaments.list(0, 6, 'active');
      setTournaments(data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Tournament API - Free Fire Tournaments</title>
        <meta name="description" content="Join epic Free Fire tournaments and win prizes!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>🎮 TOURNAMENT PLATFORM</h1>
            <p className={styles.subtitle}>
              Join the most exciting Free Fire tournaments and compete for amazing prizes!
            </p>
            <div className={styles.heroButtons}>
              {user ? (
                <>
                  <Link href="/tournaments">
                    <a className="btn btn-primary">🏆 Browse Tournaments</a>
                  </Link>
                  <Link href="/tournaments/create">
                    <a className="btn btn-secondary">➕ Create Tournament</a>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <a className="btn btn-primary">🔐 Login</a>
                  </Link>
                  <Link href="/auth/register">
                    <a className="btn btn-secondary">📝 Register Now</a>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <h2>✨ Why Join Us?</h2>
          <div className={styles.featureGrid}>
            <div className="card">
              <h3>🎯 Easy to Join</h3>
              <p>Register in seconds and start competing in tournaments</p>
            </div>
            <div className="card">
              <h3>💰 Big Prizes</h3>
              <p>Win real money and exciting rewards</p>
            </div>
            <div className="card">
              <h3>⚡ Live Tournaments</h3>
              <p>Compete against players from around the world</p>
            </div>
            <div className="card">
              <h3>🛡️ Secure & Fair</h3>
              <p>Trusted platform with verified payments</p>
            </div>
          </div>
        </section>

        {/* Tournaments Section */}
        <section className={styles.tournamentsSection}>
          <h2>🏆 Active Tournaments</h2>
          
          {loading ? (
            <div className="loader">Loading tournaments...</div>
          ) : tournaments.length === 0 ? (
            <p className={styles.noTournaments}>
              No tournaments available right now. Check back soon!
            </p>
          ) : (
            <div className={styles.tournamentGrid}>
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="card">
                  <div className={styles.tournamentHeader}>
                    <h3>{tournament.title}</h3>
                    <span className={styles.badge}>{tournament.status}</span>
                  </div>
                  <p className={styles.description}>{tournament.description}</p>
                  
                  <div className={styles.details}>
                    <div className={styles.detailItem}>
                      <span>💰 Entry Fee:</span>
                      <strong>₹{tournament.entry_fee}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>🏅 Prize Pool:</span>
                      <strong>₹{tournament.prize_pool}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>👥 Max Players:</span>
                      <strong>{tournament.max_participants}</strong>
                    </div>
                  </div>

                  <Link href={`/tournaments/${tournament.id}`}>
                    <a className="btn btn-primary" style={{ marginTop: '15px' }}>
                      View Details
                    </a>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className={styles.viewAll}>
            <Link href="/tournaments">
              <a className="btn btn-secondary">📋 View All Tournaments</a>
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <h3>100+</h3>
            <p>Active Tournaments</p>
          </div>
          <div className={styles.statCard}>
            <h3>50K+</h3>
            <p>Active Players</p>
          </div>
          <div className={styles.statCard}>
            <h3>₹50L+</h3>
            <p>Prize Money Distributed</p>
          </div>
          <div className={styles.statCard}>
            <h3>24/7</h3>
            <p>Customer Support</p>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2024 Tournament Platform. All rights reserved. 🎮</p>
      </footer>
    </>
  );
}
