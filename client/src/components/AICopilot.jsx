import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import '../styles/AICopilot.css';

export default function AICopilot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const magicPrompts = [
    "Explain Article 14 vs 15 of the Constitution",
    "What is the Basic Structure Doctrine?",
    "Generate a 3-question quiz on Criminal Law"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = textToSend.trim();
    setInput('');
    
    // Add user message to UI
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await api.post('/chat', { message: userMsg });
      
      // Add AI response to UI
      setMessages((prev) => [
        ...prev, 
        { id: Date.now(), sender: 'ai', text: res.data.text }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now(), sender: 'ai', text: 'Sorry, I am having trouble connecting right now.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleClear = async () => {
    if (window.confirm('Clear chat history?')) {
      try {
        await api.delete('/chat/clear');
        setMessages([]);
      } catch (err) {
        console.error('Failed to clear chat');
      }
    }
  };

  const formatText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return (
        <span key={i}>
          {formattedLine}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Backdrop overlay for mobile or focus mode */}
      {isOpen && <div className="copilot-backdrop" onClick={onClose}></div>}
      
      {/* Sidebar Panel */}
      <div className={`copilot-panel ${isOpen ? 'copilot-panel--open' : ''}`}>
        
        {/* Header */}
        <div className="copilot-header">
          <div className="copilot-header__info">
            <div className="copilot-header__avatar">🤖</div>
            <div>
              <h3 className="copilot-header__title">AI Legal Tutor</h3>
              <p className="copilot-header__subtitle">Always here to help</p>
            </div>
          </div>
          <div className="copilot-header__actions">
            {messages.length > 0 && (
              <button className="copilot-icon-btn" onClick={handleClear} title="Clear Chat">🗑️</button>
            )}
            <button className="copilot-icon-btn" onClick={onClose} title="Close Sidebar">✕</button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="copilot-messages">
          {messages.length === 0 ? (
            <div className="copilot-empty-state">
              <div className="copilot-empty-icon">✨</div>
              <h4>How can I help you study?</h4>
              <p>Ask me a legal doubt or try a magic prompt below:</p>
              
              <div className="copilot-magic-prompts">
                {magicPrompts.map((prompt, i) => (
                  <button 
                    key={i} 
                    className="magic-prompt-btn"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`copilot-bubble-wrapper ${msg.sender === 'user' ? 'copilot-bubble-wrapper--right' : 'copilot-bubble-wrapper--left'}`}>
                  {msg.sender === 'ai' && <div className="copilot-bubble-avatar">🤖</div>}
                  <div className={`copilot-bubble copilot-bubble--${msg.sender}`}>
                    {formatText(msg.text)}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="copilot-bubble-wrapper copilot-bubble-wrapper--left">
                  <div className="copilot-bubble-avatar">🤖</div>
                  <div className="copilot-bubble copilot-bubble--ai copilot-bubble--loading">
                    <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form className="copilot-input-area" onSubmit={onSubmit}>
          <input 
            type="text" 
            className="copilot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a legal doubt..."
            disabled={isLoading}
          />
          <button type="submit" className="copilot-send-btn" disabled={!input.trim() || isLoading}>
            ↗
          </button>
        </form>
      </div>
    </>
  );
}
