'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ yes: 0, no: 0, total: 0 });
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/vote')
      .then(res => res.json())
      .then(data => {
        console.log('Stats loaded:', data);
        setStats(data);
      })
      .catch(err => console.error('Error loading stats:', err));
    
    const voted = localStorage.getItem('userChoice');
    if (voted === 'yes' || voted === 'no') {
      setUserVote(voted);
    }
  }, []);

  const handleVote = async (choice: 'yes' | 'no') => {
    if (userVote) {
      setError('You have already voted!');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Sending vote:', choice);
      
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice })
      });
      
      const data = await res.json();
      console.log('Vote response:', data);
      
      if (!res.ok) {
        setError(data.error || 'Failed to vote');
        setLoading(false);
        return;
      }
      
      setStats(data);
      setUserVote(choice);
      localStorage.setItem('userChoice', choice);
      setError('');
      
    } catch (err) {
      console.error('Vote error:', err);
      setError('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  const yesPercent = stats.total > 0 ? (stats.yes / stats.total) * 100 : 0;
  const noPercent = stats.total > 0 ? (stats.no / stats.total) * 100 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
          VoteMaster
        </h1>
        
        <p className="text-xl text-center text-gray-600 mb-8">
          Is this project awesome?
        </p>
        
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => handleVote('yes')}
            disabled={!!userVote || loading}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-md"
          >
            {loading ? '...' : '👍 Yes'}
          </button>
          <button
            onClick={() => handleVote('no')}
            disabled={!!userVote || loading}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-md"
          >
            {loading ? '...' : '👎 No'}
          </button>
        </div>
        
        {error && (
          <div className="text-center text-red-500 mb-4 text-sm">
            {error}
          </div>
        )}
        
        {userVote && (
          <div className="text-center text-green-600 mb-4 text-sm">
            Thank you for voting!
          </div>
        )}
        
        {stats.total > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Yes ({stats.yes})</span>
              <span>No ({stats.no})</span>
            </div>
            
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden mb-4">
              <div 
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${yesPercent}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-xl font-bold text-green-600">
                  {yesPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">For</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <div className="text-xl font-bold text-red-600">
                  {noPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Against</div>
              </div>
            </div>
            
            <div className="text-center text-gray-400 text-sm mt-4">
              Total votes: {stats.total}
            </div>
          </div>
        )}
        
        {stats.total === 0 && (
          <div className="text-center text-gray-400 mt-6">
            No votes yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
}