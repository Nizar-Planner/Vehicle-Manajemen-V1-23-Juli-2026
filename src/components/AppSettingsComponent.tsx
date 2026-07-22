import React, { useState } from 'react';
import { AppUser, AppSettings } from '../types';
import { 
  Settings, 
  Users, 
  Sliders, 
  ShieldAlert, 
  Plus, 
  UserX, 
  UserCheck, 
  Trash2, 
  Save, 
  Info,
  X
} from 'lucide-react';

interface AppSettingsComponentProps {
  settings: AppSettings;
  users: AppUser[];
  onUpdateSettings: (settingsData: Partial<AppSettings>) => Promise<void>;
  onCreateUser: (userData: Omit<AppUser, 'id'>) => Promise<void>;
  onUpdateUser: (id: string, userData: Partial<AppUser>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export default function AppSettingsComponent({
  settings,
  users,
  onUpdateSettings,
  onCreateUser,
  onUpdateUser,
  onDeleteUser
}: AppSettingsComponentProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'users'>('config');
  const [totalBays, setTotalBays] = useState(settings?.totalBays || 1);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // New user form state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'Super Admin' | 'Workshop Manager' | 'Admin Bengkel' | 'Mekanik'>('Mekanik');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalBays < 1 || totalBays > 24) {
      alert('Jumlah Workshop Bay harus antara 1 s.d. 24 slot.');
      return;
    }

    setIsSavingSettings(true);
    try {
      await onUpdateSettings({ totalBays });
      alert('Konfigurasi aplikasi berhasil disimpan!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan konfigurasi');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      alert('Nama dan Username wajib diisi');
      return;
    }

    try {
      await onCreateUser({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        role,
        status: 'Active'
      });
      setIsAddingUser(false);
      setName('');
      setUsername('');
      setRole('Mekanik');
      alert('User baru berhasil ditambahkan!');
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan user baru');
    }
  };

