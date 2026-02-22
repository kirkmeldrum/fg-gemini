

import React, { useState } from 'react';
import { Camera, ChevronLeft, FileText, Zap } from 'lucide-react';
import { Button } from './components';
import { api } from './data';

interface RecipeIndexerProps {
  onScanComplete: (data: any) => void;
  onCancel: () => void;
}

export default function RecipeIndexer({ onScanComplete, onCancel }: RecipeIndexerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCapture = async () => {
    setIsProcessing(true);
    // Simulate API call to OCR service
    const recipeData = await api.ocrRecipe(null);
    onScanComplete(recipeData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Bar */}
      <div className="p-4 flex justify-between items-center text-white bg-gradient-to-b from-black/50 to-transparent absolute top-0 left-0 right-0 z-10">
        <button onClick={onCancel} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
            <ChevronLeft size={24} />
        </button>
        <span className="font-semibold text-lg">Scan Recipe</span>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Main Camera Area (Simulated) */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden">
        {/* Mock Video Feed */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
             <img 
                src="https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80" 
                className="w-full h-full object-cover blur-sm"
            />
        </div>

        {/* Document Guide Overlay */}
        <div className="absolute inset-8 border-2 border-white/50 rounded-lg flex flex-col justify-between p-4">
            <div className="flex justify-between">
                <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-500"></div>
                <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-500"></div>
            </div>
            <div className="text-center text-white/80 font-medium bg-black/40 py-2 rounded-full backdrop-blur-sm mx-auto px-4">
                Align recipe page within frame
            </div>
            <div className="flex justify-between">
                <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-500"></div>
                <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-500"></div>
            </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 animate-in fade-in duration-300">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-emerald-400 font-bold text-xl mb-2">Analyzing Text...</h3>
                <p className="text-slate-400 text-sm">Extracting ingredients and steps</p>
            </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black p-8 pb-12 flex justify-center items-center gap-8 relative z-10">
        <button className="text-white/60 hover:text-white flex flex-col items-center gap-1">
            <FileText size={24} />
            <span className="text-xs">Import File</span>
        </button>

        <button 
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group"
        >
            <div className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition-transform"></div>
        </button>

        <button className="text-white/60 hover:text-white flex flex-col items-center gap-1">
            <Zap size={24} />
            <span className="text-xs">Flash Off</span>
        </button>
      </div>
    </div>
  );
}