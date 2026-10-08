import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Medal, Crown, TrendingUp, RefreshCw, User } from 'lucide-react';

interface LeaderboardEntry {
  name: string;
  email: string;
  currentStreak: number;
  longestStreak: number;
  totalSuccessDays: number;
}

interface LeaderboardPageProps {
  currentUserEmail: string;
}

const rankColors = [
  'from-yellow-400 to-amber-500',   // 1st - Gold
  'from-slate-300 to-slate-400',    // 2nd - Silver
  'from-orange-400 to-orange-600',  // 3rd - Bronze
];

const rankBg = [
  'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200',
  'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
  'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
];

const rankIcons = [
  <Crown className="w-5 h-5 text-yellow-500" />,
  <Medal className="w-5 h-5 text-slate-400" />,
  <Medal className="w-5 h-5 text-orange-500" />,
];


export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ currentUserEmail }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEntries(data);
      setLastRefreshed(new Date());
    } catch {
      setError('Could not load leaderboard. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const myRank = entries.findIndex(e => e.email === currentUserEmail) + 1;
  const myEntry = entries.find(e => e.email === currentUserEmail);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-700">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-extrabold tracking-wider mb-6">
            <Trophy className="w-4 h-4" />
            GLOBAL LEADERBOARD
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Top Streak Champions 🏆
          </h1>
          <p className="text-slate-400 mt-3 font-medium text-sm">
            Ranked by all-time best streak. Hit your calorie target (±15%) every day to climb the board.
          </p>

          {myEntry && (
            <div className="mt-6 inline-flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                <User className="w-5 h-5 opacity-90" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Your Rank</p>
                <p className="text-white font-bold text-lg leading-none">
                  #{myRank} · {myEntry.longestStreak} day best
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refresh bar */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-400 font-medium">
          Last updated: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Crunching the numbers…</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <p className="text-rose-700 font-semibold text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No data yet</h3>
          <p className="text-xs text-slate-500">Start logging meals to appear on the leaderboard!</p>
        </div>
      )}

      {/* Top 3 Podium */}
      {!loading && !error && top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3.map((entry, i) => {
            const isMe = entry.email === currentUserEmail;
            return (
              <div
                key={entry.email}
                className={`relative rounded-3xl border px-4 pb-5 pt-8 flex flex-col items-center text-center transition-all shadow-sm ${rankBg[i]} ${isMe ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}
              >
                {/* Rank badge overlapping top */}
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl bg-gradient-to-br ${rankColors[i]} flex items-center justify-center shadow-lg border-2 border-white`}>
                  <span className="text-white font-black text-lg">#{i + 1}</span>
                </div>

                {/* Avatar with User Icon */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${rankColors[i]} flex items-center justify-center text-white shadow-inner mb-3 border-4 border-white/50`}>
                  <User className="w-8 h-8 opacity-90" />
                </div>

                {/* Info Container */}
                <div className="flex-1 w-full flex flex-col items-center">
                  <p className={`text-base font-bold text-slate-800 truncate w-full mb-0.5 ${isMe ? 'text-emerald-700' : ''}`}>
                    {isMe ? 'You' : entry.name}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2 bg-white/60 px-3 py-1 rounded-full shadow-sm">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-xl font-black text-slate-900">{entry.longestStreak}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">best streak</p>
                </div>

                {/* Badge for rank 1-3 */}
                {rankIcons[i] && (
                  <div className="absolute top-3 right-3 opacity-80">{rankIcons[i]}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of leaderboard */}
      {!loading && !error && rest.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-800 text-sm">Full Rankings</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {entries.map((entry, i) => {
              const isMe = entry.email === currentUserEmail;
              const rank = i + 1;
              return (
                <div
                  key={entry.email}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isMe ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                >
                  {/* Rank */}
                  <div className="w-7 text-center">
                    {rank <= 3 ? (
                      rankIcons[rank - 1]
                    ) : (
                      <span className="text-xs font-bold text-slate-400">#{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm ${
                    rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                    : rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400'
                    : rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                    : isMe ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                    : 'bg-gradient-to-br from-slate-500 to-slate-600'
                  }`}>
                    <User className="w-4 h-4 opacity-90" />
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isMe ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {isMe ? `${entry.name} (You)` : entry.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      🔥 Current: {entry.currentStreak}d · Total: {entry.totalSuccessDays} days
                    </p>
                  </div>

                  {/* Streak badge */}
                  <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-full shrink-0">
                    <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-sm font-black text-slate-800">{entry.longestStreak}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">best</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