  const handleToggleUserStatus = async (user: AppUser) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await onUpdateUser(user.id, { status: nextStatus });
    } catch (err: any) {
      alert(err.message || 'Gagal mengupdate status user');
    }
  };

  const handleDeleteUser = async (user: AppUser) => {
    if (confirm(`Apakah Anda yakin ingin menghapus user: ${user.name}?`)) {
      try {
        await onDeleteUser(user.id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus user');
      }
    }
  };

  return (
    <div className="space-y-6" id="settings-management-container">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Pengaturan & Kontrol Akses Sistem</h1>
        <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">
          Konfigurasi kapasitas fisik workshop (bay), atur profil akses pengguna, dan tinjau hak istimewa ACL secara terpusat.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('config')}
          className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'config'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders size={14} />
            Konfigurasi Aplikasi
          </div>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={14} />
            Kontrol List User (ACL)
          </div>
        </button>
      </div>

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-config-pane">
          {/* Left: Settings Form */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
                PENGATURAN PARAMETER OPERASIONAL
              </h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono block">
                  JUMLAH WORKSHOP BAY AKTIF
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={totalBays}
                    onChange={(e) => setTotalBays(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold font-mono focus:outline-none focus:border-gray-900 text-slate-900"
                  />
                  <span className="text-[11px] text-gray-500 uppercase font-bold">Slot Kerja Aktif</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium font-sans">
                  Menentukan kapasitas fisik maksimum untuk pengerjaan unit yang dapat diparkir di dalam bengkel secara bersamaan. Rentang yang diizinkan: 1 - 24 bay.
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 bg-[#1A1C1E] hover:bg-[#2C2E33] disabled:bg-gray-400 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Save size={14} />
                  {isSavingSettings ? 'Menyimpan...' : 'Simpan Parameter'}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Info block */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">DAMPAK PERUBAHAN PARAMETER</h3>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 shadow-2xs">
              <div className="flex gap-2.5 items-start text-xs text-slate-700 bg-slate-50 p-3 border border-gray-200 font-medium">
                <Info className="shrink-0 text-blue-600 mt-0.5" size={15} />
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 uppercase text-[10px]">Alokasi Kapasitas Dinamis</p>
                  <p className="text-[11px] leading-relaxed text-gray-500">
                    Sistem akan membagi sisa slot pengerjaan secara merata. Jika jumlah unit yang sedang dikerjakan melebihi kapasitas bay, daftar antrean akan ditampilkan dalam status "Waiting Queue" secara otomatis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4" id="settings-users-pane">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">DAFTAR PENGGUNA TERDAFTAR ({users.length})</h2>
            <button
              onClick={() => setIsAddingUser(true)}
              className="flex items-center justify-center gap-1.5 bg-[#1A1C1E] hover:bg-[#2C2E33] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus size={12} /> Tambah User Baru
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs text-slate-800">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-slate-500 font-mono font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Peran (Role)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 uppercase tracking-wide">{u.name}</td>
                    <td className="p-3 font-mono text-gray-500">{u.username}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 font-bold uppercase text-[9px] tracking-wider border ${
                        u.role === 'Super Admin' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        u.role === 'Workshop Manager' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        u.role === 'Admin Bengkel' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase ${
                        u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`p-1 hover:bg-slate-100 border cursor-pointer font-bold uppercase text-[9px] px-1.5 ${
                            u.status === 'Active' ? 'text-amber-600 border-amber-200' : 'text-emerald-600 border-emerald-200'
                          }`}
                          title={u.status === 'Active' ? 'Deaktifkan User' : 'Aktifkan User'}
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ACL Privilege Matrix Info */}
          <div className="bg-slate-50 border border-gray-200 p-4 space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-800 font-mono flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-rose-600" />
              MATRIKS OTORISASI PERAN & ACL (HAK AKSES)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px] leading-relaxed text-slate-800">
              <div className="bg-white p-3 border border-gray-200 space-y-1">
                <span className="font-bold text-rose-700 uppercase">ADMIN / PLANNER</span>
                <p className="text-gray-500 uppercase text-[10px]">Akses Penuh. Meliputi pendaftaran unit, manajemen budget/suku cadang gudang, pembuatan work order, manajemen user dan konfigurasi bay bengkel.</p>
              </div>
              <div className="bg-white p-3 border border-gray-200 space-y-1">
                <span className="font-bold text-blue-700 uppercase">MECHANIC</span>
                <p className="text-gray-500 uppercase text-[10px]">Akses Pelaksana. Diperbolehkan mengubah status pengerjaan, mencatat progress tindakan servis, dan melaporkan breakdown unit lapangan.</p>
              </div>
              <div className="bg-white p-3 border border-gray-200 space-y-1">
                <span className="font-bold text-amber-700 uppercase">OPERATOR</span>
                <p className="text-gray-500 uppercase text-[10px]">Akses Pelapor. Menulis keluhan kerusakan unit, membaca riwayat pemeliharaan, serta mengajukan pengaduan darurat.</p>
              </div>
              <div className="bg-white p-3 border border-gray-200 space-y-1">
                <span className="font-bold text-gray-700 uppercase">VIEWER</span>
                <p className="text-gray-500 uppercase text-[10px]">Akses Terbatas. Hanya dapat mengamati visualisasi dashboard utama dan melihat status armada secara read-only.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW USER MODAL */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl border border-gray-300 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 bg-[#1A1C1E] text-white flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest font-mono">Pendaftaran Pengguna Baru (ACL)</h3>
                <p className="text-[10px] text-gray-400 uppercase mt-0.5">USER ONBOARDING SYSTEM</p>
              </div>
              <button onClick={() => setIsAddingUser(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Andi Wijaya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900 font-bold uppercase text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Username Sistem *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: andi.wijaya"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900 font-mono text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Peran & Hak Akses (Role) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs focus:outline-none focus:border-gray-900 font-bold"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Workshop Manager">Workshop Manager</option>
                  <option value="Admin Bengkel">Admin Bengkel</option>
                  <option value="Mekanik">Mekanik</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
