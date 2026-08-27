import  { useState, useEffect, useMemo } from 'react';
import * as userService from '../../services/userService';
import type { AccessKey } from '../../types';
import { DoorOpen, Clock, Loader2, Search, Unlock, LayoutGrid, List } from 'lucide-react';
import * as OTPAuth from 'otpauth';

const MyLocksPage = () => {
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    window.innerWidth > 768 ? 'list' : 'grid'
  );

  useEffect(() => {
    userService.getMyKeys()
      .then(setKeys)
      .catch(err => console.error("Помилка завантаження ключів", err))
      .finally(() => setLoading(false));

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const generatePin = (secret?: string) => {
    if (!secret) return '---';
    try {
      const totp = new OTPAuth.TOTP({
        issuer: "SmartLock",
        label: "User",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
      });
      return totp.generate();
    } catch (e) {
      return 'Помилка';
    }
  };

  const handleUnlock = async (deviceId: string) => {
    setUnlockingId(deviceId);
    const success = await userService.unlockDoor(deviceId);
    setUnlockingId(null);
    if (success) alert('Запит на відкриття надіслано успішно!');
    else alert('Не вдалося відкрити двері. Перевірте підключення.');
  };

  const groupedKeys = useMemo(() => {
    const filtered = keys.filter(k => {
      if (!k.device) return false;
      const query = searchQuery.toLowerCase();
      const deviceName = (k.device.name || '').toLowerCase();
      const roomName = (k.device.room?.name || '').toLowerCase();
      const buildingName = (k.device.room?.building?.name || '').toLowerCase();
      return deviceName.includes(query) || roomName.includes(query) || buildingName.includes(query);
    });

    const groups: Record<string, AccessKey[]> = {};
    filtered.forEach(k => {
      const bName = k.device?.room?.building?.name || "Невідома будівля";
      const rName = k.device?.room?.name || "Невідома кімната";
      const groupName = `${bName} • ${rName}`;
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(k);
    });
    return groups;
  }, [keys, searchQuery]);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  const secondsRemaining = 30 - Math.floor((now / 1000) % 30);
  const progressPercent = (secondsRemaining / 30) * 100;

  return (
    <div className="space-y-8 pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Доступні приміщення</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-textSecondary" />
            </div>
            <input
              type="text"
              placeholder="Пошук (будівля, кімната, замок)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-surface border border-[#2C2C35] focus:border-primary rounded-xl text-white outline-none transition-all placeholder:text-[#6C6C70]"
            />
          </div>

          <div className="hidden sm:flex bg-[#13131A] p-1 rounded-lg border border-[#2C2C35] shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#2C2C35] text-white' : 'text-textSecondary hover:text-white'}`}
              title="Вигляд сіткою"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#2C2C35] text-white' : 'text-textSecondary hover:text-white'}`}
              title="Вигляд списком"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {keys.length === 0 ? (
        <div className="text-center bg-surface p-12 rounded-2xl border border-[#2C2C35]">
          <DoorOpen size={56} className="mx-auto text-textSecondary mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-textPrimary">Немає доступних замків</h3>
          <p className="text-textSecondary mt-2">Зверніться до адміністратора для отримання доступу.</p>
        </div>
      ) : Object.keys(groupedKeys).length === 0 ? (
        <div className="text-center py-12 text-textSecondary bg-surface/50 rounded-2xl border border-[#2C2C35] border-dashed">
          За вашим запитом нічого не знайдено.
        </div>
      ) : (
        Object.entries(groupedKeys).map(([groupName, groupKeys]) => (
          <div key={groupName} className="space-y-4">
            <div className="flex items-center gap-3 pl-1">
              <div className="h-4 w-1 bg-primary rounded-full"></div>
              <h2 className="text-sm font-bold text-textSecondary uppercase tracking-wider">{groupName}</h2>
            </div>
            
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch"
              : "flex flex-col gap-3"
            }>
              {groupKeys.map((accessKey) => {
                const device = accessKey.device!;
                const pin = generatePin(device.totpSecret);
                const isUnlocking = unlockingId === device.id;

                if (viewMode === 'list') {
                  return (
                    <div key={accessKey.id} className="bg-surface rounded-xl p-4 border border-[#2C2C35] flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:border-primary/50 transition-colors relative overflow-hidden gap-4 md:gap-6">
                    
                      <div className="absolute bottom-0 left-0 h-1 bg-[#2C2C35] w-full">
                        <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
                      </div>

                    
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary hidden md:flex items-center justify-center shrink-0">
                          <DoorOpen size={24} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-white truncate" title={device.name || 'Замок'}>{device.name || 'Замок'}</h3>
                            <span className="px-2 py-0.5 bg-[#34C759]/10 border border-[#34C759]/20 rounded text-[#34C759] text-[10px] font-bold uppercase tracking-wider shrink-0 hidden sm:inline-block">
                              {device.status}
                            </span>
                          </div>
                          <p className="text-textSecondary text-sm mt-0.5 font-mono">SN: {device.serialNumber}</p>
                        </div>
                      </div>

                     
                      <div className="bg-[#13131A] rounded-lg px-6 py-2.5 text-center shrink-0 min-w-45">
                        <p className="text-textSecondary text-[10px] mb-0.5 uppercase tracking-widest">Офлайн PIN</p>
                        <div className="text-2xl font-mono font-bold tracking-[0.2em] text-white leading-none">
                          {pin}
                        </div>
                        <p className="text-[10px] text-textSecondary mt-1 flex items-center justify-center gap-1">
                          <Clock size={10} className="text-primary" /> {secondsRemaining}с
                        </p>
                      </div>

                    
                      <div className="shrink-0 w-full md:w-auto">
                        <button
                          onClick={() => handleUnlock(device.id)}
                          disabled={isUnlocking}
                          className="w-full md:w-40 py-3 bg-primary hover:bg-[#0A73E0] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                          {isUnlocking ? <Loader2 className="animate-spin" size={18} /> : <><Unlock size={18} /> Відкрити</>}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={accessKey.id} className="h-full bg-surface rounded-2xl p-5 border border-[#2C2C35] flex flex-col shadow-sm hover:border-primary/50 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 bg-[#2C2C35] w-full">
                      <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
                    </div>

                    <div className="flex justify-between items-start mb-2 mt-1">
                      <div>
                        <h3 className="text-lg font-bold text-white line-clamp-1" title={device.name || 'Замок'}>{device.name || 'Замок'}</h3>
                        <p className="text-textSecondary text-xs mt-1 font-mono">SN: {device.serialNumber}</p>
                      </div>
                      <div className="px-2 py-1 bg-[#34C759]/10 border border-[#34C759]/20 rounded text-[#34C759] text-[10px] font-bold uppercase tracking-wider shrink-0 ml-2">
                        {device.status}
                      </div>
                    </div>

                    <div className="bg-[#13131A] rounded-xl p-4 text-center my-4 grow flex flex-col justify-center">
                      <p className="text-textSecondary text-[11px] mb-1 uppercase tracking-widest">Офлайн PIN</p>
                      <div className="text-3xl font-mono font-bold tracking-[0.2em] text-white my-1">{pin}</div>
                      <p className="text-[11px] text-textSecondary mt-1 flex items-center justify-center gap-1.5">
                        <Clock size={12} className="text-primary" /> Оновиться через {secondsRemaining}с
                      </p>
                    </div>

                    <div className="mt-auto pt-1">
                      <button
                        onClick={() => handleUnlock(device.id)}
                        disabled={isUnlocking}
                        className="w-full py-3.5 bg-primary hover:bg-[#0A73E0] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                      >
                        {isUnlocking ? <Loader2 className="animate-spin" size={20} /> : <><Unlock size={18} /> Відкрити двері</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyLocksPage;