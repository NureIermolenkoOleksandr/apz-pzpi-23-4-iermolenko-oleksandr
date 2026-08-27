import { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import { BellRing, Check, AlertTriangle, Loader2 } from 'lucide-react';


interface Alert {
  id: string;
  type: string;
  status: 'NEW' | 'SENT' | 'READ';
  message?: string;
  createdAt: string;
  device?: { name: string };
}

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Помилка завантаження алертів:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminService.markAlertAsRead(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'READ' } : a));
    } catch (error) {
      console.error('Помилка оновлення статусу:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-gray-400 w-8 h-8" /></div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BellRing className="text-[#FF9F0A] w-8 h-8" />
        <h1 className="text-2xl font-bold text-white">Системні сповіщення</h1>
      </div>

      <div className="bg-surface border border-[#2C2C35] rounded-xl overflow-hidden">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Немає нових сповіщень</div>
        ) : (
          <div className="divide-y divide-[#2C2C35]">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 flex items-center justify-between transition-colors ${alert.status === 'NEW' ? 'bg-[#FF9F0A]/5' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${alert.status === 'NEW' ? 'text-red-500' : 'text-gray-500'}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h2 className={`font-semibold ${alert.status === 'NEW' ? 'text-white' : 'text-gray-400'}`}>
                      {alert.type} {alert.device && `— ${alert.device.name}`}
                    </h2>
                    {alert.message && <p className="text-sm text-gray-400 mt-1">{alert.message}</p>}
                    <span className="text-xs text-gray-500 mt-2 block">
                      {new Date(alert.createdAt).toLocaleString('uk-UA')}
                    </span>
                  </div>
                </div>
                
                {alert.status !== 'READ' && (
                  <button 
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="p-2 hover:bg-[#2C2C35] rounded-lg text-gray-400 hover:text-green-400 transition-colors"
                    title="Позначити як прочитане"
                  >
                    <Check size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;