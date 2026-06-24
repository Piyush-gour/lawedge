import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import api from '../../utils/api';

export default function AdminTests() {
  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    type: 'subject-wise',
    duration: 30,
    difficulty: 'mixed',
    questions: [],
  });

  // UI State for Modal
  const [addMode, setAddMode] = useState('manual'); // 'manual', 'text', 'csv'
  const [bulkText, setBulkText] = useState('');
  
  // Current manual question
  const [currentQ, setCurrentQ] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  });

  const fetchData = async () => {
    try {
      const [testRes, subRes] = await Promise.all([
        api.get('/tests/admin/all'),
        api.get('/subjects'),
      ]);
      setTests(testRes.data.tests);
      setSubjects(subRes.data.subjects);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subject: subjects.length > 0 ? subjects[0]._id : '',
      type: 'subject-wise',
      duration: 30,
      difficulty: 'mixed',
      questions: [],
    });
    setAddMode('manual');
    resetCurrentQ();
    setIsModalOpen(true);
  };

  const openEditModal = (test) => {
    setEditingId(test._id);
    setFormData({
      title: test.title,
      subject: test.subject?._id || '',
      type: test.type,
      duration: test.duration,
      difficulty: test.difficulty,
      questions: test.questions || [],
    });
    setAddMode('manual');
    resetCurrentQ();
    setIsModalOpen(true);
  };

  const resetCurrentQ = () => {
    setCurrentQ({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
  };

  // --- ADD METHODS ---

  const addManualQuestion = () => {
    if (!currentQ.question.trim()) {
      alert('Please enter the question text');
      return;
    }
    if (currentQ.options.some((o) => !o.trim())) {
      alert('Please fill all 4 options');
      return;
    }
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQ }],
    });
    resetCurrentQ();
  };

  const parseBulkText = () => {
    if (!bulkText.trim()) return;
    
    // Split by double newline to get question blocks
    const blocks = bulkText.split(/\n\s*\n/);
    const parsedQuestions = [];
    
    for (let block of blocks) {
      if (!block.trim()) continue;
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      
      let qObj = { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' };
      
      lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.startsWith('question:') || lower.startsWith('q:')) {
          qObj.question = line.replace(/^(question|q):\s*(?:\d+\.)?\s*/i, '').trim();
        } 
        else if (!qObj.question && !line.match(/^[a-d]\)/i)) {
          // If no "Question:" prefix, assume first line is question
          qObj.question = line.replace(/^\d+\.\s*/, '').trim();
        }
        else if (lower.startsWith('a)')) qObj.options[0] = line.substring(2).trim();
        else if (lower.startsWith('b)')) qObj.options[1] = line.substring(2).trim();
        else if (lower.startsWith('c)')) qObj.options[2] = line.substring(2).trim();
        else if (lower.startsWith('d)')) qObj.options[3] = line.substring(2).trim();
        else if (lower.startsWith('correct:')) {
          const ans = line.replace(/correct:\s*/i, '').trim().toUpperCase();
          if (ans === 'A') qObj.correctAnswer = 0;
          if (ans === 'B') qObj.correctAnswer = 1;
          if (ans === 'C') qObj.correctAnswer = 2;
          if (ans === 'D') qObj.correctAnswer = 3;
        }
        else if (lower.startsWith('explanation:')) {
          qObj.explanation = line.replace(/explanation:\s*/i, '').trim();
        }
      });
      
      if (qObj.question && qObj.options[0]) {
        parsedQuestions.push(qObj);
      }
    }
    
    if (parsedQuestions.length > 0) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, ...parsedQuestions]
      }));
      setBulkText('');
      alert(`Successfully added ${parsedQuestions.length} questions!`);
    } else {
      alert('Could not parse any questions. Please check the format.');
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedQs = results.data.map(row => {
          let cIdx = 0;
          const ans = (row['Correct'] || '').toUpperCase().trim();
          if (ans === 'B') cIdx = 1;
          if (ans === 'C') cIdx = 2;
          if (ans === 'D') cIdx = 3;

          return {
            question: row['Question'] || '',
            options: [
              row['Option A'] || '',
              row['Option B'] || '',
              row['Option C'] || '',
              row['Option D'] || ''
            ],
            correctAnswer: cIdx,
            explanation: row['Explanation'] || ''
          };
        }).filter(q => q.question && q.options[0]);

        if (parsedQs.length > 0) {
          setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, ...parsedQs]
          }));
          alert(`Successfully added ${parsedQs.length} questions from CSV!`);
        } else {
          alert('Could not find valid questions. Make sure headers are correct: Question, Option A, Option B, Option C, Option D, Correct, Explanation');
        }
      },
      error: () => {
        alert('Failed to parse CSV file.');
      }
    });
  };

  const removeQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this test and all its attempts?')) {
      try {
        await api.delete(`/tests/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete test');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/tests/${editingId}`, formData);
      } else {
        await api.post('/tests', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to save test');
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h3>Manage Mock Tests</h3>
        <button className="admin-btn-primary" onClick={openAddModal}>+ Create Test</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Questions</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                  No tests created yet.
                </td>
              </tr>
            ) : (
              tests.map((test) => (
                <tr key={test._id}>
                  <td style={{ fontWeight: 500 }}>{test.title}</td>
                  <td>{test.subject?.name || 'Full Length'}</td>
                  <td>{test.questions?.length || 0} Qs</td>
                  <td>{test.duration} min</td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-action-btn" onClick={() => openEditModal(test)}>Edit</button>
                      <button className="admin-action-btn admin-action-btn--delete" onClick={() => handleDelete(test._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Test Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 800, width: '95%' }}>
            <div className="admin-modal__header">
              <div className="admin-modal__title">{editingId ? 'Edit Test' : 'Create New Test'}</div>
              <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal__body">
                {/* Test Metadata */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-group__label">Test Title</label>
                    <input required type="text" className="form-group__input" value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Constitutional Law - Test 1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-group__label">Difficulty</label>
                    <select className="form-group__input" value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      style={{ background: 'white' }}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-group__label">Subject</label>
                    <select className="form-group__input" value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      style={{ background: 'white' }}>
                      <option value="">Full Length (All subjects)</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-group__label">Duration (minutes)</label>
                    <input type="number" className="form-group__input" value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>

                <hr style={{ margin: '20px 0', border: 0, borderTop: '1px solid #e5e7eb' }} />

                {/* ADD QUESTIONS SECTION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, color: '#111827', fontSize: '1.1rem' }}>Questions ({formData.questions.length})</h4>
                  <div style={{ display: 'flex', gap: 8, background: '#f3f4f6', padding: 4, borderRadius: 8 }}>
                    <button type="button" onClick={() => setAddMode('manual')}
                      style={{ padding: '6px 12px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', background: addMode === 'manual' ? 'white' : 'transparent', boxShadow: addMode === 'manual' ? 'var(--shadow-sm)' : 'none' }}>
                      Manual
                    </button>
                    <button type="button" onClick={() => setAddMode('text')}
                      style={{ padding: '6px 12px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', background: addMode === 'text' ? 'white' : 'transparent', boxShadow: addMode === 'text' ? 'var(--shadow-sm)' : 'none' }}>
                      Paste Text
                    </button>
                    <button type="button" onClick={() => setAddMode('csv')}
                      style={{ padding: '6px 12px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', background: addMode === 'csv' ? 'white' : 'transparent', boxShadow: addMode === 'csv' ? 'var(--shadow-sm)' : 'none' }}>
                      Upload CSV
                    </button>
                  </div>
                </div>

                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 20 }}>
                  
                  {/* MANUAL MODE */}
                  {addMode === 'manual' && (
                    <div>
                      <div className="form-group">
                        <label className="form-group__label">Question Text</label>
                        <textarea className="form-group__input" value={currentQ.question}
                          onChange={(e) => setCurrentQ({ ...currentQ, question: e.target.value })}
                          rows={2} style={{ resize: 'vertical' }}
                          placeholder="Enter the question text..."
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {currentQ.options.map((opt, i) => (
                          <div key={i} className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-group__label" style={{ fontSize: '0.78rem' }}>
                              Option {String.fromCharCode(65 + i)} {currentQ.correctAnswer === i && '✅'}
                            </label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <input type="text" className="form-group__input" value={opt}
                                onChange={(e) => {
                                  const newOpts = [...currentQ.options];
                                  newOpts[i] = e.target.value;
                                  setCurrentQ({ ...currentQ, options: newOpts });
                                }}
                              />
                              <input type="radio" name="correctAnswer" checked={currentQ.correctAnswer === i}
                                onChange={() => setCurrentQ({ ...currentQ, correctAnswer: i })}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="form-group" style={{ marginTop: 12 }}>
                        <label className="form-group__label">Explanation (optional)</label>
                        <input type="text" className="form-group__input" value={currentQ.explanation}
                          onChange={(e) => setCurrentQ({ ...currentQ, explanation: e.target.value })}
                          placeholder="Why is this the correct answer?"
                        />
                      </div>
                      <button type="button" className="admin-btn-primary" onClick={addManualQuestion} style={{ marginTop: 8 }}>
                        + Add Question
                      </button>
                    </div>
                  )}

                  {/* TEXT PASTE MODE */}
                  {addMode === 'text' && (
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: 12, lineHeight: 1.5 }}>
                        Paste questions separated by a blank line. Use format:
                        <br/><br/>
                        <code>
                          Question: What is the capital of France?<br/>
                          A) Berlin<br/>
                          B) Paris<br/>
                          C) Madrid<br/>
                          D) Rome<br/>
                          Correct: B<br/>
                          Explanation: Paris is the capital.
                        </code>
                      </p>
                      <textarea className="form-group__input" value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        rows={8} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
                        placeholder="Paste your questions here..."
                      />
                      <button type="button" className="admin-btn-primary" onClick={parseBulkText} style={{ marginTop: 12 }}>
                        Parse & Add Questions
                      </button>
                    </div>
                  )}

                  {/* CSV MODE */}
                  {addMode === 'csv' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: 16 }}>
                        Upload a CSV file with the following exact headers:<br/>
                        <strong>Question | Option A | Option B | Option C | Option D | Correct | Explanation</strong>
                      </p>
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleCsvUpload}
                        style={{ display: 'block', margin: '0 auto' }}
                      />
                    </div>
                  )}
                </div>

                {/* Added Questions List */}
                {formData.questions.length > 0 && (
                  <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                    {formData.questions.map((q, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' }}>
                        <span style={{ flex: 1, paddingRight: 12 }}>
                          <strong>Q{i + 1}:</strong> {q.question} 
                          <span style={{ color: '#10b981', marginLeft: 8, fontWeight: 600 }}>Ans: {String.fromCharCode(65 + q.correctAnswer)}</span>
                        </span>
                        <button type="button" onClick={() => removeQuestion(i)}
                          style={{ background: '#fef2f2', border: 'none', color: '#ef4444', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Test ({formData.questions.length} Qs)</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
