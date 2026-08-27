import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import { Building2, DoorOpen, Plus, Trash2, Loader2, X, Edit } from 'lucide-react';

const BuildingsRoomsPage = () => {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);


  const [editingBuildingId, setEditingBuildingId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);


  const [buildingForm, setBuildingForm] = useState({ name: '', address: '', description: '' });
  const [roomForm, setRoomForm] = useState({ name: '', buildingId: '', floorNumber: '', areaSqm: '' });

  useEffect(() => {
    loadBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      loadRooms(selectedBuildingId);
    } else {
      setRooms([]);
    }
  }, [selectedBuildingId]);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const bData = await adminService.getBuildings();
      setBuildings(bData);
      if (bData.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(bData[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async (bId: string) => {
    try {
      setRoomsLoading(true);
      const rData = await adminService.getRooms(bId);
      setRooms(rData);
    } catch (e) {
      console.error(e);
    } finally {
      setRoomsLoading(false);
    }
  };

  const openBuildingModal = (building?: any) => {
    if (building) {
      setEditingBuildingId(building.id);
      setBuildingForm({ 
        name: building.name, 
        address: building.address, 
        description: building.description || '' 
      });
    } else {
      setEditingBuildingId(null);
      setBuildingForm({ name: '', address: '', description: '' });
    }
    setShowBuildingModal(true);
  };

  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBuildingId) {
        await adminService.updateBuilding(editingBuildingId, buildingForm);
      } else {
        await adminService.createBuilding(buildingForm);
      }
      setShowBuildingModal(false);
      loadBuildings();
    } catch (err) { alert('Помилка збереження будівлі'); }
  };

  const handleDeleteBuilding = async (id: string) => {
    if (!window.confirm('Видалити цю будівлю та всі її кімнати?')) return;
    try {
      await adminService.deleteBuilding(id);
      if (selectedBuildingId === id) setSelectedBuildingId('');
      loadBuildings();
    } catch (err) { alert('Помилка видалення'); }
  };

  const openRoomModal = (room?: any) => {
    if (room) {
      setEditingRoomId(room.id);
      setRoomForm({ 
        name: room.name, 
        buildingId: room.buildingId, 
        floorNumber: room.floorNumber?.toString() || '', 
        areaSqm: room.areaSqm?.toString() || '' 
      });
    } else {
      setEditingRoomId(null);
      setRoomForm({ 
        name: '', 
        buildingId: selectedBuildingId || '', 
        floorNumber: '', 
        areaSqm: '' 
      });
    }
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: roomForm.name,
        buildingId: roomForm.buildingId,
        floorNumber: roomForm.floorNumber ? parseInt(roomForm.floorNumber) : undefined,
        areaSqm: roomForm.areaSqm ? parseFloat(roomForm.areaSqm) : undefined
      };

      if (editingRoomId) {
        await adminService.updateRoom(editingRoomId, payload);
      } else {
        await adminService.createRoom(payload);
      }

      setShowRoomModal(false);
      const targetBuilding = roomForm.buildingId;
      setSelectedBuildingId(targetBuilding);
      loadRooms(targetBuilding); 
    } catch (err) { alert('Помилка збереження кімнати'); }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('Видалити цю кімнату?')) return;
    try {
      await adminService.deleteRoom(id);
      loadRooms(selectedBuildingId);
    } catch (err) { alert('Помилка видалення'); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="text-primary" /> Будівлі
            </h1>
            <p className="text-textSecondary text-sm">Список підключених корпоративних об'єктів</p>
          </div>
          <button 
            onClick={() => openBuildingModal()}
            className="flex items-center gap-2 bg-primary hover:bg-[#0A73E0] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <Plus size={16} /> Додати будівлю
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildings.map(b => (
            <div key={b.id} className="bg-surface border border-[#2C2C35] rounded-2xl p-5 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">{b.name}</h3>
                <p className="text-sm text-textSecondary mt-1">{b.address}</p>
                {b.description && <p className="text-xs text-textSecondary italic mt-2 opacity-80">{b.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openBuildingModal(b)} className="text-textSecondary hover:text-white p-2" title="Редагувати">
                  <Edit size={18}/>
                </button>
                <button onClick={() => handleDeleteBuilding(b.id)} className="text-textSecondary hover:text-red-500 p-2" title="Видалити">
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[#2C2C35]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <DoorOpen className="text-primary" /> Кімнати приміщення
            </h2>
            <p className="text-textSecondary text-sm">Оберіть будівлю для перегляду її плану кімнат</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedBuildingId}
              onChange={e => setSelectedBuildingId(e.target.value)}
              className="px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary text-sm min-w-50"
            >
              <option value="" disabled>Оберіть об'єкт</option>
              {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            <button 
              onClick={() => openRoomModal()}
              disabled={buildings.length === 0}
              className="flex items-center gap-2 bg-primary hover:bg-[#0A73E0] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-40"
            >
              <Plus size={16} /> Додати кімнату
            </button>
          </div>
        </div>

        <div className="bg-surface border border-[#2C2C35] rounded-2xl overflow-hidden">
          {roomsLoading ? (
            <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-10 text-textSecondary text-sm">
              {selectedBuildingId ? 'У цій будівлі ще немає створених кімнат.' : 'Будь ласка, оберіть будівлю зі списку.'}
            </div>
          ) : (
            <table className="w-full text-left text-sm text-textSecondary">
              <thead className="bg-[#13131A] text-white border-b border-[#2C2C35]">
                <tr>
                  <th className="px-6 py-4">Назва кімнати</th>
                  <th className="px-6 py-4">Поверх</th>
                  <th className="px-6 py-4">Площа</th>
                  <th className="px-6 py-4 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2C35]">
                {rooms.map(room => (
                  <tr key={room.id} className="hover:bg-[#13131A]/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{room.name}</td>
                    <td className="px-6 py-4">{room.floorNumber ?? '-'}</td>
                    <td className="px-6 py-4">{room.areaSqm ? `${room.areaSqm} м²` : '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openRoomModal(room)} className="text-textSecondary hover:text-white p-2 mr-1" title="Редагувати">
                        <Edit size={16}/>
                      </button>
                      <button onClick={() => handleDeleteRoom(room.id)} className="text-textSecondary hover:text-red-500 p-2" title="Видалити">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showBuildingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-[#2C2C35] rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingBuildingId ? 'Редагувати будівлю' : 'Нова будівля'}
              </h3>
              <button onClick={() => setShowBuildingModal(false)} className="text-textSecondary hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveBuilding} className="space-y-4">
              <div>
                <label className="text-sm text-textSecondary">Назва будівлі</label>
                <input required value={buildingForm.name} onChange={e => setBuildingForm({...buildingForm, name: e.target.value})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-textSecondary">Адреса</label>
                <input required value={buildingForm.address} onChange={e => setBuildingForm({...buildingForm, address: e.target.value})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-textSecondary">Опис (опціонально)</label>
                <textarea value={buildingForm.description} onChange={e => setBuildingForm({...buildingForm, description: e.target.value})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary h-20 resize-none" />
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-primary hover:bg-[#0A73E0] text-white font-bold rounded-xl transition-colors">
                {editingBuildingId ? 'Зберегти зміни' : "Створити об'єкт"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showRoomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-[#2C2C35] rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingRoomId ? 'Редагувати кімнату' : 'Нова кімната'}
              </h3>
              <button onClick={() => setShowRoomModal(false)} className="text-textSecondary hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="text-sm text-textSecondary">Будівля</label>
                <select required value={roomForm.buildingId} onChange={e => setRoomForm({...roomForm, buildingId: e.target.value})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary">
                  <option value="" disabled>Оберіть об'єкт</option>
                  {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-textSecondary">Назва/Номер кімнати</label>
                <input required value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-textSecondary">Поверх</label>
                  <input type="number" value={roomForm.floorNumber} onChange={e => setRoomForm({...roomForm, floorNumber: e.target.value})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm text-textSecondary">Площа (м²)</label>
                  <input type="number" step="0.1" value={roomForm.areaSqm} onChange={e => setRoomForm({...roomForm, areaSqm: e.target.value})} className="w-full mt-1 px-4 py-2 bg-[#13131A] border border-[#2C2C35] rounded-xl text-white outline-none focus:border-primary" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-primary hover:bg-[#0A73E0] text-white font-bold rounded-xl transition-colors">
                {editingRoomId ? 'Зберегти зміни' : 'Створити кімнату'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingsRoomsPage;