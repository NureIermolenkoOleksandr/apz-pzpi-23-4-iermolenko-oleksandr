import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import type { User, Device } from '../../types';
import { Users, Loader2, KeyRound, Edit, Trash2, X, ShieldBan } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [managingKeysUser, setManagingKeysUser] = useState<User | null>(null);
  
  const [keyForm, setKeyForm] = useState({ deviceId: '', validFrom: '', validTo: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, devicesData] = await Promise.all([
        adminService.getUsers(),
        adminService.getDevices()
      ]);
      setUsers(usersData);
      setDevices(devicesData);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await adminService.updateUser(editingUser.id, {
        role: editingUser.role,
        isActive: editingUser.isActive,
        fullName: editingUser.fullName
      });
      setEditingUser(null);
      fetchData();
    } catch (error) { alert("Помилка оновлення користувача"); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Видалити користувача назавжди?")) return;
    try {
      await adminService.deleteUser(id);
      fetchData();
    } catch (error) { alert("Помилка видалення"); }
  };

  const handleIssueKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingKeysUser || !keyForm.deviceId || !keyForm.validFrom) return;

    try {
      setSubmitting(true);
      await adminService.issueAccessKey({
        userId: managingKeysUser.id,
        deviceId: keyForm.deviceId,
        validFrom: new Date(keyForm.validFrom).toISOString(),
        ...(keyForm.validTo && { validTo: new Date(keyForm.validTo).toISOString() })
      });
      alert('Ключ успішно видано!');
      setKeyForm({ deviceId: '', validFrom: '', validTo: '' });
      fetchData(); 
    } catch (error: any) {
      alert(error.response?.data?.error || "Помилка видачі ключа");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!window.confirm("Відкликати цей ключ доступу?")) return;
    try {
      await adminService.revokeAccessKey(keyId);
      if (managingKeysUser) {
        setManagingKeysUser({
          ...managingKeysUser,
          // @ts-ignore
          accessKeys: managingKeysUser.accessKeys?.filter(k => k.id !== keyId)
        });
      }
      fetchData();
    } catch (error) { alert("Помилка відкликання ключа"); }
  };

  const openKeyManager = (user: User) => {
    setManagingKeysUser(user);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setKeyForm({ deviceId: '', validFrom: now.toISOString().slice(0, 16), validTo: '' });
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-primary" /> Управління користувачами
        </h1>
      </div>

      <div className="bg-surface border border-[#2C2C35] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-textSecondary">
            <thead className="bg-[#13131A] text-white border-b border-[#2C2C35]">
              <tr>
                <th className="px-6 py-4">Користувач</th>
                <th className="px-6 py-4">Роль</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2C35]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#13131A]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{user.fullName || 'Без імені'}</div>
                    <div className="text-xs mt-1">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-primary font-bold text-[10px] uppercase tracking-wider">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${user.isActive ? 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20' : 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20'}`}>
                      {user.isActive ? 'Активний' : 'Заблокований'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openKeyManager(user)} className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-bold">
                        <KeyRound size={14}/> Доступи
                      </button>
                      <button onClick={() => setEditingUser(user)} className="p-2 text-textSecondary hover:text-white" title="Редагувати"><Edit size={18}/></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-textSecondary hover:text-red-500" title="Видалити"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {managingKeysUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-[#2C2C35] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <KeyRound className="text-primary"/> Доступи: {managingKeysUser.fullName}
              </h3>
              <button onClick={() => setManagingKeysUser(null)} className="text-textSecondary hover:text-white"><X size={24}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Видати новий ключ</h4>
                <form onSubmit={handleIssueKey} className="space-y-4">
                  <div>
                    <label className="text-xs text-textSecondary">Оберіть замок</label>
                    <select required value={keyForm.deviceId} onChange={(e) => setKeyForm({...keyForm, deviceId: e.target.value})} className="w-full mt-1 px-3 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary text-sm">
                      <option value="" disabled>--- Оберіть пристрій ---</option>
                      {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-textSecondary">Дійсний З</label>
                    <input type="datetime-local" required value={keyForm.validFrom} onChange={(e) => setKeyForm({...keyForm, validFrom: e.target.value})} className="w-full mt-1 px-3 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none text-sm"/>
                  </div>
                  <div>
                    <label className="text-xs text-textSecondary">Дійсний ДО (опціонально)</label>
                    <input type="datetime-local" value={keyForm.validTo} onChange={(e) => setKeyForm({...keyForm, validTo: e.target.value})} className="w-full mt-1 px-3 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none text-sm"/>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-2.5 bg-primary hover:bg-[#0A73E0] text-white font-bold rounded-xl transition-colors flex justify-center items-center text-sm disabled:opacity-50">
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Надати доступ'}
                  </button>
                </form>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Активні ключі</h4>
                <div className="space-y-3">
                  {/* @ts-ignore */}
                  {(!managingKeysUser.accessKeys || managingKeysUser.accessKeys.length === 0) ? (
                    <div className="text-xs text-textSecondary text-center py-6 border border-dashed border-[#2C2C35] rounded-xl">Немає активних ключів</div>
                  ) : (
                    // @ts-ignore
                    managingKeysUser.accessKeys.map((key: any) => (
                      <div key={key.id} className="bg-[#13131A] p-3 rounded-xl border border-[#2C2C35] flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-white">{key.device?.name || 'Невідомий замок'}</p>
                          <p className="text-[10px] text-textSecondary mt-0.5">До: {key.validTo ? new Date(key.validTo).toLocaleDateString() : 'Безліміт'}</p>
                        </div>
                        <button onClick={() => handleRevokeKey(key.id)} className="p-1.5 bg-[#FF453A]/10 text-[#FF453A] hover:bg-[#FF453A] hover:text-white rounded-lg transition-colors" title="Забрати доступ">
                          <ShieldBan size={16}/>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-[#2C2C35] rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Редагувати профіль</h3>
              <button onClick={() => setEditingUser(null)} className="text-textSecondary hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="text-sm text-textSecondary">Повне ім'я (Нікнейм)</label>
                <input 
                  value={editingUser.fullName || ''} 
                  onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} 
                  className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary" 
                />
              </div>
              <div>
                <label className="text-sm text-textSecondary">Роль доступу</label>
                <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none">
                  <option value="TENANT">TENANT (Орендар)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Технік)</option>
                  <option value="SECURITY">SECURITY (Охорона)</option>
                  <option value="MANAGER">MANAGER (Менеджер)</option>
                  <option value="ORG_ADMIN">ORG_ADMIN (Адмін Офісу)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <div className="flex items-center gap-3 mt-4 bg-[#13131A] p-3 rounded-xl border border-[#2C2C35]">
                <input type="checkbox" checked={editingUser.isActive} onChange={e => setEditingUser({...editingUser, isActive: e.target.checked})} className="w-5 h-5 rounded accent-primary"/>
                <label className="text-white text-sm font-medium">Акаунт активний</label>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-primary hover:bg-[#0A73E0] text-white font-bold rounded-xl transition-colors">Зберегти зміни</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;