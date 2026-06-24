import { useState, useEffect } from 'react';
import api from '../utils/api';

const SYLLABUS_DATA = [
  {
    subject: "Constitutional Law",
    topics: [
      { id: "const_1", title: "Preamble, Citizenship and Fundamental Rights" },
      { id: "const_2", title: "Directive Principles of State Policy & Fundamental Duties" },
      { id: "const_3", title: "Union and State Executive, Legislature & Judiciary" },
      { id: "const_4", title: "Emergency Provisions & Amendment" },
      { id: "const_5", title: "Recent Supreme Court Judgments on Constitution" }
    ]
  },
  {
    subject: "Jurisprudence",
    topics: [
      { id: "juris_1", title: "Sources of Law & Schools of Jurisprudence" },
      { id: "juris_2", title: "Rights, Duties, Ownership and Possession" },
      { id: "juris_3", title: "Persons, Property and Liability" },
      { id: "juris_4", title: "Law and Morals" }
    ]
  },
  {
    subject: "Other Law Subjects",
    topics: [
      { id: "other_1", title: "Administrative Law" },
      { id: "other_2", title: "Law of Contract" },
      { id: "other_3", title: "Torts" },
      { id: "other_4", title: "Family Law" },
      { id: "other_5", title: "Criminal Law (IPC & CrPC)" },
      { id: "other_6", title: "Property Law & Company Law" },
      { id: "other_7", title: "Public International Law" },
      { id: "other_8", title: "Tax Law & Environmental Law" }
    ]
  }
];

export default function SyllabusPage() {
  const [completedTopics, setCompletedTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/syllabus/progress');
        if (res.data.success) {
          setCompletedTopics(res.data.completedTopics || []);
        }
      } catch (err) {
        console.error('Failed to load syllabus progress', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const handleToggle = async (topicId) => {
    const isCompleted = completedTopics.includes(topicId);
    const newCompletedState = !isCompleted;

    // Optimistic UI update
    if (newCompletedState) {
      setCompletedTopics([...completedTopics, topicId]);
    } else {
      setCompletedTopics(completedTopics.filter(id => id !== topicId));
    }

    try {
      await api.post('/syllabus/toggle', { topicId, completed: newCompletedState });
    } catch (err) {
      console.error('Failed to toggle topic', err);
      // Revert on failure
      if (newCompletedState) {
        setCompletedTopics(completedTopics.filter(id => id !== topicId));
      } else {
        setCompletedTopics([...completedTopics, topicId]);
      }
    }
  };

  const totalTopics = SYLLABUS_DATA.reduce((acc, curr) => acc + curr.topics.length, 0);
  const completedCount = completedTopics.length;
  const progressPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Syllabus...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#1e293b' }}>📖 Master Syllabus Tracker</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '30px' }}>Track your overall completion of the CLAT PG 2027 Syllabus.</p>

      {/* Master Progress Bar */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Progress</span>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', lineHeight: '1' }}>{progressPercentage}%</div>
          </div>
          <div style={{ color: '#64748b', fontWeight: '500' }}>
            {completedCount} / {totalTopics} Topics Completed
          </div>
        </div>
        <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercentage}%`, background: 'linear-gradient(90deg, #3b82f6, #10b981)', transition: 'width 0.5s ease-out' }}></div>
        </div>
      </div>

      {/* Syllabus Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {SYLLABUS_DATA.map((section, idx) => {
          const sectionTotal = section.topics.length;
          const sectionCompleted = section.topics.filter(t => completedTopics.includes(t.id)).length;
          const sectionProgress = Math.round((sectionCompleted / sectionTotal) * 100);

          return (
            <div key={idx} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{section.subject}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sectionProgress}%`, background: sectionProgress === 100 ? '#10b981' : '#3b82f6', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold', minWidth: '40px' }}>{sectionProgress}%</span>
                </div>
              </div>
              
              <div style={{ padding: '10px 20px' }}>
                {section.topics.map(topic => {
                  const isChecked = completedTopics.includes(topic.id);
                  return (
                    <label 
                      key={topic.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '12px 0', 
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleToggle(topic.id)}
                        style={{ width: '20px', height: '20px', marginRight: '16px', accentColor: '#10b981', cursor: 'pointer' }}
                      />
                      <span style={{ 
                        fontSize: '1.1rem', 
                        color: isChecked ? '#94a3b8' : '#334155',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        transition: 'all 0.2s'
                      }}>
                        {topic.title}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
