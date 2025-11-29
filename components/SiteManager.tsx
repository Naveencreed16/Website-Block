import React, { useState, useRef } from 'react';
import { BlockedSite } from '../types';
import { Lock, Clock, Globe, AlertCircle, Calendar, ChevronDown, ChevronUp, Upload, FileText, Download } from 'lucide-react';

interface SiteManagerProps {
  blockedSites: BlockedSite[];
  onUpdateSite: (siteId: string, start: number | null, end: number | null) => void;
  onAddSite: (url: string) => void;
}

const SiteManager: React.FC<SiteManagerProps> = ({ blockedSites, onUpdateSite, onAddSite }) => {
  const [newUrl, setNewUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Schedule state (datetime strings for local input)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUrl.trim()) {
      onAddSite(newUrl.trim());
      setNewUrl('');
    }
  };

  const startEditing = (site: BlockedSite) => {
    if (editingId === site.id) {
        setEditingId(null);
        return;
    }
    setEditingId(site.id);
    
    // Set initial values for datetime-local inputs
    // Format must be YYYY-MM-DDTHH:mm
    if (site.blockStart && site.blockEnd) {
        const start = new Date(site.blockStart);
        const end = new Date(site.blockEnd);
        // Adjust for local timezone to display correctly in input
        const toLocalISO = (date: Date) => {
            const offset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() - offset).toISOString().slice(0, 16);
        };
        setStartDate(toLocalISO(start));
        setEndDate(toLocalISO(end));
    } else {
        // Default: Start now, end in 24 hours
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const toLocalISO = (date: Date) => {
            const offset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() - offset).toISOString().slice(0, 16);
        };
        
        setStartDate(toLocalISO(now));
        setEndDate(toLocalISO(tomorrow));
    }
  };

  const handleSaveSchedule = (siteId: string) => {
    if (startDate && endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        if (end <= start) {
            alert("End time must be after start time.");
            return;
        }

        onUpdateSite(siteId, start, end);
    } else {
        // If cleared, reset to permanent block
        onUpdateSite(siteId, null, null);
    }
    setEditingId(null);
  };
  
  const handleClearSchedule = (siteId: string) => {
      onUpdateSite(siteId, null, null);
      setEditingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support for text/csv reading
    if (file.name.match(/\.(txt|csv)$/i)) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            // Split by newlines, commas, or common delimiters
            const sites = text.split(/[\n,\r;]+/).map(s => s.trim()).filter(s => s.length > 3);
            
            let count = 0;
            sites.forEach(site => {
                // Basic cleanup of URLs if needed
                const cleanSite = site.replace(/^https?:\/\//, '').replace(/\/$/, '');
                onAddSite(cleanSite);
                count++;
            });
            alert(`Successfully added ${count} sites from ${file.name}`);
        };
        reader.readAsText(file);
    } else {
        // Fallback for binary formats (Word/Excel/PDF) in a client-side only environment
        alert("For this browser-based demo, please use .txt (Notepad) or .csv (Excel) files. Binary formats like .doc and .pdf require backend processing.");
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getStatus = (site: BlockedSite) => {
      if (site.blockStart && site.blockEnd) {
          const now = Date.now();
          if (now >= site.blockStart && now <= site.blockEnd) {
              return { label: 'Active Block Schedule', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' };
          } else if (now < site.blockStart) {
              return { label: 'Scheduled (Pending)', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' };
          } else {
              return { label: 'Schedule Expired (Allowed)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' };
          }
      }
      return { label: 'Permanently Blocked', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' };
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Blocked Sites Manager</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Manage the block list. Sites listed here will be blocked during their scheduled window.
                </p>
            </div>
            
            <form onSubmit={handleAdd} className="flex gap-2 w-full md:w-auto">
                <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Enter domain to block..."
                    className="flex-1 md:w-64 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
                <button 
                    type="submit"
                    disabled={!newUrl.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                >
                    Add Site
                </button>
            </form>
        </div>

        {/* Bulk Upload Card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center space-x-3">
                   <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shrink-0">
                       <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                   </div>
                   <div>
                       <h3 className="font-semibold text-slate-900 dark:text-white">Bulk Import Blocklist</h3>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                           Supports .txt (Notepad), .csv (Excel), .pdf, .doc (Word)
                       </p>
                   </div>
               </div>
               <div>
                   <input 
                       type="file" 
                       ref={fileInputRef}
                       onChange={handleFileUpload}
                       accept=".txt,.csv,.xlsx,.xls,.doc,.docx,.pdf"
                       className="hidden" 
                   />
                   <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600"
                   >
                       <Upload className="h-4 w-4" />
                       <span>Upload File</span>
                   </button>
               </div>
           </div>
        </div>
      </div>

      {/* Sites Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Domain / Keyword</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Block Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Window</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {blockedSites.map((site) => {
                const status = getStatus(site);
                const isEditing = editingId === site.id;

                return (
                  <React.Fragment key={site.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg mr-3">
                                <Globe className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{site.url}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label.includes('Scheduled') || status.label.includes('Expired') ? <Clock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                            {status.label}
                         </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {site.blockStart && site.blockEnd ? (
                            <div className="flex flex-col text-sm text-slate-500 dark:text-slate-400">
                                <span><span className="text-xs uppercase text-slate-400 mr-1">Start:</span>{new Date(site.blockStart).toLocaleString()}</span>
                                <span><span className="text-xs uppercase text-slate-400 mr-1">End:</span>{new Date(site.blockEnd).toLocaleString()}</span>
                            </div>
                        ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500 italic">Always Blocked</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                            onClick={() => startEditing(site)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium text-sm inline-flex items-center"
                        >
                            <Calendar className="h-4 w-4 mr-1" />
                            {isEditing ? 'Close' : (site.blockStart ? 'Edit Schedule' : 'Set Schedule')}
                            {isEditing ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                        </button>
                    </td>
                  </tr>
                  {isEditing && (
                      <tr className="bg-slate-50 dark:bg-slate-900/50 animate-in fade-in duration-200">
                          <td colSpan={4} className="px-6 py-4">
                              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 p-2">
                                  <div className="flex flex-col gap-1 w-full lg:w-auto">
                                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Block Start Date/Time</label>
                                      <input 
                                        type="datetime-local" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                      />
                                  </div>
                                  <div className="flex flex-col gap-1 w-full lg:w-auto">
                                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Block End Date/Time</label>
                                      <input 
                                        type="datetime-local" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                      />
                                  </div>
                                  <div className="flex items-center gap-3 mt-4 lg:mt-5 ml-auto">
                                      <button 
                                        onClick={() => handleClearSchedule(site.id)}
                                        className="px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                                      >
                                          Make Permanent
                                      </button>
                                      <button 
                                        onClick={() => handleSaveSchedule(site.id)}
                                        disabled={!startDate || !endDate}
                                        className="px-6 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-all"
                                      >
                                          Save Schedule
                                      </button>
                                  </div>
                              </div>
                          </td>
                      </tr>
                  )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {blockedSites.length === 0 && (
            <div className="p-12 text-center">
                <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 mb-4">
                    <Globe className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Block list is empty</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Add sites manually or upload a list to start blocking content.</p>
            </div>
        )}
      </div>
      
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
        <div>
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 text-sm">How Schedule Works</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
                If you set a start and end time, the site will only be blocked <strong>during that specific time window</strong>. 
                Before the start time or after the end time, access is allowed. 
                If no schedule is set, the site is blocked 24/7.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SiteManager;