'use client';

import { useState, useEffect } from 'react';
import { useTheme, ThemeProvider } from '@/context/ThemeContext';

function VoteContent() {
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState({ yes: 0, no: 0, total: 0 });
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    fetch('/api/vote')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setAnimate(true);
      })
      .catch(err => console.error('Error loading stats:', err));
    
    const voted = localStorage.getItem('userChoice');
    if (voted === 'yes' || voted === 'no') {
      setUserVote(voted);
    }
  }, []);

  const handleVote = async (choice: 'yes' | 'no') => {
    if (userVote || loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice })
      });
      
      const data = await res.json();
      
      if (res.status === 429) {
        setError(data.error || '⏰ You can only vote once per day. Come back tomorrow!');
        setLoading(false);
        return;
      }
      
      if (!res.ok) {
        setError(data.error || 'Failed to vote');
        setLoading(false);
        return;
      }
      
      setStats(data);
      setUserVote(choice);
      localStorage.setItem('userChoice', choice);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500);
      
    } catch (err) {
      setError('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  const yesPercent = stats.total > 0 ? (stats.yes / stats.total) * 100 : 0;
  const noPercent = stats.total > 0 ? (stats.no / stats.total) * 100 : 0;

  return (
    <div className="min-h-screen neomorphic-bg transition-all duration-300 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        {/* Header с переключателем темы */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleTheme}
            className="neomorphic-button w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Основная карточка */}
        <div className="neomorphic-card p-8 md:p-12">
          
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              VoteMaster
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Вопрос */}
          <div className="text-center mb-10">
            <p className="text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-200 mb-2">
              Is this project awesome?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ✨ ANONYMOUS • ONE VOTE PER DAY ✨
            </p>
          </div>

          {/* Кнопки голосования (неоморфные) */}
          <div className="flex gap-6 justify-center mb-12">
            <button
              onClick={() => handleVote('yes')}
              disabled={!!userVote || loading}
              className={`neomorphic-button px-10 py-4 text-xl font-bold rounded-2xl transition-all ${
                userVote === 'yes' ? 'neomorphic-button-active' : ''
              } disabled:opacity-50 disabled:transform-none`}
            >
              <span className="flex items-center gap-2">
                👍 YES
                {loading && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
              </span>
            </button>
            
            <button
              onClick={() => handleVote('no')}
              disabled={!!userVote || loading}
              className={`neomorphic-button px-10 py-4 text-xl font-bold rounded-2xl transition-all ${
                userVote === 'no' ? 'neomorphic-button-active' : ''
              } disabled:opacity-50 disabled:transform-none`}
            >
              <span className="flex items-center gap-2">
                👎 NO
                {loading && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
              </span>
            </button>
          </div>

          {/* Ошибки */}
          {error && (
            <div className="text-center text-amber-600 dark:text-amber-400 mb-6 text-sm neomorphic-inset p-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {userVote && (
            <div className="text-center text-green-600 dark:text-green-400 mb-6 text-sm neomorphic-inset p-3 rounded-xl">
              ✓ VOTE CASTED SUCCESSFULLY ✓
            </div>
          )}

          {/* Результаты */}
          {stats.total > 0 && (
            <div className={`mt-8 transition-all duration-500 ${animate ? 'animate-fade-in' : ''}`}>
              
              {/* Неоморфный прогресс-бар */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span>👍 FOR ({stats.yes})</span>
                  <span>👎 AGAINST ({stats.no})</span>
                </div>
                
                <div className="neomorphic-progress-bar h-8 rounded-xl overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700 flex items-center justify-end pr-3 text-white text-sm font-bold"
                    style={{ width: `${yesPercent}%` }}
                  >
                    {yesPercent > 15 && `${yesPercent.toFixed(0)}%`}
                  </div>
                </div>
                <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-500">
                  Total votes: {stats.total}
                </div>
              </div>

              {/* Неоморфные проценты */}
              <div className="grid grid-cols-2 gap-6 text-center mt-8">
                <div className="neomorphic-inset p-4 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {yesPercent.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">FOR</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">{stats.yes} votes</div>
                </div>
                <div className="neomorphic-inset p-4 rounded-2xl">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {noPercent.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">AGAINST</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">{stats.no} votes</div>
                </div>
              </div>
            </div>
          )}

          {stats.total === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8 neomorphic-inset p-8 rounded-2xl">
              <span className="text-4xl block mb-2">✨</span>
              NO VOTES YET<br />
              <span className="text-sm">BE THE FIRST</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <VoteContent />
    </ThemeProvider>
  );
}