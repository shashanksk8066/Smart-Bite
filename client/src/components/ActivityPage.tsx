import React, { useState, useEffect } from 'react';
import { Activity, Flame, Plus, Trash2, Clock, CalendarDays, Bike } from 'lucide-react';
import { ExerciseLog } from '../types';

interface ActivityPageProps {
  currentUserEmail: string;
  weightKg: number;
}

// Standard MET values for activities
const MET_VALUES: Record<string, Record<string, number>> = {
  'Walking': { 'light': 2.8, 'moderate': 3.5, 'high': 4.3 },
  'Running': { 'light': 8.0, 'moderate': 9.8, 'high': 11.5 },
  'Cycling': { 'light': 4.0, 'moderate': 6.8, 'high': 8.5 },
  'Swimming': { 'light': 5.8, 'moderate': 7.0, 'high': 9.8 },
  'Gym/Weights': { 'light': 3.0, 'moderate': 4.5, 'high': 6.0 },
  'Yoga': { 'light': 2.0, 'moderate': 2.5, 'high': 3.3 },
};

export const ActivityPage: React.FC<ActivityPageProps> = ({ currentUserEmail, weightKg }) => {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [type, setType] = useState('Walking');
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'high'>('moderate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [currentUserEmail]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/exercises?email=${currentUserEmail}`);
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCalories = () => {
    const met = MET_VALUES[type][intensity] || 3.0;
    // Calories = MET * weight_in_kg * duration_in_hours
    const durationHours = duration / 60;
    return Math.round(met * weightKg * durationHours);
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const calories = calculateCalories();
    
    const payload = {
      id: `exercise-${Date.now()}`,
      user_email: currentUserEmail,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      type,
      duration_minutes: duration,
      intensity,
      calories_burned: calories
    };

    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchLogs();
        setDuration(30);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLogs(logs.filter(log => log.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date === todayStr);
  const todayCaloriesBurned = todayLogs.reduce((sum, l) => sum + l.calories_burned, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Bike className="w-8 h-8" /> Activity & Exercise
          </h1>
          <p className="text-blue-100 font-medium">Log your workouts and track calories burned.</p>
          
          <div className="mt-6 inline-flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
            <div>
              <p className="text-xs text-blue-200 font-bold uppercase">Burned Today</p>
              <p className="text-3xl font-black flex items-baseline gap-1">
                {todayCaloriesBurned} <span className="text-sm font-medium text-blue-200">kcal</span>
              </p>
            </div>
          </div>
        </div>
        <Activity className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 stroke-[0.5]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="md:col-span-1">
          <form onSubmit={handleAddExercise} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Log Activity
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Activity Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  {Object.keys(MET_VALUES).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Duration (minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number"
                    min="1"
                    max="600"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Intensity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'moderate', 'high'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setIntensity(lvl)}
                      className={`px-2 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${
                        intensity === lvl 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-600">Estimated Burn</span>
                  <span className="text-lg font-black text-orange-500 flex items-center gap-1">
                    <Flame className="w-5 h-5 fill-orange-500" /> {calculateCalories()} kcal
                  </span>
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-70"
                >
                  {isSubmitting ? 'Saving...' : 'Log Activity'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* History Column */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">Recent History</h3>
          
          {isLoading ? (
            <div className="text-center py-10 text-slate-400">Loading history...</div>
          ) : logs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No activities logged yet.</p>
              <p className="text-xs text-slate-400 mt-1">Log your first workout to start tracking.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <Bike className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight">{log.type}</h4>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {log.date} at {log.time}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {log.duration_minutes} min</span>
                        <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">{log.intensity}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-black text-orange-500 flex items-center gap-1">
                        <Flame className="w-4 h-4 fill-orange-500" /> {log.calories_burned}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Kcal</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(log.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
