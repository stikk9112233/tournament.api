import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '60px 20px',
      minHeight: '100vh',
      backgroundColor: '#0a1428',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '3em', marginBottom: '20px' }}>🎮 TOURNAMENT PLATFORM</h1>
      <p style={{ fontSize: '1.2em', marginBottom: '30px' }}>
        Join the most exciting Free Fire tournaments and compete for amazing prizes!
      </p>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/auth/login">
          <a style={{ padding: '12px 24px', backgroundColor: '#FFD700', color: '#000000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            🔐 Login
          </a>
        </Link>
        <Link href="/auth/register">
          <a style={{ padding: '12px 24px', backgroundColor: '#4C1D95', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            📝 Register Now
          </a>
        </Link>
        <Link href="/tournaments">
          <a style={{ padding: '12px 24px', backgroundColor: '#FFD700', color: '#000000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            🏆 Browse Tournaments
          </a>
        </Link>
      </div>
    </div>
  );
}
