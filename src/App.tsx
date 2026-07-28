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
  Grid
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
  MechanicInspection
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

export default function App() {
  // Navigation states
  const [activeModule, setActiveModule] = useState<'portal' | 'maintenance' | 'logistic' | 'purchasing' | 'consultation'>('portal');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Database states
  const [units, setUnits] = useState<UioUnit[]>([]);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [bookings, setBookings] = useState<WorkshopBooking[]>([]);
  const [breakdowns, setBreakdowns] = useState<BreakdownLog[]>([]);
  const [repairs, setRepairs] = useState<RepairHistory[]>([]);
  const [hmLogs, setHmLogs] = useState<HmUpdateLog[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
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

  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Quick Action triggers
  const [quickBookUnit, setQuickBookUnit] = useState<UioUnit | null>(null);

  // Sync / Fetch Data from custom Express API
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [resStats, resUio, resParts, resBookings, resBreakdowns, resRepairs, resHmLogs, resMechanics, resUsers, resSettings, resInspections] = await Promise.all([
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
        fetch('/api/inspections')
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resUio.ok) setUnits(await resUio.json());
      if (resParts.ok) setParts(await resParts.json());
      if (resBookings.ok) setBookings(await resBookings.json());
      if (resBreakdowns.ok) setBreakdowns(await resBreakdowns.json());
      if (resRepairs.ok) setRepairs(await resRepairs.json());
      if (resHmLogs && resHmLogs.ok) setHmLogs(await resHmLogs.json());
      if (resMechanics && resMechanics.ok) setMechanics(await resMechanics.json());
      if (resUsers && resUsers.ok) setAppUsers(await resUsers.json());
      if (resSettings && resSettings.ok) setAppSettings(await resSettings.json());
      if (resInspections && resInspections.ok) setInspections(await resInspections.json());
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
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans text-slate-800" id="app-shell">
      {/* Top Header Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0 shadow-xs" id="navbar">
        <div className="flex items-center gap-4">
          
          {/* Compact Dropdown Menu Trigger Container */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group p-2.5 bg-slate-900 hover:bg-emerald-600 text-white transition-all duration-200 flex items-center justify-center cursor-pointer rounded-xl border border-transparent shadow-xs"
              id="menu-trigger-button"
              title="Menu Navigasi"
            >
              <LayoutGrid size={18} className="text-emerald-400 group-hover:rotate-45 transition-transform" />
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
                  <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                    <span className="text-xs text-emerald-400 font-medium tracking-wide">Navigasi System</span>
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
          
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 shrink-0 rounded-full"></div>
            <span className="font-bold text-slate-900 tracking-tight text-base">FleetCare Pro</span>
            <span className="text-slate-700 text-[10px] font-mono font-bold hidden sm:inline bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
              {activeModule === 'portal' && 'Main Portal'}
              {activeModule === 'maintenance' && 'Maintenance Armada'}
              {activeModule === 'logistic' && 'Logistic Gudang'}
              {activeModule === 'purchasing' && 'Purchasing PO'}
              {activeModule === 'consultation' && 'Consultation AI'}
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
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-500">
            <span>Total Armada: <strong className="text-slate-900 font-bold">{units.length} Unit</strong></span>
            <div className="h-3 w-px bg-slate-200"></div>
            <span className="text-rose-600 font-semibold">{stats.overdueServiceCount} Unit Perlu Servis</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
                  stats={stats} 
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
    </div>
  );
}
