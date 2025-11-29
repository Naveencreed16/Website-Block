import React from 'react';
import { LogEntry } from '../types';
import { Clock, ShieldAlert, CheckCircle } from 'lucide-react';

interface LogsProps {
  logs: LogEntry[];
  clearLogs: () => void;
}

const Logs: React.FC<LogsProps> = ({ logs, clearLogs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
          <Clock className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No activity yet</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Scanned content history will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
        <button 
            onClick={clearLogs}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
        >
            Clear History
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Content Snippet</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categories</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {log.result.isSafe ? (
                        <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                           <CheckCircle className="h-4 w-4 mr-1.5" /> Safe
                        </span>
                      ) : (
                        <span className="flex items-center text-rose-600 dark:text-rose-400 text-sm font-medium">
                           <ShieldAlert className="h-4 w-4 mr-1.5" /> Blocked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 dark:text-slate-200 truncate max-w-xs">{log.snippet}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 truncate max-w-xs">{log.result.reasoning}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                        {log.result.categories.slice(0, 2).map((cat, i) => (
                             <span key={i} className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {cat}
                             </span>
                        ))}
                        {log.result.categories.length > 2 && (
                            <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                +{log.result.categories.length - 2}
                            </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className={`font-semibold ${
                        log.result.score > 80 ? 'text-emerald-600 dark:text-emerald-400' : 
                        log.result.score > 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                        {log.result.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;