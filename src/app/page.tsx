'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ yes: 0, no: 0, total: 0 });
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/vote')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  const handleVote = async (choice: 'yes' | 'no') => {
    if (userVote) {
      setError('You already voted');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
      
      setStats(data);
      setUserVote(choice);
      setError('');
    } catch (err) {
      setError('Network error');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4">VoteMaster</h1>
        <p className="text-xl mb-6">Is this project awesome?</p>
        
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => handleVote('yes')}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50"
          >
            👍 Yes
          </button>
          <button
            onClick={() => handleVote('no')}
            disabled={loading}
            className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
          >
            👎 No
          </button>
        </div>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {userVote && <p className="text-green-500 mb-4">You voted: {userVote === 'yes' ? 'Yes' : 'No'}</p>}
        
        {stats.total > 0 && (
          <div className="mt-4">
            <p>Yes: {stats.yes} ({stats.total ? ((stats.yes/stats.total)*100).toFixed(1) : 0}%)</p>
            <p>No: {stats.no} ({stats.total ? ((stats.no/stats.total)*100).toFixed(1) : 0}%)</p>
            <p>Total: {stats.total}</p>
          </div>
        )}
      </div>
    </div>
  );
}