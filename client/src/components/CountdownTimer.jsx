import { useState, useEffect } from 'react';

export default function CountdownTimer() {
  // Assuming CLAT PG 2027 is on the first Sunday of December 2026 (Dec 6, 2026)
  const targetDate = new Date('2026-12-06T14:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
      padding: '16px 20px',
      borderRadius: '12px',
      minWidth: '80px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    }}>
      <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#38bdf8', fontFamily: 'monospace', lineHeight: '1' }}>
        {value.toString().padStart(2, '0')}
      </span>
      <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>
        {label}
      </span>
    </div>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '32px',
      borderRadius: '16px',
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      border: '1px solid #334155'
    }}>
      <h3 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>⏳</span> Countdown to CLAT PG 2027
      </h3>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  );
}
