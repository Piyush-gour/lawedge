import { useState, useEffect } from 'react';

export default function Pomodoro() {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isWork, setIsWork] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Auto switch
      setIsWork(!isWork);
      setTimeLeft(!isWork ? WORK_TIME : BREAK_TIME);
      setIsActive(false);
      // Play a sound or show notification here in a real app
      alert(isWork ? 'Focus session complete! Take a 5 minute break.' : 'Break is over! Back to studying.');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWork]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isWork ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = (mode) => {
    setIsActive(false);
    setIsWork(mode === 'work');
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#1e293b', alignSelf: 'flex-start' }}>⏱️ Focus Timer</h3>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
        <button 
          onClick={() => switchMode('work')}
          style={{ padding: '6px 16px', border: 'none', background: isWork ? 'white' : 'transparent', color: isWork ? '#3b82f6' : '#64748b', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: isWork ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
        >
          Study (25m)
        </button>
        <button 
          onClick={() => switchMode('break')}
          style={{ padding: '6px 16px', border: 'none', background: !isWork ? 'white' : 'transparent', color: !isWork ? '#10b981' : '#64748b', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: !isWork ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
        >
          Break (5m)
        </button>
      </div>

      <div style={{ fontSize: '3.5rem', fontWeight: 800, color: isWork ? '#3b82f6' : '#10b981', fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px', marginBottom: '24px' }}>
        {formatTime(timeLeft)}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={toggleTimer}
          style={{ padding: '12px 32px', border: 'none', background: isActive ? '#fef2f2' : (isWork ? '#3b82f6' : '#10b981'), color: isActive ? '#ef4444' : 'white', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          style={{ padding: '12px 24px', border: 'none', background: '#f1f5f9', color: '#475569', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
