import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import '../styles/AIChat.css';

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your AI CLAT PG Tutor. Ask me any legal questions, doubts about PYQs, or concepts from your syllabus!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
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
        { id: Date.now(), sender: 'ai', text: 'Sorry, I am having trouble connecting to the server right now. Please try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear chat history?')) {
      try {
        await api.delete('/chat/clear');
        setMessages([
          {
            id: Date.now(),
            sender: 'ai',
            text: 'Chat history cleared. How can I help you today?',
          },
        ]);
      } catch (err) {
        console.error('Failed to clear chat');
      }
    }
  };

  // Simple Markdown-like formatter (handles bold and newlines)
  const formatText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Basic bold formatting **text**
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
    <div className="chat-page">
      <div className="chat-container">
        
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header__info">
            <div className="chat-header__avatar">🤖</div>
            <div>
              <h2 className="chat-header__title">AI Legal Tutor</h2>
              <p className="chat-header__subtitle">Powered by Gemini AI</p>
            </div>
          </div>
          <button className="chat-header__clear" onClick={handleClear} title="Clear Chat">
            🗑️ Clear
          </button>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender === 'user' ? 'chat-bubble-wrapper--right' : 'chat-bubble-wrapper--left'}`}>
              {msg.sender === 'ai' && <div className="chat-bubble-avatar">🤖</div>}
              <div className={`chat-bubble chat-bubble--${msg.sender}`}>
                {formatText(msg.text)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chat-bubble-wrapper chat-bubble-wrapper--left">
              <div className="chat-bubble-avatar">🤖</div>
              <div className="chat-bubble chat-bubble--ai chat-bubble--loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a legal doubt..."
            disabled={isLoading}
          />
          <button type="submit" className="chat-send-btn" disabled={!input.trim() || isLoading}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>

      </div>
    </div>
  );
}
