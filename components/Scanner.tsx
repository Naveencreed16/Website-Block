import React, { useState } from 'react';
import { analyzeContent } from '../services/geminiService';
import { AnalysisResult, FilterLevel, SafetyCategory, BlockedSite } from '../types';
import { AlertTriangle, CheckCircle, ShieldAlert, Loader2, ArrowRight, Ban } from 'lucide-react';

interface ScannerProps {
  filterLevel: FilterLevel;
  onAnalysisComplete: (text: string, result: AnalysisResult) => void;
  blockedSites: BlockedSite[];
}

const Scanner: React.FC<ScannerProps> = ({ filterLevel, onAnalysisComplete, blockedSites }) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const checkBlockedSites = (text: string): AnalysisResult | null => {
    const lowerText = text.toLowerCase();
    
    for (const site of blockedSites) {
      if (lowerText.includes(site.url.toLowerCase())) {
        const now = Date.now();
        const hasSchedule = site.blockStart !== null && site.blockEnd !== null;
        
        let isBlocked = true;
        
        // If schedule exists, check if we are currently within the blocking window
        if (hasSchedule) {
            if (now >= site.blockStart! && now <= site.blockEnd!) {
                isBlocked = true;
            } else {
                isBlocked = false; // Outside of blocking window (Expired or Pending)
            }
        }
        // If no schedule (both null), isBlocked remains true (Permanent Block)

        if (isBlocked) {
            const endDateFormatted = hasSchedule ? new Date(site.blockEnd!).toLocaleString() : 'Permanent';
            
            const reasoning = hasSchedule 
                ? `Access to '${site.url}' is restricted by schedule until ${endDateFormatted}.`
                : `Access to '${site.url}' is permanently restricted by the Block List.`;

            return {
                isSafe: false,
                score: 0,
                categories: [SafetyCategory.ADULT], // Defaulting to Adult/Blocked category
                reasoning: reasoning,
                flaggedPhrases: [site.url]
            };
        }
      }
    }
    return null;
  };

  const handleScan = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);

    // 1. Check Local Block List First
    const blockListResult = checkBlockedSites(inputText);
    
    if (blockListResult) {
        // Imitate delay for better UX
        setTimeout(() => {
            setResult(blockListResult);
            onAnalysisComplete(inputText, blockListResult);
            setIsAnalyzing(false);
        }, 600);
        return;
    }
    
    // 2. If not in list (or scheduled allowed), proceed to AI Scan
    try {
      const data = await analyzeContent(inputText, filterLevel);
      setResult(data);
      onAnalysisComplete(inputText, data);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze content. Check API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
    return 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Content Scanner</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
          Paste text or a URL below to check for 18+ content. The system checks against the Blocked Site List first, then analyzes context with Gemini AI.
        </p>
        
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text or URL to analyze here..."
            className="w-full h-40 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-700 dark:text-slate-200 text-sm leading-relaxed placeholder-slate-400"
          />
          <div className="absolute bottom-4 right-4 text-xs text-slate-400 dark:text-slate-500">
            {inputText.length} characters
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sensitivity:</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    filterLevel === FilterLevel.STRICT ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    filterLevel === FilterLevel.MODERATE ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                    {filterLevel}
                </span>
            </div>
            <button
            onClick={handleScan}
            disabled={isAnalyzing || !inputText.trim()}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                isAnalyzing || !inputText.trim()
                ? 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg dark:hover:bg-indigo-500'
            }`}
            >
            {isAnalyzing ? (
                <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scanning...</span>
                </>
            ) : (
                <>
                <span>Scan Content</span>
                <ArrowRight className="h-4 w-4" />
                </>
            )}
            </button>
        </div>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Header Card */}
           <div className={`rounded-xl border p-6 flex items-start justify-between ${
               result.isSafe 
                ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50' 
                : 'bg-rose-50/50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-800/50'
            }`}>
                <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${
                        result.isSafe 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                        {result.isSafe ? <CheckCircle className="h-8 w-8" /> : (result.reasoning.includes('Block List') ? <Ban className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />)}
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold ${
                            result.isSafe 
                            ? 'text-emerald-900 dark:text-emerald-300' 
                            : 'text-rose-900 dark:text-rose-300'
                        }`}>
                            {result.isSafe ? 'Content is Safe' : 'Content Blocked'}
                        </h3>
                        <p className={`mt-1 text-sm ${
                            result.isSafe 
                            ? 'text-emerald-700 dark:text-emerald-400' 
                            : 'text-rose-700 dark:text-rose-400'
                        }`}>
                            {result.reasoning}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Safety Score</div>
                    <div className={`text-3xl font-bold px-4 py-2 rounded-lg border ${getScoreColor(result.score)}`}>
                        {result.score}
                    </div>
                </div>
           </div>

           {/* Details Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Categories */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                        <ShieldAlert className="h-4 w-4 mr-2 text-slate-400" />
                        Detected Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.categories.map((cat, idx) => (
                            <span key={idx} className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                cat === SafetyCategory.SAFE 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
                            }`}>
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Flagged Phrases */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-slate-400" />
                        Flagged Phrases
                    </h4>
                    {result.flaggedPhrases.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                             {result.flaggedPhrases.map((phrase, idx) => (
                                <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded border border-slate-200 dark:border-slate-600">
                                    "{phrase}"
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">No specific phrases were flagged.</p>
                    )}
                </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;