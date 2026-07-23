import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
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

  if (!mounted) {
    return (
      <Head>
        <title>Tournament API - Free Fire Tournaments</title>
      </Head>
    );
  }

  return (
    <>
      <Head>
        <title>Tournament API - Free Fire Tournaments</title>
        <meta name="description" content="Join epic Free Fire tournaments and win prizes!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0a1428', color: '#ffffff' }}>
        <section style={{ textAlign: 'center', padding: '60px 20px', color: 'white' }}>
          <h1 style={{ fontSize: '3em', marginBottom: '20px', fontWeight: 'bold' }}>🎮 TOURNAMENT PLATFORM</h1>
          <p style={{ fontSize: '1.2em', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
            Join the most exciting Free Fire tournaments and compete for amazing prizes!
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Link href="/tournaments">
                  <a style={{ padding: '12px 24px', backgroundColor: '#FFD700', color: '#000000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                    🏆 Browse Tournaments
                  </a>
                </Link>
                <Link href="/tournaments/create">
                  <a style={{ padding: '12px 24px', backgroundColor: '#4C1D95', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                    ➕ Create Tournament
                  </a>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <a style={{ padding: '12px 24px', backgroundColor: '#FFD700', color: '#000000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                    🔐 Login
                  </a>
                </Link>
                <Link href="/auth/register">
                  <a style={{ padding: '12px 24px', backgroundColor: '#4C1D95', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                    📝 Register Now
                  </a>
                </Link>
              </>
            )}
          </div>
        </section>

        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '20px' }}>
          <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '40px', fontSize: '2em' }}>✨ Why Join Us?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: '#1a2d4d', borderRadius: '8px', padding: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h3 style={{ marginBottom: '10px' }}>🎯 Easy to Join</h3>
              <p>Register in seconds and start competing in tournaments</p>
            </div>
            <div style={{ backgroundColor: '#1a2d4d', borderRadius: '8px', padding: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h3 style={{ marginBottom: '10px' }}>💰 Big Prizes</h3>
              <p>Win real money and exciting rewards</p>
            </div>
            <div style={{ backgroundColor: '#1a2d4d', borderRadius: '8px', padding: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h3 style={{ marginBottom: '10px' }}>⚡ Live Tournaments</h3>
              <p>Compete against players from around the world</p>
            </div>
            <div style={{ backgroundColor: '#1a2d4d', borderRadius: '8px', padding: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h3 style={{ marginBottom: '10px' }}>🛡️ Secure & Fair</h3>
              <p>Trusted platform with verified payments</p>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'white' }}>
              <h3 style={{ fontSize: '2.5em', color: '#FFD700', marginBottom: '10px' }}>100+</h3>
              <p>Active Tournaments</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'white' }}>
              <h3 style={{ fontSize: '2.5em', color: '#FFD700', marginBottom: '10px' }}>50K+</h3>
              <p>Active Players</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'white' }}>
              <h3 style={{ fontSize: '2.5em', color: '#FFD700', marginBottom: '10px' }}>₹50L+</h3>
              <p>Prize Money Distributed</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'white' }}>
              <h3 style={{ fontSize: '2.5em', color: '#FFD700', marginBottom: '10px' }}>24/7</h3>
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
