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

  // Для круговой диаграммы
  const yesDegrees = (yesPercent / 100) * 360;
  const noDegrees = (noPercent / 100) * 360;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20 transform transition-all duration-500 hover:scale-[1.02]">
        
        {/* Заголовок с анимацией */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
            VoteMaster
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-pink-500 mx-auto rounded-full"></div>
        </div>

        {/* Вопрос */}
        <div className="text-center mb-10 animate-fade-in-up">
          <p className="text-2xl md:text-3xl font-semibold text-white mb-2">
            Is this project awesome?
          </p>
          <p className="text-gray-300">Your voice matters!</p>
        </div>

        {/* Кнопки с анимациями */}
        <div className="flex gap-6 justify-center mb-12">
          <button
            onClick={() => handleVote('yes')}
            disabled={!!userVote || loading}
            className={`group relative px-10 py-4 text-xl font-bold rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              userVote === 'yes'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 cursor-default'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/50'
            } disabled:opacity-50 disabled:transform-none text-white overflow-hidden`}
          >
            <span className="relative z-10 flex items-center gap-2">
              👍 Yes
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            </span>
            {!userVote && !loading && (
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            )}
          </button>
          
          <button
            onClick={() => handleVote('no')}
            disabled={!!userVote || loading}
            className={`group relative px-10 py-4 text-xl font-bold rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              userVote === 'no'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 cursor-default'
                : 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-2xl hover:shadow-red-500/50'
            } disabled:opacity-50 disabled:transform-none text-white overflow-hidden`}
          >
            <span className="relative z-10 flex items-center gap-2">
              👎 No
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            </span>
            {!userVote && !loading && (
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            )}
          </button>
        </div>

        {error && (
          <div className="text-center text-red-300 mb-6 text-sm animate-shake">
            ⚠️ {error}
          </div>
        )}

        {userVote && (
          <div className="text-center text-green-300 mb-6 text-sm animate-bounce">
            🎉 Thank you for voting! 🎉
          </div>
        )}

        {/* Результаты */}
        {stats.total > 0 && (
          <div className={`mt-8 transition-all duration-500 ${animate ? 'animate-fade-in' : ''}`}>
            <div className="flex justify-between text-sm text-gray-300 mb-3">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                Yes ({stats.yes})
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                No ({stats.no})
              </span>
            </div>
            
            {/* Круговая диаграмма */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90 transition-all duration-700" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                {yesPercent > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradientYes)"
                    strokeWidth="8"
                    strokeDasharray={`${yesPercent * 2.827} 282.7`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                )}
                {noPercent > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradientNo)"
                    strokeWidth="8"
                    strokeDasharray={`${noPercent * 2.827} 282.7`}
                    strokeLinecap="round"
                    strokeDashoffset={`-${yesPercent * 2.827}`}
                    className="transition-all duration-1000 delay-200"
                  />
                )}
                <defs>
                  <linearGradient id="gradientYes" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient id="gradientNo" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f87171" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white animate-pulse">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-300">total votes</div>
                </div>
              </div>
            </div>

            {/* Проценты с анимацией */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-4 transform hover:scale-105 transition-all duration-300 border border-green-500/30">
                <div className="text-3xl font-bold text-green-400 animate-count-up">
                  {yesPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300 mt-1">For</div>
                <div className="text-xs text-gray-400 mt-2">{stats.yes} votes</div>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-rose-600/20 backdrop-blur-sm rounded-2xl p-4 transform hover:scale-105 transition-all duration-300 border border-red-500/30">
                <div className="text-3xl font-bold text-red-400">
                  {noPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300 mt-1">Against</div>
                <div className="text-xs text-gray-400 mt-2">{stats.no} votes</div>
              </div>
            </div>
          </div>
        )}

        {stats.total === 0 && (
          <div className="text-center text-gray-400 mt-8 animate-pulse">
            ✨ No votes yet. Be the first! ✨
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-200 {
          transition-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}