'use client';

import { useState, useEffect } from 'react';

export default function Home() {
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
      
      // Обработка rate limiting (429)
      if (res.status === 429) {
        setError(data.error || '⏰ You can only vote once per day. Come back tomorrow!');
        setLoading(false);
        return;
      }
      
      // Обработка других ошибок
      if (!res.ok) {
        setError(data.error || 'Failed to vote');
        setLoading(false);
        return;
      }
      
      // Успешное голосование
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Анимированная сетка */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Анимированные неоновые линии */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse delay-700"></div>
      
      {/* Декоративные круги */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse delay-1000"></div>
      
      <div className="relative max-w-2xl w-full bg-black/80 backdrop-blur-sm rounded-2xl border border-green-500/30 shadow-2xl shadow-green-500/10 p-8 md:p-12 transition-all duration-500 hover:shadow-green-500/20">
        
        {/* Заголовок с неоном */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text animate-pulse">
            VoteMaster
          </h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full mt-3"></div>
        </div>

        {/* Вопрос */}
        <div className="text-center mb-10">
          <p className="text-2xl md:text-3xl font-bold text-gray-200 mb-2">
            Is this project awesome?
          </p>
          <p className="text-gray-500 text-sm tracking-wider">⚡ ANONYMOUS • ONE VOTE PER DAY ⚡</p>
        </div>

        {/* Кнопки с неоновым эффектом */}
        <div className="flex gap-6 justify-center mb-12">
          <button
            onClick={() => handleVote('yes')}
            disabled={!!userVote || loading}
            className={`group relative px-10 py-4 text-xl font-bold rounded-lg transition-all duration-300 transform hover:scale-105 ${
              userVote === 'yes'
                ? 'bg-green-500 cursor-default shadow-lg shadow-green-500/50'
                : 'bg-transparent border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-black hover:shadow-lg hover:shadow-green-500/50'
            } disabled:opacity-50 disabled:transform-none overflow-hidden`}
          >
            <span className="relative z-10 flex items-center gap-2">
              👍 YES
              {loading && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
            </span>
            {!userVote && !loading && (
              <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            )}
          </button>
          
          <button
            onClick={() => handleVote('no')}
            disabled={!!userVote || loading}
            className={`group relative px-10 py-4 text-xl font-bold rounded-lg transition-all duration-300 transform hover:scale-105 ${
              userVote === 'no'
                ? 'bg-red-500 cursor-default shadow-lg shadow-red-500/50'
                : 'bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-black hover:shadow-lg hover:shadow-red-500/50'
            } disabled:opacity-50 disabled:transform-none overflow-hidden`}
          >
            <span className="relative z-10 flex items-center gap-2">
              👎 NO
              {loading && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
            </span>
            {!userVote && !loading && (
              <div className="absolute inset-0 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            )}
          </button>
        </div>

        {/* Ошибки (включая rate limiting) */}
        {error && (
          <div className="text-center text-yellow-400 mb-6 text-sm border border-yellow-500/30 rounded-lg p-3 bg-yellow-500/10">
            ⚠️ {error}
          </div>
        )}

        {userVote && (
          <div className="text-center text-green-400 mb-6 text-sm animate-pulse">
            ✓ VOTE CASTED SUCCESSFULLY ✓
          </div>
        )}

        {/* Результаты */}
        {stats.total > 0 && (
          <div className={`mt-8 transition-all duration-500 ${animate ? 'animate-fade-in' : ''}`}>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500"></div>
                FOR ({stats.yes})
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500"></div>
                AGAINST ({stats.no})
              </span>
            </div>
            
            {/* Круговая диаграмма */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="8"
                />
                {yesPercent > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${yesPercent * 2.827} 282.7`}
                    strokeLinecap="round"
                    className="filter drop-shadow-lg"
                  />
                )}
                {noPercent > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray={`${noPercent * 2.827} 282.7`}
                    strokeLinecap="round"
                    strokeDashoffset={`-${yesPercent * 2.827}`}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 animate-pulse">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-600 tracking-wider">VOTES</div>
                </div>
              </div>
            </div>

            {/* Проценты */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-xl p-4 hover:border-green-500/60 transition-all duration-300">
                <div className="text-3xl font-bold text-green-400 font-mono">
                  {yesPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">FOR</div>
                <div className="text-xs text-gray-600 mt-2">{stats.yes} votes</div>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/30 rounded-xl p-4 hover:border-red-500/60 transition-all duration-300">
                <div className="text-3xl font-bold text-red-400 font-mono">
                  {noPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">AGAINST</div>
                <div className="text-xs text-gray-600 mt-2">{stats.no} votes</div>
              </div>
            </div>
          </div>
        )}

        {stats.total === 0 && (
          <div className="text-center text-gray-600 mt-8 animate-pulse border border-gray-800 rounded-xl p-6">
            <span className="text-2xl block mb-2">💀</span>
            NO VOTES YET<br />
            <span className="text-xs">BE THE FIRST</span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}