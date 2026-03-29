'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Poll {
  id: number;
  question: string;
  scheduledFor: string;
  isActive: boolean;
  votesYes: number;
  votesNo: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Проверка аутентификации
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token === 'authenticated') {
      setIsAuthenticated(true);
      fetchPolls();
    }
  }, []);

  const handleLogin = () => {
    if (password === 'admin123') {
      localStorage.setItem('adminToken', 'authenticated');
      setIsAuthenticated(true);
      fetchPolls();
      setPassword('');
    } else {
      setMessage('Wrong password');
    }
  };

  const fetchPolls = async () => {
    const res = await fetch('/api/admin/polls');
    const data = await res.json();
    setPolls(data);
  };

  const createPoll = async () => {
    if (!newQuestion || !newDate) {
      setMessage('Please fill all fields');
      return;
    }
    
    setLoading(true);
    const res = await fetch('/api/admin/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: newQuestion,
        scheduledFor: newDate,
      }),
    });
    
    const data = await res.json();
    if (res.ok) {
      setNewQuestion('');
      setNewDate('');
      setMessage('Poll created successfully!');
      fetchPolls();
    } else {
      setMessage(data.error || 'Error creating poll');
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center neomorphic-bg">
        <div className="neomorphic-card p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="neomorphic-inset w-full p-3 rounded-xl mb-4 outline-none"
          />
          <button
            onClick={handleLogin}
            className="neomorphic-button w-full py-3 rounded-xl font-semibold"
          >
            Login
          </button>
          {message && (
            <p className="text-red-500 text-center mt-4 text-sm">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen neomorphic-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button
            onClick={logout}
            className="neomorphic-button px-6 py-2 rounded-xl"
          >
            Logout
          </button>
        </div>
        
        {/* Форма создания опроса */}
        <div className="neomorphic-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Poll</h2>
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="neomorphic-inset p-3 rounded-xl outline-none"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="neomorphic-inset p-3 rounded-xl outline-none"
            />
            <button
              onClick={createPoll}
              disabled={loading}
              className="neomorphic-button py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
            {message && (
              <p className={`text-center text-sm ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
        
        {/* Список опросов */}
        <div className="neomorphic-card p-6">
          <h2 className="text-xl font-semibold mb-4">Poll History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Question</th>
                  <th className="text-center p-2">Yes</th>
                  <th className="text-center p-2">No</th>
                  <th className="text-center p-2">Total</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {polls.map((poll) => (
                  <tr key={poll.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="p-2">{new Date(poll.scheduledFor).toLocaleDateString()}</td>
                    <td className="p-2">{poll.question}</td>
                    <td className="text-center p-2 text-green-600">{poll.votesYes}</td>
                    <td className="text-center p-2 text-red-600">{poll.votesNo}</td>
                    <td className="text-center p-2">{poll.votesYes + poll.votesNo}</td>
                    <td className="text-center p-2">
                      {poll.isActive ? (
                        <span className="text-green-500">Active</span>
                      ) : (
                        <span className="text-gray-500">Past</span>
                      )}
                    </td>
                  </tr>
                ))}
                {polls.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      No polls yet. Create your first one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}