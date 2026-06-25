import { useState, useEffect } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import api from '../utils/api';

export default function StudyHeatmap() {
  const [data, setData] = useState([{ date: new Date().toISOString().split('T')[0], count: 0, level: 0 }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await api.get('/dashboard/heatmap');
        if (res.data.success && res.data.heatmap.length > 0) {
          // Sort by date to prevent react-activity-calendar crashes
          const sorted = res.data.heatmap.sort((a, b) => new Date(a.date) - new Date(b.date));
          setData(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch heatmap', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  const explicitTheme = {
    light: ['#e2e8f0', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981'],
    dark: ['#e2e8f0', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981'],
  };

  return (
    <div className="heatmap-wrapper" style={{ overflowX: 'auto', maxWidth: '100%', width: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#1e293b', wordBreak: 'break-word' }}>🟩 Study Consistency Tracker</h3>
      
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .heatmap-wrapper::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .heatmap-wrapper {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <div className="heatmap-container" style={{ display: 'flex', justifyContent: 'flex-start', maxWidth: '100%' }}>
        {!loading && (
          <ActivityCalendar 
            data={data} 
            theme={explicitTheme}
            labels={{
              legend: {
                less: 'Light Study',
                more: 'Intense Study'
              },
              months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              totalCount: '{{count}} study sessions completed in 2026'
            }}
            blockSize={14}
            blockRadius={3}
            blockMargin={3}
            fontSize={12}
            hideTotalCount={false}
          />
        )}
      </div>
    </div>
  );
}
