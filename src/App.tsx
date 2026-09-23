/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Truck, 
  Wrench, 
  AlertTriangle, 
  Package, 
  History, 
  LayoutDashboard,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Clock,
  Settings,
  RefreshCw,
  TrendingUp,
  LayoutGrid,
  Users,
  ClipboardCheck,
  Gauge,
  Boxes,
  ShoppingCart,
  MessageSquare,
  ArrowLeft,
  Grid,
  Check
} from 'lucide-react';

import { 
  UioUnit, 
  SparePart, 
  WorkshopBooking, 
  BreakdownLog, 
  RepairHistory, 
  DashboardStats,
  HmUpdateLog,
  Mechanic,
  AppUser,
  AppSettings,
  MechanicInspection,
  ManpowerPerson
} from './types';

import Dashboard from './components/Dashboard';
import UioManager from './components/UioManager';
import BookingSystem from './components/BookingSystem';
import BreakdownLogs from './components/BreakdownLogs';
import Warehouse from './components/Warehouse';
import RepairHistoryPage from './components/RepairHistoryPage';
import MechanicManagement from './components/MechanicManagement';
import AppSettingsComponent from './components/AppSettingsComponent';
import InspectionsPlanner from './components/InspectionsPlanner';
import HmKmLoggingPage from './components/HmKmLoggingPage';
import ModulePortal from './components/ModulePortal';
import LogisticPortal from './components/LogisticPortal';
import PurchasingPortal from './components/PurchasingPortal';
import ConsultationPortal from './components/ConsultationPortal';
import ManpowerPortal from './components/ManpowerPortal';
import BrandLogo from './components/BrandLogo';
import BrandKitModal from './components/BrandKitModal';
import ServiceNeededModal from './components/ServiceNeededModal';

