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

  return (
    <div className="countdown-wrapper">
      <style>{`
        .countdown-wrapper {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 20px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid #334155;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
        .countdown-title {
          margin: 0 0 16px 0;
          font-size: 1.1rem;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 8px;
          text-align: center;
          flex-wrap: wrap;
          justify-content: center;
        }
        .countdown-units {
          display: flex;
          gap: 8px;
          justify-content: center;
          width: 100%;
          box-sizing: border-box;
        }
        .countdown-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(145deg, #1e293b, #0f172a);
          padding: 10px 8px;
          border-radius: 10px;
          flex: 1;
          min-width: 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .countdown-unit__value {
          font-size: 1.6rem;
          font-weight: bold;
          color: #38bdf8;
          font-family: monospace;
          line-height: 1;
        }
        .countdown-unit__label {
          font-size: 0.6rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }
        @media (min-width: 480px) {
          .countdown-wrapper { padding: 24px; }
          .countdown-title { font-size: 1.25rem; }
          .countdown-units { gap: 12px; }
          .countdown-unit { padding: 14px 12px; }
          .countdown-unit__value { font-size: 2rem; }
          .countdown-unit__label { font-size: 0.7rem; }
        }
      `}</style>

      <h3 className="countdown-title">
        <span>⏳</span> Countdown to CLAT PG 2027
      </h3>
      
      <div className="countdown-units">
        <div className="countdown-unit">
          <span className="countdown-unit__value">{timeLeft.days.toString().padStart(2, '0')}</span>
          <span className="countdown-unit__label">Days</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-unit__value">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="countdown-unit__label">Hours</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-unit__value">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="countdown-unit__label">Min</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-unit__value">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="countdown-unit__label">Sec</span>
        </div>
      </div>
    </div>
  );
}
