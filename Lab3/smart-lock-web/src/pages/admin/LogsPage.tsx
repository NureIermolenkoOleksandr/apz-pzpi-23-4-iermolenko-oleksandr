import  { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import { ShieldAlert, Loader2, Activity, Filter } from 'lucide-react';

const LogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchLogs();
  }, [eventTypeFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
   
      const data = await adminService.getAuditLogs(
        eventTypeFilter ? { type: eventTypeFilter } : undefined
      );
      setLogs(data);
    } catch (error) {
      console.error('Помилка завантаження логів', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventBadgeClass = (type: string) => {
    if (type === 'ACCESS_GRANTED') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (type === 'ACCESS_DENIED') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (type.includes('ANOMALY') || type.includes('FORCED')) return 'bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-primary" /> Журнал подій
          </h1>
          <p className="text-textSecondary mt-1 text-sm">Глобальний аудит безпеки системи</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#13131A] border border-[#2C2C35] rounded-xl px-3 py-1.5 focus-within:border-primary transition-colors">
        <Filter size={18} className="text-textSecondary shrink-0" />
        <select 
            value={eventTypeFilter} 
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-transparent text-sm text-white outline-none cursor-pointer pr-8 py-0.5 w-full sm:w-auto"
            style={{ colorScheme: 'dark' }} 
        >
            <option value="" className="bg-[#13131A] text-white">Всі події</option>
            <option value="ACCESS_GRANTED" className="bg-[#13131A] text-white">Доступ дозволено</option>
            <option value="ACCESS_DENIED" className="bg-[#13131A] text-white">Відмова в доступі</option>
            <option value="DOOR_FORCED" className="bg-[#13131A] text-white">Злам дверей</option>
            <option value="ANOMALY_DETECTED" className="bg-[#13131A] text-white">Аномалія</option>
        </select>
</div>
      </div>

      <div className="bg-surface border border-[#2C2C35] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-textSecondary">
              <thead className="bg-[#13131A] text-white border-b border-[#2C2C35]">
                <tr>
                  <th className="px-6 py-4">Дата та Час</th>
                  <th className="px-6 py-4">Подія</th>
                  <th className="px-6 py-4">Пристрій</th>
                  <th className="px-6 py-4">Користувач / Ініціатор</th>
                  <th className="px-6 py-4 text-right">Ризик</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2C35]">
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center">Записів не знайдено</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#13131A]/50">
                      <td className="px-6 py-4 text-white whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('uk-UA')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getEventBadgeClass(log.eventType)}`}>
                          {log.eventType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{log.device?.name || 'Видалений замок'}</div>
                        <div className="text-xs font-mono">{log.device?.serialNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{log.user?.fullName || 'Система'}</div>
                        <div className="text-xs">{log.user?.email || 'Автоматика / Механіка'}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {log.riskScore > 0 ? (
                          <span className="text-[#FF9F0A] font-bold flex items-center justify-end gap-1">
                            <Activity size={14} /> Z: {log.riskScore.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-textSecondary">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;