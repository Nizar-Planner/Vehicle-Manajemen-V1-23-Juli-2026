/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Wrench, 
  AlertTriangle, 
  Layers, 
  FileText, 
  Package, 
  Clock, 
  Gauge, 
  CalendarCheck2, 
  ArrowRight,
  ChevronRight,
  X,
  Activity,
  Search,
  Printer,
  Download,
  Save,
  RefreshCw,
  Plus,
  Play,
  ShieldCheck,
  Zap,
  BarChart3,
  LogOut
} from 'lucide-react';
import { UioUnit, SparePart, WorkshopBooking, BreakdownLog, HmUpdateLog, DashboardStats, FleetKPIs } from '../types';
import DashboardCharts from './DashboardCharts';

interface DashboardProps {
  stats: DashboardStats;
  units: UioUnit[];
  parts: SparePart[];
  bookings: WorkshopBooking[];
  breakdowns?: BreakdownLog[];
  hmLogs?: HmUpdateLog[];
  totalBays?: number;
  onNavigate: (tab: string) => void;
  onQuickBook: (unit: UioUnit) => void;
  onQuickRestock: (part: SparePart) => void;
  onRefreshData?: () => void;
}

export default function Dashboard({ 
  stats, 
  units, 
  parts, 
  bookings, 
  breakdowns = [],
  hmLogs = [],
  totalBays = 1,
  onNavigate, 
  onQuickBook, 
  onQuickRestock,
  onRefreshData
}: DashboardProps) {

  const [selectedTimelineBooking, setSelectedTimelineBooking] = useState<WorkshopBooking | null>(null);

  // Service monitoring sub-menu active tab and modal open state
  const [serviceMonitoringTab, setServiceMonitoringTab] = useState<'near' | 'overdue' | 'scheduled'>('near');
  const [isScheduleServiceModalOpen, setIsScheduleServiceModalOpen] = useState<boolean>(false);

  // KPI Monitoring modal state & filters (MTTR, MTBF, MA, PA)
  const [activeKpiModal, setActiveKpiModal] = useState<'mttr' | 'mtbf' | 'ma' | 'pa' | null>(null);
  const [kpiPeriod, setKpiPeriod] = useState<'7d' | '30d' | '365d'>('30d');
  const [kpiSearchTerm, setKpiSearchTerm] = useState('');
  const [kpiCategoryFilter, setKpiCategoryFilter] = useState('ALL');

  // Compute active real-time fleet KPIs using WO breakdown hours, HM logs updates, and MOHH
  const computeFleetKpis = () => {
    const daysInPeriod = kpiPeriod === '7d' ? 7 : kpiPeriod === '365d' ? 365 : 30;
    const mohhPerUnit = daysInPeriod * 24; // e.g. 720 hours for 30d
    const totalMohh = Math.max(24, (units.length || 1) * mohhPerUnit);

    // Breakdown hours from Work Orders (WO) and reported breakdowns
    let totalDowntimeHoursWO = 0;
    bookings.forEach(b => {
      if (b.status === 'Completed' || b.status === 'In Progress') {
        const hours = b.totalWorkHoursCalculated || b.flatRateHours || (b.serviceType === 'Repair' ? 8 : 4);
        totalDowntimeHoursWO += Number(hours);
      }
    });

    if (breakdowns && breakdowns.length > 0) {
      breakdowns.forEach(bd => {
        if (bd.status === 'Open' || bd.status === 'On Repair') {
          totalDowntimeHoursWO += 6;
        }
      });
    }

    const totalDowntimeHours = Math.max(1, totalDowntimeHoursWO);

    // Breakdown Event Count (Count of repair WOs or breakdown reports)
    const breakdownCount = Math.max(
      1, 
      bookings.filter(b => b.serviceType === 'Repair' || b.status === 'In Progress' || b.status === 'Completed').length +
      (breakdowns ? breakdowns.filter(b => b.status !== 'Resolved').length : 0)
    );

    // Working Hours (Working Hours parameter from Update HM)
    let totalWorkingHoursHM = 0;
    if (hmLogs && hmLogs.length > 0) {
      hmLogs.forEach(l => {
        const diff = l.newHm - l.previousHm;
        if (diff > 0) totalWorkingHoursHM += diff;
      });
    }

    if (totalWorkingHoursHM === 0) {
      totalWorkingHoursHM = units.reduce((sum, u) => {
        const elapsed = u.currentHm - u.lastServiceHm;
        return sum + (elapsed > 0 ? elapsed : 120);
      }, 0);
    }

    if (totalWorkingHoursHM === 0) totalWorkingHoursHM = 540;

    const standbyHours = Math.max(0, totalMohh - totalWorkingHoursHM - totalDowntimeHours);

    // MTTR = Total Breakdown Hours / Breakdown Event Count (Hours)
    const mttr = Number((totalDowntimeHours / breakdownCount).toFixed(1));

    // MTBF = Working Hours / Breakdown Event Count (Hours)
    const mtbf = Number((totalWorkingHoursHM / breakdownCount).toFixed(1));

    // MA = (Working Hours / (Working Hours + Breakdown Hours)) * 100 (%)
    const maRaw = (totalWorkingHoursHM / (totalWorkingHoursHM + totalDowntimeHours)) * 100;
    const ma = Number((Math.min(100, maRaw)).toFixed(1));

    // PA = ((MOHH - Breakdown Hours) / MOHH) * 100 (%)
    const paRaw = ((totalMohh - totalDowntimeHours) / totalMohh) * 100;
    const pa = Number((Math.min(100, paRaw)).toFixed(1));

    return {
      mttrHours: mttr,
      mtbfHours: mtbf,
      mechanicalAvailability: ma,
      physicalAvailability: pa,
      totalMohh,
      totalWorkingHoursHM,
      totalDowntimeHours,
      standbyHours,
      breakdownCount,
      daysInPeriod
    };
  };

  const calculatedKpis = computeFleetKpis();

  // Unit by unit breakdown for the KPI modal table
  const getUnitKpiDetails = () => {
    const daysInPeriod = kpiPeriod === '7d' ? 7 : kpiPeriod === '365d' ? 365 : 30;
    const unitMohh = daysInPeriod * 24;

    return units
      .filter(u => {
        const matchesSearch = u.code.toLowerCase().includes(kpiSearchTerm.toLowerCase()) || u.name.toLowerCase().includes(kpiSearchTerm.toLowerCase());
        const matchesCategory = kpiCategoryFilter === 'ALL' || u.category === kpiCategoryFilter;
        return matchesSearch && matchesCategory;
      })
      .map(u => {
        const unitLogs = (hmLogs || []).filter(l => l.unitId === u.id);
        let unitWorkingHours = unitLogs.reduce((s, l) => s + Math.max(0, l.newHm - l.previousHm), 0);
        if (unitWorkingHours === 0) {
          unitWorkingHours = Math.max(20, u.currentHm > 0 ? (u.currentHm % 300) || 120 : 80);
        }

        const unitWOs = bookings.filter(b => b.unitId === u.id);
        let unitDowntime = unitWOs.reduce((s, b) => s + (b.totalWorkHoursCalculated || b.flatRateHours || (b.serviceType === 'Repair' ? 8 : 4)), 0);
        
        const unitBreakdownLogs = (breakdowns || []).filter(b => b.unitId === u.id);
        if (unitBreakdownLogs.some(b => b.status === 'Open' || b.status === 'On Repair')) {
          unitDowntime += 8;
        }

        const unitBreakdownEvents = Math.max(
          u.status === 'Breakdown' || u.status === 'Under Maintenance' ? 1 : 0,
          unitWOs.filter(b => b.serviceType === 'Repair' || b.status === 'In Progress' || b.status === 'Completed').length
        );

        const unitStandby = Math.max(0, unitMohh - unitWorkingHours - unitDowntime);

        const mttrVal = unitBreakdownEvents > 0 
          ? Number((unitDowntime / unitBreakdownEvents).toFixed(1)) 
          : 0;

        const mtbfVal = unitBreakdownEvents > 0 
          ? Number((unitWorkingHours / unitBreakdownEvents).toFixed(1)) 
          : unitWorkingHours;

        const totalOpAndRepair = unitWorkingHours + unitDowntime;
        const maVal = totalOpAndRepair > 0 
          ? Number(((unitWorkingHours / totalOpAndRepair) * 100).toFixed(1)) 
          : 100;

        const paVal = Number((((unitMohh - unitDowntime) / unitMohh) * 100).toFixed(1));

        return {
          unit: u,
          unitWorkingHours,
          unitDowntime,
          unitBreakdownEvents,
          unitMohh,
          unitStandby,
          mttrVal,
          mtbfVal,
          maVal: Math.min(100, maVal),
          paVal: Math.min(100, paVal)
        };
      });
  };

  // Fleet KPIs State (MTTR, MTBF, MA, PA)
  const [fleetKpis, setFleetKpis] = useState<FleetKPIs>({
    mttrHours: 3.5,
    mtbfHours: 128.4,
    mechanicalAvailability: 94.2,
    physicalAvailability: 96.1,
    totalOperatingHours: 540,
    totalDowntimeHours: 24
  });

  // Jam Keluar Unit / Dispatch Modal State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchUnitId, setDispatchUnitId] = useState('');
  const [dispatchOpHours, setDispatchOpHours] = useState<number | ''>(8);
  const [dispatchOperator, setDispatchOperator] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);

  // Quick HM/KM Update State
  const [quickSearchUnit, setQuickSearchUnit] = useState('');
  const [selectedQuickUnit, setSelectedQuickUnit] = useState<UioUnit | null>(null);
  const [quickHm, setQuickHm] = useState<number | ''>('');
  const [quickKm, setQuickKm] = useState<number | ''>('');
  const [quickNotes, setQuickNotes] = useState('');
  const [isUpdatingHmKm, setIsUpdatingHmKm] = useState(false);
  const [hmKmSuccessMsg, setHmKmSuccessMsg] = useState('');
  const [hmKmErrorMsg, setHmKmErrorMsg] = useState('');

  // Report Generator Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportUnitFilter, setReportUnitFilter] = useState('ALL');
  const [reportPreviewData, setReportPreviewData] = useState<any[] | null>(null);

  const fetchKpis = async () => {
    try {
      const res = await fetch('/api/fleet-kpis');
      if (res.ok) {
        const data = await res.json();
        setFleetKpis(data);
      }
    } catch (err) {
      console.error('Failed to fetch fleet KPIs:', err);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, [units, bookings]);

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchUnitId || !dispatchOpHours || !dispatchOperator) return;

    setIsSubmittingDispatch(true);
    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: dispatchUnitId,
          operatingHours: Number(dispatchOpHours),
          operatorName: dispatchOperator,
          notes: dispatchNotes || 'Jam Keluar Unit dari Workshop'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mencatat jam keluar unit');
      }

      setHmKmSuccessMsg(`Jam Keluar Unit berhasil dicatat! Total jam operasi terakumulasi.`);
      setTimeout(() => setHmKmSuccessMsg(''), 4000);
      setShowDispatchModal(false);
      setDispatchUnitId('');
      setDispatchNotes('');
      fetchKpis();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat mencatat jam keluar unit');
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  // Filter units for Service Monitoring (Near Service, Overdue Service, Scheduled)
  const nearServiceUnits = units.filter(u => {
    const elapsed = u.currentHm - u.lastServiceHm;
    const remaining = u.serviceInterval - elapsed;
    return remaining > 0 && remaining <= Math.max(50, u.serviceInterval * 0.15);
  });

  const overdueServiceUnits = units.filter(u => {
    const elapsed = u.currentHm - u.lastServiceHm;
    return elapsed >= u.serviceInterval;
  });

  const scheduledServiceBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'In Progress');

  const serviceOverdueUnits = overdueServiceUnits;

  const oilOverdueUnits = units.filter(u => {
    const elapsed = u.currentHm - u.lastOilChangeHm;
    return elapsed >= u.oilChangeInterval;
  });

  // Filter low stock parts
  const lowStockParts = parts.filter(p => p.stock <= p.minStock);

  // Active bookings list
  const activeBookingsList = bookings.filter(b => b.status === 'Pending' || b.status === 'In Progress');

  // Handle Quick Search selection
  const matchingUnits = units.filter(u => 
    u.code.toLowerCase().includes(quickSearchUnit.toLowerCase()) || 
    u.name.toLowerCase().includes(quickSearchUnit.toLowerCase())
  );

  const handleSelectUnitForQuickUpdate = (unit: UioUnit) => {
    setSelectedQuickUnit(unit);
    setQuickHm(unit.currentHm);
    setQuickKm(unit.currentKm || 0);
    setQuickSearchUnit(`${unit.code} - ${unit.name}`);
    setHmKmSuccessMsg('');
    setHmKmErrorMsg('');
  };

  const handleQuickHmKmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuickUnit) {
      setHmKmErrorMsg('Pilih unit armada terlebih dahulu.');
      return;
    }
    if (quickHm === '' || Number(quickHm) < selectedQuickUnit.currentHm) {
      setHmKmErrorMsg(`HM baru tidak boleh lebih kecil dari HM saat ini (${selectedQuickUnit.currentHm}).`);
      return;
    }

    setIsUpdatingHmKm(true);
    setHmKmErrorMsg('');
    setHmKmSuccessMsg('');

    try {
      const res = await fetch(`/api/uio/${selectedQuickUnit.id}/update-hm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHm: Number(quickHm),
          currentKm: quickKm !== '' ? Number(quickKm) : undefined,
          notes: quickNotes || 'Quick Update via Dashboard'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal meng-update HM/KM');
      }

      if (onRefreshData) {
        onRefreshData();
      }

      setHmKmSuccessMsg(`Berhasil meng-update HM/KM untuk unit ${selectedQuickUnit.code}! Data tersinkronisasi.`);
      setTimeout(() => setHmKmSuccessMsg(''), 4000);
      setSelectedQuickUnit(null);
      setQuickSearchUnit('');
      setQuickNotes('');
    } catch (err: any) {
      setHmKmErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan HM/KM');
    } finally {
      setIsUpdatingHmKm(false);
    }
  };

  // Generate Report
  const handleGenerateReport = async () => {
    try {
      const res = await fetch('/api/hm-logs');
      if (res.ok) {
        const logs: any[] = await res.json();
        const filtered = logs.filter(log => {
          const logDate = log.updatedAt.split(' ')[0];
          const matchesDate = logDate >= reportStartDate && logDate <= reportEndDate;
          const matchesUnit = reportUnitFilter === 'ALL' || log.unitId === reportUnitFilter;
          return matchesDate && matchesUnit;
        });
        setReportPreviewData(filtered);
      }
    } catch (err) {
      console.error('Failed to generate report', err);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Grid Status Armada UIO */}

      {/* Grid Status Armada UIO */}
      <div className="space-y-3" id="fleet-status-section">
        <h2 className="text-xs font-bold text-slate-600 flex items-center gap-2">
          <Activity size={15} className="text-emerald-500 animate-pulse" />
          Status Monitoring Armada UIO (Real-Time)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" id="stats-grid">
          {/* Total Unit */}
          <div className="bg-white p-4 border border-slate-200 rounded-xl flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group shadow-2xs" 
               onClick={() => onNavigate('uio')} id="stat-total-uio">
            <div className="flex items-start justify-between">
              <span className="text-xs text-slate-500 font-semibold">Total Armada</span>
              <div className="p-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Truck size={16} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{stats.totalUnits}</div>
              <p className="text-xs text-slate-500 mt-1">Semua Unit Terdaftar</p>
            </div>
          </div>

          {/* Operating (Aktif) */}
          <div className="bg-emerald-50/20 p-4 border border-emerald-200/60 rounded-xl flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group shadow-2xs" 
               onClick={() => onNavigate('uio')} id="stat-active-uio">
            <div className="flex items-start justify-between">
              <span className="text-xs text-emerald-800 font-semibold">UIO Aktif</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Activity size={16} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-emerald-700 leading-none">{stats.activeUnits}</div>
              <p className="text-xs text-emerald-600 mt-1">Beroperasi Normal</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-rose-50/20 p-4 border border-rose-200/60 rounded-xl flex flex-col justify-between hover:border-rose-500 hover:shadow-md transition-all cursor-pointer group shadow-2xs" 
               onClick={() => onNavigate('uio')} id="stat-breakdown-uio">
            <div className="flex items-start justify-between">
              <span className="text-xs text-rose-800 font-semibold">UIO Breakdown</span>
              <div className="p-2 bg-rose-50 text-rose-600 border border-rose-200/60 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-all">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-rose-600 leading-none">{stats.breakdownUnits}</div>
              <p className="text-xs text-rose-500 mt-1">Butuh Perbaikan Segera</p>
            </div>
          </div>

          {/* Standby */}
          <div className="bg-amber-50/20 p-4 border border-amber-200/60 rounded-xl flex flex-col justify-between hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group shadow-2xs" 
               onClick={() => onNavigate('uio')} id="stat-standby-uio">
            <div className="flex items-start justify-between">
              <span className="text-xs text-amber-900 font-semibold">UIO Standby</span>
              <div className="p-2 bg-amber-50 text-amber-600 border border-amber-200/60 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-amber-800 leading-none">{stats.standbyUnits}</div>
              <p className="text-xs text-amber-700 mt-1">Unit Siap & Standby</p>
            </div>
          </div>

          {/* Schedule Service Card */}
          <div 
            className={`p-4 border rounded-xl flex flex-col justify-between transition-all cursor-pointer group shadow-2xs ${
              overdueServiceUnits.length > 0
                ? 'bg-rose-50/40 border-rose-300 hover:border-rose-500 hover:shadow-md'
                : 'bg-amber-50/30 border-amber-300/70 hover:border-amber-500 hover:shadow-md'
            }`} 
            onClick={() => {
              if (overdueServiceUnits.length > 0) {
                setServiceMonitoringTab('overdue');
              } else {
                setServiceMonitoringTab('near');
              }
              setIsScheduleServiceModalOpen(true);
            }} 
            id="stat-maintenance-uio"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs font-bold ${overdueServiceUnits.length > 0 ? 'text-rose-950' : 'text-amber-900'}`}>Schedule Service</span>
                {overdueServiceUnits.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-full animate-pulse shadow-2xs">
                    <AlertTriangle size={11} />
                    <span>{overdueServiceUnits.length} Terlewat!</span>
                  </span>
                )}
              </div>
              <div className={`p-2 border rounded-lg transition-all ${
                overdueServiceUnits.length > 0
                  ? 'bg-rose-100 text-rose-700 border-rose-200 group-hover:bg-rose-600 group-hover:text-white'
                  : 'bg-amber-100 text-amber-700 border-amber-200 group-hover:bg-amber-500 group-hover:text-white'
              }`}>
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-2xl font-bold leading-none ${overdueServiceUnits.length > 0 ? 'text-rose-900' : 'text-amber-800'}`}>
                {nearServiceUnits.length + overdueServiceUnits.length} <span className="text-xs font-normal opacity-80">Unit</span>
              </div>
              {overdueServiceUnits.length > 0 ? (
                <div className="mt-1.5 flex items-center gap-1 bg-rose-100/80 px-2 py-1 rounded-md border border-rose-200/80 text-[10px] text-rose-800 font-bold">
                  <AlertTriangle size={12} className="text-rose-600 shrink-0" />
                  <span className="truncate">{overdueServiceUnits.length} Terlewat &bull; {nearServiceUnits.length} Mendekati</span>
                </div>
              ) : (
                <p className="text-[10px] text-amber-700 mt-1 font-medium truncate">
                  {nearServiceUnits.length} Unit Mendekati Waktu Servis
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Interaktif Monitoring Waktu Servis (3 Menu Inside) */}
        {isScheduleServiceModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" id="service-monitoring-interactive-panel">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-2xs">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-mono uppercase tracking-wider">
                      Schedule Service Monitoring
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pelacakan unit mendekati service interval, terlewat batas HM/KM, dan jadwal booking workshop.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsScheduleServiceModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 3 Sub-Menu Selectors */}
              <div className="px-5 pt-4 pb-3 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setServiceMonitoringTab('near')}
                    className={`px-3.5 py-2 rounded-xl font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      serviceMonitoringTab === 'near'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                    }`}
                    id="menu-near-service"
                  >
                    <span>🟡 Mendekati Servis</span>
                    <span className="px-1.5 py-0.5 bg-slate-950/20 rounded-md text-[10px]">{nearServiceUnits.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceMonitoringTab('overdue')}
                    className={`px-3.5 py-2 rounded-xl font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      serviceMonitoringTab === 'overdue'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                    }`}
                    id="menu-overdue-service"
                  >
                    <span>🔴 Terlewat Servis</span>
                    <span className="px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">{overdueServiceUnits.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceMonitoringTab('scheduled')}
                    className={`px-3.5 py-2 rounded-xl font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      serviceMonitoringTab === 'scheduled'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                    }`}
                    id="menu-scheduled-service"
                  >
                    <span>🔵 Terschedule</span>
                    <span className="px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">{scheduledServiceBookings.length}</span>
                  </button>
                </div>
              </div>

              {/* Modal Content Area */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {/* Tab 1: Unit Mendekati Waktu Servis */}
                {serviceMonitoringTab === 'near' && (
                  <div className="space-y-3" id="tab-near-service-content">
                    {nearServiceUnits.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <ShieldCheck size={24} className="text-emerald-500 mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase text-slate-700">Tidak ada unit mendekati waktu servis</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Semua unit armada memiliki selisih HM yang aman di bawah interval servis.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {nearServiceUnits.map(u => {
                          const elapsed = u.currentHm - u.lastServiceHm;
                          const remaining = u.serviceInterval - elapsed;
                          const pct = Math.min(100, Math.round((elapsed / u.serviceInterval) * 100));

                          return (
                            <div key={`near-${u.id}`} className="bg-amber-50/30 border border-amber-200 rounded-xl p-3.5 space-y-3 hover:border-amber-400 transition-all shadow-3xs">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-extrabold text-slate-900">{u.code}</span>
                                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md uppercase border border-amber-200">
                                      Sisa {remaining} HM
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{u.name} &bull; {u.category}</p>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-mono text-slate-600">
                                  <span>HM Saat ini: <strong>{u.currentHm}</strong></span>
                                  <span>Target Servis: <strong>{u.lastServiceHm + u.serviceInterval} HM</strong></span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                  <span>Servis Terakhir: {u.lastServiceHm} HM</span>
                                  <span>Interval: {u.serviceInterval} HM ({pct}%)</span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setIsScheduleServiceModalOpen(false);
                                  onQuickBook(u);
                                }}
                                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                              >
                                <Wrench size={14} />
                                <span>Booking Servis Sekarang</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Terlewat Servis */}
                {serviceMonitoringTab === 'overdue' && (
                  <div className="space-y-3" id="tab-overdue-service-content">
                    {overdueServiceUnits.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <ShieldCheck size={24} className="text-emerald-500 mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase text-slate-700">Tidak ada unit terlewat servis</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Semua unit dirawat tepat waktu sesuai standar maintenance.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {overdueServiceUnits.map(u => {
                          const elapsed = u.currentHm - u.lastServiceHm;
                          const overdueHm = elapsed - u.serviceInterval;

                          return (
                            <div key={`overdue-${u.id}`} className="bg-rose-50/40 border border-rose-200 rounded-xl p-3.5 space-y-3 hover:border-rose-400 transition-all shadow-3xs">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-extrabold text-slate-900">{u.code}</span>
                                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-md uppercase border border-rose-300">
                                      Terlewat +{overdueHm} HM
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{u.name} &bull; {u.category}</p>
                                </div>
                              </div>

                              <div className="bg-rose-100/50 p-2.5 rounded-lg border border-rose-200/60 text-[11px] text-rose-900 font-mono space-y-1">
                                <div className="flex justify-between">
                                  <span>HM Terkini:</span>
                                  <strong>{u.currentHm} HM</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Servis Terakhir:</span>
                                  <span>{u.lastServiceHm} HM</span>
                                </div>
                                <div className="flex justify-between text-rose-700 font-bold">
                                  <span>Batas Seharusnya:</span>
                                  <span>{u.lastServiceHm + u.serviceInterval} HM</span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setIsScheduleServiceModalOpen(false);
                                  onQuickBook(u);
                                }}
                                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                              >
                                <AlertTriangle size={14} />
                                <span>Jadwalkan Servis Segera</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Terschedule */}
                {serviceMonitoringTab === 'scheduled' && (
                  <div className="space-y-3" id="tab-scheduled-service-content">
                    {scheduledServiceBookings.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <Clock size={24} className="text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase text-slate-700">Belum ada booking terschedule</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Semua antrean workshop telah selesai dikerjakan.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {scheduledServiceBookings.map(b => (
                          <div key={`sched-${b.id}`} className="bg-blue-50/30 border border-blue-200 rounded-xl p-3.5 space-y-3 hover:border-blue-400 transition-all shadow-3xs">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-extrabold text-slate-900">{b.unitCode}</span>
                                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md uppercase border ${
                                    b.status === 'In Progress' 
                                      ? 'bg-amber-100 text-amber-800 border-amber-300' 
                                      : 'bg-blue-100 text-blue-800 border-blue-300'
                                  }`}>
                                    WO: {b.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{b.serviceType}</p>
                              </div>
                            </div>

                            <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 text-[11px] space-y-1 font-mono text-slate-700">
                              <div className="flex justify-between">
                                <span className="text-slate-400">ID Booking:</span>
                                <strong>#{b.id}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Mekanik:</span>
                                <span className="font-semibold text-slate-800">{b.mechanicName || 'Belum Di-assign'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Jadwal:</span>
                                <span>{b.bookingDate}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setIsScheduleServiceModalOpen(false);
                                onNavigate('bookings');
                              }}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                            >
                              <ArrowRight size={14} />
                              <span>Kelola Booking Bengkel</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  Total Unit Perlu Perhatian: <strong>{nearServiceUnits.length + overdueServiceUnits.length} Unit</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsScheduleServiceModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold font-mono rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrik Indikator Kinerja (MTTR, MTBF, MA, PA) */}
      <div className="bg-white text-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-md space-y-4" id="fleet-kpi-metrics-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-2">
                Key Performance Indicators (KPI)
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Pengukuran real-time keandalan perbaikan (MTTR), durasi antar kerusakan (MTBF), serta ketersediaan mekanis (MA) &amp; fisik (PA). Klik kartu untuk detail monitoring.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDispatchModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase font-mono rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={14} />
            <span>Catat Jam Operasi Keluar Unit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MTTR Card */}
          <div 
            onClick={() => setActiveKpiModal('mttr')}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-white hover:shadow-md transition-all cursor-pointer group space-y-3"
            id="kpi-card-mttr"
          >
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="font-mono uppercase text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">MTTR (Mean Time To Repair)</span>
              <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md font-mono">Std: &lt; 4.0 Jam</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-amber-600 group-hover:text-amber-700 transition-colors">
                {calculatedKpis.mttrHours}
              </span>
              <span className="text-xs font-mono text-slate-500">Jam / Perbaikan</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${calculatedKpis.mttrHours <= 4 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (calculatedKpis.mttrHours / 8) * 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/70">
              <span className="truncate">Rata-rata durasi perbaikan</span>
              <span className="text-[10px] font-bold font-mono text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                <span>Monitoring</span>
                <ChevronRight size={12} />
              </span>
            </div>
          </div>

          {/* MTBF Card */}
          <div 
            onClick={() => setActiveKpiModal('mtbf')}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-white hover:shadow-md transition-all cursor-pointer group space-y-3"
            id="kpi-card-mtbf"
          >
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="font-mono uppercase text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">MTBF (Mean Time Between Failures)</span>
              <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md font-mono">Std: &gt; 100 Jam</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                {calculatedKpis.mtbfHours}
              </span>
              <span className="text-xs font-mono text-slate-500">Jam Op / Breakdown</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500"
                style={{ width: `${Math.min(100, (calculatedKpis.mtbfHours / 200) * 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/70">
              <span className="truncate">Jam operasi antarkerusakan</span>
              <span className="text-[10px] font-bold font-mono text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                <span>Monitoring</span>
                <ChevronRight size={12} />
              </span>
            </div>
          </div>

          {/* MA Card */}
          <div 
            onClick={() => setActiveKpiModal('ma')}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-white hover:shadow-md transition-all cursor-pointer group space-y-3"
            id="kpi-card-ma"
          >
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="font-mono uppercase text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">MA (Mechanical Availability)</span>
              <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md font-mono">Target: &gt; 90%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-blue-600 group-hover:text-blue-700 transition-colors">
                {calculatedKpis.mechanicalAvailability}%
              </span>
              <span className="text-xs font-mono text-slate-500">Jam Op / (Op + Repair)</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${calculatedKpis.mechanicalAvailability >= 90 ? 'bg-blue-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, calculatedKpis.mechanicalAvailability)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/70">
              <span className="truncate">Kesiapan mekanis armada</span>
              <span className="text-[10px] font-bold font-mono text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                <span>Monitoring</span>
                <ChevronRight size={12} />
              </span>
            </div>
          </div>

          {/* PA Card */}
          <div 
            onClick={() => setActiveKpiModal('pa')}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-white hover:shadow-md transition-all cursor-pointer group space-y-3"
            id="kpi-card-pa"
          >
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="font-mono uppercase text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">PA (Physical Availability)</span>
              <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md font-mono">Target: &gt; 92%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-teal-600 group-hover:text-teal-700 transition-colors">
                {calculatedKpis.physicalAvailability}%
              </span>
              <span className="text-xs font-mono text-slate-500">Kesiapan Fisik Total</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${calculatedKpis.physicalAvailability >= 92 ? 'bg-teal-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, calculatedKpis.physicalAvailability)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/70">
              <span className="truncate">Kesiapan fisik kalender</span>
              <span className="text-[10px] font-bold font-mono text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                <span>Monitoring</span>
                <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Interaktif Monitoring KPI (MTTR, MTBF, MA, PA) */}
      {activeKpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden" id="kpi-monitoring-modal-panel">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl font-bold shadow-xs">
                  <Activity size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold font-mono uppercase tracking-wider text-white">
                      Monitoring KPI {activeKpiModal.toUpperCase()}
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded-md border border-emerald-500/40">
                      Real-Time Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Detail kalkulasi parameter input WO breakdown, update HM jam kerja unit, dan MOHH kalender.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Period Filter Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Periode:</span>
                  <select
                    value={kpiPeriod}
                    onChange={(e: any) => setKpiPeriod(e.target.value)}
                    className="bg-transparent text-white font-bold font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="7d" className="bg-slate-900 text-white">7 Hari (Mingguan)</option>
                    <option value="30d" className="bg-slate-900 text-white">30 Hari (Bulanan - MOHH 720 Jam)</option>
                    <option value="365d" className="bg-slate-900 text-white">365 Hari (Tahunan - MOHH 8760 Jam)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveKpiModal(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* KPI Tabs Header Bar */}
            <div className="px-5 pt-3 pb-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveKpiModal('mttr')}
                  className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                    activeKpiModal === 'mttr'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  id="tab-kpi-mttr"
                >
                  <span>MTTR</span>
                  <span className="px-1.5 py-0.5 bg-slate-950/15 rounded-md text-[10px]">{calculatedKpis.mttrHours} Jam</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveKpiModal('mtbf')}
                  className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                    activeKpiModal === 'mtbf'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  id="tab-kpi-mtbf"
                >
                  <span>MTBF</span>
                  <span className="px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">{calculatedKpis.mtbfHours} Jam</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveKpiModal('ma')}
                  className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                    activeKpiModal === 'ma'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  id="tab-kpi-ma"
                >
                  <span>MA (%)</span>
                  <span className="px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">{calculatedKpis.mechanicalAvailability}%</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveKpiModal('pa')}
                  className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                    activeKpiModal === 'pa'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  id="tab-kpi-pa"
                >
                  <span>PA (%)</span>
                  <span className="px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">{calculatedKpis.physicalAvailability}%</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
              {/* Formula & Parameters Breakdown Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
                      <Gauge size={16} />
                    </div>
                    <h4 className="text-xs font-extrabold font-mono uppercase text-slate-900">
                      Rumus &amp; Parameter Kalkulasi Active ({activeKpiModal.toUpperCase()})
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    Standard Target: {
                      activeKpiModal === 'mttr' ? '< 4.0 Jam' :
                      activeKpiModal === 'mtbf' ? '> 100 Jam' :
                      activeKpiModal === 'ma' ? '> 90%' : '> 92%'
                    }
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
                  {/* Rumus Formula */}
                  <div className="bg-slate-900 text-white p-3 rounded-xl space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
                    <span className="text-[10px] text-emerald-400 font-bold block uppercase">RUMUS FORMULA</span>
                    <div className="text-xs font-bold leading-snug">
                      {activeKpiModal === 'mttr' && 'MTTR = Jam Breakdown (WO) / Total Breakdown Event'}
                      {activeKpiModal === 'mtbf' && 'MTBF = Working Hours (HM) / Total Breakdown Event'}
                      {activeKpiModal === 'ma' && 'MA = WH / (WH + Jam Breakdown) x 100%'}
                      {activeKpiModal === 'pa' && 'PA = (MOHH - Jam Breakdown) / MOHH x 100%'}
                    </div>
                  </div>

                  {/* MOHH Parameter */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">1. MOHH (KALENDER)</span>
                    <div className="text-sm font-extrabold text-slate-900">{calculatedKpis.totalMohh.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">Jam</span></div>
                    <span className="text-[10px] text-slate-500 font-sans block">{units.length} Unit x {calculatedKpis.daysInPeriod * 24} Jam</span>
                  </div>

                  {/* Working Hours (Update HM) */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">2. WORKING HOURS (HM)</span>
                    <div className="text-sm font-extrabold text-blue-600">{calculatedKpis.totalWorkingHoursHM.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">Jam</span></div>
                    <span className="text-[10px] text-slate-500 font-sans block">Dari Update HM Logging</span>
                  </div>

                  {/* Breakdown Hours (WO) */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">3. JAM BREAKDOWN (WO)</span>
                    <div className="text-sm font-extrabold text-rose-600">{calculatedKpis.totalDowntimeHours.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">Jam</span></div>
                    <span className="text-[10px] text-slate-500 font-sans block">Dari Data WO Perbaikan</span>
                  </div>

                  {/* Standby Hours */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">4. JAM STANDBY</span>
                    <div className="text-sm font-extrabold text-amber-600">{calculatedKpis.standbyHours.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">Jam</span></div>
                    <span className="text-[10px] text-slate-500 font-sans block">MOHH - WH - Breakdown</span>
                  </div>
                </div>
              </div>

              {/* Table Monitoring Unit Per Parameter */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden space-y-3 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold font-mono uppercase text-slate-900">
                      Rincian Indikator {activeKpiModal.toUpperCase()} Per Unit Armada
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {units.length} Unit Total
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search Input */}
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari kode unit..."
                        value={kpiSearchTerm}
                        onChange={e => setKpiSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 w-36 sm:w-48 font-mono"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={kpiCategoryFilter}
                      onChange={e => setKpiCategoryFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Semua Kategori</option>
                      <option value="Excavator">Excavator</option>
                      <option value="Bulldozer">Bulldozer</option>
                      <option value="Dump Truck">Dump Truck</option>
                      <option value="Wheel Loader">Wheel Loader</option>
                      <option value="Light Vehicle">Light Vehicle</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="p-3">Kode &amp; Nama Unit</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Jam Kerja (HM)</th>
                        <th className="p-3 text-right">Jam Breakdown (WO)</th>
                        <th className="p-3 text-center">Event BD</th>
                        <th className="p-3 text-right font-black text-slate-900 bg-slate-100/80">
                          Nilai {activeKpiModal.toUpperCase()}
                        </th>
                        <th className="p-3 text-center">Evaluasi Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {getUnitKpiDetails().map(({ unit, unitWorkingHours, unitDowntime, unitBreakdownEvents, mttrVal, mtbfVal, maVal, paVal }) => {
                        const activeVal = activeKpiModal === 'mttr' ? mttrVal :
                                          activeKpiModal === 'mtbf' ? mtbfVal :
                                          activeKpiModal === 'ma' ? maVal : paVal;

                        const isSuccess = 
                          activeKpiModal === 'mttr' ? (activeVal <= 4.0 || activeVal === 0) :
                          activeKpiModal === 'mtbf' ? activeVal >= 100.0 :
                          activeKpiModal === 'ma' ? activeVal >= 90.0 : activeVal >= 92.0;

                        return (
                          <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <div className="font-extrabold text-slate-900">{unit.code}</div>
                              <div className="text-[10px] text-slate-500 font-sans font-medium truncate max-w-[150px]">{unit.name}</div>
                            </td>
                            <td className="p-3 text-slate-600">{unit.category}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                unit.status === 'Operating' ? 'bg-emerald-100 text-emerald-800' :
                                unit.status === 'Breakdown' ? 'bg-rose-100 text-rose-800' :
                                unit.status === 'Under Maintenance' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {unit.status}
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-blue-600">{unitWorkingHours} Jam</td>
                            <td className="p-3 text-right font-bold text-rose-600">{unitDowntime} Jam</td>
                            <td className="p-3 text-center font-bold text-slate-700">{unitBreakdownEvents}</td>
                            <td className="p-3 text-right font-black text-slate-900 bg-slate-50 text-sm">
                              {activeKpiModal === 'mttr' || activeKpiModal === 'mtbf' ? `${activeVal} Jam` : `${activeVal}%`}
                            </td>
                            <td className="p-3 text-center">
                              {isSuccess ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
                                  <ShieldCheck size={11} />
                                  <span>Sesuai Target</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full border border-rose-200">
                                  <AlertTriangle size={11} />
                                  <span>Perlu Evaluasi</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Formula Aktif: <strong>WO Input + HM Update + MOHH Kalender ({kpiPeriod})</strong>
              </span>
              <button
                type="button"
                onClick={() => setActiveKpiModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono rounded-xl transition-all cursor-pointer"
              >
                Tutup Monitoring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visualisasi Data Tren 6 Bulan (Recharts) */}
      <DashboardCharts />

      {/* Panel Analisis Kinerja & Kapasitas Bengkel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="workshop-analytics-section">
        {/* Repair Hours vs Available Hours */}
        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <Gauge size={16} className="text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
                RASIO JAM PERBAIKAN VS JAM TERSEDIA
              </h3>
            </div>
            <span className="text-[9px] font-mono font-bold bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded-md">BULAN INI</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end font-mono">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">JAM PERBAIKAN</span>
                <span className="text-xl font-black text-blue-600">{stats.totalRepairHours} <span className="text-xs text-gray-500 font-normal">Hrs</span></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">KAPASITAS TERSEDIA</span>
                <span className="text-xl font-black text-slate-800">{stats.totalAvailableHours} <span className="text-xs text-gray-500 font-normal">Hrs</span></span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-3 border border-gray-250 rounded-full overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-500 ${
                  (stats.totalRepairHours / (stats.totalAvailableHours || 1)) > 0.85 
                    ? 'bg-rose-500' 
                    : (stats.totalRepairHours / (stats.totalAvailableHours || 1)) > 0.5 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.round((stats.totalRepairHours / (stats.totalAvailableHours || 1)) * 100))}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              <span>Beban Kerja: {Math.round((stats.totalRepairHours / (stats.totalAvailableHours || 1)) * 100)}%</span>
              <span>Sisa Slot: {Math.max(0, stats.totalAvailableHours - stats.totalRepairHours)} Jam</span>
            </div>
          </div>
        </div>

        {/* Units Entering Workshop This Month */}
        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <CalendarCheck2 size={16} className="text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
                UNIT MASUK WORKSHOP BULAN INI
              </h3>
            </div>
            <span className="text-[9px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-md">ESTIMASI KUNJUNGAN</span>
          </div>

          <div className="flex items-center justify-between gap-6 py-1">
            <div className="space-y-1 shrink-0">
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">TOTAL TRANSAKSI WORK ORDER</span>
              <div className="text-3xl font-mono font-black text-indigo-600 flex items-baseline gap-1.5">
                {stats.unitsEnteredThisMonth}
                <span className="text-xs text-gray-400 font-normal uppercase tracking-wider font-sans">Kunjungan</span>
              </div>
            </div>
            
            {/* Visual breakdown indicator block */}
            <div className="flex-1 bg-slate-50 border border-gray-200 p-3 flex flex-col justify-center space-y-1.5 rounded-xl">
              <div className="flex justify-between text-[10px] text-slate-600 font-mono font-bold uppercase">
                <span>Rasio Kunjungan/Unit:</span>
                <span className="text-indigo-600 font-black">{Math.round((stats.unitsEnteredThisMonth / (stats.totalUnits || 1)) * 100)}%</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-normal uppercase">
                Grafik antrean masuk terpantau kondusif dengan sisa kapasitas slot perbaikan memadai.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Workshop Bays Monitoring */}
      <div className="space-y-3" id="workshop-bays-section">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
            <Wrench size={14} className="text-blue-500" />
            PEMETAAN WORKSHOP BAY (TOTAL: {totalBays} SLOT)
          </h2>
          <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">Dynamic Allocation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" id="bays-grid">
          {Array.from({ length: totalBays }).map((_, index) => {
            const bayNumber = index + 1;
            // Find an in-progress booking for this bay (dynamic allocation)
            const activeInBay = bookings.filter(b => b.status === 'In Progress')[index];

            return (
              <div 
                key={bayNumber} 
                className={`p-3 border rounded-xl flex flex-col justify-between h-28 transition-all shadow-3xs ${
                  activeInBay 
                    ? 'bg-blue-50/40 border-blue-300 hover:border-blue-600' 
                    : 'bg-emerald-50/10 border-dashed border-gray-300 hover:border-emerald-500'
                }`}
                id={`bay-card-${bayNumber}`}
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                  <span className="font-mono font-black text-xs text-slate-800">BAY 0{bayNumber}</span>
                  <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-md border ${
                    activeInBay 
                      ? 'bg-blue-100 border-blue-200 text-blue-800' 
                      : 'bg-emerald-100 border-emerald-200 text-emerald-800'
                  }`}>
                    {activeInBay ? 'TERISI' : 'KOSONG'}
                  </span>
                </div>

                {activeInBay ? (
                  <div className="mt-2 space-y-1 text-[10px] flex-1 flex flex-col justify-between">
                    <div>
                      <strong className="text-blue-800 font-mono text-[11px] block truncate">{activeInBay.unitCode}</strong>
                      <span className="text-gray-500 block truncate leading-tight uppercase font-medium">{activeInBay.serviceType}</span>
                    </div>
                    <div className="text-[9px] text-gray-400 font-mono flex items-center justify-between">
                      <span className="truncate uppercase font-bold text-gray-600">👤 {activeInBay.mechanicName.split(' ')[0]}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex-1 flex flex-col items-center justify-center text-gray-400 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70">SLOT TERSEDIA</span>
                    <span className="text-[9px] text-gray-400 font-mono">Siap Digunakan</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Alerts & Actions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="alerts-and-actions">
        {/* Left: Urgent Maintenance Reminders */}
        <div className="lg:col-span-8 space-y-6">
          {/* Periodic Service & Oil Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden" id="service-alerts-card">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Clock className="text-amber-500" size={16} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Pengingat Otomatis & Jadwal Servis Terdekat
                </h2>
              </div>
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">CALCULATED VIA HM/KM</span>
            </div>

            <div className="p-4 divide-y divide-gray-100">
              {serviceOverdueUnits.length === 0 && oilOverdueUnits.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-200 w-fit mx-auto mb-2">
                    <CalendarCheck2 size={20} />
                  </div>
                  <p className="font-bold text-xs uppercase tracking-wider text-emerald-700">Semua unit dalam kondisi aman!</p>
                  <p className="text-[11px] text-gray-400 mt-1">Belum ada unit yang melewati batas service interval atau ganti oli.</p>
                </div>
              ) : (
                <>
                  {/* Service Overdue Sections */}
                  {serviceOverdueUnits.map(u => {
                    const elapsed = u.currentHm - u.lastServiceHm;
                    return (
                      <div key={`srv-${u.id}`} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-700 font-mono border border-rose-200 rounded-md uppercase">OVERDUE SERVICE</span>
                            <span className="text-sm font-bold text-gray-900 font-mono">{u.code}</span>
                            <span className="text-xs text-gray-500">({u.name})</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            HM saat ini: <strong className="font-mono">{u.currentHm}</strong> | Servis terakhir pada: <strong className="font-mono">{u.lastServiceHm} HM</strong> (Selisih: <strong className="text-rose-600 font-mono">{elapsed} HM</strong> / Batas: {u.serviceInterval} HM)
                          </p>
                        </div>
                        <button 
                          onClick={() => onQuickBook(u)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1A1C1E] hover:bg-[#2C2E33] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-center shadow-2xs"
                        >
                          Book Servis <ArrowRight size={12} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Oil Overdue Sections */}
                  {oilOverdueUnits.filter(u => !serviceOverdueUnits.includes(u)).map(u => {
                    const elapsed = u.currentHm - u.lastOilChangeHm;
                    return (
                      <div key={`oil-${u.id}`} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 font-mono border border-amber-200 rounded-md uppercase">GANTI OLI SEGERA</span>
                            <span className="text-sm font-bold text-gray-900 font-mono">{u.code}</span>
                            <span className="text-xs text-gray-500">({u.name})</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            HM saat ini: <strong className="font-mono">{u.currentHm}</strong> | Ganti oli terakhir pada: <strong className="font-mono">{u.lastOilChangeHm} HM</strong> (Selisih: <strong className="text-amber-600 font-mono">{elapsed} HM</strong> / Batas: {u.oilChangeInterval} HM)
                          </p>
                        </div>
                        <button 
                          onClick={() => onQuickBook(u)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1A1C1E] hover:bg-[#2C2E33] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-center shadow-2xs"
                        >
                          Book Ganti Oli <ArrowRight size={12} />
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Low Stock Warehouse Warnings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden" id="warehouse-alerts-card">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Package className="text-[#1A1C1E]" size={16} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Stok Suku Cadang Kritis (Gudang Utama)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">CONNECTED</span>
            </div>

            <div className="p-4 divide-y divide-gray-100">
              {lowStockParts.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Stok semua suku cadang aman!</p>
                  <p className="text-[11px] text-gray-400 mt-1">Semua suku cadang berada di atas batas minimum stok.</p>
                </div>
              ) : (
                lowStockParts.map(p => (
                  <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">{p.name}</span>
                        <span className="text-[11px] text-gray-400 font-mono">({p.code})</span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Batas Minimum Stok: <strong className="font-mono text-gray-700">{p.minStock} {p.unit}</strong> | Estimasi Harga: <strong className="text-gray-700 font-mono">Rp {p.price.toLocaleString('id-ID')}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-bold text-rose-700 font-mono bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg inline-block">
                          {p.stock} / {p.minStock} {p.unit}
                        </div>
                      </div>
                      <button
                        onClick={() => onQuickRestock(p)}
                        className="px-2.5 py-1.5 text-[10px] border border-gray-300 hover:border-gray-800 hover:bg-gray-50 rounded-lg font-bold uppercase transition-all cursor-pointer shadow-3xs"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Active Workshop Bookings Summary & UIO Breakdown list */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Booking Tracker */}
          <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs space-y-4" id="active-bookings-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Pekerjaan Bengkel Aktif</h3>
              <button 
                onClick={() => onNavigate('bookings')}
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
              >
                Lihat Semua <ArrowRight size={10} />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeBookingsList.length === 0 ? (
                <div className="py-4 text-center text-gray-400 text-xs font-mono bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                  NO ACTIVE BOOKINGS FOUND
                </div>
              ) : (
                activeBookingsList.slice(0, 5).map(b => (
                  <button 
                    key={b.id} 
                    onClick={() => setSelectedTimelineBooking(b)}
                    className="w-full text-left p-3 bg-gray-50 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all rounded-xl space-y-2 cursor-pointer block group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 font-mono">#{b.id}</span>
                      <div className="flex gap-1.5 items-center">
                        <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-md border ${
                          b.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                        } uppercase`}>
                          WO: {b.status}
                        </span>
                        <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-md border ${
                          b.progressStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          b.progressStatus === 'Ready for Pickup' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                          b.progressStatus === 'On Repair' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          b.progressStatus === 'Waiting for Parts' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        } uppercase`}>
                          {b.progressStatus || 'ADMIN'}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-800 space-y-1 font-sans">
                      <div className="font-bold text-gray-900 font-mono flex items-center justify-between">
                        <span className="group-hover:text-blue-600 transition-colors">{b.unitCode} &mdash; {b.serviceType}</span>
                        <span className="text-[10px] text-blue-600 font-sans font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-block">Lacak Timeline &rarr;</span>
                      </div>
                      <div className="text-gray-500 text-[10px] flex justify-between uppercase">
                        <span>LOKASI: {b.workshopName}</span>
                        <span>MEKANIK: {b.mechanicName}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Breakdown Unit List Quick Tracker */}
          <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs space-y-4" id="quick-breakdown-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Status Breakdown Saat Ini</h3>
              <button 
                onClick={() => onNavigate('breakdowns')}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
              >
                Atasi Defek <ArrowRight size={10} />
              </button>
            </div>

            <div className="space-y-2.5">
              {units.filter(u => u.status === 'Breakdown' || u.status === 'Under Maintenance').length === 0 ? (
                <div className="py-4 text-center text-gray-400 text-xs font-mono bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                  NO DEFECTIVE UNITS RECOGNIZED
                </div>
              ) : (
                units.filter(u => u.status === 'Breakdown' || u.status === 'Under Maintenance').slice(0, 4).map(u => (
                  <div key={u.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-gray-900 font-mono">{u.code}</span>
                      <p className="text-[11px] text-gray-500 leading-tight">{u.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">HM: {u.currentHm}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border font-mono uppercase ${
                      u.status === 'Breakdown' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {u.status === 'Breakdown' ? 'BREAKDOWN' : 'SERVIS'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE POPUP MODAL */}
      {selectedTimelineBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <span className="text-[9px] font-bold text-gray-400 font-mono tracking-widest uppercase">WORK ORDER PROGRESS TIMELINE</span>
                <h3 className="text-sm font-black font-mono text-gray-900 uppercase">WO #{selectedTimelineBooking.id} &mdash; {selectedTimelineBooking.unitCode}</h3>
                <p className="text-[10px] text-gray-500 font-mono uppercase mt-0.5">Jenis Servis: <strong>{selectedTimelineBooking.serviceType}</strong></p>
              </div>
              <button 
                onClick={() => setSelectedTimelineBooking(null)}
                className="p-1.5 text-gray-400 hover:text-gray-900 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-200 p-3 text-[11px] font-mono text-gray-700 rounded-xl">
              <div>
                <span className="text-gray-400 font-bold block text-[9px] uppercase">Status Administrasi</span>
                <span className="font-bold uppercase text-gray-900">{selectedTimelineBooking.status}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[9px] uppercase">Status Lapangan</span>
                <span className="font-bold uppercase text-gray-900">{selectedTimelineBooking.progressStatus || 'ADMIN PROCESSING'}</span>
              </div>
              <div className="mt-1">
                <span className="text-gray-400 font-bold block text-[9px] uppercase">Mekanik Bengkel</span>
                <span className="font-bold uppercase text-gray-900">{selectedTimelineBooking.mechanicName || '-'}</span>
              </div>
              <div className="mt-1">
                <span className="text-gray-400 font-bold block text-[9px] uppercase">Lokasi Workshop</span>
                <span className="font-bold uppercase text-gray-900">{selectedTimelineBooking.workshopName || '-'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity size={12} /> Log Progress Pekerjaan (Timeline)
              </h4>

              {(!selectedTimelineBooking.progressLogs || selectedTimelineBooking.progressLogs.length === 0) ? (
                <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 text-xs text-gray-400 font-mono uppercase rounded-xl">
                  Belum ada log progress terdokumentasi.
                </div>
              ) : (
                <div className="relative pl-5 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-gray-200 space-y-4">
                  {selectedTimelineBooking.progressLogs.map((log) => (
                    <div key={log.id} className="relative text-[11px] space-y-0.5">
                      {/* dot */}
                      <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full"></div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] flex-wrap font-mono">
                        <span className="text-gray-400 font-bold">{log.timestamp}</span>
                        <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1 text-[9px] rounded-md uppercase">{log.status}</span>
                        <span className="text-gray-400">oleh: <strong className="text-gray-700 uppercase font-bold">{log.updatedBy}</strong></span>
                      </div>
                      <p className="text-gray-800 uppercase font-semibold pl-2 py-1 bg-gray-50 border border-gray-100 rounded-lg">
                        "{log.notes}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button 
                onClick={() => setSelectedTimelineBooking(null)}
                className="bg-[#1A1C1E] hover:bg-[#2C2E33] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                Tutup Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAPORAN HM & KM REPORT PDF MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Printer className="text-slate-800" size={18} />
                  <h3 className="text-base font-black font-mono text-slate-900 uppercase">Laporan Pencapaian HM & KM Armada</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">Generasi laporan log fleksibel berdasarkan rentang tanggal dan filter unit, dapat diekspor/dicetak ke PDF.</p>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 cursor-pointer rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <div>
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">Dari Tanggal</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">Filter Unit Armada</label>
                <select
                  value={reportUnitFilter}
                  onChange={(e) => setReportUnitFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Unit Armada</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.code} - {u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleGenerateReport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase font-mono tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw size={14} />
                <span>Filter Laporan</span>
              </button>

              <button
                onClick={handlePrintPDF}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase font-mono tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer size={14} />
                <span>Cetak / Save PDF</span>
              </button>
            </div>

            {/* Print Area Preview */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-inner space-y-4 print:border-none print:shadow-none" id="printable-report">
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-black font-mono text-slate-900 uppercase tracking-tight">LAPORAN DOKUMENTASI HM & KM ARMADA UIO</h1>
                  <p className="text-xs font-mono text-slate-500 uppercase mt-0.5">Rentang Tanggal: {reportStartDate} s/d {reportEndDate}</p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400">
                  <span>Sistem FleetCare Pro</span>
                  <br />
                  <span>Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              {!reportPreviewData || reportPreviewData.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-mono">
                  Tidak ada catatan log HM/KM pada kriteria filter tanggal ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 uppercase">
                        <th className="py-2.5 px-3">Waktu Sync</th>
                        <th className="py-2.5 px-3">Kode Unit</th>
                        <th className="py-2.5 px-3">Hour Meter (HM)</th>
                        <th className="py-2.5 px-3">Kilometer (KM)</th>
                        <th className="py-2.5 px-3">Petugas / Operator</th>
                        <th className="py-2.5 px-3">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reportPreviewData.map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-500">{log.updatedAt}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{log.unitCode}</td>
                          <td className="py-2 px-3 font-bold text-emerald-700">{log.hmValue} HM</td>
                          <td className="py-2 px-3 font-bold text-blue-700">{log.kmValue || 0} KM</td>
                          <td className="py-2 px-3 text-slate-700">{log.updatedBy}</td>
                          <td className="py-2 px-3 text-slate-500 italic">{log.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button 
                onClick={() => setShowReportModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Jam Keluar Unit / Operating Hours Dispatch */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <LogOut className="text-emerald-600" size={20} />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase font-mono">
                  Pencatatan Jam Keluar Unit & Jam Operasi
                </h3>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">
                  Pilih Unit Armada
                </label>
                <select
                  value={dispatchUnitId}
                  onChange={(e) => setDispatchUnitId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Pilih Unit --</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.code} - {u.name} (HM: {u.currentHm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">
                  Estimasi Jam Operasi Shift Ini (Jam)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={dispatchOpHours}
                  onChange={(e) => setDispatchOpHours(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  placeholder="Mis. 8 Jam / 12 Jam..."
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Jam operasi ini diakumulasikan untuk perhitungan statistik MTTR, MTBF, MA & PA.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">
                  Nama Operator / Driver Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={dispatchOperator}
                  onChange={(e) => setDispatchOperator(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  placeholder="Masukkan nama operator / driver..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">
                  Catatan / Lokasi Pit / Shift
                </label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Mis. Shift 1 - Pit Barat, kondisi unit fit..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold uppercase font-mono cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispatch}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase font-mono shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <LogOut size={14} />
                  <span>{isSubmittingDispatch ? 'Menyimpan...' : 'Simpan Jam Keluar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
