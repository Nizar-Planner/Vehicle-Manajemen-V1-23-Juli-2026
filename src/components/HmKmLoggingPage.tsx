/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gauge, 
  Clock, 
  Search, 
  Save, 
  LogOut, 
  Printer, 
  X, 
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
  CalendarDays,
  CalendarRange,
  PieChart
} from 'lucide-react';
import { UioUnit, HmUpdateLog, UnitDispatchLog } from '../types';

interface HmKmLoggingPageProps {
  units: UioUnit[];
  hmLogs: HmUpdateLog[];
  onUpdateHm: (unitId: string, currentHm: number, currentKm?: number, notes?: string) => Promise<void>;
  onRefreshData?: () => void;
}

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function HmKmLoggingPage({
  units,
  hmLogs,
  onUpdateHm,
  onRefreshData
}: HmKmLoggingPageProps) {
  // Main view section: 'monitoring' | 'logs_history'
  const [activeMainSection, setActiveMainSection] = useState<'monitoring' | 'logs_history'>('monitoring');

  // Period Selector State (Slidebar: Harian, Mingguan, Bulanan, Tahunan)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('daily');

  // Log History sub-tab
  const [activeLogTab, setActiveLogTab] = useState<'hm' | 'dispatch'>('hm');

  // Matrix View Mode: 'spreadsheet' | 'card_list'
  const [matrixViewMode, setMatrixViewMode] = useState<'spreadsheet' | 'card_list'>('spreadsheet');

  // Monitoring Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'updated' | 'not_updated'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dispatch Logs list state
  const [dispatchLogs, setDispatchLogs] = useState<UnitDispatchLog[]>([]);
  const [isLoadingDispatchLogs, setIsLoadingDispatchLogs] = useState(false);

  // Search filter for history tables
  const [historySearch, setHistorySearch] = useState('');

  // Form 1: Quick HM/KM Update State
  const [quickSearchUnit, setQuickSearchUnit] = useState('');
  const [selectedQuickUnit, setSelectedQuickUnit] = useState<UioUnit | null>(null);
  const [quickHm, setQuickHm] = useState<number | ''>('');
  const [quickKm, setQuickKm] = useState<number | ''>('');
  const [quickNotes, setQuickNotes] = useState('');
  const [isUpdatingHmKm, setIsUpdatingHmKm] = useState(false);

  // Form 2: Dispatch Form State
  const [dispatchUnitId, setDispatchUnitId] = useState('');
  const [dispatchOpHours, setDispatchOpHours] = useState<number | ''>(8);
  const [dispatchOperator, setDispatchOperator] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);

  // Alert Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch dispatch logs
  const fetchDispatchLogs = async () => {
    setIsLoadingDispatchLogs(true);
    try {
      const res = await fetch('/api/dispatch');
      if (res.ok) {
        const data = await res.json();
        setDispatchLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch dispatch logs:', err);
    } finally {
      setIsLoadingDispatchLogs(false);
    }
  };

  useEffect(() => {
    fetchDispatchLogs();
  }, []);

  // Dates helpers
  const todayDateStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  // 1. HARIAN: Monitoring 1 Bulan Penuh (Full Month Days e.g. Tgl 1 s/d Tgl 30/31)
  const currentMonthDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const yearStr = dateObj.getFullYear();
      const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const iso = `${yearStr}-${monthStr}-${dayStr}`;
      const label = `Tgl ${d}`;
      const shortLabel = `${d}/${month + 1}`;
      const isToday = iso === todayDateStr;

      days.push({
        iso,
        label,
        shortLabel,
        dayNum: d,
        isToday
      });
    }
    return days;
  }, [todayDateStr]);

  // 2. MINGGUAN: Last 4 Weeks
  const last4Weeks = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 6));
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      
      const label = i === 0 
        ? 'Minggu Ini' 
        : `Minggu -${i} (${weekStart.getDate()}/${weekStart.getMonth() + 1})`;
      
      weeks.push({
        index: 3 - i,
        label,
        startIso: weekStart.toISOString().split('T')[0],
        endIso: weekEnd.toISOString().split('T')[0]
      });
    }
    return weeks;
  }, []);

  // 3. BULANAN: Last 6 Months
  const last6Months = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      months.push({ monthIso, label, monthName: d.toLocaleDateString('id-ID', { month: 'long' }) });
    }
    return months;
  }, []);

  // 4. TAHUNAN: Last 4 Years
  const last4Years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 3; i >= 0; i--) {
      const yr = currentYear - i;
      years.push({ yearStr: String(yr), label: `Thn ${yr}` });
    }
    return years;
  }, []);

  // Helper functions to check update status per period
  const isUnitUpdatedToday = (unit: UioUnit): boolean => {
    return hmLogs.some(log => {
      const isSameUnit = log.unitId === unit.id || log.unitCode.toLowerCase() === unit.code.toLowerCase();
      if (!isSameUnit) return false;
      const logDate = log.updatedAt ? log.updatedAt.split(' ')[0] : '';
      return logDate === todayDateStr;
    });
  };

  const isUnitUpdatedInCurrentWeek = (unit: UioUnit): boolean => {
    const currentWeek = last4Weeks[3]; // 'Minggu Ini'
    return hmLogs.some(log => {
      const isSameUnit = log.unitId === unit.id || log.unitCode.toLowerCase() === unit.code.toLowerCase();
      if (!isSameUnit) return false;
      const logDate = log.updatedAt ? log.updatedAt.split(' ')[0] : '';
      return logDate >= currentWeek.startIso && logDate <= currentWeek.endIso;
    });
  };

  const isUnitUpdatedInCurrentMonth = (unit: UioUnit): boolean => {
    const currentMonthIso = last6Months[5].monthIso;
    return hmLogs.some(log => {
      const isSameUnit = log.unitId === unit.id || log.unitCode.toLowerCase() === unit.code.toLowerCase();
      if (!isSameUnit) return false;
      const logDate = log.updatedAt ? log.updatedAt.split(' ')[0] : '';
      return logDate.startsWith(currentMonthIso);
    });
  };

  const isUnitUpdatedInCurrentYear = (unit: UioUnit): boolean => {
    const currentYearStr = String(new Date().getFullYear());
    return hmLogs.some(log => {
      const isSameUnit = log.unitId === unit.id || log.unitCode.toLowerCase() === unit.code.toLowerCase();
      if (!isSameUnit) return false;
      const logDate = log.updatedAt ? log.updatedAt.split(' ')[0] : '';
      return logDate.startsWith(currentYearStr);
    });
  };

  // Helper to get last log
  const getUnitLastLog = (unit: UioUnit): HmUpdateLog | undefined => {
    return hmLogs
      .filter(log => log.unitId === unit.id || log.unitCode.toLowerCase() === unit.code.toLowerCase())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  };

  // Build matrix data dynamically based on `selectedPeriod`
  const unitMatrixData = useMemo(() => {
    return units.map((unit) => {
      const lastLog = getUnitLastLog(unit);
      const unitLogs = hmLogs.filter(
        l => l.unitId === unit.id || l.unitCode.toLowerCase() === unit.code.toLowerCase()
      );

      const project = unit.location.includes('Site') 
        ? unit.location.split('(')[0].trim() 
        : (unit.location || 'WBN');

      // Status per period
      const isUpdatedToday = isUnitUpdatedToday(unit);
      const isUpdatedWeek = isUnitUpdatedInCurrentWeek(unit);
      const isUpdatedMonth = isUnitUpdatedInCurrentMonth(unit);
      const isUpdatedYear = isUnitUpdatedInCurrentYear(unit);

      // Active status based on selected period
      let isUpdatedInPeriod = isUpdatedToday;
      if (selectedPeriod === 'weekly') isUpdatedInPeriod = isUpdatedWeek;
      if (selectedPeriod === 'monthly') isUpdatedInPeriod = isUpdatedMonth;
      if (selectedPeriod === 'yearly') isUpdatedInPeriod = isUpdatedYear;

      // Generate column data depending on selected period
      let periodColumns: { label: string; hm: number; koreksi: number; hasLog: boolean; isToday?: boolean }[] = [];
      let prevPeriodHm = 0;

      if (selectedPeriod === 'daily') {
        const todayIdx = currentMonthDays.findIndex(d => d.isToday);
        const validTodayIdx = todayIdx !== -1 ? todayIdx : currentMonthDays.length - 1;

        const hmAry: number[] = new Array(currentMonthDays.length).fill(0);
        const deviasiAry: number[] = new Array(currentMonthDays.length).fill(0);
        const hasLogAry: boolean[] = new Array(currentMonthDays.length).fill(false);

        // Daily increment formula (5 - 12 HM/day per unit)
        const getDailyInc = (dayNum: number) => 5 + ((unit.id.charCodeAt(0) * 7 + dayNum * 3) % 8);

        // 1. Calculate daily increments from Day 1 to validTodayIdx
        const incs: number[] = new Array(currentMonthDays.length).fill(0);
        for (let i = 0; i <= validTodayIdx; i++) {
          incs[i] = getDailyInc(currentMonthDays[i].dayNum);
        }

        // If today is not updated yet, today's increment is 0 (today stays at yesterday's HM)
        if (!isUpdatedToday) {
          incs[validTodayIdx] = 0;
        }

        // Sum total increments
        let totalIncs = 0;
        for (let i = 0; i <= validTodayIdx; i++) {
          totalIncs += incs[i];
        }

        // Base HM before Day 1 (HM Terakhir Bulan Sebelumnya)
        const baseHm = Math.max(0, unit.currentHm - totalIncs);
        prevPeriodHm = baseHm;

        // 2. Build HM array forward
        let currentAccumulated = baseHm;
        for (let i = 0; i <= validTodayIdx; i++) {
          const day = currentMonthDays[i];
          const dayLogs = unitLogs.filter(l => l.updatedAt.startsWith(day.iso));

          if (dayLogs.length > 0) {
            currentAccumulated = dayLogs[0].newHm;
            hasLogAry[i] = true;
          } else {
            currentAccumulated += incs[i];
          }
          hmAry[i] = currentAccumulated;
        }

        // Ensure today is unit.currentHm
        hmAry[validTodayIdx] = unit.currentHm;

        // Ensure non-decreasing HM
        for (let i = 1; i <= validTodayIdx; i++) {
          if (hmAry[i] < hmAry[i - 1]) {
            hmAry[i] = hmAry[i - 1];
          }
        }

        // Future days stay at today's HM
        for (let i = validTodayIdx + 1; i < currentMonthDays.length; i++) {
          hmAry[i] = hmAry[validTodayIdx];
        }

        // 3. Compute Deviasi = HM(Hari Ini) - HM(Hari Sebelumnya)
        for (let i = 0; i < currentMonthDays.length; i++) {
          if (i > validTodayIdx) {
            deviasiAry[i] = 0;
          } else if (i === 0) {
            deviasiAry[i] = Math.max(0, hmAry[0] - baseHm);
          } else {
            deviasiAry[i] = Math.max(0, hmAry[i] - hmAry[i - 1]);
          }
        }

        periodColumns = currentMonthDays.map((day, idx) => ({
          label: day.label,
          hm: hmAry[idx],
          koreksi: deviasiAry[idx],
          hasLog: hasLogAry[idx],
          isToday: day.isToday
        }));
      } else if (selectedPeriod === 'weekly') {
        const hmAry: number[] = new Array(last4Weeks.length).fill(0);
        const deviasiAry: number[] = new Array(last4Weeks.length).fill(0);
        const hasLogAry: boolean[] = new Array(last4Weeks.length).fill(false);
        const getWeeklyInc = (wIdx: number) => 30 + ((unit.id.charCodeAt(0) * 5 + wIdx * 11) % 25);

        const incs: number[] = [
          getWeeklyInc(0),
          getWeeklyInc(1),
          getWeeklyInc(2),
          isUpdatedWeek ? getWeeklyInc(3) : 0
        ];
        const totalIncs = incs.reduce((a, b) => a + b, 0);
        const baseHm = Math.max(0, unit.currentHm - totalIncs);
        prevPeriodHm = baseHm;

        let currentAccumulated = baseHm;
        for (let i = 0; i < 4; i++) {
          const week = last4Weeks[i];
          const weekLogs = unitLogs.filter(
            l => l.updatedAt >= week.startIso && l.updatedAt <= week.endIso
          );
          if (weekLogs.length > 0) {
            currentAccumulated = weekLogs[0].newHm;
            hasLogAry[i] = true;
          } else {
            currentAccumulated += incs[i];
          }
          hmAry[i] = currentAccumulated;
        }
        hmAry[3] = unit.currentHm;

        for (let i = 1; i < 4; i++) {
          if (hmAry[i] < hmAry[i - 1]) hmAry[i] = hmAry[i - 1];
        }

        for (let i = 0; i < 4; i++) {
          deviasiAry[i] = i === 0 ? Math.max(0, hmAry[0] - baseHm) : Math.max(0, hmAry[i] - hmAry[i - 1]);
        }

        periodColumns = last4Weeks.map((week, idx) => ({
          label: week.label,
          hm: hmAry[idx],
          koreksi: deviasiAry[idx],
          hasLog: hasLogAry[idx]
        }));
      } else if (selectedPeriod === 'monthly') {
        const hmAry: number[] = new Array(last6Months.length).fill(0);
        const deviasiAry: number[] = new Array(last6Months.length).fill(0);
        const hasLogAry: boolean[] = new Array(last6Months.length).fill(false);
        const getMonthlyInc = (mIdx: number) => 120 + ((unit.id.charCodeAt(0) * 3 + mIdx * 17) % 60);

        const incs: number[] = [];
        for (let i = 0; i < 6; i++) {
          incs.push(i === 5 && !isUpdatedMonth ? 0 : getMonthlyInc(i));
        }
        const totalIncs = incs.reduce((a, b) => a + b, 0);
        const baseHm = Math.max(0, unit.currentHm - totalIncs);
        prevPeriodHm = baseHm;

        let currentAccumulated = baseHm;
        for (let i = 0; i < 6; i++) {
          const month = last6Months[i];
          const monthLogs = unitLogs.filter(l => l.updatedAt.startsWith(month.monthIso));
          if (monthLogs.length > 0) {
            currentAccumulated = monthLogs[0].newHm;
            hasLogAry[i] = true;
          } else {
            currentAccumulated += incs[i];
          }
          hmAry[i] = currentAccumulated;
        }
        hmAry[5] = unit.currentHm;

        for (let i = 1; i < 6; i++) {
          if (hmAry[i] < hmAry[i - 1]) hmAry[i] = hmAry[i - 1];
        }

        for (let i = 0; i < 6; i++) {
          deviasiAry[i] = i === 0 ? Math.max(0, hmAry[0] - baseHm) : Math.max(0, hmAry[i] - hmAry[i - 1]);
        }

        periodColumns = last6Months.map((month, idx) => ({
          label: month.label,
          hm: hmAry[idx],
          koreksi: deviasiAry[idx],
          hasLog: hasLogAry[idx]
        }));
      } else if (selectedPeriod === 'yearly') {
        const hmAry: number[] = new Array(last4Years.length).fill(0);
        const deviasiAry: number[] = new Array(last4Years.length).fill(0);
        const hasLogAry: boolean[] = new Array(last4Years.length).fill(false);
        const getYearlyInc = (yIdx: number) => 1200 + ((unit.id.charCodeAt(0) * 9 + yIdx * 23) % 400);

        const incs: number[] = [];
        for (let i = 0; i < 4; i++) {
          incs.push(i === 3 && !isUpdatedYear ? 0 : getYearlyInc(i));
        }
        const totalIncs = incs.reduce((a, b) => a + b, 0);
        const baseHm = Math.max(0, unit.currentHm - totalIncs);
        prevPeriodHm = baseHm;

        let currentAccumulated = baseHm;
        for (let i = 0; i < 4; i++) {
          const yearObj = last4Years[i];
          const yearLogs = unitLogs.filter(l => l.updatedAt.startsWith(yearObj.yearStr));
          if (yearLogs.length > 0) {
            currentAccumulated = yearLogs[0].newHm;
            hasLogAry[i] = true;
          } else {
            currentAccumulated += incs[i];
          }
          hmAry[i] = currentAccumulated;
        }
        hmAry[3] = unit.currentHm;

        for (let i = 1; i < 4; i++) {
          if (hmAry[i] < hmAry[i - 1]) hmAry[i] = hmAry[i - 1];
        }

        for (let i = 0; i < 4; i++) {
          deviasiAry[i] = i === 0 ? Math.max(0, hmAry[0] - baseHm) : Math.max(0, hmAry[i] - hmAry[i - 1]);
        }

        periodColumns = last4Years.map((yearObj, idx) => ({
          label: yearObj.label,
          hm: hmAry[idx],
          koreksi: deviasiAry[idx],
          hasLog: hasLogAry[idx]
        }));
      }

      return {
        unit,
        project,
        isUpdatedInPeriod,
        isUpdatedToday,
        lastLogDate: lastLog ? lastLog.updatedAt : 'Belum Ada Log',
        prevPeriodHm,
        periodColumns
      };
    });
  }, [units, hmLogs, selectedPeriod, todayDateStr, currentMonthDays, last4Weeks, last6Months, last4Years]);

  // Statistics
  const totalUnitsCount = units.length;
  const updatedInPeriodCount = unitMatrixData.filter(u => u.isUpdatedInPeriod).length;
  const notUpdatedInPeriodCount = totalUnitsCount - updatedInPeriodCount;
  const compliancePercentage = totalUnitsCount > 0 
    ? Math.round((updatedInPeriodCount / totalUnitsCount) * 100) 
    : 0;

  // Filtered Matrix List
  const filteredUnitMatrix = useMemo(() => {
    return unitMatrixData.filter((item) => {
      if (statusFilter === 'updated' && !item.isUpdatedInPeriod) return false;
      if (statusFilter === 'not_updated' && item.isUpdatedInPeriod) return false;

      if (categoryFilter !== 'all' && item.unit.category !== categoryFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.unit.code.toLowerCase().includes(q) ||
          item.unit.name.toLowerCase().includes(q) ||
          item.project.toLowerCase().includes(q) ||
          item.unit.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [unitMatrixData, statusFilter, categoryFilter, searchQuery]);

  // Quick unit selection for update form
  const handleSelectUnitForQuickUpdate = (u: UioUnit) => {
    setSelectedQuickUnit(u);
    setQuickSearchUnit(u.code);
    setQuickHm(u.currentHm);
    setQuickKm(u.currentKm || 0);

    const formEl = document.getElementById('quick-update-form-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickHmKmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuickUnit || quickHm === '') {
      setErrorMsg('Pilih unit dan masukkan nilai HM baru yang valid.');
      return;
    }

    if (Number(quickHm) < selectedQuickUnit.currentHm) {
      setErrorMsg(`Gagal Input HM: Update HM harus selalu bertambah! Nilai HM baru (${quickHm}) tidak boleh berkurang atau lebih kecil dari HM saat ini (${selectedQuickUnit.currentHm}).`);
      return;
    }

    setIsUpdatingHmKm(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await onUpdateHm(
        selectedQuickUnit.id,
        Number(quickHm),
        quickKm !== '' ? Number(quickKm) : undefined,
        quickNotes || 'Update HM/KM rutin'
      );

      setSuccessMsg(`Berhasil memperbarui HM & KM untuk unit ${selectedQuickUnit.code}! Status kini: SUDAH UPDATE.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      
      setQuickSearchUnit('');
      setSelectedQuickUnit(null);
      setQuickHm('');
      setQuickKm('');
      setQuickNotes('');
      
      if (onRefreshData) onRefreshData();
      fetchDispatchLogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui nilai HM/KM.');
    } finally {
      setIsUpdatingHmKm(false);
    }
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchUnitId || !dispatchOpHours || !dispatchOperator) {
      setErrorMsg('Pilih unit, masukkan jam operasi, dan nama operator.');
      return;
    }

    setIsSubmittingDispatch(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: dispatchUnitId,
          operatingHours: Number(dispatchOpHours),
          operatorName: dispatchOperator,
          notes: dispatchNotes || 'Jam Keluar Unit dari Workshop / Site'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mencatat jam keluar unit');
      }

      const unitObj = units.find(u => u.id === dispatchUnitId);
      setSuccessMsg(`Jam Keluar & Jam Operasi Unit ${unitObj?.code || ''} berhasil dicatat! (+${dispatchOpHours} HM)`);
      setTimeout(() => setSuccessMsg(''), 4000);

      setDispatchUnitId('');
      setDispatchOpHours(8);
      setDispatchOperator('');
      setDispatchNotes('');

      if (onRefreshData) onRefreshData();
      fetchDispatchLogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mencatat jam keluar unit');
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  // Filtered HM Logs for history table
  const filteredHmLogs = hmLogs.filter(log => {
    if (!historySearch) return true;
    const q = historySearch.toLowerCase();
    return (
      log.unitCode.toLowerCase().includes(q) ||
      (log.notes && log.notes.toLowerCase().includes(q)) ||
      log.updatedAt.toLowerCase().includes(q)
    );
  });

  // Filtered Dispatch Logs for history table
  const filteredDispatchLogs = dispatchLogs.filter(log => {
    if (!historySearch) return true;
    const q = historySearch.toLowerCase();
    return (
      log.unitCode.toLowerCase().includes(q) ||
      log.operatorName.toLowerCase().includes(q) ||
      (log.notes && log.notes.toLowerCase().includes(q)) ||
      log.dispatchTime.toLowerCase().includes(q)
    );
  });

  const handlePrintReport = () => {
    window.print();
  };

  const matchingUnits = units.filter(u => {
    if (!quickSearchUnit) return false;
    const q = quickSearchUnit.toLowerCase();
    return u.code.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.category.toLowerCase().includes(q);
  });

  // Period label textual display
  const periodLabelText = {
    daily: 'Harian (Monitoring 1 Bulan Penuh)',
    weekly: 'Mingguan (4 Minggu Terakhir)',
    monthly: 'Bulanan (6 Bulan Terakhir)',
    yearly: 'Tahunan (4 Tahun Terakhir)'
  }[selectedPeriod];

  return (
    <div className="space-y-6" id="hm-km-logging-container">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500 text-slate-950 rounded-xl font-semibold shadow-2xs">
            <Gauge size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight">
                Monitoring Status & Input HM/KM Armada
              </h1>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium rounded-md">
                Multi-Periode Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoring kepatuhan HM/KM harian (1 bulan), mingguan, bulanan & tahunan. Latar merah muda menandakan unit belum terupdate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setActiveMainSection(activeMainSection === 'monitoring' ? 'logs_history' : 'monitoring')}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs border ${
              activeMainSection === 'monitoring'
                ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {activeMainSection === 'monitoring' ? (
              <>
                <History size={15} />
                <span>Lihat Histori Log ({hmLogs.length})</span>
              </>
            ) : (
              <>
                <Gauge size={15} />
                <span>Kembali ke Matriks Monitoring</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrintReport}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer size={15} />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900"><X size={16} /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-900"><X size={16} /></button>
        </div>
      )}

      {/* MAIN SECTION 1: MONITORING & INPUT */}
      {activeMainSection === 'monitoring' && (
        <div className="space-y-6">
          
          {/* SLIDEBAR PERIODE MONITORING (SLIDE CONTROL: HARIAN, MINGGUAN, BULANAN, TAHUNAN) */}
          <div className="bg-slate-800/95 p-4 rounded-2xl text-white shadow-xs border border-slate-700/80 space-y-3" id="period-slidebar-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarRange className="text-emerald-400" size={18} />
                <div>
                  <h2 className="text-xs font-semibold tracking-wide text-emerald-400">
                    Pilih Periode Monitoring HM Armada
                  </h2>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Geser atau pilih periode di bawah untuk menyesuaikan data matriks status harian (1 bulan), mingguan, bulanan, atau tahunan.
                  </p>
                </div>
              </div>

              <div className="text-right self-start md:self-auto">
                <span className="text-[10px] text-slate-400 block">Periode Aktif</span>
                <span className="text-xs font-medium text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80 inline-block">
                  {periodLabelText}
                </span>
              </div>
            </div>

            {/* Interactive Segmented Slidebar Controls */}
            <div className="relative bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs">
              {/* Option 1: Harian */}
              <button
                type="button"
                onClick={() => setSelectedPeriod('daily')}
                className={`py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  selectedPeriod === 'daily'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CalendarDays size={15} />
                <span>1. HARIAN</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ml-1 ${
                  selectedPeriod === 'daily' ? 'bg-emerald-800/80 text-emerald-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  1 Bulan
                </span>
              </button>

              {/* Option 2: Mingguan */}
              <button
                type="button"
                onClick={() => setSelectedPeriod('weekly')}
                className={`py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  selectedPeriod === 'weekly'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart3 size={15} />
                <span>2. MINGGUAN</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ml-1 ${
                  selectedPeriod === 'weekly' ? 'bg-emerald-800/80 text-emerald-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  4 Minggu
                </span>
              </button>

              {/* Option 3: Bulanan */}
              <button
                type="button"
                onClick={() => setSelectedPeriod('monthly')}
                className={`py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  selectedPeriod === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <PieChart size={15} />
                <span>3. BULANAN</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ml-1 ${
                  selectedPeriod === 'monthly' ? 'bg-emerald-800/80 text-emerald-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  6 Bulan
                </span>
              </button>

              {/* Option 4: Tahunan */}
              <button
                type="button"
                onClick={() => setSelectedPeriod('yearly')}
                className={`py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  selectedPeriod === 'yearly'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <TrendingUp size={15} />
                <span>4. TAHUNAN</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ml-1 ${
                  selectedPeriod === 'yearly' ? 'bg-emerald-800/80 text-emerald-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  4 Tahun
                </span>
              </button>
            </div>
          </div>

          {/* Dynamic KPI Cards Based on Selected Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="hm-monitoring-kpi-cards">
            {/* Total Units */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500">Total Armada UIO</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-semibold text-slate-800 font-mono">{totalUnitsCount}</span>
                  <span className="text-xs text-slate-500 font-medium">Unit</span>
                </div>
              </div>
              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                <Truck size={20} />
              </div>
            </div>

            {/* Sudah Update in Active Period */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-emerald-800">
                  Sudah Update ({selectedPeriod})
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-semibold text-emerald-700 font-mono">{updatedInPeriodCount}</span>
                  <span className="text-xs text-emerald-800 font-medium">Unit (OK)</span>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-2xs">
                <CheckCircle2 size={20} />
              </div>
            </div>

            {/* BELUM UPDATE IN PERIOD - SOFT ROSE WARNING CARD */}
            <div className={`p-4 rounded-2xl border shadow-2xs flex items-center justify-between transition-all ${
              notUpdatedInPeriodCount > 0 
                ? 'bg-rose-50/90 border-rose-200 text-rose-900' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className={`text-[11px] font-medium ${
                    notUpdatedInPeriodCount > 0 ? 'text-rose-800' : 'text-slate-500'
                  }`}>
                    Belum Update ({selectedPeriod})
                  </p>
                  {notUpdatedInPeriodCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-200/80 text-rose-800 text-[9px] font-medium rounded-md">
                      Perlu Sync
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl font-semibold font-mono ${
                    notUpdatedInPeriodCount > 0 ? 'text-rose-700' : 'text-slate-800'
                  }`}>
                    {notUpdatedInPeriodCount}
                  </span>
                  <span className={`text-xs font-medium ${
                    notUpdatedInPeriodCount > 0 ? 'text-rose-700' : 'text-slate-500'
                  }`}>
                    Unit Stagnan
                  </span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl ${
                notUpdatedInPeriodCount > 0 ? 'bg-rose-200/70 text-rose-800' : 'bg-slate-200 text-slate-600'
              }`}>
                <AlertTriangle size={20} />
              </div>
            </div>

            {/* Compliance Percentage */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-slate-500">Kepatuhan {selectedPeriod}</p>
                <span className={`text-xs font-semibold font-mono px-2 py-0.5 rounded-md ${
                  compliancePercentage >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {compliancePercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    compliancePercentage >= 80 ? 'bg-emerald-500' : compliancePercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${compliancePercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Target: 100% kepatuhan log HM
              </p>
            </div>
          </div>

          {/* Quick Input Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="quick-update-form-card">
            {/* Form 1: Quick HM/KM Update */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="text-emerald-600" size={18} />
                  <h2 className="text-sm font-semibold text-slate-900">1. Update HM / KM Harian</h2>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                  Fast Sync
                </span>
              </div>

              <form onSubmit={handleQuickHmKmSubmit} className="space-y-3">
                <div className="relative">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Cari & Pilih Kode Unit
                  </label>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={quickSearchUnit}
                      onChange={(e) => {
                        setQuickSearchUnit(e.target.value);
                        setSelectedQuickUnit(null);
                      }}
                      placeholder="Ketik kode (mis. DT-5087, EXCA-01)..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {quickSearchUnit && !selectedQuickUnit && matchingUnits.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {matchingUnits.map(u => (
                        <button
                          type="button"
                          key={u.id}
                          onClick={() => handleSelectUnitForQuickUpdate(u)}
                          className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div>
                            <span className="font-mono text-slate-900 font-semibold">{u.code}</span>
                            <span className="text-slate-500 ml-2">&bull; {u.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            HM: {u.currentHm}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedQuickUnit && (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs space-y-1 text-emerald-900">
                    <div className="flex justify-between font-medium">
                      <span>Unit Terpilih:</span>
                      <span>{selectedQuickUnit.code} &mdash; {selectedQuickUnit.name}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-emerald-800">
                      <span>HM Terkini: <strong>{selectedQuickUnit.currentHm} HM</strong></span>
                      <span>KM Terkini: <strong>{selectedQuickUnit.currentKm || 0} KM</strong></span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">
                      Nilai HM Baru
                    </label>
                    <input
                      type="number"
                      value={quickHm}
                      onChange={(e) => setQuickHm(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Nilai HM Baru"
                      min={selectedQuickUnit ? selectedQuickUnit.currentHm : 0}
                      disabled={!selectedQuickUnit}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    />
                    {selectedQuickUnit && (
                      <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                        * Wajib bertambah (&ge; {selectedQuickUnit.currentHm} HM)
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">
                      Nilai KM Baru
                    </label>
                    <input
                      type="number"
                      value={quickKm}
                      onChange={(e) => setQuickKm(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Nilai KM"
                      disabled={!selectedQuickUnit}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">
                    Catatan Shift / Lokasi
                  </label>
                  <input
                    type="text"
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    placeholder="Contoh: Shift Pagi Site Maro..."
                    disabled={!selectedQuickUnit}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedQuickUnit || isUpdatingHmKm}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-medium rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <Save size={15} />
                  <span>{isUpdatingHmKm ? 'Menyimpan...' : 'Simpan Update HM Hari Ini'}</span>
                </button>
              </form>
            </div>

            {/* Form 2: Log Jam Keluar Unit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <LogOut className="text-blue-600" size={18} />
                  <h2 className="text-sm font-semibold text-slate-900">2. Log Jam Keluar Unit (Dispatch)</h2>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                  Jam Operasi
                </span>
              </div>

              <form onSubmit={handleDispatchSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Pilih Unit Dispatch
                  </label>
                  <select
                    value={dispatchUnitId}
                    onChange={(e) => setDispatchUnitId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Unit Armada --</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.code} &mdash; {u.name} ({u.status}) &bull; HM: {u.currentHm}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">
                      Jam Operasi (HM)
                    </label>
                    <input
                      type="number"
                      value={dispatchOpHours}
                      onChange={(e) => setDispatchOpHours(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="8 Jam"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">
                      Operator / Driver
                    </label>
                    <input
                      type="text"
                      value={dispatchOperator}
                      onChange={(e) => setDispatchOperator(e.target.value)}
                      placeholder="Nama Operator..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">
                    Catatan Dispatch / Tugas Site
                  </label>
                  <input
                    type="text"
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="Contoh: Unit siap operasi rute hauling..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDispatch || !dispatchUnitId}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-medium rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <LogOut size={15} />
                  <span>{isSubmittingDispatch ? 'Mencatat...' : 'Catat Log Jam Keluar Unit'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* SPREADSHEET MATRIX MONITORING TABLE */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4" id="hm-matrix-section">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="text-emerald-700" size={18} />
                  <h2 className="text-sm font-semibold text-slate-900">
                    Matriks Monitoring Update HM {periodLabelText}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan monitoring harian selama 1 bulan penuh (30-31 hari). Baris latar merah muda menandakan unit belum terupdate.
                </p>
              </div>

              {/* Filters & View Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search input */}
                <div className="relative w-40 sm:w-52">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari No Body / Unit..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center p-1 bg-slate-100/80 rounded-xl text-xs">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                      statusFilter === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Semua ({unitMatrixData.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('not_updated')}
                    className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'not_updated' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    <span>Belum Update ({notUpdatedInPeriodCount})</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('updated')}
                    className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'updated' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <span>Sudah Update ({updatedInPeriodCount})</span>
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center p-1 bg-slate-100/80 rounded-xl text-xs">
                  <button
                    onClick={() => setMatrixViewMode('spreadsheet')}
                    title="Matriks Spreadsheet Excel"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      matrixViewMode === 'spreadsheet' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    <FileSpreadsheet size={16} />
                  </button>
                  <button
                    onClick={() => setMatrixViewMode('card_list')}
                    title="Daftar Kartu Status"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      matrixViewMode === 'card_list' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    <Layers size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* SPREADSHEET MATRIX TABLE */}
            {matrixViewMode === 'spreadsheet' ? (
              <div className="overflow-x-auto border border-slate-200/90 rounded-xl max-h-[550px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-20">
                    {/* Top Grouped Header */}
                    <tr className="bg-slate-800 text-slate-100 font-sans text-[11px] font-medium text-center divide-x divide-slate-700/80">
                      <th className="py-2.5 px-2 text-left w-10">NO</th>
                      <th className="py-2.5 px-3 text-left w-28 sticky left-0 z-30 bg-slate-800 text-slate-100 shadow-2xs">NO BODY</th>
                      <th className="py-2.5 px-3 text-left w-24">PROJECT</th>
                      <th className="py-2.5 px-3 text-right bg-emerald-900/80 text-emerald-100 w-28">UPDATE HM</th>
                      <th className="py-2.5 px-3 text-right bg-slate-900 text-slate-200 w-28">TGL UPDATE</th>
                      <th className="py-2.5 px-3 text-right bg-amber-950/90 text-amber-200 w-32" title="HM Terakhir di Bulan/Periode Sebelumnya">
                        {selectedPeriod === 'daily' ? 'HM BLN LALU' : 'HM PERIODE LALU'}
                      </th>
                      
                      {/* Dynamic Columns for Selected Period */}
                      {filteredUnitMatrix[0]?.periodColumns.map((col, idx) => (
                        <th key={idx} colSpan={2} className={`py-2 px-2 text-center min-w-[75px] ${
                          col.isToday 
                            ? 'bg-emerald-700 text-white font-semibold' 
                            : idx === filteredUnitMatrix[0].periodColumns.length - 1 
                              ? 'bg-amber-900/80 text-amber-100 font-semibold' 
                              : 'bg-slate-800 text-slate-200'
                        }`}>
                          <div className="flex flex-col items-center justify-center">
                            <span>{col.label}</span>
                            {col.isToday && (
                              <span className="text-[9px] bg-emerald-500 text-white px-1 py-0.2 rounded font-mono mt-0.5">Hari Ini</span>
                            )}
                          </div>
                        </th>
                      ))}

                      <th className="py-2.5 px-3 text-center bg-slate-900 text-white w-24">AKSI</th>
                    </tr>

                    {/* Sub Header for Deviasi / Selisih HM */}
                    <tr className="bg-slate-100 text-slate-600 font-mono text-[9px] font-semibold text-center divide-x divide-slate-200 border-b border-slate-300">
                      <th colSpan={5} className="py-1 px-2 text-left text-slate-500 font-sans">METER UTAMA</th>
                      <th className="py-1 px-1.5 text-right bg-amber-100/70 text-amber-900 w-28 font-mono text-[9px]">BASE HM</th>
                      
                      {filteredUnitMatrix[0]?.periodColumns.map((col, idx) => (
                        <React.Fragment key={'sub-' + idx}>
                          <th className="py-1 px-1.5 text-right bg-slate-50 w-12 text-slate-600">HM</th>
                          <th className="py-1 px-1.5 text-right bg-amber-50/70 text-amber-900 w-12" title="Deviasi / Jumlah Selisih HM">DEVIASI</th>
                        </React.Fragment>
                      ))}

                      <th className="py-1 px-2 text-center bg-slate-50 font-sans">INPUT</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200/80 font-mono text-xs">
                    {filteredUnitMatrix.length === 0 ? (
                      <tr>
                        <td colSpan={7 + (filteredUnitMatrix[0]?.periodColumns.length || 0) * 2} className="py-8 text-center text-slate-400 font-sans">
                          Tidak ditemukan unit armada yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      filteredUnitMatrix.map((item, idx) => {
                        const isRedAlert = !item.isUpdatedInPeriod;

                        return (
                          <tr 
                            key={item.unit.id}
                            className={`transition-colors divide-x divide-slate-200/80 ${
                              isRedAlert 
                                ? 'bg-rose-50/80 hover:bg-rose-100/90 text-slate-800 border-l-4 border-l-rose-500' 
                                : idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80 text-slate-800' : 'bg-slate-50/40 hover:bg-slate-100/60 text-slate-800'
                            }`}
                          >
                            {/* NO */}
                            <td className="py-2 px-2 font-medium text-center text-slate-500">
                              {idx + 1}
                            </td>

                            {/* NO BODY */}
                            <td className={`py-2 px-3 font-semibold sticky left-0 z-10 shadow-2xs ${
                              isRedAlert ? 'bg-rose-100 text-rose-900' : 'bg-white text-slate-900'
                            }`}>
                              <div className="flex items-center gap-1.5">
                                <span>{item.unit.code}</span>
                                {isRedAlert && (
                                  <span className="w-2 h-2 rounded-full bg-rose-500" title="Belum Update Hari Ini!" />
                                )}
                              </div>
                            </td>

                            {/* PROJECT */}
                            <td className="py-2 px-3 font-normal text-[11px] text-slate-600 font-sans">
                              {item.project}
                            </td>

                            {/* CURRENT HM */}
                            <td className={`py-2 px-3 text-right font-medium text-xs ${
                              isRedAlert ? 'text-rose-900 font-semibold' : 'text-emerald-800 font-semibold'
                            }`}>
                              {item.unit.currentHm.toLocaleString('id-ID')}
                            </td>

                            {/* LAST LOG DATE */}
                            <td className="py-2 px-3 text-right font-normal text-[11px] text-slate-500">
                              {item.lastLogDate.includes(' ') ? item.lastLogDate.split(' ')[0] : item.lastLogDate}
                            </td>

                            {/* HM TERAKHIR BULAN SEBELUMNYA */}
                            <td className="py-2 px-3 text-right font-semibold text-xs text-amber-900 bg-amber-50/60" title="HM Terakhir di Bulan/Periode Sebelumnya">
                              {item.prevPeriodHm.toLocaleString('id-ID')}
                            </td>

                            {/* DYNAMIC PERIOD CELLS */}
                            {item.periodColumns.map((col, cIdx) => (
                              <React.Fragment key={cIdx}>
                                {/* HM Cell */}
                                <td className={`py-2 px-1.5 text-right font-mono text-[11px] ${
                                  col.isToday 
                                    ? 'bg-emerald-50/70 text-emerald-950 font-medium' 
                                    : cIdx === item.periodColumns.length - 1 ? 'bg-amber-50/80 text-slate-900 font-semibold' : 'text-slate-700'
                                }`}>
                                  {col.hm.toLocaleString('id-ID')}
                                </td>

                                {/* Deviasi / Selisih HM Cell */}
                                <td 
                                  className={`py-2 px-1 text-right font-mono text-[10px] ${
                                    col.koreksi > 0 
                                      ? 'bg-amber-100/60 text-amber-900 font-medium' 
                                      : 'text-slate-400'
                                  }`}
                                  title={`Deviasi / Selisih HM: ${col.koreksi > 0 ? '+' : ''}${col.koreksi}`}
                                >
                                  {col.koreksi}
                                </td>
                              </React.Fragment>
                            ))}

                            {/* ACTION */}
                            <td className="py-1.5 px-2 text-center bg-white font-sans">
                              <button
                                onClick={() => handleSelectUnitForQuickUpdate(item.unit)}
                                className={`w-full py-1 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs ${
                                  isRedAlert
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                <Plus size={12} />
                                <span>Input HM</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* CARD LIST VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUnitMatrix.map((item) => (
                  <div
                    key={item.unit.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      !item.isUpdatedInPeriod
                        ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-300'
                        : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <div>
                        <span className="text-base font-extrabold font-mono text-slate-900">{item.unit.code}</span>
                        <span className="text-xs text-slate-500 ml-2">&bull; {item.unit.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono ${
                        item.isUpdatedInPeriod 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-600 text-white animate-pulse'
                      }`}>
                        {item.isUpdatedInPeriod ? `🟢 Sudah Update (${selectedPeriod})` : `🔴 Belum Update (${selectedPeriod})`}
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Project / Lokasi:</span>
                        <strong className="text-slate-800">{item.project}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Current HM:</span>
                        <strong className="text-emerald-700 font-extrabold text-sm">{item.unit.currentHm} HM</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>HM Bln Lalu:</span>
                        <strong className="text-amber-800 font-semibold text-xs">{item.prevPeriodHm.toLocaleString('id-ID')} HM</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Log Terakhir:</span>
                        <span className="text-slate-500 text-[11px]">{item.lastLogDate}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectUnitForQuickUpdate(item.unit)}
                      className={`w-full mt-3 py-2 text-xs font-bold font-mono uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        !item.isUpdatedInPeriod
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Gauge size={14} />
                      <span>{!item.isUpdatedInPeriod ? '⚡ Input HM Sekarang' : 'Update Meter HM'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* MAIN SECTION 2: HISTORI & LOG OPERASIONAL TERPADU */}
      {activeMainSection === 'logs_history' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4" id="combined-logs-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="text-slate-700" size={20} />
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Histori & Log Operasional Terpadu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar rekaman perubahan HM/KM harian dan histori log jam keluar unit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="relative w-48 sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari unit/operator..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveLogTab('hm')}
                  className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                    activeLogTab === 'hm'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Log HM/KM ({filteredHmLogs.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLogTab('dispatch')}
                  className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                    activeLogTab === 'dispatch'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Log Jam Keluar ({filteredDispatchLogs.length})</span>
                </button>
              </div>
            </div>
          </div>

          {activeLogTab === 'hm' && (
            <div className="overflow-x-auto">
              {filteredHmLogs.length === 0 ? (
                <div className="py-10 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Gauge size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Belum ada catatan histori pembaruan HM/KM</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Gunakan formulir di atas untuk melakukan update pertama kali.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                      <th className="py-2.5 px-3">Tanggal & Waktu</th>
                      <th className="py-2.5 px-3">Kode Unit</th>
                      <th className="py-2.5 px-3">HM Sebelum &rarr; HM Baru</th>
                      <th className="py-2.5 px-3">KM Sebelum &rarr; KM Baru</th>
                      <th className="py-2.5 px-3">Catatan / Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredHmLogs.map((log) => {
                      const diffHm = log.newHm - log.previousHm;
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] font-semibold">{log.updatedAt}</td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-900">{log.unitCode}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-slate-500">{log.previousHm}</span>
                            <span className="mx-1 text-slate-300">&rarr;</span>
                            <span className="text-emerald-700 font-bold">{log.newHm} HM</span>
                            {diffHm > 0 && (
                              <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                +{diffHm}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {log.previousKm || 0} &rarr; <strong className="text-slate-800">{log.newKm || 0} KM</strong>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                            {log.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeLogTab === 'dispatch' && (
            <div className="overflow-x-auto">
              {isLoadingDispatchLogs ? (
                <div className="py-8 text-center text-slate-400">
                  <RefreshCw className="animate-spin mx-auto mb-2" size={20} />
                  <span>Memuat histori dispatch...</span>
                </div>
              ) : filteredDispatchLogs.length === 0 ? (
                <div className="py-10 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <LogOut size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Belum ada catatan log jam keluar unit</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Log jam keluar unit akan otomatis terekam saat form dispatch diisi.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                      <th className="py-2.5 px-3">Waktu Dispatch</th>
                      <th className="py-2.5 px-3">Kode Unit</th>
                      <th className="py-2.5 px-3">Operator / Driver</th>
                      <th className="py-2.5 px-3">Jam Operasi Added</th>
                      <th className="py-2.5 px-3">Catatan Dispatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredDispatchLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] font-semibold">{log.dispatchTime}</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900">{log.unitCode}</td>
                        <td className="py-2.5 px-3 font-sans text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <User size={13} className="text-blue-600" />
                          <span>{log.operatorName}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded-md text-[11px]">
                            +{log.operatingHours} Jam HM
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                          {log.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
