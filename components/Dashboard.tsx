import React from 'react';
import { Stats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Shield, ShieldAlert, Eye, Activity } from 'lucide-react';

interface DashboardProps {
  stats: Stats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const data = Object.entries(stats.categoryBreakdown).map(([name, value]) => ({ name, value }));
  const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981'];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Scanned" 
          value={stats.totalScanned} 
          icon={Eye} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Threats Blocked" 
          value={stats.blockedCount} 
          icon={ShieldAlert} 
          color="bg-rose-500" 
        />
        <StatCard 
          title="Safe Content" 
          value={stats.totalScanned - stats.blockedCount} 
          icon={Shield} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Activity Rate" 
          value={stats.totalScanned > 0 ? "100%" : "0%"} 
          icon={Activity} 
          color="bg-indigo-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Blocked Categories</h3>
            <div className="h-64">
                {data.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={data}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                       <XAxis dataKey="name" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                       <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                       <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#f8fafc'}}
                       />
                       <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                         {data.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                        No threats detected yet
                    </div>
                )}
            </div>
        </div>

        {/* Safety Ratio */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Safety Distribution</h3>
             <div className="h-64 flex items-center justify-center">
                 {stats.totalScanned > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Safe', value: stats.totalScanned - stats.blockedCount },
                                    { name: 'Unsafe', value: stats.blockedCount }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc'}} />
                        </PieChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="text-slate-400 dark:text-slate-500 text-sm">
                        Start scanning to see analytics
                    </div>
                 )}
            </div>
             <div className="flex justify-center space-x-6 mt-2">
                 <div className="flex items-center">
                     <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                     <span className="text-sm text-slate-600 dark:text-slate-400">Safe</span>
                 </div>
                 <div className="flex items-center">
                     <div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div>
                     <span className="text-sm text-slate-600 dark:text-slate-400">Unsafe</span>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;