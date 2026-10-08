import React, { useEffect, useState } from 'react';
import { Sparkles, Scan, Search, PieChart, CheckCircle2 } from 'lucide-react';

interface ScanProgressProps {
  imagePreviewUrl?: string;
}

const SCAN_STEPS = [
  { label: 'Scanning plate geometry & color spectrum...', icon: Scan },
  { label: 'Detecting primary food items & main proteins...', icon: Search },
  { label: 'Identifying side accompaniments, sauces & garnishes...', icon: Sparkles },
  { label: 'Estimating volume, portion sizes & gram weight...', icon: PieChart },
  { label: 'Calculating precise calories, protein, carbs & fat...', icon: CheckCircle2 },
];

export const ScanProgress: React.FC<ScanProgressProps> = ({ imagePreviewUrl }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center my-6 relative overflow-hidden">
      <div className="max-w-md mx-auto">
        {/* Preview image with laser overlay */}
        {imagePreviewUrl && (
          <div className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-md">
            <img
              src={imagePreviewUrl}
              alt="Scanning preview"
              className="w-full h-full object-cover filter brightness-95"
            />
            {/* Animated Scanning Beam */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_#10b981] animate-pulse top-1/2" />
            
            <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ANALYZING
            </div>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Nutritionist at Work
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Analyzing Food Plate & Accompaniments
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Our vision model is isolating each item on the plate to ensure no side dish or garnish is missed.
        </p>

        {/* Step Indicator */}
        <div className="space-y-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
          {SCAN_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center space-x-3 text-xs py-1 transition-colors ${
                  isDone
                    ? 'text-emerald-700 font-semibold'
                    : isCurrent
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'animate-spin text-emerald-600' : ''}`} />
                <span className="flex-1">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
