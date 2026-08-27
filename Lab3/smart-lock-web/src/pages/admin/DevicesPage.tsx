import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import type { Device } from '../../types';
import { Server, Loader2, KeyRound, Plus, ShieldAlert, Edit, Trash2, Activity, X } from 'lucide-react';

const DevicesPage = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false); 
  
  const [deviceSecret, setDeviceSecret] = useState<{ id: string; secret: string } | null>(null);
  const [secretLoadingId, setSecretLoadingId] = useState<string | null>(null);
 
const [editingDevice, setEditingDevice] = useState<(Partial<Device> & { buildingId?: string; roomId?: string }) | null>(null);
  const [logsDevice, setLogsDevice] = useState<{ id: string; name: string, logs: any[] } | null>(null);

  useEffect(() => { 
    loadDevices(); 
    loadBuildingsData();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDevices();
      setDevices(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const loadBuildingsData = async () => {
    try {
      const buildingsData = await adminService.getBuildings();
      setBuildings(buildingsData);
    } catch (error) {
      console.error("Помилка завантаження будівель", error);
    }
  };


  const loadRoomsForBuilding = async (buildingId: string) => {
    if (!buildingId) {
      setAvailableRooms([]);
      return;
    }
    try {
      setRoomsLoading(true);
      const roomsData = await adminService.getRooms(buildingId);
      setAvailableRooms(roomsData);
    } catch (error) {
      console.error("Помилка завантаження кімнат для будівлі", error);
      setAvailableRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleSaveDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice || !editingDevice.roomId) return;
    
    try {
      if (editingDevice.id) {
        await adminService.updateDevice(editingDevice.id, editingDevice);
      } else {
        await adminService.createDevice(editingDevice as any);
      }
      setEditingDevice(null);
      loadDevices();
    } catch (error: any) {
      alert(error.response?.data?.error || "Помилка збереження");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Видалити цей пристрій? Ця дія незворотна.')) return;
    try {
      await adminService.deleteDevice(id);
      loadDevices();
    } catch (error) { alert("Помилка видалення"); }
  };

  const handleViewSecret = async (id: string) => {
    try {
      setSecretLoadingId(id);
      const data = await adminService.getDeviceSecret(id);
      setDeviceSecret({ id, secret: data.totpSecret || data.secret });
    } catch (error: any) { 
      alert('Немає доступу до секретного ключа (Потрібна роль SUPER_ADMIN)'); 
    } finally {
      setSecretLoadingId(null);
    }
  };

  const handleViewLogs = async (device: Device) => {
    try {
      const logs = await adminService.getAuditLogs({ deviceId: device.id });
      setLogsDevice({ id: device.id, name: device.name || 'Замок', logs });
    } catch (error) { alert("Помилка завантаження логів"); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="text-primary" /> Пристрої та Замки
          </h1>
          <p className="text-textSecondary mt-1 text-sm">Натисніть на рядок пристрою, щоб переглянути його події</p>
        </div>
        <button 
          onClick={() => {
            setAvailableRooms([]);
            setEditingDevice({ status: 'ONLINE', category: 'SMART_LOCK', buildingId: '', roomId: '' });
          }}
          className="flex items-center gap-2 bg-primary hover:bg-[#0A73E0] text-white px-4 py-2.5 rounded-xl font-bold transition-colors"
        >
          <Plus size={20} /> Додати пристрій
        </button>
      </div>

      <div className="bg-surface border border-[#2C2C35] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-textSecondary">
            <thead className="bg-[#13131A] text-white border-b border-[#2C2C35]">
              <tr>
                <th className="px-6 py-4">Назва / SN</th>
                <th className="px-6 py-4">Розташування</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2C35]">
              {devices.map((device) => (
                <tr 
                  key={device.id} 
                  onClick={() => handleViewLogs(device)}
                  className="hover:bg-[#13131A]/50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{device.name || 'Без назви'}</div>
                    <div className="text-xs font-mono mt-1">SN: {device.serialNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">
                      {device.room?.building?.name ? `${device.room.building.name} — ` : ''}
                      {device.room?.name || 'Не прив\'язано'}
                    </div>
                    <div className="text-[10px] text-textSecondary mt-0.5 uppercase tracking-wider">{device.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        device.status === 'ONLINE' ? 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20' : 
                        device.status === 'OFFLINE' ? 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20' : 
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => {
                          const bId = device.room?.buildingId || '';
                          setEditingDevice({ ...device, buildingId: bId });
                          loadRoomsForBuilding(bId); 
                        }} 
                        className="p-2 text-textSecondary hover:text-white" 
                        title="Редагувати"
                      >
                        <Edit size={18}/>
                      </button>
                      <button onClick={() => handleDelete(device.id)} className="p-2 text-textSecondary hover:text-red-500" title="Видалити"><Trash2 size={18}/></button>
                      {user?.role === 'SUPER_ADMIN' && (
                        <button onClick={() => handleViewSecret(device.id)} className="p-2 text-textSecondary hover:text-orange-400" title="Секрет">
                          {secretLoadingId === device.id ? <Loader2 className="animate-spin" size={18}/> : <KeyRound size={18}/>}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingDevice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-[#2C2C35] rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editingDevice.id ? 'Редагувати' : 'Новий'} пристрій</h3>
              <button onClick={() => setEditingDevice(null)} className="text-textSecondary hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveDevice} className="space-y-4">
              <div>
                <label className="text-sm text-textSecondary">Назва замка/пристрою</label>
                <input required value={editingDevice.name || ''} onChange={e => setEditingDevice({...editingDevice, name: e.target.value})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-textSecondary">Серійний номер (SN)</label>
                <input required disabled={!!editingDevice.id} value={editingDevice.serialNumber || ''} onChange={e => setEditingDevice({...editingDevice, serialNumber: e.target.value})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary disabled:opacity-50" />
              </div>

              <div>
                <label className="text-sm text-textSecondary">Будівля</label>
                <select 
                  required
                  value={editingDevice.buildingId || ''} 
                  onChange={e => {
                    const selectedBuildingId = e.target.value;
                    setEditingDevice({...editingDevice, buildingId: selectedBuildingId, roomId: ''});
                    loadRoomsForBuilding(selectedBuildingId);
                  }}
                  className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary"
                >
                  <option value="" disabled>Оберіть будівлю</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.address})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-textSecondary flex items-center gap-2">
                  Кімната {roomsLoading && <Loader2 className="animate-spin text-primary" size={14} />}
                </label>
                <select 
                  required
                  disabled={!editingDevice.buildingId || roomsLoading}
                  value={editingDevice.roomId || ''} 
                  onChange={e => setEditingDevice({...editingDevice, roomId: e.target.value})}
                  className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary disabled:opacity-40"
                >
                  <option value="" disabled>
                    {editingDevice.buildingId ? 'Оберіть кімнату' : 'Спочатку оберіть будівлю'}
                  </option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name} {r.floorNumber ? `(Поверх ${r.floorNumber})` : ''}</option>
                  ))}
                </select>
              </div>

              {editingDevice.id && (
                <div>
                  <label className="text-sm text-textSecondary">Статус</label>
                  <select value={editingDevice.status} onChange={e => setEditingDevice({...editingDevice, status: e.target.value as any})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary">
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
              )}
              <button type="submit" className="w-full py-3 mt-4 bg-primary hover:bg-[#0A73E0] text-white font-bold rounded-xl transition-colors">Зберегти пристрій</button>
            </form>
          </div>
        </div>
      )}

      {logsDevice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setLogsDevice(null)}>
          <div className="bg-surface border border-[#2C2C35] rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="text-primary"/> Історія: {logsDevice.name}</h3>
              <button onClick={() => setLogsDevice(null)} className="text-textSecondary hover:text-white"><X size={24}/></button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2 space-y-3">
              {logsDevice.logs.length === 0 ? (
                <div className="text-center py-10 text-textSecondary">Поки немає подій для цього замка</div>
              ) : (
                logsDevice.logs.map((log: any, idx: number) => (
                  <div key={idx} className="bg-[#13131A] p-4 rounded-xl border border-[#2C2C35] flex justify-between items-center hover:border-primary/30 transition-colors">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {log.eventType.replace('_', ' ')}
                        {log.riskScore > 0 && <span className="text-[#FF9F0A] text-[10px] px-1.5 py-0.5 bg-[#FF9F0A]/10 rounded">Z: {log.riskScore.toFixed(1)}</span>}
                      </div>
                      <div className="text-xs text-textSecondary mt-1">
                        Ініціатор: {log.user?.fullName || log.user?.email || 'Система'}
                      </div>
                    </div>
                    <div className="text-xs text-textSecondary bg-surface px-3 py-1.5 rounded-lg border border-[#2C2C35]">
                      {new Date(log.timestamp || log.createdAt).toLocaleString('uk-UA')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {deviceSecret && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeviceSecret(null)}>
          <div className="bg-surface border border-[#2C2C35] rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FF9F0A]/10 text-[#FF9F0A] rounded-full flex items-center justify-center mb-4"><ShieldAlert size={32} /></div>
              <h3 className="text-xl font-bold text-white mb-2">TOTP Secret</h3>
              <p className="text-textSecondary text-sm mb-4">Для налаштування фізичного пристрою.</p>
              <div className="bg-[#13131A] border border-[#2C2C35] p-4 rounded-xl w-full mb-6 mt-2">
                <code className="text-[#FF9F0A] text-lg font-mono tracking-widest break-all">{deviceSecret.secret}</code>
              </div>
              <button onClick={() => setDeviceSecret(null)} className="w-full py-3 bg-[#2C2C35] hover:bg-[#3A3A46] text-white font-bold rounded-xl transition-colors">Закрити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;