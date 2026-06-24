import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await api.get('/dashboard/todos');
      setTodos(res.data.todos);
    } catch (err) {
      console.error('Failed to fetch todos', err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const res = await api.post('/dashboard/todos', { text: newTodo });
      setTodos([res.data.todo, ...todos]);
      setNewTodo('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/dashboard/todos/${id}`);
      setTodos(todos.map(t => t._id === id ? res.data.todo : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/dashboard/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1e293b' }}>📝 Daily Goals</h3>
      
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder="Add a new study goal..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
        />
        <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Add
        </button>
      </form>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {todos.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '20px' }}>No goals set. Add one above!</p>
        ) : (
          todos.map(todo => (
            <div key={todo._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <input 
                type="checkbox" 
                checked={todo.completed}
                onChange={() => handleToggle(todo._id)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981', marginTop: '4px' }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: todo.completed ? '#9ca3af' : '#334155', textDecoration: todo.completed ? 'line-through' : 'none' }}>
                  {todo.text}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  {new Date(todo.createdAt).toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                  })}
                </span>
              </div>
              <button 
                onClick={() => handleDelete(todo._id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7, padding: '4px 8px' }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
