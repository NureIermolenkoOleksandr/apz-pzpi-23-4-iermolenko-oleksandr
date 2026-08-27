import { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import { Users, Server, AlertTriangle, Building, Loader2, ShieldAlert, KeyRound, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(setStats)
      .catch(err => {
        console.error("Помилка завантаження статистики", err);
        setStats(null); 
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  if (!stats) return <div className="text-center p-10 text-red-500">Не вдалося завантажити дані дашборду. Перевірте з'єднання з бекендом.</div>;

  const role = stats.role;

  const summary = stats.summary || stats.securitySummary || stats.technicalSummary || {};
  
  const metricUsers = summary.totalUsers ?? undefined;
  const metricDevices = summary.totalDevices ?? summary.offlineDevices ?? undefined;
  const metricAlerts = summary.activeAlerts ?? summary.activeBreaches ?? undefined;
  const metricBuildings = summary.totalBuildings ?? summary.managedBuildings ?? undefined;
  const metricKeys = summary.activeKeysIssued ?? undefined;
  const metricLowBattery = summary.lowBatteryDevices ?? undefined;
  const metricViolations = summary.violationsToday ?? undefined;

  let chartData: any[] = [];
  if (stats.chartData?.deviceStatus) {
    chartData = stats.chartData.deviceStatus.map((item: any) => ({
      name: item.status,
      count: item._count.status
    }));
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return '#34C759';
      case 'OFFLINE': return '#FF453A';
      case 'ERROR': return '#FF9F0A';
      case 'MAINTENANCE': return '#0A84FF';
      default: return '#8E8E93';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Дашборд ({role})</h1>
        <p className="text-textSecondary mt-1">Огляд стану системи та активності</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricUsers !== undefined && (
          <MetricCard title="Користувачі" value={metricUsers} icon={<Users size={24} />} color="text-blue-500" bg="bg-blue-500/10" />
        )}
        {metricBuildings !== undefined && (
          <MetricCard title="Офіси / Будівлі" value={metricBuildings} icon={<Building size={24} />} color="text-indigo-500" bg="bg-indigo-500/10" />
        )}
        {metricDevices !== undefined && (
          <MetricCard title={role === 'MAINTENANCE' ? "Офлайн пристрої" : "Пристрої"} value={metricDevices} icon={<Server size={24} />} color={role === 'MAINTENANCE' ? "text-red-500" : "text-green-500"} bg={role === 'MAINTENANCE' ? "bg-red-500/10" : "bg-green-500/10"} />
        )}
        {metricAlerts !== undefined && (
          <MetricCard title="Активні тривоги" value={metricAlerts} icon={<AlertTriangle size={24} />} color="text-orange-500" bg="bg-orange-500/10" />
        )}
        {metricKeys !== undefined && (
          <MetricCard title="Видані ключі" value={metricKeys} icon={<KeyRound size={24} />} color="text-emerald-500" bg="bg-emerald-500/10" />
        )}
        {metricLowBattery !== undefined && (
          <MetricCard title="Низький заряд" value={metricLowBattery} icon={<Activity size={24} />} color="text-orange-500" bg="bg-orange-500/10" />
        )}
        {metricViolations !== undefined && (
          <MetricCard title="Порушення (Сьогодні)" value={metricViolations} icon={<ShieldAlert size={24} />} color="text-red-500" bg="bg-red-500/10" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {chartData.length > 0 && (
          <div className="bg-surface border border-[#2C2C35] rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-6">Статуси пристроїв</h2>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C35" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#8E8E93" tick={{fill: '#8E8E93'}} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#8E8E93" tick={{fill: '#8E8E93', fontSize: 12}} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C23', borderColor: '#2C2C35', borderRadius: '8px', color: '#fff' }}
                    cursor={{fill: '#2C2C35'}}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className={`bg-surface border border-[#2C2C35] rounded-2xl p-6 shadow-sm flex flex-col ${chartData.length === 0 ? 'lg:col-span-3' : 'lg:col-span-1'}`}>
          <h2 className="text-lg font-bold text-white mb-4">Деталі / Активність</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((log: any) => (
                <div key={log.id} className="bg-[#13131A] p-3 rounded-xl border border-[#2C2C35]">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-white truncate pr-2">{log.device?.name || 'Невідомий пристрій'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      log.eventType === 'ACCESS_GRANTED' ? 'bg-green-500/10 text-green-500' :
                      log.eventType === 'ACCESS_DENIED' ? 'bg-red-500/10 text-red-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {log.eventType.replace('ACCESS_', '')}
                    </span>
                  </div>
                  <div className="text-xs text-textSecondary mt-1 truncate">
                    {log.user?.email || 'Система'}
                  </div>
                  <div className="text-[10px] text-textSecondary mt-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            ) : stats.criticalDevices && stats.criticalDevices.length > 0 ? (
               stats.criticalDevices.map((dev: any, idx: number) => (
                 <div key={idx} className="bg-[#13131A] p-3 rounded-xl border border-[#2C2C35]">
                    <span className="text-sm font-bold text-white">{dev.name}</span>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">{dev.status}</span>
                      <span className="text-xs text-orange-500 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">Заряд: {dev.batteryLevel}%</span>
                    </div>
                 </div>
               ))
            ) : stats.workQueue && stats.workQueue.length > 0 ? (
               stats.workQueue.map((alert: any) => (
                 <div key={alert.id} className="bg-[#13131A] p-3 rounded-xl border border-[#2C2C35] border-l-4 border-l-red-500">
                    <span className="text-sm font-bold text-white">{alert.type}</span>
                    <p className="text-xs text-textSecondary mt-1">{alert.message}</p>
                    <p className="text-[10px] text-textSecondary mt-2">{alert.device?.name} ({alert.device?.room?.name})</p>
                 </div>
               ))
            ) : stats.alerts && stats.alerts.length > 0 ? (
               stats.alerts.map((alert: any) => (
                 <div key={alert.id} className="bg-[#13131A] p-3 rounded-xl border border-[#2C2C35] border-l-4 border-l-red-500">
                    <span className="text-sm font-bold text-white">{alert.type}</span>
                    <p className="text-xs text-textSecondary mt-1">{alert.message}</p>
                 </div>
               ))
            ) : (
               <div className="h-full flex items-center justify-center text-textSecondary text-sm text-center py-10">
                 Немає подій для відображення
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color, bg }: any) => (
  <div className="bg-surface rounded-2xl p-6 border border-[#2C2C35] shadow-sm flex items-center justify-between hover:border-primary/50 transition-colors">
    <div>
      <p className="text-textSecondary text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
      {icon}
    </div>
  </div>
);

export default DashboardPage;