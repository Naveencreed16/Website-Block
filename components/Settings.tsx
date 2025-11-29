import React from 'react';
import { FilterLevel, BlockedSite } from '../types';
import { Check, Trash2, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SettingsProps {
  filterLevel: FilterLevel;
  setFilterLevel: (level: FilterLevel) => void;
  blockedSites: BlockedSite[];
  onUninstall: () => void;
}

const Settings: React.FC<SettingsProps> = ({ filterLevel, setFilterLevel, blockedSites, onUninstall }) => {
  const levels = [
    {
      id: FilterLevel.STRICT,
      title: 'Strict Protection',
      description: 'Blocks all adult content, profanity, violence, and suggestive themes. Best for children.',
    },
    {
      id: FilterLevel.MODERATE,
      title: 'Moderate Protection',
      description: 'Blocks explicit content and hate speech but allows mild language and context-based nuances.',
    },
    {
      id: FilterLevel.OFF,
      title: 'Protection Off',
      description: 'No filtering applied. Content is logged but not blocked.',
    }
  ];

  // Logic to determine if uninstall is allowed
  const now = Date.now();
  // Find the latest End Date among all active scheduled blocks
  const maxLockedDate = blockedSites.reduce((max, site) => {
      // Only consider sites that have a specific blockEnd set
      if (site.blockEnd && site.blockEnd > now) {
          return site.blockEnd > max ? site.blockEnd : max;
      }
      return max;
  }, 0);

  const isLocked = maxLockedDate > 0;

  return (
    <div className="max-w-2xl space-y-10">
      
      {/* Filtering Section */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Filter Sensitivity</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Configure how the GuardianNet AI analyzes and blocks content.</p>

        <div className="space-y-4">
            {levels.map((level) => (
            <button
                key={level.id}
                onClick={() => setFilterLevel(level.id)}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 flex items-start justify-between group ${
                filterLevel === level.id
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
            >
                <div className="pr-4">
                <h3 className={`font-bold mb-1 ${
                    filterLevel === level.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'
                }`}>
                    {level.title}
                </h3>
                <p className={`text-sm ${
                    filterLevel === level.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                }`}>
                    {level.description}
                </p>
                </div>
                
                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    filterLevel === level.id
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-slate-300 dark:border-slate-600'
                }`}>
                    {filterLevel === level.id && <Check className="h-4 w-4 text-white" />}
                </div>
            </button>
            ))}
        </div>
      </section>

      <hr className="border-slate-200 dark:border-slate-700" />

      {/* Danger Zone / Uninstall Section */}
      <section>
        <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Application Management</h2>
        </div>
        
        {isLocked ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-6 flex items-start space-x-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full shrink-0">
                    <Lock className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400">Uninstallation Locked</h3>
                    <p className="text-amber-700 dark:text-amber-300 mt-1 mb-3 text-sm">
                        You have active block schedules running. To ensure commitment to your goals, the application cannot be uninstalled or reset until all scheduled time windows have passed.
                    </p>
                    <div className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
                        Locked until: {new Date(maxLockedDate).toLocaleString()}
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Uninstall Extension</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-lg">
                            This will remove the extension, clear all logs, and reset your blocked sites list. This action cannot be undone.
                        </p>
                    </div>
                    <button 
                        onClick={onUninstall}
                        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg font-medium text-sm transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Uninstall</span>
                    </button>
                </div>
                
                <div className="mt-4 flex items-center space-x-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Note: If you want to prevent uninstallation, set a Block Schedule in the Site Manager.</span>
                </div>
            </div>
        )}
      </section>
    </div>
  );
};

export default Settings;