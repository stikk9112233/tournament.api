import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tournaments/active`);
      if (response.ok) {
        const data = await response.json();
        setTournaments(Array.isArray(data) ? data.slice(0, 6) : []);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setTournaments([]);
    } finally {
      setTournamentsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Tournament API - Free Fire Tournaments</title>
        <meta name="description" content="Join epic Free Fire tournaments and win prizes!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--primary)' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '60px 20px', color: 'white' }}>
          <h1 style={{ fontSize: '3em', marginBottom: '20px' }}>🎮 TOURNAMENT PLATFORM</h1>
          <p style={{ fontSize: '1.2em', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
            Join the most exciting Free Fire tournaments and compete for amazing prizes!
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
        </section>

        {/* Features Section */}
        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '20px' }}>
          <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '40px', fontSize: '2em' }}>✨ Why Join Us?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
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

        {/* Stats Section */}
        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'white' }}>
              <h3 style={{ fontSize: '2.5em', color: '#FFD700' }}>100+</h3>
              <p>Active Tournaments</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'white' }}>
              <h3 style={{ fontSize: '2.5em', color: '#FFD700' }}>50K+</h3>
              <p>Active Players</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'white' }}>
              <h3 style={{ fontSize: '2.5em', color: '#FFD700' }}>₹50L+</h3>
              <p>Prize Money Distributed</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'white' }}>
              <h3 style={{ fontSize: '2.5em', color: '#FFD700' }}>24/7</h3>
              <p>Customer Support</p>
            </div>
          </div>
        </section>

        <footer style={{ textAlign: 'center', padding: '40px 20px', color: 'white', borderTop: '1px solid rgba(255,215,0,0.2)' }}>
          <p>&copy; 2024 Tournament Platform. All rights reserved. 🎮</p>
        </footer>
      </div>
    </>
  );
}
