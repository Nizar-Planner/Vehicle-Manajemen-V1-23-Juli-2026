import React, { useState, useMemo } from 'react';
import { 
  Gauge, 
  Clock, 
  Search, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Truck, 
  User, 
  Calendar,
  RefreshCw, 
  ArrowRight, 
  AlertCircle, 
  Filter, 
  Check, 
  FileSpreadsheet, 
  Layers, 
  TrendingUp, 
  Activity, 
  Plus, 
  BarChart3, 
  PieChart as PieChartIcon,
  X,
  Wrench,
  Sparkles,
  MapPin,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Info,
  Droplet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { UioUnit, HmUpdateLog, AppUser } from '../types';

interface BulkRowItem {
  currentHm: number | string;
  currentKm: number | string;
  status: 'Operating' | 'Standby' | 'Breakdown';
  location: string;
  notes: string;
  isModified: boolean;
}

interface UnitControlPortalProps {
  units: UioUnit[];
  hmLogs: HmUpdateLog[];
  currentUser?: AppUser;
  onUpdateHm: (unitId: string, currentHm: number, currentKm?: number, notes?: string) => Promise<void>;
  onRefreshData?: () => void;
  onNavigateToBooking?: (unit: UioUnit) => void;
}

export default function UnitControlPortal({
  units,
  hmLogs,
  currentUser,
  onUpdateHm,
  onRefreshData,
  onNavigateToBooking
}: UnitControlPortalProps) {
  // Main Sub-Tab
  const [activeTab, setActiveTab] = useState<'monitoring' | 'bulk_update' | 'pm_readiness' | 'logs'>('monitoring');

  // Search & Filters for Monitoring
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Operating' | 'Standby' | 'Breakdown'>('ALL');
  const [updateStatusFilter, setUpdateStatusFilter] = useState<'ALL' | 'UPDATED_TODAY' | 'NOT_UPDATED_TODAY'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [pmAlertFilter, setPmAlertFilter] = useState<'ALL' | 'OVERDUE' | 'APPROACHING' | 'SAFE'>('ALL');

  // Single Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UioUnit | null>(null);
  const [inputHm, setInputHm] = useState<number | ''>('');
  const [inputKm, setInputKm] = useState<number | ''>('');
  const [inputStatus, setInputStatus] = useState<'Operating' | 'Standby' | 'Breakdown'>('Operating');
  const [inputLocation, setInputLocation] = useState('');
  const [inputNotes, setInputNotes] = useState('');
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);

  // Bulk / Spreadsheet State
  const [bulkRows, setBulkRows] = useState<Record<string, BulkRowItem>>({});
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Check if unit was updated today
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const getUnitLastUpdate = (unitId: string) => {
    const logs = hmLogs.filter(l => l.unitId === unitId);
    if (logs.length === 0) return null;
    // Sort desc by updatedAt
    const sorted = [...logs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return sorted[0];
  };

  const isUnitUpdatedToday = (unitId: string) => {
    const lastLog = getUnitLastUpdate(unitId);
    if (!lastLog) return false;
    return lastLog.updatedAt.startsWith(todayStr);
  };

  // Helper calculations for Periodic Maintenance
  const getUnitPmStatus = (unit: UioUnit) => {
    const targetServiceHm = (unit.lastServiceHm || 0) + (unit.serviceInterval || 250);
    const remainingHm = targetServiceHm - unit.currentHm;
    const isOverdue = remainingHm <= 0;
    const isApproaching = remainingHm > 0 && remainingHm <= 50;

    // Oil status
    const targetOilHm = (unit.lastOilChangeHm || 0) + (unit.oilChangeInterval || 250);
    const remainingOilHm = targetOilHm - unit.currentHm;

    return {
      targetServiceHm,
      remainingHm,
      isOverdue,
      isApproaching,
      targetOilHm,
      remainingOilHm,
      statusBadge: isOverdue 
        ? { text: `OVERDUE (${Math.abs(remainingHm)} HM Lewat)`, color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300' }
        : isApproaching
        ? { text: `SEGERA PM (Sisa ${remainingHm} HM)`, color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' }
        : { text: `Aman (${remainingHm} HM lagi)`, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' }
    };
  };

  // -------------------------------------------------------------
  // DASHBOARD AGGREGATES
  // -------------------------------------------------------------
  const stats = useMemo(() => {
    const total = units.length;
    const operating = units.filter(u => u.status === 'Operating').length;
    const standby = units.filter(u => u.status === 'Standby').length;
    const breakdown = units.filter(u => u.status === 'Breakdown').length;
    const underMaint = units.filter(u => u.status === 'Under Maintenance').length;

    const updatedToday = units.filter(u => isUnitUpdatedToday(u.id)).length;
    const notUpdatedToday = total - updatedToday;

    let overduePmCount = 0;
    let approachingPmCount = 0;

    units.forEach(u => {
      const pm = getUnitPmStatus(u);
      if (pm.isOverdue) overduePmCount++;
      else if (pm.isApproaching) approachingPmCount++;
    });

    const utilizationRate = total > 0 ? Math.round((operating / total) * 100) : 0;
    const totalHmFleet = units.reduce((acc, u) => acc + (u.currentHm || 0), 0);

    return {
      total,
      operating,
      standby,
      breakdown,
      underMaint,
      updatedToday,
      notUpdatedToday,
      overduePmCount,
      approachingPmCount,
      utilizationRate,
      totalHmFleet
    };
  }, [units, hmLogs, todayStr]);

  // Chart Data: Status Operasional
  const operationalChartData = useMemo(() => [
    { name: 'Beroperasi', value: stats.operating, color: '#10b981' },
    { name: 'Standby', value: stats.standby, color: '#f59e0b' },
    { name: 'Breakdown / Servis', value: stats.breakdown + stats.underMaint, color: '#ef4444' },
  ], [stats]);

  // Chart Data: Top 5 Highest Hour Meter Units
  const topHmUnits = useMemo(() => {
    return [...units]
      .sort((a, b) => b.currentHm - a.currentHm)
      .slice(0, 5)
      .map(u => ({
        code: u.code,
        hm: u.currentHm,
        name: u.name.split(' ')[0] + ' ' + (u.name.split(' ')[1] || ''),
        status: u.status
      }));
  }, [units]);

  // -------------------------------------------------------------
  // FILTERED UNITS FOR MONITORING TABLE
  // -------------------------------------------------------------
  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      // Search text
      const matchesSearch = 
        unit.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Operational Status
      const matchesStatus = statusFilter === 'ALL' || unit.status === statusFilter;

      // Update Today Status
      const isUpdated = isUnitUpdatedToday(unit.id);
      const matchesUpdate = 
        updateStatusFilter === 'ALL' ||
        (updateStatusFilter === 'UPDATED_TODAY' && isUpdated) ||
        (updateStatusFilter === 'NOT_UPDATED_TODAY' && !isUpdated);

      // Category
      const matchesCategory = categoryFilter === 'ALL' || unit.category === categoryFilter;

      // PM Alert
      const pm = getUnitPmStatus(unit);
      let matchesPm = true;
      if (pmAlertFilter === 'OVERDUE') matchesPm = pm.isOverdue;
      else if (pmAlertFilter === 'APPROACHING') matchesPm = pm.isApproaching;
      else if (pmAlertFilter === 'SAFE') matchesPm = !pm.isOverdue && !pm.isApproaching;

      return matchesSearch && matchesStatus && matchesUpdate && matchesCategory && matchesPm;
    });
  }, [units, searchQuery, statusFilter, updateStatusFilter, categoryFilter, pmAlertFilter, hmLogs]);

  // Categories list
  const categoryOptions = useMemo(() => {
    const set = new Set(units.map(u => u.category));
    return Array.from(set);
  }, [units]);

  // -------------------------------------------------------------
  // OPEN SINGLE UPDATE MODAL
  // -------------------------------------------------------------
  const openSingleUpdateModal = (unit: UioUnit) => {
    setSelectedUnit(unit);
    setInputHm(unit.currentHm);
    setInputKm(unit.currentKm || 0);
    setInputStatus(unit.status === 'Under Maintenance' ? 'Breakdown' : unit.status);
    setInputLocation(unit.location);
    setInputNotes('');
    setIsUpdateModalOpen(true);
  };

  const handleSaveSingleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    if (inputHm === '') return;

    const nextHm = Number(inputHm);
    const nextKm = inputKm !== '' ? Number(inputKm) : selectedUnit.currentKm || 0;

    if (nextHm < selectedUnit.currentHm) {
      if (!window.confirm(`Perhatian: Nilai HM baru (${nextHm}) lebih kecil dari HM sebelumnya (${selectedUnit.currentHm}). Apakah ini pergantian meter alat (Hour Meter Replacement)?`)) {
        return;
      }
    }

    setIsSubmittingSingle(true);
    try {
      // Use API
      const res = await fetch(`/api/uio/${selectedUnit.id}/update-hm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHm: nextHm,
          currentKm: nextKm,
          status: inputStatus,
          location: inputLocation,
          notes: inputNotes || `Update HM/KM rutin oleh ${currentUser?.name || 'Admin'} (HM: ${selectedUnit.currentHm} -> ${nextHm}, Status: ${inputStatus})`
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan update HM');
      }

      setIsUpdateModalOpen(false);
      showToast(`HM & Status unit ${selectedUnit.code} berhasil diperbarui! (${nextHm} HM)`, 'success');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat update HM', 'error');
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  // -------------------------------------------------------------
  // BULK UPDATE SPREADSHEET INITIALIZATION & SAVE
  // -------------------------------------------------------------
  const initializeBulkRows = () => {
    const initial: Record<string, BulkRowItem> = {};
    units.forEach(u => {
      initial[u.id] = {
        currentHm: u.currentHm,
        currentKm: u.currentKm || 0,
        status: (u.status === 'Under Maintenance' ? 'Breakdown' : u.status) as 'Operating' | 'Standby' | 'Breakdown',
        location: u.location,
        notes: '',
        isModified: false
      };
    });
    setBulkRows(initial);
  };

  const handleBulkChange = (unitId: string, field: keyof BulkRowItem, value: any) => {
    setBulkRows(prev => {
      const current: BulkRowItem = prev[unitId] || {
        currentHm: 0,
        currentKm: 0,
        status: 'Operating',
        location: '',
        notes: '',
        isModified: false
      };
      return {
        ...prev,
        [unitId]: {
          ...current,
          [field]: value,
          isModified: true
        }
      };
    });
  };

  const handleSaveBulkUpdates = async () => {
    const modifiedUnits = Object.keys(bulkRows)
      .map(unitId => ({ unitId, data: bulkRows[unitId] }))
      .filter(item => item.data && item.data.isModified);

    if (modifiedUnits.length === 0) {
      showToast('Tidak ada data unit yang diubah.', 'info');
      return;
    }

    setIsSubmittingBulk(true);
    try {
      const updatesPayload = modifiedUnits.map(({ unitId, data }) => ({
        unitId,
        currentHm: Number(data.currentHm),
        currentKm: Number(data.currentKm),
        status: data.status,
        location: data.location,
        notes: data.notes || `Bulk update HM/KM harian oleh ${currentUser?.name || 'Admin'}`
      }));

      const res = await fetch('/api/uio/batch-update-hm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: updatesPayload,
          updatedBy: currentUser?.name || 'Admin Dispatcher'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan update massal');
      }

      showToast(`Berhasil memperbarui ${modifiedUnits.length} unit secara massal!`, 'success');
      if (onRefreshData) onRefreshData();
      setActiveTab('monitoring');
    } catch (err: any) {
      showToast(err.message || 'Gagal update massal', 'error');
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="unit-control-portal-root">
      {/* In-app Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border font-mono text-xs animate-in slide-in-from-bottom-4 duration-200 ${
          toast.type === 'success' 
            ? 'bg-emerald-950 text-emerald-200 border-emerald-800' 
            : toast.type === 'error'
            ? 'bg-rose-950 text-rose-200 border-rose-800'
            : 'bg-slate-900 text-slate-200 border-slate-700'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle size={16} className="text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info size={16} className="text-blue-400 shrink-0" />}
          <span className="font-semibold">{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Header Banner & Status */}
      <div className="bg-[#0A1931] text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-red-600 text-white rounded-2xl shadow-lg flex items-center justify-center shrink-0">
            <Gauge size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black font-mono uppercase tracking-wider text-white">
                MONITORING HM/KM &amp; STATUS OPERASIONAL UNIT
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Basis Periodic Maintenance
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-1 max-w-2xl leading-relaxed">
              Pusat kendali telemetry armada: Pemantauan unit Beroperasi, Standby, dan Breakdown, kalkulasi sisa jam kerja menuju Periodic Maintenance (PM), serta pencatatan log harian oleh Admin/Dispatcher.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              initializeBulkRows();
              setActiveTab('bulk_update');
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold rounded-xl border border-slate-700 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Input Massal (Spreadsheet)</span>
          </button>

          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Perbarui Data"
            >
              <RefreshCw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Operating Units */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-emerald-200 dark:border-emerald-950 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-extrabold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>1. Unit Beroperasi</span>
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <Activity size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {stats.operating}
            </span>
            <span className="text-xs font-bold font-mono text-slate-500">
              / {stats.total} Unit ({stats.utilizationRate}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            Aktif berproduksi di pit &amp; hauling road
          </p>
        </div>

        {/* Card 2: Standby Units */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-amber-200 dark:border-amber-950 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase font-extrabold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>2. Unit Standby</span>
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {stats.standby}
            </span>
            <span className="text-xs font-bold font-mono text-slate-500">
              Unit Siaga
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            Menunggu antrian, operator, atau relokasi pit
          </p>
        </div>

        {/* Card 3: Breakdown Units */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-rose-200 dark:border-rose-950 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-rose-700 dark:text-rose-400 uppercase font-extrabold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>3. Unit Breakdown</span>
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-xl">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
              {stats.breakdown + stats.underMaint}
            </span>
            <span className="text-xs font-bold font-mono text-slate-500">
              Unit Rusak / Servis
            </span>
          </div>
          <p className="text-[11px] text-rose-700 dark:text-rose-400 font-sans font-semibold">
            Memerlukan perbaikan mekanik &amp; suku cadang
          </p>
        </div>

        {/* Card 4: Daily Update Compliance */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-blue-200 dark:border-blue-950 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-blue-700 dark:text-blue-400 uppercase font-extrabold flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              <span>4. Update Hari Ini</span>
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-xl">
              <Gauge size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
              {stats.updatedToday}
            </span>
            <span className="text-xs font-bold font-mono text-slate-500">
              / {stats.total} Unit Terupdate
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            {stats.notUpdatedToday > 0 ? (
              <span className="text-amber-600 font-bold">⚠️ {stats.notUpdatedToday} Unit belum diupdate hari ini</span>
            ) : (
              <span className="text-emerald-600 font-bold">✓ 100% Seluruh unit sudah terupdate</span>
            )}
          </p>
        </div>
      </div>

      {/* 3. PM Radar Urgent Alert Bar (If any overdue/approaching) */}
      {(stats.overduePmCount > 0 || stats.approachingPmCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                PERINGATAN PERIODIC MAINTENANCE (PM)
              </div>
              <div className="text-amber-800 dark:text-amber-400 text-[11px] mt-0.5">
                Terdapat <strong>{stats.overduePmCount} Unit Overdue PM</strong> (melewati batas jam operasi) dan <strong>{stats.approachingPmCount} Unit Segera Butuh Servis</strong> (&lt; 50 HM tersisa).
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPmAlertFilter('OVERDUE');
              setActiveTab('monitoring');
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all cursor-pointer text-center shrink-0"
          >
            Lihat Unit Overdue
          </button>
        </div>
      )}

      {/* 4. Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 gap-2 flex-wrap text-xs font-mono font-bold">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('monitoring')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'monitoring'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Gauge size={14} />
            <span>Tabel Monitoring &amp; Status ({units.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              initializeBulkRows();
              setActiveTab('bulk_update');
            }}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bulk_update'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Input Massal (Spreadsheet Grid)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pm_readiness')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pm_readiness'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Wrench size={14} />
            <span>Kesiapan Periodic Maintenance ({stats.overduePmCount + stats.approachingPmCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <History size={14} />
            <span>Riwayat Audit Log HM/KM ({hmLogs.length})</span>
          </button>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Total Armada: <strong>{units.length} Unit</strong> &bull; Total HM: <strong>{stats.totalHmFleet.toLocaleString()} HM</strong>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: MONITORING HM & STATUS SELURUH UNIT                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode unit (e.g. EXCA-01), model, lokasi..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 font-mono text-xs font-bold overflow-x-auto pb-1">
                {(['ALL', 'Operating', 'Standby', 'Breakdown'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? 'Semua Status' : st === 'Operating' ? '🟢 Beroperasi' : st === 'Standby' ? '🟡 Standby' : '🔴 Breakdown'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Filters: Update Status & PM Alert */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-bold">Filter Kepatuhan:</span>
                <button
                  type="button"
                  onClick={() => setUpdateStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg ${updateStatusFilter === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500'}`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateStatusFilter('UPDATED_TODAY')}
                  className={`px-2.5 py-1 rounded-lg ${updateStatusFilter === 'UPDATED_TODAY' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'}`}
                >
                  ✓ Sudah Update Hari Ini ({stats.updatedToday})
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateStatusFilter('NOT_UPDATED_TODAY')}
                  className={`px-2.5 py-1 rounded-lg ${updateStatusFilter === 'NOT_UPDATED_TODAY' ? 'bg-amber-600 text-white font-bold' : 'text-slate-500'}`}
                >
                  ⚠️ Belum Update Hari Ini ({stats.notUpdatedToday})
                </button>
              </div>

              {/* PM Alert Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-bold">Kesiapan PM:</span>
                <button
                  type="button"
                  onClick={() => setPmAlertFilter('ALL')}
                  className={`px-2 py-0.5 rounded-md ${pmAlertFilter === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-500'}`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setPmAlertFilter('OVERDUE')}
                  className={`px-2 py-0.5 rounded-md ${pmAlertFilter === 'OVERDUE' ? 'bg-rose-600 text-white font-bold' : 'text-slate-500'}`}
                >
                  Overdue ({stats.overduePmCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPmAlertFilter('APPROACHING')}
                  className={`px-2 py-0.5 rounded-md ${pmAlertFilter === 'APPROACHING' ? 'bg-amber-600 text-white font-bold' : 'text-slate-500'}`}
                >
                  Mendekati PM ({stats.approachingPmCount})
                </button>
              </div>
            </div>
          </div>

          {/* Main Units Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    <th className="p-3.5">Kode &amp; Unit</th>
                    <th className="p-3.5">Kategori &amp; Lokasi</th>
                    <th className="p-3.5 text-center">Status Operasi</th>
                    <th className="p-3.5 text-right">HM Saat Ini</th>
                    <th className="p-3.5 text-right">Target Servis (PM)</th>
                    <th className="p-3.5 text-center">Sisa HM Menuju PM</th>
                    <th className="p-3.5 text-center">Update Hari Ini</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Tidak ada unit yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map(unit => {
                      const pm = getUnitPmStatus(unit);
                      const isUpdated = isUnitUpdatedToday(unit.id);
                      const lastLog = getUnitLastUpdate(unit.id);

                      return (
                        <tr key={unit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Unit Code & Name */}
                          <td className="p-3.5">
                            <div className="font-black text-slate-900 dark:text-white text-sm">
                              {unit.code}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs font-sans">
                              {unit.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              SN: {unit.serialNumber || '-'}
                            </div>
                          </td>

                          {/* Category & Location */}
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                              {unit.category}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                              <MapPin size={11} className="text-slate-400" />
                              <span className="truncate max-w-[150px]">{unit.location}</span>
                            </div>
                          </td>

                          {/* Operational Status Badge */}
                          <td className="p-3.5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                              unit.status === 'Operating'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : unit.status === 'Standby'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                unit.status === 'Operating' ? 'bg-emerald-500 animate-pulse' :
                                unit.status === 'Standby' ? 'bg-amber-500' : 'bg-rose-500'
                              }`} />
                              <span>{unit.status === 'Operating' ? 'Beroperasi' : unit.status === 'Standby' ? 'Standby' : 'Breakdown'}</span>
                            </span>
                          </td>

                          {/* Current HM */}
                          <td className="p-3.5 text-right">
                            <div className="font-black text-slate-900 dark:text-white text-sm">
                              {unit.currentHm.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">HM</span>
                            </div>
                            {unit.currentKm !== undefined && unit.currentKm > 0 && (
                              <div className="text-[10px] text-slate-400">
                                {unit.currentKm.toLocaleString()} KM
                              </div>
                            )}
                          </td>

                          {/* Target PM */}
                          <td className="p-3.5 text-right">
                            <div className="font-bold text-slate-700 dark:text-slate-300">
                              {pm.targetServiceHm.toLocaleString()} HM
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Interval: {unit.serviceInterval || 250} HM
                            </div>
                          </td>

                          {/* Remaining HM towards PM */}
                          <td className="p-3.5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${pm.statusBadge.color}`}>
                              {pm.statusBadge.text}
                            </span>
                          </td>

                          {/* Updated Today Status */}
                          <td className="p-3.5 text-center">
                            {isUpdated ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                                  <Check size={12} />
                                  <span>Sudah Update</span>
                                </span>
                                {lastLog && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {lastLog.updatedAt.slice(11, 16)} WIB
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                                <Clock size={12} />
                                <span>Belum Hari Ini</span>
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => openSingleUpdateModal(unit)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                            >
                              <Gauge size={13} />
                              <span>Update HM</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: INPUT MASSAL (BULK SPREADSHEET MODE)                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'bulk_update' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-emerald-600" />
                <span>Input Massal Cepat (Spreadsheet Update Mode)</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Ketik langsung angka HM/KM dan ubah status unit secara bersamaan dari rekap log sheet harian operator.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('monitoring')}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBulkUpdates}
                disabled={isSubmittingBulk}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSubmittingBulk ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
              </button>
            </div>
          </div>

          {/* Bulk Spreadsheet Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <th className="p-3">Kode Unit</th>
                  <th className="p-3">Model / Kategori</th>
                  <th className="p-3 text-right">HM Sebelumnya</th>
                  <th className="p-3 text-right">HM Baru (Ketik)</th>
                  <th className="p-3 text-right">Penambahan (Δ)</th>
                  <th className="p-3">Status Operasi</th>
                  <th className="p-3">Lokasi Pit / Site</th>
                  <th className="p-3">Catatan Harian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {units.map(unit => {
                  const row = bulkRows[unit.id] || {
                    currentHm: unit.currentHm,
                    currentKm: unit.currentKm || 0,
                    status: unit.status,
                    location: unit.location,
                    notes: '',
                    isModified: false
                  };
                  const deltaHm = Number(row.currentHm) - unit.currentHm;

                  return (
                    <tr key={unit.id} className={row.isModified ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                        {unit.code}
                      </td>
                      <td className="p-3 text-slate-500 font-sans truncate max-w-xs">
                        {unit.name} ({unit.category})
                      </td>
                      <td className="p-3 text-right text-slate-400 font-bold">
                        {unit.currentHm.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={row.currentHm}
                          onChange={e => handleBulkChange(unit.id, 'currentHm', e.target.value)}
                          className="w-24 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-black text-blue-600 dark:text-blue-400 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-bold ${deltaHm > 0 ? 'text-emerald-600' : deltaHm < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {deltaHm > 0 ? `+${deltaHm}` : deltaHm} HM
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={row.status}
                          onChange={e => handleBulkChange(unit.id, 'status', e.target.value)}
                          className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-[11px] font-bold"
                        >
                          <option value="Operating">🟢 Beroperasi</option>
                          <option value="Standby">🟡 Standby</option>
                          <option value="Breakdown">🔴 Breakdown</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.location}
                          onChange={e => handleBulkChange(unit.id, 'location', e.target.value)}
                          className="w-32 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-[11px]"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="Kondisi alat..."
                          value={row.notes}
                          onChange={e => handleBulkChange(unit.id, 'notes', e.target.value)}
                          className="w-40 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-[11px]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: KESIAPAN PERIODIC MAINTENANCE (PM)                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'pm_readiness' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench size={16} className="text-blue-600" />
                <span>Kesiapan Servis Berkala (Periodic Maintenance Readiness)</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Monitoring jatuh tempo servis berkala armada (250, 500, 1000, 2000 HM) dan jadwal penggantian oli mesin berbasis HM/KM.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {units.map(unit => {
                const pm = getUnitPmStatus(unit);
                return (
                  <div 
                    key={unit.id}
                    className={`p-4 rounded-2xl border space-y-3 font-mono text-xs transition-all ${
                      pm.isOverdue 
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800' 
                        : pm.isApproaching
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">{unit.code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pm.statusBadge.color}`}>
                        {pm.statusBadge.text}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate font-sans">
                      {unit.name} ({unit.category})
                    </div>

                    <div className="space-y-1.5 pt-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">HM Saat Ini:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{unit.currentHm} HM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Servis Terakhir:</span>
                        <span>{unit.lastServiceHm || 0} HM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Servis Berikutnya:</span>
                        <span className="font-bold text-blue-600">{pm.targetServiceHm} HM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sisa HM Servis:</span>
                        <span className={`font-black ${pm.isOverdue ? 'text-rose-600' : pm.isApproaching ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {pm.remainingHm} HM
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                      {onNavigateToBooking && (
                        <button
                          type="button"
                          onClick={() => onNavigateToBooking(unit)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold"
                        >
                          Buat Work Order PM
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: RIWAYAT AUDIT LOG HM/KM                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <History size={16} className="text-slate-500" />
                <span>Audit Trail &amp; Riwayat Log Pembaruan HM/KM</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Catatan historis seluruh pembaruan jam operasi, petugas pencatat, serta selisih penambahan jam alat.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <th className="p-3">Waktu Pembaruan</th>
                  <th className="p-3">Kode Unit</th>
                  <th className="p-3 text-right">HM Lama</th>
                  <th className="p-3 text-right">HM Baru</th>
                  <th className="p-3 text-right">Selisih (+Δ)</th>
                  <th className="p-3">Catatan / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hmLogs.slice().reverse().map(log => {
                  const delta = log.newHm - log.previousHm;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-slate-500">{log.updatedAt}</td>
                      <td className="p-3 font-extrabold text-blue-600 dark:text-blue-400">{log.unitCode}</td>
                      <td className="p-3 text-right text-slate-400">{log.previousHm.toLocaleString()}</td>
                      <td className="p-3 text-right font-black text-slate-900 dark:text-white">{log.newHm.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        {delta > 0 ? `+${delta}` : delta} HM
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-sans text-[11px]">{log.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SINGLE UNIT UPDATE                                     */}
      {/* ------------------------------------------------------------- */}
      {isUpdateModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">Pembaruan Telemetry Alat</span>
                <h3 className="text-base font-black font-mono text-slate-900 dark:text-white">
                  Update HM/KM: {selectedUnit.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current telemetry snapshot */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Model:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate">{selectedUnit.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">HM Saat Ini:</span>
                <span className="font-black text-blue-600 text-sm">{selectedUnit.currentHm.toLocaleString()} HM</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Servis Terakhir:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedUnit.lastServiceHm || 0} HM</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target Servis (PM):</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {(selectedUnit.lastServiceHm || 0) + (selectedUnit.serviceInterval || 250)} HM
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveSingleUpdate} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Angka Hour Meter (HM) Baru:
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={inputHm}
                    onChange={e => setInputHm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-black text-blue-600 focus:outline-none focus:border-blue-500"
                    required
                  />
                  {inputHm !== '' && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Penambahan: <strong className="text-emerald-600">{Number(inputHm) - selectedUnit.currentHm > 0 ? `+${Number(inputHm) - selectedUnit.currentHm}` : Number(inputHm) - selectedUnit.currentHm} HM</strong>
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kilometer (KM) Baru (Opsional):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={inputKm}
                    onChange={e => setInputKm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Operasi Unit:</label>
                  <select
                    value={inputStatus}
                    onChange={e => setInputStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Operating">🟢 Beroperasi (Operating)</option>
                    <option value="Standby">🟡 Standby (Siaga)</option>
                    <option value="Breakdown">🔴 Breakdown (Rusak / Servis)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Pit / Site:</label>
                  <input
                    type="text"
                    value={inputLocation}
                    onChange={e => setInputLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Log Harian:</label>
                <textarea
                  rows={2}
                  value={inputNotes}
                  onChange={e => setInputNotes(e.target.value)}
                  placeholder="e.g. Operasi shift siang lancar, suhu engine normal, siap operasi besok."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 font-bold">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSingle}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{isSubmittingSingle ? 'Menyimpan...' : 'Simpan & Sinkronkan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
