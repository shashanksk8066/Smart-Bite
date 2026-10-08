import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, X } from 'lucide-react';
import { AIMealSuggestions } from './AIMealSuggestions';
import { TodayMacrosSummary } from './TodayMacrosSummary';

interface ImageUploaderProps {
  onImageSelected: (base64Image: string, customPrompt?: string) => void;
  isLoading: boolean;
  dailyGoalCalories?: number;
  todayCalories?: number;
  todayProtein?: number;
  todayCarbs?: number;
  todayFat?: number;
  todayBurned?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
  dailyGoalCalories = 2000,
  todayCalories = 0,
  todayProtein = 0,
  todayCarbs = 0,
  todayFat = 0,
  todayBurned = 0,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // File handle
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected(e.target.result as string, customNotes);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Camera start
  const startCamera = async () => {
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        stopCamera();
        onImageSelected(dataUrl, customNotes);
      }
    }
  };

  // Convert Suggestion Image URL to Base64
  const handleSuggestionSelect = async (sampleUrl: string, promptText?: string) => {
    try {
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onImageSelected(reader.result as string, promptText || customNotes);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error fetching sample image:', err);
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg');
          onImageSelected(dataURL, promptText || customNotes);
        }
      };
      img.onerror = () => {
        alert('Could not load meal image. Please try uploading a photo directly.');
      };
      img.src = sampleUrl;
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's Macros Tracking Block */}
      <TodayMacrosSummary
        dailyGoalCalories={dailyGoalCalories}
        todayCalories={todayCalories}
        todayProtein={todayProtein}
        todayCarbs={todayCarbs}
        todayFat={todayFat}
        todayBurned={todayBurned}
      />

      {/* Primary Upload Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Upload or Snap Food Photo
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              AI detects all main dishes, accompaniments, sauces, garnishes, and drinks.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-open-camera"
              onClick={startCamera}
              disabled={isLoading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-200 text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Use Camera</span>
            </button>

            <button
              id="btn-browse-file"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-sm transition-all shadow-sm disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>Browse Image</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        {!showCamera ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/80 scale-[0.99]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
              <Upload className="w-8 h-8 stroke-[1.75]" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Drag & Drop meal image here
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
              Supports JPG, PNG, WEBP up to 20MB. Clear top-down or angled dish photos produce highest accuracy.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Detects side salads, lemon wedges, chutneys, raita, sauces & condiments
            </div>
          </div>
        ) : (
          /* Live Camera View */
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 min-h-[320px] flex flex-col items-center justify-center">
            {cameraError ? (
              <div className="p-6 text-center max-w-md">
                <div className="text-red-400 font-semibold mb-2">{cameraError}</div>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
                >
                  Close Camera
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-h-[420px] object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute top-4 right-4">
                  <button
                    onClick={stopCamera}
                    className="p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full border border-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-4 px-4">
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg text-base"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Capture & Analyze</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Optional Custom Context / Notes Input */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label htmlFor="custom-notes" className="block text-xs font-semibold text-slate-500 mb-1.5">
            Optional Context or Custom Recipe Notes (e.g., "Homemade with olive oil", "Double cheese burger"):
          </label>
          <input
            id="custom-notes"
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Add context to assist AI estimation (e.g., Cooked with coconut oil, zero sugar dip...)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* AI Meal Suggestions Based on Remaining Goal Target */}
      <AIMealSuggestions
        dailyGoalCalories={dailyGoalCalories}
        todayCalories={todayCalories}
        todayProtein={todayProtein}
        todayCarbs={todayCarbs}
        todayFat={todayFat}
        todayBurned={todayBurned}
        onSelectSuggestion={handleSuggestionSelect}
        isLoadingAnalysis={isLoading}
      />
    </div>
  );
};
