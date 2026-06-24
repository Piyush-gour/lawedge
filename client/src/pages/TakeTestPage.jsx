import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/Tests.css'; // For the results view
import '../styles/NTAInterface.css'; // For the NTA specific layout

export default function TakeTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NTA State
  const [hasStarted, setHasStarted] = useState(false);
  const [acceptedInstructions, setAcceptedInstructions] = useState(false);
  
  const [currentQ, setCurrentQ] = useState(0);
  // answers array elements: { questionIndex, selectedAnswer: -1 to 3, status: 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked' }
  const [answers, setAnswers] = useState([]);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  
  // Custom confirm modal for fullscreen
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const timerRef = useRef(null);

  // Fetch Test Data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await api.get(`/tests/${id}`);
        const testData = res.data.test;
        setTest(testData);
        setTimeLeft(testData.duration * 60); // convert to seconds
        
        // Initialize empty answers with NTA statuses
        setAnswers(
          testData.questions.map((_, i) => ({
            questionIndex: i,
            selectedAnswer: -1,
            status: 'not-visited',
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  // Fullscreen and startup logic
  const handleStartTest = () => {
    if (!acceptedInstructions) {
      alert('Please read and accept the instructions first.');
      return;
    }
    
    // Attempt Fullscreen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log('Fullscreen failed:', err));
    }

    // Set first question to not-answered (visited)
    setAnswers(prev => prev.map((a, i) => 
      i === 0 ? { ...a, status: 'not-answered' } : a
    ));
    
    setHasStarted(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || submitted || !test) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [hasStarted, submitted, test]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // NTA Actions
  const handleOptionSelect = (optIndex) => {
    setAnswers((prev) =>
      prev.map((a, i) =>
        i === currentQ ? { ...a, selectedAnswer: optIndex } : a
      )
    );
  };

  const moveToNextQuestion = (prevIndex) => {
    if (prevIndex < test.questions.length - 1) {
      const nextIndex = prevIndex + 1;
      setCurrentQ(nextIndex);
      // If the next question is not-visited, mark it as not-answered (because we are visiting it now)
      setAnswers((prev) => prev.map((a, i) => {
        if (i === nextIndex && a.status === 'not-visited') {
          return { ...a, status: 'not-answered' };
        }
        return a;
      }));
    }
  };

  const handleSaveAndNext = () => {
    setAnswers((prev) => prev.map((a, i) => {
      if (i === currentQ) {
        if (a.selectedAnswer !== -1) {
          return { ...a, status: 'answered' };
        } else {
          return { ...a, status: 'not-answered' };
        }
      }
      return a;
    }));
    moveToNextQuestion(currentQ);
  };

  const handleClearResponse = () => {
    setAnswers((prev) => prev.map((a, i) => 
      i === currentQ ? { ...a, selectedAnswer: -1 } : a
    ));
    // Status doesn't immediately change until they navigate away, but conventionally NTA keeps it as 'not-answered' if cleared.
  };

  const handleMarkForReviewAndNext = () => {
    setAnswers((prev) => prev.map((a, i) => {
      if (i === currentQ) {
        if (a.selectedAnswer !== -1) {
          return { ...a, status: 'answered-marked' };
        } else {
          return { ...a, status: 'marked' };
        }
      }
      return a;
    }));
    moveToNextQuestion(currentQ);
  };

  const jumpToQuestion = (index) => {
    // Before jumping, if the current question is still "not-visited" (which happens if it was just loaded) 
    // or if they didn't click save, we should ensure it's at least 'not-answered' if no answer is selected.
    setAnswers((prev) => prev.map((a, i) => {
      if (i === currentQ) {
        // If they just navigated away without clicking Save, NTA rules usually say:
        // if answered, keep it answered. If not answered, it becomes not-answered.
        // For simplicity, we just mark it not-answered if it was not-visited.
        if (a.status === 'not-visited') return { ...a, status: 'not-answered' };
      }
      if (i === index && a.status === 'not-visited') {
        return { ...a, status: 'not-answered' }; // visiting the new one
      }
      return a;
    }));
    setCurrentQ(index);
  };

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    clearInterval(timerRef.current);
    setSubmitError('');

    // Exit fullscreen (try our best)
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.log('Could not exit fullscreen', e);
    }

    const timeTaken = test ? test.duration * 60 - timeLeft : 0;

    try {
      const res = await api.post(`/tests/${id}/submit`, {
        answers,
        timeTaken,
      });
      setResults(res.data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to submit test: ' + (err.response?.data?.message || err.message));
      setShowConfirmModal(true); // Re-show modal to display error
    }
  }, [answers, id, submitted, test, timeLeft]);

  // --- RENDERING ---

  if (loading) {
    return (
      <div className="test-take-page">
        <div className="dash-skeleton" style={{ height: 60, marginBottom: 24 }} />
        <div className="dash-skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="dash-empty">
        <div className="dash-empty__icon">⚠️</div>
        <p className="dash-empty__text">Test not found.</p>
      </div>
    );
  }

  // 1. RESULTS VIEW (Standard UI)
  if (submitted && results) {
    return (
      <div className="test-take-page" style={{ marginTop: 24 }}>
        <div className="test-results-header">
          <h2>📊 Test Results</h2>
          <button className="admin-btn-secondary" onClick={() => navigate('/tests')}>
            ← Back to Tests
          </button>
        </div>

        <div className="test-results-summary">
          <div className="results-stat">
            <div className="results-stat__value">{results.score}</div>
            <div className="results-stat__label">Total Score</div>
          </div>
          <div className="results-stat">
            <div className="results-stat__value" style={{
              color: results.percentage >= 70 ? '#10b981' : results.percentage >= 40 ? '#f59e0b' : '#ef4444'
            }}>
              {results.percentage}%
            </div>
            <div className="results-stat__label">Accuracy</div>
          </div>
          <div className="results-stat">
            <div className="results-stat__value">{formatTime(results.timeTaken)}</div>
            <div className="results-stat__label">Time Taken</div>
          </div>
        </div>

        <div className="test-review">
          {results.results.map((r, i) => {
            const isUnanswered = r.selectedAnswer === -1;
            return (
              <div key={i} className={`review-card ${r.isCorrect ? 'review-card--correct' : isUnanswered ? '' : 'review-card--wrong'}`} style={{ borderLeftColor: isUnanswered ? '#9ca3af' : '' }}>
                <div className="review-card__header">
                  <span className="review-card__num">Q{i + 1}</span>
                  <span className={`review-card__badge ${r.isCorrect ? 'review-card__badge--correct' : isUnanswered ? '' : 'review-card__badge--wrong'}`} style={isUnanswered ? { background: '#f3f4f6', color: '#4b5563' } : {}}>
                    {r.isCorrect ? '✅ Correct' : isUnanswered ? '⚪ Unanswered' : '❌ Wrong'}
                  </span>
                </div>
                <p className="review-card__question">{r.question}</p>
                <div className="review-card__options">
                  {r.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`review-option
                        ${oi === r.correctAnswer ? 'review-option--correct' : ''}
                        ${oi === r.selectedAnswer && oi !== r.correctAnswer ? 'review-option--wrong' : ''}
                      `}
                    >
                      <span className="review-option__letter">{String.fromCharCode(65 + oi)}</span>
                      <span>{opt}</span>
                      {oi === r.correctAnswer && <span className="review-option__tag">✓ Correct Answer</span>}
                      {oi === r.selectedAnswer && oi !== r.correctAnswer && <span className="review-option__tag">✗ Your Answer</span>}
                    </div>
                  ))}
                </div>
                {r.explanation && (
                  <div className="review-card__explanation">
                    💡 <strong>Explanation:</strong> {r.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. INSTRUCTIONS SCREEN
  if (!hasStarted) {
    return (
      <div className="nta-instructions">
        <div className="nta-instructions-header">
          {test.title} - Instructions
        </div>
        <div className="nta-instructions-content">
          <h2>Please read the instructions carefully</h2>
          <p><strong>General Instructions:</strong></p>
          <ul>
            <li>Total duration of this test is <strong>{test.duration} minutes</strong>.</li>
            <li>The clock will be set at the server. The countdown timer at the top right will display the time remaining to complete the examination.</li>
            <li>When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
            <li>For every correct answer, <strong>+{test.marksPerQuestion || 1} mark</strong> will be awarded.</li>
            <li>For every incorrect answer, <strong>-{test.negativeMarks || 0.25} marks</strong> will be deducted (Negative Marking).</li>
            <li>Unanswered questions will receive 0 marks.</li>
          </ul>
          
          <p style={{ marginTop: 24 }}><strong>Navigating & Answering a Question:</strong></p>
          <ul>
            <li>To select your answer, click on the button of one of the options.</li>
            <li>To deselect your chosen answer, click on the <strong>Clear Response</strong> button.</li>
            <li>To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
            <li>To mark the question for review, click on the <strong>Mark for Review & Next</strong> button.</li>
          </ul>

          <p style={{ marginTop: 24 }}><strong>Question Palette Legend:</strong></p>
          <div className="nta-legend-grid" style={{ maxWidth: 500 }}>
            <div className="nta-legend-item"><div className="status-badge not-visited">1</div> You have not visited the question yet.</div>
            <div className="nta-legend-item"><div className="status-badge not-answered">2</div> You have not answered the question.</div>
            <div className="nta-legend-item"><div className="status-badge answered">3</div> You have answered the question.</div>
            <div className="nta-legend-item"><div className="status-badge marked">4</div> You have NOT answered the question, but have marked it for review.</div>
            <div className="nta-legend-item"><div className="status-badge answered-marked">5</div> The question is answered AND marked for review (will be considered for evaluation).</div>
          </div>
        </div>
        <div className="nta-instructions-footer">
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '1.05rem', fontWeight: 500, color: '#0f172a' }}>
            <input 
              type="checkbox" 
              checked={acceptedInstructions} 
              onChange={(e) => setAcceptedInstructions(e.target.checked)} 
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
            I have read and understood the instructions. All computer hardware allotted to me are in proper working condition.
          </label>
          <button 
            className="nta-btn-submit" 
            style={{ width: 'auto', padding: '12px 40px', opacity: acceptedInstructions ? 1 : 0.5 }}
            onClick={handleStartTest}
            disabled={!acceptedInstructions}
          >
            I am ready to begin
          </button>
        </div>
      </div>
    );
  }

  // 3. NTA CBT TEST SCREEN
  const question = test.questions[currentQ];
  const currentAnswerState = answers[currentQ]?.selectedAnswer;

  // Calculate stats for legend
  const stats = {
    notVisited: answers.filter(a => a.status === 'not-visited').length,
    notAnswered: answers.filter(a => a.status === 'not-answered').length,
    answered: answers.filter(a => a.status === 'answered').length,
    marked: answers.filter(a => a.status === 'marked').length,
    answeredMarked: answers.filter(a => a.status === 'answered-marked').length,
  };

  return (
    <div className="nta-layout">
      
      {/* Header */}
      <header className="nta-header">
        <h1 className="nta-header__title">{test.title}</h1>
        <div className="nta-timer">Time Left: {formatTime(timeLeft)}</div>
      </header>

      {/* Main Content Area */}
      <div className="nta-content">
        
        {/* Left Panel: Question */}
        <div className="nta-main-panel">
          <div className="nta-question-header">
            <span>Question No. {currentQ + 1}</span>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Marks: +{test.marksPerQuestion || 1} | -{test.negativeMarks || 0.25}
            </span>
          </div>
          
          <div className="nta-question-body">
            <div className="nta-question-text">{question.question}</div>
            <div className="nta-options-list">
              {question.options.map((opt, oi) => (
                <label key={oi} className="nta-option">
                  <input 
                    type="radio" 
                    name={`q-${currentQ}`}
                    checked={currentAnswerState === oi}
                    onChange={() => handleOptionSelect(oi)}
                  />
                  <div className="nta-option-text">{opt}</div>
                </label>
              ))}
            </div>
          </div>

          <div className="nta-action-footer">
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="nta-btn nta-btn-review" onClick={handleMarkForReviewAndNext}>
                Mark for Review & Next
              </button>
              <button className="nta-btn nta-btn-clear" onClick={handleClearResponse}>
                Clear Response
              </button>
            </div>
            <button className="nta-btn nta-btn-save" onClick={handleSaveAndNext}>
              Save & Next
            </button>
          </div>
        </div>

        {/* Right Panel: Sidebar */}
        <div className="nta-sidebar">
          
          {/* Profile Details */}
          <div className="nta-profile">
            <div className="nta-profile-img">👤</div>
            <div className="nta-profile-info">
              Candidate Name:
              <strong>Student Profile</strong>
            </div>
          </div>

          {/* Legend */}
          <div className="nta-legend">
            <div className="nta-legend-grid">
              <div className="nta-legend-item">
                <div className="status-badge answered">{stats.answered}</div> Answered
              </div>
              <div className="nta-legend-item">
                <div className="status-badge not-answered">{stats.notAnswered}</div> Not Answered
              </div>
              <div className="nta-legend-item">
                <div className="status-badge not-visited">{stats.notVisited}</div> Not Visited
              </div>
              <div className="nta-legend-item">
                <div className="status-badge marked">{stats.marked}</div> Marked for Review
              </div>
              <div className="nta-legend-item" style={{ gridColumn: 'span 2' }}>
                <div className="status-badge answered-marked">{stats.answeredMarked}</div> Answered & Marked for Review (will be considered for evaluation)
              </div>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="nta-palette-container">
            <div className="nta-palette-title">SECTION: {test.subject?.name || 'General'}</div>
            <div className="nta-palette-grid">
              {answers.map((a, i) => (
                <button 
                  key={i} 
                  className="nta-palette-btn"
                  onClick={() => jumpToQuestion(i)}
                  title={`Question ${i + 1}`}
                >
                  <div className={`status-badge ${a.status}`}>
                    {i + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="nta-submit-section">
            <button 
              className="nta-btn-submit"
              onClick={() => setShowConfirmModal(true)}
            >
              Submit Test
            </button>
          </div>

        </div>
      </div>

      {/* Watermark */}
      {user && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          fontSize: '4rem',
          fontWeight: 800,
          color: 'rgba(0,0,0,0.03)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 99999
        }}>
          {user.email}
        </div>
      )}

      {/* Custom Confirm Modal (window.confirm breaks in Fullscreen) */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: 24, borderRadius: 8, maxWidth: 400,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>Confirm Submission</h3>
            <p style={{ color: '#475569', marginBottom: 24 }}>Are you sure you want to submit the test? You will not be able to modify your answers.</p>
            
            {submitError && (
              <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid #fee2e2' }}>
                <strong>Error:</strong> {submitError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                className="nta-btn nta-btn-clear" 
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                className="nta-btn nta-btn-save" 
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmit();
                }}
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
