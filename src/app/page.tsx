'use client';

import { useState, useEffect } from 'react';

interface Stats {
  yes: number;
  no: number;
  total: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    const savedVote = localStorage.getItem('userVote');
    if (savedVote === 'yes' || savedVote === 'no') {
      setUserVote(savedVote);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/vote');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleVote = async (choice: 'yes' | 'no') => {
    if (userVote) {
      setError('You have already voted');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to vote');
        return;
      }

      setStats(data);
      setUserVote(choice);
      localStorage.setItem('userVote', choice);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const yesPercent = stats?.total ? (stats.yes / stats.total) * 100 : 0;
  const noPercent = stats?.total ? (stats.no / stats.total) * 100 : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-8">
          VoteMaster
        </h1>

        <div className="text-center mb-10">
          <p className="text-xl text-gray-600">Is this project awesome?</p>
        </div>

        <div className="flex gap-4 justify-center mb-12">
          <button
            onClick={() => handleVote('yes')}
            disabled={!!userVote || loading}
            className={`px-8 py-3 text-lg font-semibold rounded-full transition-all transform hover:scale-105 ${
              userVote === 'yes'
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
            } disabled:opacity-50 disabled:transform-none`}
          >
            👍 Yes
          </button>
          <button
            onClick={() => handleVote('no')}
            disabled={!!userVote || loading}
            className={`px-8 py-3 text-lg font-semibold rounded-full transition-all transform hover:scale-105 ${
              userVote === 'no'
                ? 'bg-red-500 text-white cursor-default'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
            } disabled:opacity-50 disabled:transform-none`}
          >
            👎 No
          </button>
        </div>

        {error && (
          <div className="text-center text-red-500 mb-6 text-sm">{error}</div>
        )}

        {stats && stats.total > 0 && (
          <div className="mt-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Yes ({stats.yes})</span>
              <span>No ({stats.no})</span>
            </div>
            
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                />
                {yesPercent > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={`${yesPercent * 2.827} 282.7`}
                    strokeLinecap="round"
                  />
                )}
                {noPercent > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="10"
                    strokeDasharray={`${noPercent * 2.827} 282.7`}
                    strokeLinecap="round"
                    strokeDashoffset={`-${yesPercent * 2.827}`}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-700">
                  {stats.total}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {yesPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">For</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-600">
                  {noPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Against</div>
              </div>
            </div>
          </div>
        )}

        {stats && stats.total === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No votes yet. Be the first!
          </div>
        )}
      </div>
    </main>
  );
}