export default function App() {
  // Navigation states
  const [activeModule, setActiveModule] = useState<'portal' | 'maintenance' | 'logistic' | 'purchasing' | 'consultation' | 'manpower'>('portal');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Global Theme Mode (Dark / Light)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fleet_dark_mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fleet_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fleet_dark_mode', 'false');
    }
  }, [isDarkMode]);
  
  // Database states
  const [units, setUnits] = useState<UioUnit[]>([]);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [bookings, setBookings] = useState<WorkshopBooking[]>([]);
  const [breakdowns, setBreakdowns] = useState<BreakdownLog[]>([]);
  const [repairs, setRepairs] = useState<RepairHistory[]>([]);
  const [hmLogs, setHmLogs] = useState<HmUpdateLog[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    const saved = localStorage.getItem('fleet_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      id: 'U-000',
      username: 'ahmadnizar',
      name: 'Ahmad Nizar Arif',
      role: 'Super Admin',
      status: 'Active'
    };
  });
  const [inspections, setInspections] = useState<MechanicInspection[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({ id: 'default', totalBays: 1 });
  const [stats, setStats] = useState<DashboardStats>({
    totalUnits: 0,
    activeUnits: 0,
    breakdownUnits: 0,
    underMaintenanceUnits: 0,
    overdueServiceCount: 0,
    overdueOilCount: 0,
    lowStockCount: 0,
    activeBookings: 0,
  });
  const [manpower, setManpower] = useState<ManpowerPerson[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Quick Action triggers
  const [quickBookUnit, setQuickBookUnit] = useState<UioUnit | null>(null);

  // Sync / Fetch Data from custom Express API
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [resStats, resUio, resParts, resBookings, resBreakdowns, resRepairs, resHmLogs, resMechanics, resUsers, resSettings, resInspections, resManpower] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/uio'),
        fetch('/api/warehouse'),
        fetch('/api/bookings'),
        fetch('/api/breakdowns'),
        fetch('/api/repairs'),
        fetch('/api/hm-logs'),
        fetch('/api/mechanics'),
        fetch('/api/users'),
        fetch('/api/settings'),
        fetch('/api/inspections'),
        fetch('/api/manpower')
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resUio.ok) setUnits(await resUio.json());
      if (resParts.ok) setParts(await resParts.json());
      if (resBookings.ok) setBookings(await resBookings.json());
      if (resBreakdowns.ok) setBreakdowns(await resBreakdowns.json());
      if (resRepairs.ok) setRepairs(await resRepairs.json());
      if (resHmLogs && resHmLogs.ok) setHmLogs(await resHmLogs.json());
      if (resMechanics && resMechanics.ok) setMechanics(await resMechanics.json());
      if (resUsers && resUsers.ok) {
        const userList: AppUser[] = await resUsers.json();
        setAppUsers(userList);
        const match = userList.find(u => u.username === currentUser.username || u.name === currentUser.name || u.id === currentUser.id);
        if (match) {
          setCurrentUser(match);
        } else if (userList.length > 0 && !localStorage.getItem('fleet_current_user')) {
          setCurrentUser(userList[0]);
        }
      }
      if (resSettings && resSettings.ok) setAppSettings(await resSettings.json());
      if (resInspections && resInspections.ok) setInspections(await resInspections.json());
      if (resManpower && resManpower.ok) {
        const mpData = await resManpower.json();
        setManpower(mpData.personnel || []);
      }
    } catch (err) {
      console.error('Error fetching data from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [refreshTrigger]);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // UIO Actions
  const handleAddUnit = async (unitData: Partial<UioUnit>) => {
    try {
      const res = await fetch('/api/uio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menambahkan unit');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateHm = async (unitId: string, currentHm: number, currentKm?: number, notes?: string) => {
    try {
      const res = await fetch(`/api/uio/${unitId}/update-hm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentHm, currentKm, notes }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal merubah HM');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      const res = await fetch(`/api/uio/${unitId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menghapus unit');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  // Booking Actions
  const handleCreateBooking = async (bookingData: any) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan booking');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, payload: any) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mengubah status booking');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  // Breakdown Actions
  const handleReportBreakdown = async (payload: any) => {
    try {
      const res = await fetch('/api/breakdowns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal melaporkan kerusakan');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleResolveBreakdown = async (id: string, payload: any) => {
    try {
      const res = await fetch(`/api/breakdowns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyelesaikan kerusakan');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  // Spare Parts Actions
  const handleAddSparePart = async (partData: Partial<SparePart>) => {
    try {
      const res = await fetch('/api/warehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menambahkan suku cadang');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateSparePart = async (partId: string, updatedFields: Partial<SparePart>) => {
    try {
      const res = await fetch(`/api/warehouse/${partId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mengupdate suku cadang');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  // Quick Trigger Shortcuts
  const handleQuickBook = (unit: UioUnit) => {
    setActiveTab('bookings');
  };

  const handleQuickRestock = (part: SparePart) => {
    setActiveTab('warehouse');
  };

  // Mechanics Actions
  const handleCreateMechanic = async (mechanicData: Omit<Mechanic, 'id'>) => {
    try {
      const res = await fetch('/api/mechanics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mechanicData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan mekanik');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateMechanic = async (id: string, mechanicData: Partial<Mechanic>) => {
    try {
      const res = await fetch(`/api/mechanics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mechanicData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal merubah mekanik');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteMechanic = async (id: string) => {
    try {
      const res = await fetch(`/api/mechanics/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menghapus mekanik');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  // User Control Actions
  const handleCreateUser = async (userData: Omit<AppUser, 'id'>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan user');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<AppUser>) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal merubah status user');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menghapus user');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  // Settings Actions
  const handleUpdateSettings = async (settingsData: Partial<AppSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan konfigurasi');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  // Inspections & Backlog Actions
  const handleCreateInspection = async (payload: any) => {
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal membuat rekomendasi inspeksi');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleProcessBacklog = async (id: string, action: 'approve' | 'reject' | 'need_info', payload: any) => {
    try {
      const res = await fetch(`/api/inspections/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memproses backlog');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleAddInspectionComment = async (id: string, commentData: any) => {
    try {
      const res = await fetch(`/api/inspections/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mengirim komentar / foto');
      }
      triggerRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard, badge: null },
    { id: 'uio', label: 'Armada UIO', icon: Truck, badge: stats.overdueServiceCount > 0 ? stats.overdueServiceCount : null, badgeColor: 'bg-rose-500' },
    { id: 'hm-logging', label: 'Input HM & Log Unit', icon: Gauge, badge: null },
    { id: 'bookings', label: 'Work Order & Antrian', icon: Wrench, badge: stats.activeBookings > 0 ? stats.activeBookings : null, badgeColor: 'bg-emerald-500' },
    { id: 'inspections', label: 'Inspeksi & Backlog', icon: ClipboardCheck, badge: inspections.filter(i => i.status === 'Pending Planner').length || null, badgeColor: 'bg-amber-500' },
    { id: 'warehouse', label: 'Logistik Gudang', icon: Package, badge: stats.lowStockCount > 0 ? stats.lowStockCount : null, badgeColor: 'bg-amber-500' },
    { id: 'mechanics', label: 'Jadwal & Tim Mekanik', icon: Users, badge: null },
    { id: 'settings', label: 'Pengaturan & Akses', icon: Settings, badge: null },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/70 text-slate-800'}`} id="app-shell">
      {/* Top Header Navigation Bar */}
      <header className={`h-16 border-b flex items-center justify-between px-6 sm:px-8 shrink-0 shadow-xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`} id="navbar">
        <div className="flex items-center gap-4">
          
          {/* Compact Dropdown Menu Trigger Container with Brand Logo */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`group h-10 px-2.5 py-1.5 transition-all duration-200 flex items-center gap-2 cursor-pointer rounded-xl border hover:shadow-xs active:scale-95 shadow-2xs ${
                isDarkMode 
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-red-500/50 text-slate-200' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-red-300 text-slate-800'
              }`}
              id="menu-trigger-button"
              title="Menu Navigasi FLEET PARTNER"
            >
              {/* Official FLEET PARTNER Logo Image */}
              <BrandLogo variant="icon" size="sm" theme={isDarkMode ? 'dark' : 'light'} className="w-8 h-[22px] transition-transform group-hover:scale-105 shrink-0" />
              <ChevronDown 
                size={13} 
                className={`text-slate-400 group-hover:text-red-500 transition-transform duration-200 ${
                  isMenuOpen ? 'rotate-180 text-red-500' : ''
                }`} 
              />
            </button>

            {/* Compact Dropdown Menu Panel (Absolute positioned directly underneath) */}
            {isMenuOpen && (
              <>
                {/* Backdrop click closer */}
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                
                <div 
                  className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 text-white shadow-2xl z-50 rounded-2xl overflow-hidden py-1"
                  id="app-menu-dropdown"
                >
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex items-center">
                    <BrandLogo variant="horizontal" theme="dark" size="sm" />
                  </div>
                  
                  <div className="divide-y divide-slate-800/60 max-h-[70vh] overflow-y-auto">
                    {/* Module Switcher Section */}
                    <div className="p-2 bg-slate-950 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">Pilih Modul Utama</span>
                      <button
                        type="button"
                        onClick={() => { setActiveModule('portal'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          activeModule === 'portal' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <LayoutGrid size={15} />
                          <span>Menu Tampilan Portal</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveModule('maintenance'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          activeModule === 'maintenance' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Wrench size={15} />
                          <span>Maintenance Armada</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveModule('logistic'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          activeModule === 'logistic' ? 'bg-blue-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Boxes size={15} />
                          <span>Logistic &amp; Gudang</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveModule('purchasing'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          activeModule === 'purchasing' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingCart size={15} />
                          <span>Purchasing &amp; PO</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveModule('consultation'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          activeModule === 'consultation' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare size={15} />
                          <span>Consultation &amp; AI</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveModule('manpower'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          activeModule === 'manpower' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Users size={15} />
                          <span>Manpower &amp; Personil</span>
                        </div>
                      </button>
                    </div>

                    {/* Submenu for Maintenance */}
                    {activeModule === 'maintenance' && (
                      <div className="pt-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block px-4 py-1">Fitur Maintenance</span>
                        {menuItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                setIsMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-all text-xs font-semibold hover:bg-slate-800 hover:text-white ${
                                isActive ? 'bg-slate-800 text-emerald-400 border-l-3 border-emerald-500 font-bold' : 'text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                                <span>{item.label}</span>
                              </div>
                              {item.badge !== null && (
                                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full text-white ${item.badgeColor || 'bg-emerald-500'}`}>
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div 
            className="flex items-center gap-2.5 select-none"
          >
            <div className="flex flex-col justify-center">
              <div 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="relative cursor-pointer group hover:opacity-85 transition-all active:scale-95"
                title={`Klik untuk beralih ke ${isDarkMode ? 'Tema Mode Terang' : 'Tema Mode Gelap'}`}
              >
                <span 
                  className={`font-black tracking-[0.20em] uppercase leading-none block text-base sm:text-lg transition-colors duration-200 ${
                    isDarkMode ? 'text-white group-hover:text-red-400' : 'text-[#0A1931] group-hover:text-red-700'
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  FLEET PARTNER
                </span>
                {/* Slender arc underline */}
                <svg 
                  viewBox="0 0 200 12" 
                  className="w-full h-1.5 mt-0.5" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M 2 10 Q 100 2 198 10 Q 100 5 2 10 Z" 
                    fill={isDarkMode ? '#38BDF8' : '#0A1931'} 
                    className="transition-colors duration-200"
                  />
                </svg>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold hidden sm:inline border px-2.5 py-0.5 rounded-full uppercase transition-colors ${
              isDarkMode 
                ? 'bg-slate-800 text-slate-300 border-slate-700' 
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {activeModule === 'portal' && 'Portal Utama'}
              {activeModule === 'maintenance' && 'Maintenance'}
              {activeModule === 'logistic' && 'Logistic'}
              {activeModule === 'purchasing' && 'Purchasing'}
              {activeModule === 'consultation' && 'Consultation'}
            </span>
          </div>

          {activeModule !== 'portal' && (
            <button
              type="button"
              onClick={() => setActiveModule('portal')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              title="Kembali ke Menu Tampilan Portal"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Pilih Modul</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

          {/* Telemetry Display info in header to maximize screen space */}
          <div className="hidden md:flex items-center gap-3 text-xs font-medium text-slate-500">
            <span
              role="button"
              tabIndex={0}
              onClick={() => {
                setActiveModule('maintenance');
                setActiveTab('uio');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveModule('maintenance');
                  setActiveTab('uio');
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 select-none ${
                activeModule === 'maintenance' && activeTab === 'uio'
                  ? 'bg-red-50 text-red-950 border-red-300 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800'
                  : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 hover:border-red-300 hover:text-red-700 dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:border-red-500/60'
              }`}
              title="Klik untuk membuka Halaman Kelola Total Armada UIO"
            >
              <Truck size={14} className="text-red-600 dark:text-red-400 shrink-0" />
              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                Total Armada: <strong className="font-extrabold text-[#0A1931] dark:text-white underline decoration-red-500/40 underline-offset-2">{units.length} Unit</strong>
              </span>
            </span>
            <div className="h-3 w-px bg-slate-200 dark:bg-slate-800"></div>
            <span
              role="button"
              tabIndex={0}
              onClick={() => setIsServiceModalOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsServiceModalOpen(true);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm active:scale-95 select-none ${
                stats.overdueServiceCount > 0
                  ? 'bg-[#0A1931] hover:bg-[#12284c] text-white border-[#1b345b] dark:bg-rose-950/60 dark:text-rose-100 dark:border-rose-800 dark:hover:border-rose-700'
                  : 'bg-[#0A1931] hover:bg-[#12284c] text-white border-[#1b345b] dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'
              }`}
              title="Klik untuk melihat daftar unit armada yang perlu diservis"
            >
              <AlertTriangle 
                size={14} 
                className={
                  stats.overdueServiceCount > 0 
                    ? "text-rose-400 dark:text-rose-400 animate-pulse shrink-0 stroke-[2.5]" 
                    : "text-slate-300 dark:text-slate-300 shrink-0 stroke-[2]"
                } 
              />
              <span className="text-white dark:text-rose-100 font-bold">
                <strong className="font-black text-rose-300 dark:text-rose-300 underline decoration-rose-400/80 underline-offset-2">
                  {stats.overdueServiceCount} Unit
                </strong> Perlu Servis
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Real-time Refresh trigger */}
          <button 
            onClick={triggerRefresh}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer rounded-xl flex items-center gap-2 border border-slate-200"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Time / Sync indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Clock size={14} className="text-slate-400" />
            <span>UTC-7</span>
          </div>

          {/* Simple Circular Account / Settings Button */}
          <div className="relative pl-1.5 border-l border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#0A1931] to-[#1e3a68] text-white flex items-center justify-center text-xs font-bold font-mono border-2 border-slate-200 dark:border-slate-700 shadow-xs hover:border-red-500 dark:hover:border-red-500 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
              title={`Akun: ${currentUser.name} (${currentUser.role}) - Klik untuk Pengaturan Akun`}
            >
              <span className="uppercase">{currentUser.name.charAt(0)}</span>
              {/* Online status indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </button>

            {/* Dropdown Menu when clicked */}
            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Account Info */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        @{currentUser.username}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-2.5 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveModule('maintenance');
                        setActiveTab('settings');
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Settings size={15} className="text-slate-500" />
                      <span>Buka Pengaturan &amp; Akses</span>
                    </button>

                    {/* Switch Account quick list if available */}
                    {appUsers.length > 1 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                          Ganti Akun Masuk
                        </div>
                        <div className="space-y-0.5 max-h-36 overflow-y-auto">
                          {appUsers.map(user => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setCurrentUser(user);
                                localStorage.setItem('fleet_current_user', JSON.stringify(user));
                                setIsUserMenuOpen(false);
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                user.id === currentUser.id
                                  ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                                  {user.name.charAt(0)}
                                </div>
                                <span className="truncate">{user.name}</span>
                              </div>
                              {user.id === currentUser.id && (
                                <Check size={14} className="text-red-600 shrink-0 ml-1" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0" id="main-canvas">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" id="view-canvas">
          {isLoading && units.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500" id="loading-spinner">
              <RefreshCw className="animate-spin text-slate-600 mb-3" size={32} />
              <p className="text-sm font-bold uppercase tracking-wider font-sans">Connecting to FLEET.OS Database...</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-mono">Synchronizing telemetry data feeds...</p>
            </div>
          ) : (
            <div className="animate-fadeIn w-full mx-auto space-y-6" id="view-inner-content">
              {activeModule === 'portal' && (
                <ModulePortal 
                  onSelectModule={(mod) => {
                    setActiveModule(mod);
                    if (mod === 'maintenance') {
                      setActiveTab('dashboard');
                    }
                  }} 
                  onNavigateTab={(mod, tab) => {
                    setActiveModule(mod);
                    if (tab) {
                      setActiveTab(tab as any);
                    }
                  }}
                  onOpenBrandKit={() => setIsBrandKitOpen(true)}
                  stats={stats} 
                  currentUser={currentUser}
                  units={units}
                  parts={parts}
                  repairs={repairs}
                  breakdowns={breakdowns}
                  bookings={bookings}
                  manpower={manpower}
                  onRefreshData={fetchAllData}
                />
              )}

              {activeModule === 'logistic' && (
                <LogisticPortal 
                  parts={parts} 
                  onAddPart={handleAddSparePart}
                  onUpdatePart={handleUpdateSparePart}
                />
              )}

              {activeModule === 'purchasing' && (
                <PurchasingPortal />
              )}

              {activeModule === 'consultation' && (
                <ConsultationPortal units={units} />
              )}

              {activeModule === 'manpower' && (
                <ManpowerPortal 
                  units={units}
                  bookings={bookings}
                  repairs={repairs}
                  onBackToPortal={() => setActiveModule('portal')}
                  onNavigateToBooking={() => {
                    setActiveModule('maintenance');
                    setActiveTab('bookings');
                  }}
                />
              )}

              {activeModule === 'maintenance' && (
                <>
                  {activeTab === 'dashboard' && (
                    <Dashboard 
                      stats={stats} 
                      units={units} 
                      parts={parts} 
                      bookings={bookings} 
                      breakdowns={breakdowns}
                      hmLogs={hmLogs}
                      totalBays={appSettings?.totalBays || 1}
                      onNavigate={setActiveTab}
                      onQuickBook={handleQuickBook}
                      onQuickRestock={handleQuickRestock}
                      onRefreshData={triggerRefresh}
                    />
                  )}
                  {activeTab === 'uio' && (
                    <UioManager 
                      units={units} 
                      parts={parts}
                      onAddUnit={handleAddUnit}
                      onUpdateHm={handleUpdateHm}
                      onDeleteUnit={handleDeleteUnit}
                      repairs={repairs}
                      hmLogs={hmLogs}
                      bookings={bookings}
                    />
                  )}
                  {activeTab === 'hm-logging' && (
                    <HmKmLoggingPage
                      units={units}
                      hmLogs={hmLogs}
                      onUpdateHm={handleUpdateHm}
                      onRefreshData={triggerRefresh}
                    />
                  )}
                  {activeTab === 'bookings' && (
                    <BookingSystem 
                      bookings={bookings} 
                      units={units} 
                      parts={parts} 
                      mechanics={mechanics}
                      onCreateBooking={handleCreateBooking}
                      onUpdateBookingStatus={handleUpdateBookingStatus}
                    />
                  )}
                  {activeTab === 'inspections' && (
                    <InspectionsPlanner
                      inspections={inspections}
                      units={units}
                      mechanics={mechanics}
                      parts={parts}
                      onCreateInspection={handleCreateInspection}
                      onProcessBacklog={handleProcessBacklog}
                      onAddComment={handleAddInspectionComment}
                    />
                  )}
                  {activeTab === 'warehouse' && (
                    <Warehouse 
                      parts={parts} 
                      onAddPart={handleAddSparePart}
                      onUpdatePart={handleUpdateSparePart}
                    />
                  )}
                  {activeTab === 'mechanics' && (
                    <MechanicManagement 
                      mechanics={mechanics}
                      bookings={bookings}
                      repairs={repairs}
                      onCreateMechanic={handleCreateMechanic}
                      onUpdateMechanic={handleUpdateMechanic}
                      onDeleteMechanic={handleDeleteMechanic}
                    />
                  )}
                  {activeTab === 'settings' && (
                    <AppSettingsComponent 
                      settings={appSettings}
                      users={appUsers}
                      onUpdateSettings={handleUpdateSettings}
                      onCreateUser={handleCreateUser}
                      onUpdateUser={handleUpdateUser}
                      onDeleteUser={handleDeleteUser}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Brand Identity & Logo Modal */}
      <BrandKitModal 
        isOpen={isBrandKitOpen} 
        onClose={() => setIsBrandKitOpen(false)} 
      />

      {/* Overdue Service Units Modal */}
      <ServiceNeededModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        units={units}
        onNavigateToBooking={() => {
          setActiveModule('maintenance');
          setActiveTab('bookings');
        }}
        onNavigateToUio={() => {
          setActiveModule('maintenance');
          setActiveTab('uio');
        }}
      />
    </div>
  );
}
