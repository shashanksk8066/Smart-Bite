import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Volume2, RotateCcw, ArrowRight, AlertCircle } from 'lucide-react';
import { FoodAnalysisResult, UserProfile } from '../types';

interface VoiceMealLoggerProps {
  onAnalysisComplete: (result: FoodAnalysisResult) => void;
  userProfile: UserProfile | null;
  dailyGoalCalories?: number;
  todayCalories?: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceMealLogger: React.FC<VoiceMealLoggerProps> = ({
  onAnalysisComplete,
  userProfile,
  dailyGoalCalories = 2000,
  todayCalories = 0,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = () => {
    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setError('Voice recognition is not supported in this browser. Please type what you ate below.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();

      // Safari/WebKit safety: wrap property assignments in try-catch blocks
      try {
        recognition.continuous = true;
      } catch (_) {}

      try {
        recognition.interimResults = true;
      } catch (_) {}

      try {
        // Use browser/system language if available; fallback to standard en-US without invalid patterns
        const userLang = navigator.language || 'en-US';
        if (/^[a-z]{2}(-[A-Z]{2})?$/i.test(userLang)) {
          recognition.lang = userLang;
        }
      } catch (_) {
        // Leave default system language if setLang throws in Safari
      }

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => (prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim()));
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error || event);
        const errType = event.error || '';

        if (errType === 'not-allowed') {
          setError('Microphone permission was denied. Please allow microphone access in your browser or Mac Settings.');
        } else if (errType === 'no-speech') {
          // No speech detected is normal when quiet, don't show scary error
        } else if (errType === 'network') {
          setError('Speech recognition network service is unavailable. You can type your meal description directly below.');
        } else {
          // Generic friendly message instead of raw WebKit syntax errors
          setError('Microphone listening paused. You can tap again to resume, or edit your meal text directly below.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Recognition start exception:', err);
      setIsListening(false);
      setError('Could not start microphone. You can type your meal description directly into the box below.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  };

  const handleAnalyze = async () => {
    const fullText = (transcript + ' ' + interimTranscript).trim();
    if (!fullText) {
      setError('Please speak or type what you ate before analyzing.');
      return;
    }

    if (isListening) {
      stopListening();
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          userProfile: userProfile,
        }),
      });

      // Safely read response text first to prevent Safari SyntaxError on non-JSON / 404 HTML
      const responseText = await response.text();
      let data: FoodAnalysisResult;

      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        if (response.status === 404) {
          throw new Error('Backend server needs to be restarted. Please restart your backend server with "npm run dev" so it recognizes the new voice endpoint.');
        }
        throw new Error(`Server returned status ${response.status}. Please check your backend terminal.`);
      }

      if (!response.ok) {
        throw new Error((data as any).error || `Server error (${response.status})`);
      }

      onAnalysisComplete(data);
    } catch (err: any) {
      console.error('Error analyzing voice description:', err);
      setError(err.message || 'Failed to estimate meal nutrition. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const examplePrompts = [
    '2 boiled eggs with 2 slices of whole wheat toast and an avocado',
    '1 bowl of chicken dum biryani with cucumber raita and sliced onions',
    '1 cup cooked brown rice with yellow dal and steamed broccoli',
    '1 scoop whey protein smoothie with 1 banana and 1 tbsp peanut butter',
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-teal-500/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-3">
              <Mic className="w-3.5 h-3.5 text-teal-400" /> AI Speech-to-Nutrition
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Speak What You Ate
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Turn on your mic and describe your meal naturally with portions. Gemini AI will calculate your calories, macros, and healthy swaps!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Goal</span>
              <span className="text-xl font-black text-emerald-400">
                {Math.max(0, dailyGoalCalories - todayCalories)} <span className="text-xs text-slate-400 font-normal">kcal</span>
              </span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Input Mode</span>
              <span className="text-sm font-extrabold text-teal-300">Voice & Speech</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Animated Microphone Area */}
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="relative mb-4">
            {/* Pulsing ring animation when active */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-emerald-500/10 animate-pulse" />
              </>
            )}

            <button
              type="button"
              onClick={toggleListening}
              disabled={isAnalyzing}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white scale-105 ring-4 ring-rose-500/30'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="w-9 h-9 animate-bounce" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-slate-900">
              {isListening ? 'Listening... Speak naturally' : 'Tap Microphone to Speak'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isListening
                ? 'Say your dish names and quantities (e.g. "2 boiled eggs and 1 banana"). Tap again when done.'
                : 'Supports natural speaking with portions like "1 cup", "2 slices", or "150g".'}
            </p>
          </div>

          {/* Sound waves visualizer bar when listening */}
          {isListening && (
            <div className="flex items-center gap-1.5 mt-4 h-6">
              <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
              <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-6" />
              <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-4" />
              <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-7" />
              <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-5" />
              <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-2" />
            </div>
          )}
        </div>

        {/* Live Transcript / Editable Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-600" /> Spoken Meal Transcript
            </span>
            {(transcript || interimTranscript) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Clear Text
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken words will appear here in real-time... (Or click here to type directly)"
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all resize-none"
            />
            {interimTranscript && (
              <span className="absolute bottom-3 right-4 text-[11px] font-bold text-emerald-600 animate-pulse">
                Transcribing...
              </span>
            )}
          </div>
        </div>

        {/* Notice/Error message banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Notice</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Or tap an example to test:
          </span>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTranscript(prompt)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-slate-600 font-medium transition-all text-left"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Action Button: Analyze & Estimate */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!transcript.trim() && !interimTranscript.trim())}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI Analyzing Spoken Food Items & Macros...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Estimate Nutrition from Voice</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
