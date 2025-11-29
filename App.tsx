import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Scanner from './components/Scanner';
import Dashboard from './components/Dashboard';
import Logs from './components/Logs';
import Settings from './components/Settings';
import SiteManager from './components/SiteManager';
import { AnalysisResult, FilterLevel, LogEntry, Stats, BlockedSite } from './types';

// Pre-built list of "bad" sites
const DEFAULT_BLOCKED_SITES: BlockedSite[] = [
    { id: '1', url: 'adult-example.com', category: 'Adult Content', blockStart: null, blockEnd: null },
    { id: '2', url: 'gambling-demo-site.net', category: 'Gambling', blockStart: null, blockEnd: null },
    { id: '3', url: 'explicit-content.org', category: 'Adult Content', blockStart: null, blockEnd: null },
    { id: '4', url: 'violence-hub-demo.com', category: 'Violence', blockStart: null, blockEnd: null },
    { id: '5', url: 'restricted-zone.net', category: 'Restricted', blockStart: null, blockEnd: null },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterLevel, setFilterLevel] = useState<FilterLevel>(FilterLevel.MODERATE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('guardianNetTheme');
        // Strictly assign user's specified mode if it exists
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // Fallback to system only if user hasn't specified
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [stats, setStats] = useState<Stats>({
    totalScanned: 0,
    blockedCount: 0,
    categoryBreakdown: {}
  });

  // Load blocked sites from storage or use default
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>(() => {
      const saved = localStorage.getItem('guardianNetBlockedSites');
      return saved ? JSON.parse(saved) : DEFAULT_BLOCKED_SITES;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('guardianNetTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('guardianNetTheme', 'light');
    }
  }, [isDarkMode]);

  // Load from local storage on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('guardianNetLogs');
    const savedStats = localStorage.getItem('guardianNetStats');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('guardianNetLogs', JSON.stringify(logs));
    localStorage.setItem('guardianNetStats', JSON.stringify(stats));
    localStorage.setItem('guardianNetBlockedSites', JSON.stringify(blockedSites));
  }, [logs, stats, blockedSites]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleAnalysisComplete = (text: string, result: AnalysisResult) => {
    // Create new log entry
    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      snippet: text.length > 50 ? text.substring(0, 50) + "..." : text,
      result: result
    };

    setLogs(prev => [newEntry, ...prev]);

    // Update stats
    setStats(prev => {
      const newCategories = { ...prev.categoryBreakdown };
      
      if (!result.isSafe) {
        result.categories.forEach(cat => {
          newCategories[cat] = (newCategories[cat] || 0) + 1;
        });
      }

      return {
        totalScanned: prev.totalScanned + 1,
        blockedCount: result.isSafe ? prev.blockedCount : prev.blockedCount + 1,
        categoryBreakdown: newCategories
      };
    });
  };

  const clearLogs = () => {
    setLogs([]);
    setStats({ totalScanned: 0, blockedCount: 0, categoryBreakdown: {} });
  };

  const updateSiteSchedule = (siteId: string, start: number | null, end: number | null) => {
    setBlockedSites(prev => prev.map(site => 
        site.id === siteId ? { ...site, blockStart: start, blockEnd: end } : site
    ));
  };

  const addBlockedSite = (url: string) => {
    setBlockedSites(prev => {
        // Prevent duplicate entries
        if (prev.some(site => site.url.toLowerCase() === url.toLowerCase())) {
            return prev;
        }
        const newSite: BlockedSite = {
            id: crypto.randomUUID(),
            url: url,
            category: 'Custom Block',
            blockStart: null,
            blockEnd: null
        };
        return [newSite, ...prev];
    });
  };

  const handleUninstall = () => {
      // Logic to simulate uninstallation/reset
      if (window.confirm("Are you sure you want to uninstall? This will wipe all data and reset the application.")) {
          localStorage.removeItem('guardianNetLogs');
          localStorage.removeItem('guardianNetStats');
          localStorage.removeItem('guardianNetBlockedSites');
          localStorage.removeItem('guardianNetTheme');
          window.location.reload();
      }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'scanner':
        return <Scanner filterLevel={filterLevel} onAnalysisComplete={handleAnalysisComplete} blockedSites={blockedSites} />;
      case 'sites':
        return <SiteManager blockedSites={blockedSites} onUpdateSite={updateSiteSchedule} onAddSite={addBlockedSite} />;
      case 'logs':
        return <Logs logs={logs} clearLogs={clearLogs} />;
      case 'settings':
        return (
            <Settings 
                filterLevel={filterLevel} 
                setFilterLevel={setFilterLevel} 
                blockedSites={blockedSites}
                onUninstall={handleUninstall}
            />
        );
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
          {activeTab === 'logs' ? 'Activity Logs' : activeTab === 'sites' ? 'Site Manager' : activeTab}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {activeTab === 'dashboard' && 'Overview of content filtration activity.'}
          {activeTab === 'scanner' && 'Real-time AI content analysis.'}
          {activeTab === 'sites' && 'Manage blocked domains and active schedules.'}
          {activeTab === 'logs' && 'History of scanned content and actions taken.'}
          {activeTab === 'settings' && 'Configure filtering sensitivity and preferences.'}
        </p>
      </div>
      {renderContent()}
    </Layout>
  );
}

export default App;