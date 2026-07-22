import React, { useState } from 'react';
import { Mechanic, WorkshopBooking, RepairHistory } from '../types';
import { 
  UserPlus, 
  Trash2, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle, 
  XCircle, 
  User, 
  X, 
  ChevronRight,
  Info,
  History,
  Wrench,
  Truck,
  FileText,
  Hammer,
  TrendingUp,
  Settings,
  DollarSign
} from 'lucide-react';

interface MechanicManagementProps {
  mechanics: Mechanic[];
  bookings?: WorkshopBooking[];
  repairs?: RepairHistory[];
  onCreateMechanic: (mechanicData: Omit<Mechanic, 'id'>) => Promise<void>;
  onUpdateMechanic: (id: string, mechanicData: Partial<Mechanic>) => Promise<void>;
  onDeleteMechanic: (id: string) => Promise<void>;
}

export default function MechanicManagement({
  mechanics,
  bookings = [],
  repairs = [],
  onCreateMechanic,
  onUpdateMechanic,
  onDeleteMechanic
}: MechanicManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Mechanic');

  // Active mechanic schedule editing state
  const [editingScheduleMechanic, setEditingScheduleMechanic] = useState<Mechanic | null>(null);
  
  // Selected mechanic for history log state
  const [selectedMechanicForHistory, setSelectedMechanicForHistory] = useState<Mechanic | null>(null);

  // Common roles
  const roles = [
    'Senior Mechanic',
    'Junior Mechanic',
    'Master Welder',
    'Senior Auto Electrician',
    'Hydraulic Specialist',
    'Maintenance Helper'
  ];

  // Days of current month helper (assuming 30 or 31 days)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed
  const currentMonthName = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama mekanik wajib diisi');
      return;
    }

    // Initialize default schedule where weekdays are 'Work' and weekends are 'Off'
    const initialSchedule: { [day: number]: 'Work' | 'Off' } = {};
    let workDaysCount = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday
      const status = isWeekend ? 'Off' : 'Work';
      initialSchedule[day] = status;
      if (status === 'Work') workDaysCount++;
    }

    // Work days * 8 hours = availableHours
    const calculatedHours = workDaysCount * 8;

    try {
      await onCreateMechanic({
        name: name.trim(),
        role,
        availableHours: calculatedHours,
        schedule: initialSchedule
      });
      setIsAdding(false);
      setName('');
      setRole('Senior Mechanic');
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan mekanik');
    }
  };

  const handleToggleDaySchedule = async (mechanic: Mechanic, day: number) => {
    const currentStatus = mechanic.schedule[day] || 'Work';
    const nextStatus = currentStatus === 'Work' ? 'Off' : 'Work';
    
    const updatedSchedule = { ...mechanic.schedule, [day]: nextStatus };
    
    // Recalculate available hours based on updated schedule
    let workDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (updatedSchedule[d] === 'Work') {
        workDays++;
      }
    }
    const updatedHours = workDays * 8;

    try {
      await onUpdateMechanic(mechanic.id, {
        schedule: updatedSchedule,
        availableHours: updatedHours
      });
      // Update local edit modal state if active
      if (editingScheduleMechanic?.id === mechanic.id) {
        setEditingScheduleMechanic({
          ...mechanic,
          schedule: updatedSchedule,
          availableHours: updatedHours
        });
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah jadwal kerja');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data mekanik: ${name}?`)) {
      try {
        await onDeleteMechanic(id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus mekanik');
      }
    }
  };

  // Counting work & off days helper
  const getScheduleStats = (mechanic: Mechanic) => {
    let work = 0;
    let off = 0;
    daysArray.forEach(day => {
      if (mechanic.schedule[day] === 'Off') off++;
      else work++;
    });
    return { work, off };
  };

  return (
    <div className="space-y-6" id="mechanic-management-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Mekanik & Roster Kerja</h1>
          <p className="text-slate-500 text-xs mt-1">
            Daftar tim mekanik, jabatan, jam kerja tersedia, status pengerjaan, serta penginputan roster kerja dan jadwal libur.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          <UserPlus size={14} /> Tambah Mekanik Baru
        </button>
      </div>

      {/* Roster & Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Roster List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-600">Daftar Manpower Aktif ({mechanics.length})</h2>

          {mechanics.length === 0 ? (
            <div className="py-12 text-center bg-white border border-gray-200 rounded-xl text-gray-500 shadow-xs">
              <User className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="font-bold text-xs uppercase tracking-wider">Belum ada mekanik terdaftar</p>
              <p className="text-[11px] text-gray-400 mt-1">Silakan tambahkan anggota tim mekanik baru di tombol kanan atas.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs text-slate-800">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-mono font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Jabatan</th>
                    <th className="p-3 text-center">Roster Bulan Ini</th>
                    <th className="p-3 text-right">Kapasitas Jam</th>
                    <th className="p-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mechanics.map(m => {
                    const stats = getScheduleStats(m);
                    // Filter completed repairs for this mechanic
                    const finishedCount = repairs.filter(r => r.mechanicName === m.name).length;
                    const activeWorkOrders = bookings.filter(b => 
                      b.status === 'In Progress' && 
                      (b.mechanicName?.includes(m.name) || b.mechanicsAssigned?.includes(m.name))
                    );
                    const isWorking = activeWorkOrders.length > 0;
                    const activeCount = bookings.filter(b => (b.mechanicName?.includes(m.name) || b.mechanicsAssigned?.includes(m.name)) && b.status !== 'Completed' && b.status !== 'Cancelled').length;
                    
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-bold text-slate-900 uppercase tracking-wide">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full border border-white shadow-3xs ${
                              isWorking ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                            }`} title={isWorking ? 'Sedang Bekerja' : 'Tersedia / Standby'}></span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{m.name}</span>
                                <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.2 rounded border uppercase ${
                                  isWorking 
                                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                }`}>
                                  {isWorking ? `Kerja (${activeWorkOrders[0].unitCode})` : 'Standby'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">
                                  {finishedCount} Selesai | {activeCount} Aktif
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 border border-gray-200 text-slate-800 px-2 py-0.5 rounded-md font-bold uppercase text-[9px] tracking-wider">
                            {m.role}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono">
                          <span className="text-emerald-700 font-bold">{stats.work} H Kerja</span>
                          <span className="text-gray-300 mx-1.5">|</span>
                          <span className="text-rose-600 font-bold">{stats.off} H Libur</span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-blue-600">
                          {m.availableHours} Jam
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedMechanicForHistory(m)}
                              className="text-emerald-700 hover:text-white hover:bg-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold uppercase text-[9px] tracking-wider cursor-pointer transition-all flex items-center gap-1"
                              title="Lihat Log Perbaikan & Histori Unit yang Pernah Diperbaiki"
                            >
                              <History size={11} /> Histori Kerja
                            </button>
                            <button
                              onClick={() => setEditingScheduleMechanic(m)}
                              className="text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-bold uppercase text-[9px] tracking-wider cursor-pointer transition-all"
                              title="Klik untuk melihat & merubah kalender roster kerja harian"
                            >
                              Roster
                            </button>
                            <button
                              onClick={() => handleDelete(m.id, m.name)}
                              className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Hapus Mekanik"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Informative Widget */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">INFORMASI KAPASITAS MANPOWER</h2>
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex gap-2.5 items-start text-xs text-slate-700 bg-slate-50/50 p-3.5 border border-gray-100 rounded-xl font-medium">
              <Info className="shrink-0 text-blue-600 mt-0.5" size={15} />
              <div className="space-y-1">
                <p className="font-bold text-slate-800 uppercase text-[10px]">Perhitungan Kapasitas Tersedia</p>
                <p className="text-[11px] leading-relaxed text-gray-500 font-sans">
                  Total jam tersedia dihitung otomatis dari roster kerja bulanan mekanik. 1 Hari Kerja (Work Day) dialokasikan setara dengan <strong>8 Jam Kerja Produktif</strong>. Hari Libur (Off Day) tidak dihitung dalam kapasitas.
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 font-mono text-[11px] space-y-2.5">
              <div className="flex justify-between items-center py-1.5 pt-0">
                <span className="text-gray-500 uppercase tracking-wide font-sans font-bold">Total Mekanik Aktif</span>
                <span className="font-bold text-slate-900">{mechanics.length} Personel</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-gray-500 uppercase tracking-wide font-sans font-bold">Total Kapasitas Bengkel</span>
                <span className="font-black text-blue-600 text-xs">
                  {mechanics.reduce((sum, m) => sum + m.availableHours, 0)} Jam Kerja
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-gray-500 uppercase tracking-wide font-sans font-bold">Estimasi Kerja Rata-Rata</span>
                <span className="font-bold text-emerald-600">
                  {mechanics.length > 0 
                    ? Math.round(mechanics.reduce((sum, m) => sum + m.availableHours, 0) / mechanics.length) 
                    : 0} Jam / Mekanik
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD NEW MECHANIC */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 bg-[#1A1C1E] text-white flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-emerald-400">Pendaftaran Personel Mekanik</h3>
                <p className="text-[10px] text-gray-400 uppercase mt-0.5 font-bold">MANPOWER ONBOARDING SYSTEM</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white cursor-pointer p-1 rounded-full hover:bg-gray-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Nama Lengkap Mekanik *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Herianto Muliadi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-950 font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Jabatan / Spesialisasi *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs focus:outline-none focus:border-gray-950 font-bold"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-3.5 text-blue-800 leading-relaxed font-medium rounded-xl text-[11px]">
                Pendaftaran baru akan otomatis memiliki status roster kerja <strong>Work (Hari Kerja)</strong> untuk hari Senin s.d. Jumat, dan <strong>Off (Hari Libur)</strong> untuk hari Sabtu & Minggu sepanjang bulan {currentMonthName}.
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold uppercase text-[10px] tracking-wider cursor-pointer shadow-sm"
                >
                  Daftarkan Mekanik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MONTHLY ROSTER SCHEDULING CALENDAR */}
      {editingScheduleMechanic && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-2xl w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-blue-200">Pengaturan Roster Kerja & Jadwal Libur</h3>
                <p className="text-[10px] text-white uppercase mt-0.5 font-bold">Mekanik: {editingScheduleMechanic.name} ({editingScheduleMechanic.role})</p>
              </div>
              <button onClick={() => setEditingScheduleMechanic(null)} className="text-blue-100 hover:text-white cursor-pointer p-1 rounded-full hover:bg-blue-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 text-center border border-gray-100 bg-slate-50 p-3 rounded-xl font-mono text-slate-800">
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-bold block font-sans">BULAN MONITORING</span>
                  <strong className="text-slate-800 text-xs font-black uppercase">{currentMonthName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-bold block font-sans">ROSTER KERJA</span>
                  <strong className="text-emerald-600 text-xs font-black">
                    {getScheduleStats(editingScheduleMechanic).work} Hari Kerja
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-bold block font-sans">KAPASITAS JAM TERSEDIA</span>
                  <strong className="text-blue-600 text-xs font-black">
                    {editingScheduleMechanic.availableHours} Jam
                  </strong>
                </div>
              </div>

              {/* Grid Legend */}
              <div className="flex gap-4 items-center justify-end font-mono text-[10px] font-bold uppercase pb-1 border-b border-gray-100">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 border border-emerald-600 inline-block rounded"></span> WORK (KERJA)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 border border-rose-600 inline-block rounded"></span> OFF (LIBUR)</span>
              </div>

              {/* Instructions */}
              <div className="text-slate-500 bg-blue-50 border border-blue-100 p-3 rounded-xl font-medium text-[11px] leading-relaxed">
                Silakan klik pada tanggal di bawah ini untuk merubah status roster dari <strong>WORK (KERJA)</strong> ke <strong>OFF (LIBUR / CUTI)</strong> atau sebaliknya. Kapasitas jam mekanik akan dihitung ulang secara real-time.
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {daysArray.map(day => {
                  const status = editingScheduleMechanic.schedule[day] || 'Work';
                  const date = new Date(currentYear, currentMonth, day);
                  const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
                  
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDaySchedule(editingScheduleMechanic, day)}
                      className={`p-2 border rounded-xl transition-all cursor-pointer flex flex-col items-center justify-between font-mono h-14 select-none ${
                        status === 'Work'
                          ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/80 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 hover:bg-rose-100/80 text-rose-800'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">{dayName}</span>
                      <span className="text-base font-black leading-none">{day}</span>
                      <span className="text-[8px] font-black tracking-wider uppercase leading-none">
                        {status === 'Work' ? 'WORK' : 'OFF'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingScheduleMechanic(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                >
                  Selesai & Simpan Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MECHANIC DETAILED WORK & UNIT REPAIR HISTORY (NEW FEATURE) */}
      {selectedMechanicForHistory && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn" id="mechanic-history-modal">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-4xl w-full overflow-hidden my-6">
            
            {/* Header */}
            <div className="p-4 bg-[#1A1C1E] text-white flex justify-between items-center border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                  <History size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider font-mono">Histori Kerja & Traceability Unit</h3>
                  <p className="text-[10px] text-emerald-400 uppercase font-mono mt-0.5">Mekanik: {selectedMechanicForHistory.name} &mdash; {selectedMechanicForHistory.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMechanicForHistory(null)} 
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Summary Panel */}
            <div className="p-5 bg-slate-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-mono">JAM TERSEDIA BULAN INI</span>
                <span className="text-lg font-bold text-gray-900 font-mono mt-0.5 block">{selectedMechanicForHistory.availableHours} JAM</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-mono">WORK ORDER AKTIF</span>
                <span className="text-lg font-bold text-amber-600 font-mono mt-0.5 block">
                  {bookings.filter(b => b.mechanicName === selectedMechanicForHistory.name && b.status !== 'Completed' && b.status !== 'Cancelled').length} JOBS
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-mono">WORK ORDER SELESAI</span>
                <span className="text-lg font-bold text-emerald-600 font-mono mt-0.5 block">
                  {repairs.filter(r => r.mechanicName === selectedMechanicForHistory.name).length} WORK ORDERS
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-mono">TOTAL ESTIMASI BIAYA DIHEMAT</span>
                <span className="text-lg font-bold text-blue-600 font-mono mt-0.5 block">
                  Rp {repairs
                    .filter(r => r.mechanicName === selectedMechanicForHistory.name)
                    .reduce((sum, r) => sum + r.totalCost, 0)
                    .toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              
              {/* SECTION A: WORK ORDER AKTIF (IN-PROGRESS) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 border-b border-gray-100 pb-2">
                  <Wrench size={16} className="text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-sans">1. Pekerjaan Aktif & Rincian Progress Lapangan</h4>
                </div>
                
                {(() => {
                  const activeJobs = bookings.filter(b => b.mechanicName === selectedMechanicForHistory.name && b.status !== 'Completed' && b.status !== 'Cancelled');
                  if (activeJobs.length === 0) {
                    return (
                      <p className="text-[11px] text-gray-400 italic uppercase font-semibold pl-1 font-mono">
                        Saat ini tidak ada pekerjaan aktif (work order in-progress) yang didelegasikan ke mekanik ini.
                      </p>
                    );
                  }
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeJobs.map((b) => (
                        <div key={b.id} className="border border-amber-200 bg-amber-50/20 p-4 rounded-xl space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono font-bold text-xs text-gray-900 block">WO ID: #{b.id}</span>
                              <span className="text-[10px] text-gray-500 font-mono uppercase mt-0.5 block">UNIT: <strong className="text-slate-800">{b.unitCode}</strong></span>
                            </div>
                            <span className="text-[9px] font-bold font-mono px-2 py-0.5 border border-amber-200 bg-amber-50 text-amber-800 rounded-md uppercase">
                              {b.progressStatus || 'PROCESSING'}
                            </span>
                          </div>

                          <div className="border-t border-dashed border-amber-100 pt-2 text-[11px] space-y-1 text-gray-600">
                            <div><strong className="text-gray-700">Jenis Servis:</strong> {b.serviceType}</div>
                            <div><strong className="text-gray-700">Tanggal Booking:</strong> {b.bookingDate}</div>
                            <div><strong className="text-gray-700">Lokasi Workshop:</strong> {b.workshopName}</div>
                            {b.complaint && (
                              <div className="mt-1 bg-white p-2 border border-gray-100 rounded-lg text-gray-500">
                                <strong className="text-gray-700 text-[10px] block uppercase">Keluhan Armada:</strong>
                                "{b.complaint}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* SECTION B: ARSIP PEKERJAAN SELESAI (COMPLETED LOGS) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 border-b border-gray-100 pb-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-sans">2. Arsip Sejarah Perbaikan & Log Sparepart yang Selesai</h4>
                </div>

                {(() => {
                  const completedJobs = repairs.filter(r => r.mechanicName === selectedMechanicForHistory.name);
                  if (completedJobs.length === 0) {
                    return (
                      <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                        <FileText className="mx-auto text-gray-300 mb-2" size={24} />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Belum ada arsip perbaikan selesai</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Setelah Work Order selesai divalidasi admin, sejarah perbaikannya akan terekam di sini.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <table className="w-full text-xs text-left text-gray-700 border border-gray-100 rounded-xl overflow-hidden min-w-[700px]">
                        <thead className="text-[10px] uppercase bg-slate-50 text-gray-500 border-b border-gray-100 font-mono font-bold">
                          <tr>
                            <th className="px-4 py-2.5">Tanggal Selesai</th>
                            <th className="px-4 py-2.5">ID Perbaikan</th>
                            <th className="px-4 py-2.5">Unit Terkait</th>
                            <th className="px-4 py-2.5">Jenis Pekerjaan</th>
                            <th className="px-4 py-2.5">Hour Meter (HM)</th>
                            <th className="px-4 py-2.5">Deskripsi Tindakan</th>
                            <th className="px-4 py-2.5 text-right">Rincian Suku Cadang</th>
                            <th className="px-4 py-2.5 text-right">Total Biaya</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {completedJobs.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50/50 text-[11px] transition-colors">
                              <td className="px-4 py-3 font-mono font-bold whitespace-nowrap text-gray-500">{r.completionDate}</td>
                              <td className="px-4 py-3 font-mono font-bold text-blue-700">{r.id}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <Truck size={12} className="text-slate-400" />
                                  <span className="font-mono font-black text-slate-800 uppercase bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[10px]">{r.unitCode}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px]">
                                  {r.serviceType}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono font-semibold text-gray-600">{r.hmAtService.toLocaleString()} HM</td>
                              <td className="px-4 py-3 text-gray-600 max-w-xs uppercase leading-tight font-sans font-medium" title={r.description}>
                                {r.description}
                              </td>
                              <td className="px-4 py-3 text-right max-w-[180px]">
                                {r.partsUsed && r.partsUsed.length > 0 ? (
                                  <div className="space-y-0.5 text-[10px]">
                                    {r.partsUsed.map((p, idx) => (
                                      <div key={idx} className="text-gray-500 font-mono">
                                        <span className="font-bold text-gray-700 uppercase">{p.partName}</span> ({p.quantity} {p.quantity > 1 ? 'pcs' : 'pc'})
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic text-[10px]">Tanpa Suku Cadang</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                Rp {r.totalCost.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMechanicForHistory(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold uppercase text-[10px] tracking-wider cursor-pointer shadow-sm transition-all"
              >
                Tutup Catatan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
