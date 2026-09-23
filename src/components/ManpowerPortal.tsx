import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Wrench, 
  Shield, 
  Zap, 
  CircleDot, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Award, 
  BarChart3, 
  Layers, 
  FileText, 
  Phone, 
  Mail, 
  Calendar, 
  ArrowLeft, 
  RefreshCw, 
  Check, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Star, 
  X,
  PlayCircle,
  HardHat,
  Cpu,
  HelpCircle,
  SlidersHorizontal,
  ChevronDown,
  Sun,
  Moon,
  RotateCcw,
  UserCheck,
  UserX,
  CheckSquare,
  Square,
  Settings2,
  ArrowRightLeft,
  ArrowRight
} from 'lucide-react';
import { 
  ManpowerPerson, 
  ManpowerTaskLog, 
  ManpowerRole, 
  ManpowerShift, 
  ManpowerStatus, 
  ManpowerSkillLevel, 
  WeeklyRosterSchedule,
  UioUnit, 
  WorkshopBooking, 
  RepairHistory 
} from '../types';

interface ManpowerPortalProps {
  units?: UioUnit[];
  bookings?: WorkshopBooking[];
  repairs?: RepairHistory[];
  onBackToPortal?: () => void;
  onNavigateToBooking?: () => void;
}

const DAYS_OF_WEEK: { key: keyof WeeklyRosterSchedule; label: string; short: string }[] = [
  { key: 'monday', label: 'Senin', short: 'SEN' },
  { key: 'tuesday', label: 'Selasa', short: 'SEL' },
  { key: 'wednesday', label: 'Rabu', short: 'RAB' },
  { key: 'thursday', label: 'Kamis', short: 'KAM' },
  { key: 'friday', label: 'Jumat', short: 'JUM' },
  { key: 'saturday', label: 'Sabtu', short: 'SAB' },
  { key: 'sunday', label: 'Minggu', short: 'MIN' }
];

export default function ManpowerPortal({
  units = [],
  bookings = [],
  repairs = [],
  onBackToPortal,
  onNavigateToBooking
}: ManpowerPortalProps) {
  // Data states
  const [personnel, setPersonnel] = useState<ManpowerPerson[]>([]);
  const [taskLogs, setTaskLogs] = useState<ManpowerTaskLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter & Navigation states
  const [activeTab, setActiveTab] = useState<'roster' | 'productivity' | 'live-board' | 'task-history' | 'shifts'>('roster');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Shift Management & Attendance State
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);
  const [isBulkShiftModalOpen, setIsBulkShiftModalOpen] = useState<boolean>(false);
  const [bulkShiftTarget, setBulkShiftTarget] = useState<ManpowerShift>('Shift 1 (Pagi)');
  const [bulkStatusTarget, setBulkStatusTarget] = useState<ManpowerStatus>('On Duty');
  const [bulkBayTarget, setBulkBayTarget] = useState<string>('Workshop Utama');

  const [isQuickShiftModalOpen, setIsQuickShiftModalOpen] = useState<boolean>(false);
  const [quickShiftPerson, setQuickShiftPerson] = useState<ManpowerPerson | null>(null);
  const [quickShiftTarget, setQuickShiftTarget] = useState<ManpowerShift>('Shift 1 (Pagi)');
  const [quickStatusTarget, setQuickStatusTarget] = useState<ManpowerStatus>('On Duty');
  const [quickBayTarget, setQuickBayTarget] = useState<string>('');

  const [isRotateConfirmModalOpen, setIsRotateConfirmModalOpen] = useState<boolean>(false);
  const [isShiftConfigModalOpen, setIsShiftConfigModalOpen] = useState<boolean>(false);
  const [shiftSubTab, setShiftSubTab] = useState<'workload' | 'matrix' | 'compliance'>('workload');
  const [shiftFilterTab, setShiftFilterTab] = useState<'ALL' | 'Shift 1 (Pagi)' | 'Shift 2 (Malam)' | 'Standby' | 'Roster Off'>('ALL');

  const [shiftConfig, setShiftConfig] = useState({
    shift1Name: 'Shift 1 (Pagi)',
    shift1Start: '07:00',
    shift1End: '15:30',
    shift1Break: 45,
    shift1MinManpower: 4,
    shift1MinForeman: 1,
    shift2Name: 'Shift 2 (Malam)',
    shift2Start: '19:00',
    shift2End: '03:30',
    shift2Break: 45,
    shift2MinManpower: 3,
    shift2MinForeman: 1,
  });

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingPerson, setEditingPerson] = useState<ManpowerPerson | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [selectedPersonForAssign, setSelectedPersonForAssign] = useState<ManpowerPerson | null>(null);

  const [isCompleteTaskModalOpen, setIsCompleteTaskModalOpen] = useState<boolean>(false);
  const [selectedPersonForComplete, setSelectedPersonForComplete] = useState<ManpowerPerson | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [detailPerson, setDetailPerson] = useState<ManpowerPerson | null>(null);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    nrp: '',
    name: '',
    role: 'Mekanik' as ManpowerRole,
    skillLevel: 'Senior' as ManpowerSkillLevel,
    phone: '',
    email: '',
    shift: 'Shift 1 (Pagi)' as ManpowerShift,
    status: 'On Duty' as ManpowerStatus,
    assignedBay: 'Bay 1 (Heavy Repair)',
    specialties: '',
    certifications: '',
    notes: ''
  });

  // Form states for Assign Job
  const [assignForm, setAssignForm] = useState({
    unitCode: '',
    workOrderId: '',
    jobType: '',
    bay: 'Bay 1',
    targetHours: 4.0
  });

  // Form states for Complete Task
  const [completeForm, setCompleteForm] = useState({
    taskTitle: '',
    unitCode: '',
    category: 'Preventive Maintenance' as ManpowerTaskLog['category'],
    actualHours: 3.5,
    flatRateHours: 4.0,
    notes: ''
  });

  // Fetch Manpower Data from backend
  const fetchManpowerData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/manpower');
      if (!res.ok) throw new Error('Gagal mengambil data manpower');
      const data = await res.json();
      setPersonnel(data.personnel || []);
      setTaskLogs(data.tasks || []);
    } catch (err: any) {
      console.error('Error fetching manpower data:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManpowerData();
  }, []);

  // Filtered personnel list
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nrp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesShift = shiftFilter === 'ALL' || p.shift.includes(shiftFilter);

      return matchesSearch && matchesRole && matchesStatus && matchesShift;
    });
  }, [personnel, searchQuery, roleFilter, statusFilter, shiftFilter]);

  // Aggregate KPI Calculations
  const stats = useMemo(() => {
    const total = personnel.length;
    if (total === 0) {
      return {
        total: 0,
        avgEfficiency: 100,
        avgUtilization: 0,
        onDutyCount: 0,
        inJobCount: 0,
        standbyCount: 0,
        rosterOffCount: 0,
        totalCompletedJobs: 0,
        roleCounts: { Foreman: 0, Mekanik: 0, Helper: 0, Tireman: 0, 'Auto-Electrician': 0, Welder: 0 }
      };
    }

    const onDutyCount = personnel.filter(p => p.status === 'On Duty' || p.status === 'In Job').length;
    const inJobCount = personnel.filter(p => p.status === 'In Job').length;
    const standbyCount = personnel.filter(p => p.status === 'Standby').length;
    const rosterOffCount = personnel.filter(p => p.status === 'Roster Off' || p.status === 'Cuti / Izin').length;

    const totalEfficiency = personnel.reduce((sum, p) => sum + (p.efficiencyRatio || 100), 0);
    const avgEfficiency = Number((totalEfficiency / total).toFixed(1));

    const totalUtilization = personnel.reduce((sum, p) => sum + (p.utilizationRate || 0), 0);
    const avgUtilization = Number((totalUtilization / total).toFixed(1));

    const totalCompletedJobs = personnel.reduce((sum, p) => sum + (p.completedJobsCount || 0), 0);

    const roleCounts: Record<string, number> = {
      Foreman: personnel.filter(p => p.role === 'Foreman').length,
      Mekanik: personnel.filter(p => p.role === 'Mekanik').length,
      Helper: personnel.filter(p => p.role === 'Helper').length,
      Tireman: personnel.filter(p => p.role === 'Tireman').length,
      'Auto-Electrician': personnel.filter(p => p.role === 'Auto-Electrician').length,
      Welder: personnel.filter(p => p.role === 'Welder').length
    };

    return {
      total,
      avgEfficiency,
      avgUtilization,
      onDutyCount,
      inJobCount,
      standbyCount,
      rosterOffCount,
      totalCompletedJobs,
      roleCounts
    };
  }, [personnel]);

  // Shift Workload & Staffing Analytics
  const shiftStats = useMemo(() => {
    const shift1List = personnel.filter(p => p.shift === 'Shift 1 (Pagi)');
    const shift2List = personnel.filter(p => p.shift === 'Shift 2 (Malam)');
    const standbyList = personnel.filter(p => p.shift === 'Standby');
    const rosterOffList = personnel.filter(p => p.shift === 'Roster Off');

    // Shift 1 metrics
    const shift1Total = shift1List.length;
    const shift1OnDuty = shift1List.filter(p => p.status === 'On Duty' || p.status === 'In Job').length;
    const shift1InJob = shift1List.filter(p => p.status === 'In Job').length;
    const shift1Foreman = shift1List.filter(p => p.role === 'Foreman').length;
    const shift1Mekanik = shift1List.filter(p => p.role === 'Mekanik').length;
    const shift1Tireman = shift1List.filter(p => p.role === 'Tireman').length;
    const shift1AutoElec = shift1List.filter(p => p.role === 'Auto-Electrician').length;
    const shift1CapacityHours = shift1Total * 8; // 8 hours per shift
    const shift1ActiveWorkloadHours = shift1List.reduce((acc, p) => acc + (p.activeJob ? (p.activeJob.targetHours || 4) : 0), 0);
    const shift1WorkloadPercent = shift1CapacityHours > 0 
      ? Math.min(100, Math.round((shift1ActiveWorkloadHours / shift1CapacityHours) * 100))
      : 0;

    // Shift 2 metrics
    const shift2Total = shift2List.length;
    const shift2OnDuty = shift2List.filter(p => p.status === 'On Duty' || p.status === 'In Job').length;
    const shift2InJob = shift2List.filter(p => p.status === 'In Job').length;
    const shift2Foreman = shift2List.filter(p => p.role === 'Foreman').length;
    const shift2Mekanik = shift2List.filter(p => p.role === 'Mekanik').length;
    const shift2Tireman = shift2List.filter(p => p.role === 'Tireman').length;
    const shift2AutoElec = shift2List.filter(p => p.role === 'Auto-Electrician').length;
    const shift2CapacityHours = shift2Total * 8;
    const shift2ActiveWorkloadHours = shift2List.reduce((acc, p) => acc + (p.activeJob ? (p.activeJob.targetHours || 4) : 0), 0);
    const shift2WorkloadPercent = shift2CapacityHours > 0 
      ? Math.min(100, Math.round((shift2ActiveWorkloadHours / shift2CapacityHours) * 100))
      : 0;

    // Compliance Check
    const shift1HasForeman = shift1Foreman >= shiftConfig.shift1MinForeman;
    const shift2HasForeman = shift2Foreman >= shiftConfig.shift2MinForeman;
    const shift1AdequateMekanik = shift1Mekanik >= shiftConfig.shift1MinManpower;
    const shift2AdequateMekanik = shift2Mekanik >= shiftConfig.shift2MinManpower;
    const isCompliant = shift1HasForeman && shift2HasForeman;

    const attendanceRate = personnel.length > 0 
      ? Math.round(((stats.onDutyCount) / personnel.length) * 100) 
      : 100;

    return {
      shift1List,
      shift2List,
      standbyList,
      rosterOffList,
      shift1: {
        total: shift1Total,
        onDuty: shift1OnDuty,
        inJob: shift1InJob,
        foreman: shift1Foreman,
        mekanik: shift1Mekanik,
        tireman: shift1Tireman,
        autoElec: shift1AutoElec,
        capacityHours: shift1CapacityHours,
        workloadHours: shift1ActiveWorkloadHours,
        workloadPercent: shift1WorkloadPercent,
        hasForeman: shift1HasForeman,
        adequateMekanik: shift1AdequateMekanik
      },
      shift2: {
        total: shift2Total,
        onDuty: shift2OnDuty,
        inJob: shift2InJob,
        foreman: shift2Foreman,
        mekanik: shift2Mekanik,
        tireman: shift2Tireman,
        autoElec: shift2AutoElec,
        capacityHours: shift2CapacityHours,
        workloadHours: shift2ActiveWorkloadHours,
        workloadPercent: shift2WorkloadPercent,
        hasForeman: shift2HasForeman,
        adequateMekanik: shift2AdequateMekanik
      },
      standbyCount: standbyList.length,
      rosterOffCount: rosterOffList.length,
      isCompliant,
      attendanceRate
    };
  }, [personnel, stats.onDutyCount, shiftConfig]);

  // Helper for 7-Day Schedule Roster
  const getPersonDayShift = (person: ManpowerPerson, day: keyof WeeklyRosterSchedule): ManpowerShift => {
    if (person.weeklyRoster && person.weeklyRoster[day]) {
      return person.weeklyRoster[day];
    }
    if (day === 'sunday') return 'Roster Off';
    if (day === 'saturday' && person.shift === 'Shift 2 (Malam)') return 'Standby';
    return person.shift;
  };

  const cycleShiftValue = (current: ManpowerShift): ManpowerShift => {
    if (current === 'Shift 1 (Pagi)') return 'Shift 2 (Malam)';
    if (current === 'Shift 2 (Malam)') return 'Standby';
    if (current === 'Standby') return 'Roster Off';
    return 'Shift 1 (Pagi)';
  };

  const handleWeeklyRosterCycle = async (person: ManpowerPerson, day: keyof WeeklyRosterSchedule) => {
    const currentShift = getPersonDayShift(person, day);
    const nextShift = cycleShiftValue(currentShift);

    const existingRoster: WeeklyRosterSchedule = person.weeklyRoster || {
      monday: person.shift,
      tuesday: person.shift,
      wednesday: person.shift,
      thursday: person.shift,
      friday: person.shift,
      saturday: person.shift === 'Shift 2 (Malam)' ? 'Standby' : person.shift,
      sunday: 'Roster Off'
    };

    const updatedRoster: WeeklyRosterSchedule = {
      ...existingRoster,
      [day]: nextShift
    };

    // Optimistically update
    setPersonnel(prev => prev.map(p => p.id === person.id ? { ...p, weeklyRoster: updatedRoster } : p));

    try {
      await fetch(`/api/manpower/${person.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyRoster: updatedRoster })
      });
    } catch (err) {
      console.error('Failed to update weekly roster:', err);
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelectPerson = (id: string) => {
    setSelectedPersonnelIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredPersonnel.map(p => p.id);
    const allSelected = visibleIds.every(id => selectedPersonnelIds.includes(id));
    if (allSelected) {
      setSelectedPersonnelIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedPersonnelIds(Array.from(new Set([...selectedPersonnelIds, ...visibleIds])));
    }
  };

  // Submit Bulk Shift Changes
  const handleBulkShiftSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedPersonnelIds.length === 0) return;

    try {
      const res = await fetch('/api/manpower/bulk-shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personIds: selectedPersonnelIds,
          shift: bulkShiftTarget,
          status: bulkStatusTarget,
          assignedBay: bulkBayTarget || undefined
        })
      });

      if (!res.ok) throw new Error('Gagal memperbarui shift massal');
      setIsBulkShiftModalOpen(false);
      setSelectedPersonnelIds([]);
      fetchManpowerData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengatur shift massal');
    }
  };

  // Quick Direct Bulk Shift Action (from toolbar)
  const handleQuickBulkShift = async (targetShift: ManpowerShift, targetStatus?: ManpowerStatus) => {
    if (selectedPersonnelIds.length === 0) return;
    try {
      const res = await fetch('/api/manpower/bulk-shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personIds: selectedPersonnelIds,
          shift: targetShift,
          status: targetStatus || (targetShift === 'Roster Off' ? 'Roster Off' : targetShift === 'Standby' ? 'Standby' : 'On Duty')
        })
      });

      if (!res.ok) throw new Error('Gagal mengubah shift');
      setSelectedPersonnelIds([]);
      fetchManpowerData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah shift');
    }
  };

  // Rotate Shifts (Swap Shift 1 <-> Shift 2)
  const handleRotateShifts = async () => {
    try {
      const res = await fetch('/api/manpower/rotate-shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Gagal merotasi shift');
      setIsRotateConfirmModalOpen(false);
      fetchManpowerData();
    } catch (err: any) {
      alert(err.message || 'Gagal merotasi shift');
    }
  };

  // Open Quick Shift Modal for single person
  const handleOpenQuickShift = (p: ManpowerPerson) => {
    setQuickShiftPerson(p);
    setQuickShiftTarget(p.shift);
    setQuickStatusTarget(p.status);
    setQuickBayTarget(p.assignedBay || 'Bay 1 (Heavy Repair)');
    setIsQuickShiftModalOpen(true);
  };

  // Submit Quick Shift for single person
  const handleQuickShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickShiftPerson) return;

    try {
      const res = await fetch(`/api/manpower/${quickShiftPerson.id}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shift: quickShiftTarget,
          status: quickStatusTarget,
          assignedBay: quickBayTarget
        })
      });

      if (!res.ok) throw new Error('Gagal memperbarui shift & kehadiran personil');
      setIsQuickShiftModalOpen(false);
      setQuickShiftPerson(null);
      fetchManpowerData();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui shift');
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingPerson(null);
    setFormData({
      nrp: `NRP-${Math.floor(10000 + Math.random() * 90000)}`,
      name: '',
      role: 'Mekanik',
      skillLevel: 'Senior',
      phone: '',
      email: '',
      shift: 'Shift 1 (Pagi)',
      status: 'On Duty',
      assignedBay: 'Bay 1 (Heavy Repair)',
      specialties: '',
      certifications: '',
      notes: ''
    });
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p: ManpowerPerson) => {
    setEditingPerson(p);
    setFormData({
      nrp: p.nrp,
      name: p.name,
      role: p.role,
      skillLevel: p.skillLevel,
      phone: p.phone,
      email: p.email || '',
      shift: p.shift,
      status: p.status,
      assignedBay: p.assignedBay || 'Bay 1 (Heavy Repair)',
      specialties: p.specialties.join(', '),
      certifications: p.certifications.join(', '),
      notes: p.notes || ''
    });
    setIsAddEditModalOpen(true);
  };

  // Submit Add or Edit
  const handleSubmitPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const payload = {
      ...formData,
      specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()).filter(Boolean) : []
    };

    try {
      if (editingPerson) {
        // Update
        const res = await fetch(`/api/manpower/${editingPerson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Gagal memperbarui profil personil');
      } else {
        // Create
        const res = await fetch('/api/manpower', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Gagal menambahkan personil baru');
      }

      setIsAddEditModalOpen(false);
      fetchManpowerData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    }
  };

  // Delete Person
  const handleDeletePerson = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus personil ${name}?`)) return;
    try {
      const res = await fetch(`/api/manpower/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus personil');
      fetchManpowerData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menghapus personil');
    }
  };

  // Open Assign Job Modal
  const handleOpenAssign = (p: ManpowerPerson) => {
    setSelectedPersonForAssign(p);
    setAssignForm({
      unitCode: units[0]?.code || 'EXCA-01',
      workOrderId: bookings[0]?.id || 'WO-AUTO',
      jobType: p.role === 'Tireman' 
        ? 'Penggantian Ban & Pengecekan Rim OTR' 
        : p.role === 'Auto-Electrician' 
        ? 'Troubleshooting Kelistrikan & Sensor 24V' 
        : 'Perbaikan Servis & Penanganan Kerusakan',
      bay: p.assignedBay || 'Bay 1',
      targetHours: 4.0
    });
    setIsAssignModalOpen(true);
  };

  // Submit Assign Job
  const handleSubmitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonForAssign) return;

    try {
      const res = await fetch(`/api/manpower/${selectedPersonForAssign.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm)
      });
      if (!res.ok) throw new Error('Gagal menugaskan pekerjaan');

      setIsAssignModalOpen(false);
      setSelectedPersonForAssign(null);
      fetchManpowerData();
    } catch (err: any) {
      alert(err.message || 'Gagal menugaskan');
    }
  };

  // Open Complete Task Modal
  const handleOpenComplete = (p: ManpowerPerson) => {
    setSelectedPersonForComplete(p);
    const targetHrs = p.activeJob?.targetHours || 4.0;
    setCompleteForm({
      taskTitle: p.activeJob?.jobType || 'Perbaikan Kerusakan Alat Berat',
      unitCode: p.activeJob?.unitCode || 'ARMADA',
      category: p.role === 'Tireman' ? 'Tire Management' : 'Preventive Maintenance',
      actualHours: targetHrs, // default equal
      flatRateHours: targetHrs,
      notes: 'Pekerjaan selesai diuji coba dan lulus Quality Control lapangan.'
    });
    setIsCompleteTaskModalOpen(true);
  };

  // Submit Complete Task
  const handleSubmitComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonForComplete) return;

    try {
      const res = await fetch(`/api/manpower/${selectedPersonForComplete.id}/complete-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeForm)
      });
      if (!res.ok) throw new Error('Gagal menyelesaikan tugas');

      setIsCompleteTaskModalOpen(false);
      setSelectedPersonForComplete(null);
      fetchManpowerData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyelesaikan pekerjaan');
    }
  };

  // Helper for Role Badges & Styling
  const getRoleBadge = (role: ManpowerRole) => {
    switch (role) {
      case 'Foreman':
        return {
          label: 'Foreman',
          bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800',
          icon: Shield,
          iconColor: 'text-amber-600 dark:text-amber-400'
        };
      case 'Mekanik':
        return {
          label: 'Mekanik',
          bg: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800',
          icon: Wrench,
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'Helper':
        return {
          label: 'Helper',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800',
          icon: HardHat,
          iconColor: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'Tireman':
        return {
          label: 'Tireman',
          bg: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-800',
          icon: CircleDot,
          iconColor: 'text-purple-600 dark:text-purple-400'
        };
      case 'Auto-Electrician':
        return {
          label: 'Auto-Electrician',
          bg: 'bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-950/80 dark:text-yellow-200 dark:border-yellow-800',
          icon: Zap,
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        };
      default:
        return {
          label: role,
          bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
          icon: Users,
          iconColor: 'text-slate-600 dark:text-slate-400'
        };
    }
  };

  // Helper for Status Badges
  const getStatusBadge = (status: ManpowerStatus) => {
    switch (status) {
      case 'In Job':
        return {
          label: 'In Job (Sedang Kerja)',
          bg: 'bg-blue-500 text-white font-bold animate-pulse',
          dot: 'bg-white'
        };
      case 'On Duty':
        return {
          label: 'On Duty (Siap Tugas)',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500'
        };
      case 'Standby':
        return {
          label: 'Standby On-Call',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
          dot: 'bg-indigo-500'
        };
      case 'Roster Off':
        return {
          label: 'Roster Off (Libur)',
          bg: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
          dot: 'bg-slate-400'
        };
      case 'Cuti / Izin':
        return {
          label: 'Cuti / Izin',
          bg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
          dot: 'bg-rose-500'
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
          dot: 'bg-slate-400'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="manpower-portal-root">
      {/* Top Banner Navigation & Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {onBackToPortal && (
            <button
              type="button"
              onClick={onBackToPortal}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
              title="Kembali ke Portal Menu Utama"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 shrink-0">
            <Users size={28} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                MANAJEMEN MANPOWER &amp; PRODUKTIVITAS
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                MODUL TIM LAPANGAN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
              Pengawasan kinerja tim mekanik, foreman, helper, dan tireman. Pemantauan efisiensi flat-rate jam kerja, utilisasi teknisi, dan penugasan perbaikan armada site.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
          <button
            type="button"
            onClick={fetchManpowerData}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Refresh Data Manpower"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Tambah Personil Baru</span>
          </button>
        </div>
      </div>

      {/* Hero 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="manpower-kpi-summary">
        {/* KPI 1: Rata-Rata Efisiensi Manpower */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Rata-Rata Efisiensi Tim
              </span>
              <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {stats.avgEfficiency}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Flat Rate &gt; Standar</span>
            </span>
            <span className="text-slate-400">Benchmark &ge; 100%</span>
          </div>
        </div>

        {/* KPI 2: Tingkat Utilisasi Kerja */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Tingkat Utilisasi Kerja
              </span>
              <div className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                {stats.avgUtilization}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Clock size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500 dark:text-slate-400">Basis: 173 Jam/Bulan</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">Produktivitas Tinggi</span>
          </div>
        </div>

        {/* KPI 3: Total Personil & Komposisi Peran */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Total Personil Lapangan
              </span>
              <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {stats.total} <span className="text-sm font-normal text-slate-400">Orang</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              <Award size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{stats.roleCounts.Foreman} Foreman &bull; {stats.roleCounts.Mekanik} Mekanik</span>
            <span>{stats.roleCounts.Helper} Helper &bull; {stats.roleCounts.Tireman} Tire</span>
          </div>
        </div>

        {/* KPI 4: Kesiapan Kerja & Status Shift */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Status Operasional Hari Ini
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.onDutyCount} <span className="text-xs font-bold text-slate-500">On Duty</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <PlayCircle size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between text-[11px] font-mono">
            <span className="text-blue-600 dark:text-blue-400 font-bold">{stats.inJobCount} Sedang Tangani Unit</span>
            <span className="text-slate-400">{stats.standbyCount} Standby</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : 'text-slate-800 hover:text-slate-950 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <Users size={16} />
            <span>Direktori Personil &amp; Tim ({filteredPersonnel.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('productivity')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'productivity'
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : 'text-slate-800 hover:text-slate-950 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <BarChart3 size={16} />
            <span>Analitik Produktivitas &amp; Efisiensi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live-board')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'live-board'
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : 'text-slate-800 hover:text-slate-950 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <Layers size={16} />
            <span>Board Penugasan Bay ({personnel.filter(p => p.status === 'In Job').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('task-history')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'task-history'
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : 'text-slate-800 hover:text-slate-950 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <FileText size={16} />
            <span>Log Riwayat Tugas ({taskLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shifts')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'shifts'
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : 'text-slate-800 hover:text-slate-950 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <Clock size={16} />
            <span>Pengaturan Shift &amp; Beban Kerja</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
              activeTab === 'shifts'
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-300 border-blue-300 dark:border-blue-400/30'
            }`}>
              2 Shift
            </span>
          </button>
        </div>

        {/* View Switcher for Roster */}
        {activeTab === 'roster' && (
          <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' 
                  : 'text-slate-800 hover:text-slate-950 dark:text-slate-300'
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' 
                  : 'text-slate-800 hover:text-slate-950 dark:text-slate-300'
              }`}
            >
              Tabel
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: DIREKTORI & ROSTER PERSONIL */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari personil nama, NRP, keahlian mesin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-sans text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400 text-[11px] uppercase">Peran:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Peran</option>
                  <option value="Foreman">Foreman</option>
                  <option value="Mekanik">Mekanik</option>
                  <option value="Helper">Helper</option>
                  <option value="Tireman">Tireman</option>
                  <option value="Auto-Electrician">Auto-Electrician</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400 text-[11px] uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="On Duty">On Duty</option>
                  <option value="In Job">In Job</option>
                  <option value="Standby">Standby</option>
                  <option value="Roster Off">Roster Off</option>
                </select>
              </div>

              {/* Reset filter button if any active */}
              {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline px-2 py-1"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="personnel-cards-grid">
              {filteredPersonnel.map((person) => {
                const roleBadge = getRoleBadge(person.role);
                const statusBadge = getStatusBadge(person.status);
                const RoleIcon = roleBadge.icon;

                return (
                  <div
                    key={person.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
                  >
                    <div className="space-y-3">
                      {/* Top Row: NRP, Role Badge, Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-xl border ${roleBadge.bg}`}>
                            <RoleIcon size={20} className={roleBadge.iconColor} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider block">
                              {person.nrp}
                            </span>
                            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {person.name}
                            </h3>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border ${statusBadge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                          <span>{person.status}</span>
                        </span>
                      </div>

                      {/* Role & Skill Level Row */}
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className={`px-2 py-0.5 rounded-md font-bold border ${roleBadge.bg}`}>
                          {person.role} ({person.skillLevel})
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-500 dark:text-slate-400 font-sans text-xs">
                          {person.shift}
                        </span>
                      </div>

                      {/* Active Job Alert if in Job */}
                      {person.activeJob ? (
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-900 dark:text-blue-200">
                            <span className="flex items-center gap-1">
                              <Wrench size={13} className="text-blue-600 dark:text-blue-400" />
                              <span>Sedang Tangani: {person.activeJob.unitCode}</span>
                            </span>
                            <span className="text-blue-600 dark:text-blue-400">
                              {person.activeJob.bay || 'Bay Workshop'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans line-clamp-1">
                            {person.activeJob.jobType}
                          </p>
                          <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                            Target Jam: <strong>{person.activeJob.targetHours} Jam</strong> &bull; Mulai: {person.activeJob.startTime.split(' ')[1]}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                          <span>Lokasi: {person.assignedBay || 'Workshop Site'}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tersedia untuk Penugasan</span>
                        </div>
                      )}

                      {/* Productivity & Efficiency Meter */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-500 dark:text-slate-400">Rasio Efisiensi Kerja:</span>
                          <span className={`font-black ${
                            person.efficiencyRatio >= 105 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : person.efficiencyRatio >= 95 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {person.efficiencyRatio}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              person.efficiencyRatio >= 105 
                                ? 'bg-emerald-500' 
                                : person.efficiencyRatio >= 95 
                                ? 'bg-blue-500' 
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, (person.efficiencyRatio / 120) * 100)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Flat Rate: <strong>{person.flatRateHoursEarned} Jam</strong></span>
                          <span>Jam Aktual: <strong>{person.actualWorkHours} Jam</strong></span>
                          <span>WO: <strong>{person.completedJobsCount} Unit</strong></span>
                        </div>
                      </div>

                      {/* Specialties Tags */}
                      {person.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {person.specialties.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                          {person.specialties.length > 2 && (
                            <span className="text-[10px] font-mono text-slate-400 self-center">
                              +{person.specialties.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailPerson(person);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Lihat Detail Profil & Sertifikasi"
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenQuickShift(person)}
                          className="px-2 py-1.5 rounded-lg text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer flex items-center gap-1 border border-amber-200/50 dark:border-amber-800/50"
                          title="Atur Shift & Kehadiran"
                        >
                          <Clock size={12} />
                          <span>Shift</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(person)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Personil"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePerson(person.id, person.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Hapus Personil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Primary Action: Assign Job OR Complete Task */}
                      {person.status === 'In Job' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenComplete(person)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Selesaikan</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAssign(person)}
                          className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Wrench size={13} />
                          <span>Tugaskan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 font-mono text-[11px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">NRP &amp; Nama</th>
                      <th className="py-3 px-4">Peran &amp; Level</th>
                      <th className="py-3 px-4">Shift &amp; Bay</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Jam Flat Rate</th>
                      <th className="py-3 px-4">Jam Aktual</th>
                      <th className="py-3 px-4">Efisiensi</th>
                      <th className="py-3 px-4">WO Selesai</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                    {filteredPersonnel.map((person) => {
                      const roleBadge = getRoleBadge(person.role);
                      const statusBadge = getStatusBadge(person.status);

                      return (
                        <tr key={person.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <span className="text-[10px] text-slate-400 block">{person.nrp}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{person.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold border text-[11px] ${roleBadge.bg}`}>
                              {person.role}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{person.skillLevel}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-800 dark:text-slate-200">{person.shift}</span>
                            <span className="text-[10px] text-slate-400 block">{person.assignedBay || '-'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                              {person.status}
                            </span>
                            {person.activeJob && (
                              <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-0.5 font-bold">
                                {person.activeJob.unitCode}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {person.flatRateHoursEarned} Jam
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {person.actualWorkHours} Jam
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-black ${
                              person.efficiencyRatio >= 105 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : person.efficiencyRatio >= 95 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {person.efficiencyRatio}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-bold">
                            {person.completedJobsCount}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {person.status === 'In Job' ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenComplete(person)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                                >
                                  Selesai
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssign(person)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                                >
                                  Tugaskan
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenQuickShift(person)}
                                className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors border border-amber-200/50 dark:border-amber-800/50"
                                title="Atur Shift & Kehadiran"
                              >
                                Shift
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(person)}
                                className="p-1 rounded text-slate-400 hover:text-blue-500"
                              >
                                <Edit2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANALITIK PRODUKTIVITAS & EFISIENSI */}
      {activeTab === 'productivity' && (
        <div className="space-y-6">
          {/* Info Banner: Penjelasan Formula Produktivitas Flat Rate */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-md border border-blue-800">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 shrink-0">
                <BarChart3 size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold font-mono uppercase tracking-wider text-white">
                  METODOLOGI PENGUKURAN EFISIENSI &amp; PRODUKTIVITAS WORKSHOP ALAT BERAT
                </h3>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  Efisiensi mekanik dihitung dengan membandingkan <strong>Jam Standar Flat Rate (Standard Labour Time)</strong> terhadap <strong>Jam Aktual Fisik yang Dihabiskan</strong> untuk menyelesaikan Work Order. Nilai di atas 100% menandakan mekanik/tim bekerja lebih cepat daripada estimasi buku pedoman pabrikan (CAT / Komatsu / Hino) dengan kepatuhan QC tinggi.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-blue-200">
                  <div className="bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-700/60">
                    Formula: <strong>(Total Jam Flat Rate &divide; Total Jam Aktual) &times; 100%</strong>
                  </div>
                  <div className="bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-700/60">
                    Standar Utilisasi Bulanan: <strong>173 Jam Kerja Efektif</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table: Top 5 Highest Efficiency Personnel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  <span>LEADERBOARD PERFORMER MANPOWER BULAN INI</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Peringkat berdasarkan rasio efisiensi kerja dan jumlah pekerjaan selesai (Zero Rework)
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Bulan: September 2026
              </span>
            </div>

            <div className="space-y-3">
              {[...personnel]
                .sort((a, b) => b.efficiencyRatio - a.efficiencyRatio)
                .slice(0, 5)
                .map((person, idx) => {
                  const roleBadge = getRoleBadge(person.role);
                  return (
                    <div
                      key={person.id}
                      className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black font-mono text-sm shrink-0 ${
                          idx === 0 
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' 
                            : idx === 1 
                            ? 'bg-slate-300 text-slate-900' 
                            : idx === 2 
                            ? 'bg-amber-700 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {idx === 0 ? '1' : idx === 1 ? '2' : idx === 2 ? '3' : idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold font-mono text-sm text-slate-900 dark:text-white">
                              {person.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${roleBadge.bg}`}>
                              {person.role}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {person.nrp} &bull; Keahlian: {person.specialties[0] || 'Umum'} &bull; {person.completedJobsCount} Pekerjaan Selesai
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 sm:self-center">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 block uppercase">Jam Flat Rate vs Aktual</span>
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {person.flatRateHoursEarned} Jam / {person.actualWorkHours} Jam
                          </span>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <span className="text-[10px] font-mono text-slate-400 block uppercase">Skor Efisiensi</span>
                          <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {person.efficiencyRatio}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Breakdown per Peran (Role Comparison Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Foreman Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Shield size={16} />
                  <span>Tim Foreman</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {stats.roleCounts.Foreman} Pengawas
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                108.7% <span className="text-xs font-normal text-slate-400">Avg Efisiensi</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Supervisi alur SPK, verifikasi quality control, dan koordinasi dispatching shift malam.
              </p>
            </div>

            {/* Mekanik Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Wrench size={16} />
                  <span>Tim Mekanik</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {stats.roleCounts.Mekanik} Teknisi
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                105.8% <span className="text-xs font-normal text-slate-400">Avg Efisiensi</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Pelaksana overhaul engine, trouble hidrolik, servis berkala 250 HM, dan rembesan silinder.
              </p>
            </div>

            {/* Tireman Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <CircleDot size={16} />
                  <span>Tim Tireman</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {stats.roleCounts.Tireman} Tire Crew
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                104.5% <span className="text-xs font-normal text-slate-400">Avg Efisiensi</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Manajemen tekanan ban OTR hauler, rotasi tapak ban, inspeksi velg retak, dan safety inflation cage.
              </p>
            </div>

            {/* Helper Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <HardHat size={16} />
                  <span>Tim Helper</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {stats.roleCounts.Helper} Helper
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                96.2% <span className="text-xs font-normal text-slate-400">Avg Efisiensi</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Asistensi servis lube bay, pencucian komponen mesin, penyiapan SST tools, dan housekeeping 5R workshop.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOARD PENUGASAN BAY (LIVE BOARD) */}
      {activeTab === 'live-board' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers size={18} className="text-blue-500" />
                  <span>LIVE WORK BAY &amp; FIELD ASSIGNMENT BOARD</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Status perbaikan langsung di workshop dan unit yang sedang dikerjakan mekanik
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                {personnel.filter(p => p.status === 'In Job').length} Unit Sedang Ditangani
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personnel
                .filter(p => p.status === 'In Job' && p.activeJob)
                .map((person) => {
                  const roleBadge = getRoleBadge(person.role);
                  return (
                    <div
                      key={person.id}
                      className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Header: Unit Code & Bay */}
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black font-mono text-blue-900 dark:text-blue-200">
                            {person.activeJob?.unitCode}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600 text-white">
                            {person.activeJob?.bay || 'Bay Workshop'}
                          </span>
                        </div>

                        {/* Task Description */}
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                          {person.activeJob?.jobType}
                        </div>

                        {/* Assignee Info */}
                        <div className="pt-2 border-t border-blue-100 dark:border-blue-900/60 flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border ${roleBadge.bg}`}>
                            <roleBadge.icon size={14} className={roleBadge.iconColor} />
                          </div>
                          <div>
                            <span className="font-bold text-xs font-mono text-slate-900 dark:text-white block">
                              {person.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {person.role} ({person.nrp})
                            </span>
                          </div>
                        </div>

                        {/* Start time & Target Hours */}
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>Mulai: {person.activeJob?.startTime}</span>
                          <span>Target: <strong>{person.activeJob?.targetHours} Jam</strong></span>
                        </div>
                      </div>

                      {/* Complete Task Trigger */}
                      <button
                        type="button"
                        onClick={() => handleOpenComplete(person)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer mt-2"
                      >
                        <Check size={14} />
                        <span>Selesaikan Pekerjaan</span>
                      </button>
                    </div>
                  );
                })}

              {personnel.filter(p => p.status === 'In Job').length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 font-mono text-xs">
                  Tidak ada unit yang sedang dalam proses perbaikan fisik saat ini. Semua personil standby atau siap ditugaskan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOG RIWAYAT TUGAS & SERVIS */}
      {activeTab === 'task-history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText size={18} className="text-emerald-500" />
                <span>LOG RIWAYAT TUGAS &amp; AUDIT EFISIENSI MANPOWER</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Daftar pekerjaan yang telah diselesaikan beserta catatan jam aktual vs standar flat rate
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              Total: {taskLogs.length} Pekerjaan Selesai
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-950/60 font-mono text-[11px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Waktu Selesai</th>
                  <th className="py-3 px-4">Personil &amp; Role</th>
                  <th className="py-3 px-4">Unit Armada</th>
                  <th className="py-3 px-4">Uraian Tugas</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Jam Aktual</th>
                  <th className="py-3 px-4">Flat Rate</th>
                  <th className="py-3 px-4">Efisiensi</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                {taskLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {log.completedAt}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{log.personName}</span>
                      <span className="text-[10px] text-slate-400">{log.role}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {log.unitCode}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-800 dark:text-slate-200 max-w-xs">
                      {log.taskTitle}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {log.actualHours} Jam
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {log.flatRateHours} Jam
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                        log.efficiencyScore >= 105 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' 
                          : log.efficiencyScore >= 95 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      }`}>
                        {log.efficiencyScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-[11px] text-slate-500 max-w-xs truncate">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: PENGATURAN SHIFT KERJA & DISTRIBUSI BEBAN KERJA */}
      {/* ==================================================== */}
      {activeTab === 'shifts' && (
        <div className="space-y-6 animate-fadeIn" id="manpower-shifts-tab">
          {/* Subheader & Action Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                  <Clock size={20} />
                </div>
                <h3 className="text-base font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                  PENGATURAN SHIFT KERJA &amp; DISTRIBUSI BEBAN KERJA
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
                Atur rotasi regu teknisi, pantau keseimbangan beban kerja antar shift, dan jadwalkan roster 7 hari dengan kepatuhan minimum pengawas lapangan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsRotateConfirmModalOpen(true)}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Rotasi Shift Mingguan"
              >
                <ArrowRightLeft size={14} />
                <span>Rotasi Shift (1 ⇄ 2)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShiftConfigModalOpen(true)}
                className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-mono font-bold text-xs flex items-center gap-2 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                title="Konfigurasi Jam & Parameter Shift"
              >
                <Settings2 size={14} />
                <span>Konfigurasi Shift</span>
              </button>
            </div>
          </div>

          {/* Sub-tab Pill Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setShiftSubTab('workload')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                shiftSubTab === 'workload'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-800 hover:text-slate-950 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-bold'
              }`}
            >
              <BarChart3 size={15} />
              <span>Distribusi Beban Kerja &amp; Alokasi</span>
            </button>

            <button
              type="button"
              onClick={() => setShiftSubTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                shiftSubTab === 'matrix'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-800 hover:text-slate-950 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-bold'
              }`}
            >
              <Calendar size={15} />
              <span>Matriks Roster 7 Hari</span>
            </button>

            <button
              type="button"
              onClick={() => setShiftSubTab('compliance')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                shiftSubTab === 'compliance'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-800 hover:text-slate-950 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-bold'
              }`}
            >
              <Shield size={15} />
              <span>Kepatuhan SOP &amp; Safety</span>
            </button>
          </div>

          {/* 4 Shift Distribution Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Shift 1 (Pagi) Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                    <Sun size={15} />
                    <span>{shiftConfig.shift1Name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                    {shiftConfig.shift1Start} - {shiftConfig.shift1End}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {shiftStats.shift1.total}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {shiftStats.shift1.onDuty} On Duty &bull; {shiftStats.shift1.inJob} In Job
                  </span>
                </div>

                {/* Role breakdown chips */}
                <div className="mt-2.5 flex flex-wrap gap-1 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {shiftStats.shift1.foreman} Foreman
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {shiftStats.shift1.mekanik} Mekanik
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {shiftStats.shift1.tireman} Tireman
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-yellow-50 dark:bg-yellow-950/70 text-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                    {shiftStats.shift1.autoElec} Elec
                  </span>
                </div>

                {/* Workload Progress Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Beban Terjadwal: {shiftStats.shift1.workloadHours} Jam</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{shiftStats.shift1.workloadPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${Math.min(100, shiftStats.shift1.workloadPercent)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[10px] font-mono flex items-center justify-between">
                <span className={shiftStats.shift1.hasForeman ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {shiftStats.shift1.hasForeman ? '✓ Pengawas Lengkap' : '⚠️ Kurang Pengawas'}
                </span>
                <button
                  type="button"
                  onClick={() => setShiftFilterTab('Shift 1 (Pagi)')}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  Filter Tim &rarr;
                </button>
              </div>
            </div>

            {/* Shift 2 (Malam) Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    <Moon size={15} />
                    <span>{shiftConfig.shift2Name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-800">
                    {shiftConfig.shift2Start} - {shiftConfig.shift2End}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {shiftStats.shift2.total}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {shiftStats.shift2.onDuty} On Duty &bull; {shiftStats.shift2.inJob} In Job
                  </span>
                </div>

                {/* Role breakdown chips */}
                <div className="mt-2.5 flex flex-wrap gap-1 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {shiftStats.shift2.foreman} Foreman
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {shiftStats.shift2.mekanik} Mekanik
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {shiftStats.shift2.tireman} Tireman
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-yellow-50 dark:bg-yellow-950/70 text-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                    {shiftStats.shift2.autoElec} Elec
                  </span>
                </div>

                {/* Workload Progress Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Beban Terjadwal: {shiftStats.shift2.workloadHours} Jam</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{shiftStats.shift2.workloadPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(100, shiftStats.shift2.workloadPercent)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[10px] font-mono flex items-center justify-between">
                <span className={shiftStats.shift2.hasForeman ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {shiftStats.shift2.hasForeman ? '✓ Pengawas Lengkap' : '⚠️ Kurang Pengawas'}
                </span>
                <button
                  type="button"
                  onClick={() => setShiftFilterTab('Shift 2 (Malam)')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                >
                  Filter Tim &rarr;
                </button>
              </div>
            </div>

            {/* Standby & Roster Off Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">
                    <Zap size={15} />
                    <span>Cadangan &amp; Roster Off</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-300 dark:border-cyan-800">
                    {shiftStats.standbyCount + shiftStats.rosterOffCount} Orang
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900">
                    <span className="text-[10px] font-mono font-bold text-cyan-800 dark:text-cyan-300 block">
                      STANDBY
                    </span>
                    <span className="text-2xl font-black font-mono text-cyan-900 dark:text-cyan-100">
                      {shiftStats.standbyCount}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 block mt-0.5">
                      On-Call Siaga
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 block">
                      ROSTER OFF
                    </span>
                    <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                      {shiftStats.rosterOffCount}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
                      Libur Rotasi
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-[11px] font-sans text-slate-500 dark:text-slate-400">
                  Personil standby siap diterjunkan menggantikan teknisi yang berhalangan atau mengatasi lonjakan breakdown alat berat mendadak di pit.
                </p>
              </div>

              <div className="mt-3 pt-2 text-[10px] font-mono flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Cadangan Cepat: {shiftStats.standbyCount}</span>
                <button
                  type="button"
                  onClick={() => setShiftFilterTab('Standby')}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Lihat Standby &rarr;
                </button>
              </div>
            </div>

            {/* Attendance & Compliance Summary Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    <UserCheck size={15} />
                    <span>Kehadiran &amp; SOP</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                    {shiftStats.attendanceRate}% Hadir
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {stats.onDutyCount} <span className="text-sm font-normal text-slate-400">/ {stats.total} Orang</span>
                  </span>
                  <span className="text-[11px] font-sans text-slate-500 block mt-1">
                    Total personil aktif bertugas fisik di workshop saat ini.
                  </span>
                </div>

                {/* Checklist Kepatuhan */}
                <div className="mt-2 space-y-1 font-mono text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Foreman Pagi (POP):</span>
                    <span className={shiftStats.shift1.hasForeman ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      {shiftStats.shift1.hasForeman ? '✓ OK' : '⚠️ KOSONG'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Foreman Malam (POP):</span>
                    <span className={shiftStats.shift2.hasForeman ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      {shiftStats.shift2.hasForeman ? '✓ OK' : '⚠️ KOSONG'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Kesiapan Tire Bay:</span>
                    <span className="text-emerald-600 font-bold">✓ TERPENUHI</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[10px] font-mono flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Fatigue SOP:</span>
                <span className="text-emerald-600 font-bold">Max 12 Jam Kerja</span>
              </div>
            </div>
          </div>

          {/* Multi-select Bulk Actions Floating / Sticky Bar */}
          {selectedPersonnelIds.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/80 border-2 border-blue-400 dark:border-blue-700 rounded-2xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs">
                  <CheckSquare size={16} />
                </div>
                <div>
                  <span className="font-mono font-bold text-xs text-blue-900 dark:text-blue-100 block">
                    {selectedPersonnelIds.length} Personil Dipilih
                  </span>
                  <span className="text-[10px] font-sans text-blue-700 dark:text-blue-300">
                    Terapkan aksi shift massal ke teknisi yang dicentang
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickBulkShift('Shift 1 (Pagi)')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sun size={13} />
                  <span>Pindah Shift 1</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickBulkShift('Shift 2 (Malam)')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Moon size={13} />
                  <span>Pindah Shift 2</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickBulkShift('Standby', 'Standby')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap size={13} />
                  <span>Set Standby</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickBulkShift('Roster Off', 'Roster Off')}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Set Roster Off</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBulkShiftModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Settings2 size={13} />
                  <span>Atur Lengkap...</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPersonnelIds([])}
                  className="px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-blue-200/50 text-blue-800 dark:text-blue-200 font-mono text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* SUB-TAB 1: DISTRIBUSI BEBAN KERJA & ALOKASI TABEL */}
          {shiftSubTab === 'workload' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              {/* Filter Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-bold mr-1">Filter Shift:</span>
                  {(['ALL', 'Shift 1 (Pagi)', 'Shift 2 (Malam)', 'Standby', 'Roster Off'] as const).map((sFilter) => (
                    <button
                      key={sFilter}
                      type="button"
                      onClick={() => setShiftFilterTab(sFilter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        shiftFilterTab === sFilter
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {sFilter === 'ALL' ? `Semua (${personnel.length})` : sFilter}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
                  >
                    <CheckSquare size={13} />
                    <span>Pilih Semua Tampil</span>
                  </button>
                </div>
              </div>

              {/* Table of Personnel Shifts & Workload */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 font-mono text-[11px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={filteredPersonnel.length > 0 && filteredPersonnel.every(p => selectedPersonnelIds.includes(p.id))}
                          onChange={handleSelectAllVisible}
                          className="rounded text-blue-600 cursor-pointer"
                          title="Pilih Semua"
                        />
                      </th>
                      <th className="py-3 px-3">Personil &amp; NRP</th>
                      <th className="py-3 px-3">Peran &amp; Level</th>
                      <th className="py-3 px-3">Shift Kerja</th>
                      <th className="py-3 px-3">Status Kehadiran</th>
                      <th className="py-3 px-3">Bay Penugasan</th>
                      <th className="py-3 px-3">Pekerjaan Aktif</th>
                      <th className="py-3 px-3">Jam Fisik</th>
                      <th className="py-3 px-3 text-right">Aksi Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                    {personnel
                      .filter(p => shiftFilterTab === 'ALL' || p.shift === shiftFilterTab)
                      .map((person) => {
                        const isSelected = selectedPersonnelIds.includes(person.id);
                        const roleBadge = getRoleBadge(person.role);
                        const statusBadge = getStatusBadge(person.status);

                        return (
                          <tr
                            key={person.id}
                            className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                              isSelected ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                            }`}
                          >
                            <td className="py-3 px-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectPerson(person.id)}
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 dark:text-white block">{person.name}</span>
                              <span className="text-[10px] text-slate-400">{person.nrp}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${roleBadge.bg}`}>
                                {person.role}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{person.skillLevel}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                person.shift === 'Shift 1 (Pagi)'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                  : person.shift === 'Shift 2 (Malam)'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                                  : person.shift === 'Standby'
                                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {person.shift === 'Shift 1 (Pagi)' && <Sun size={12} className="text-amber-500" />}
                                {person.shift === 'Shift 2 (Malam)' && <Moon size={12} className="text-indigo-500" />}
                                {person.shift === 'Standby' && <Zap size={12} className="text-cyan-500" />}
                                <span>{person.shift}</span>
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                                {person.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                              {person.assignedBay || 'Workshop'}
                            </td>
                            <td className="py-3 px-3 font-sans">
                              {person.activeJob ? (
                                <div>
                                  <span className="font-bold text-blue-600 dark:text-blue-400 text-xs block font-mono">
                                    {person.activeJob.unitCode} ({person.activeJob.targetHours}h)
                                  </span>
                                  <span className="text-[11px] text-slate-600 dark:text-slate-300 block truncate max-w-xs">
                                    {person.activeJob.jobType}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-mono text-[11px]">- Siap Tugas -</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">
                              {person.actualWorkHours} Jam
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenQuickShift(person)}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-mono font-bold text-[11px] border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                              >
                                Ubah Shift
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: MATRIKS ROSTER 7 HARI */}
          {shiftSubTab === 'matrix' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-white uppercase flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" />
                    <span>JADWAL MATRIKS ROSTER MINGGUAN (7 HARI)</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                    Klik langsung pada kotak hari personil untuk merotasi shift kerja secara instan: ☀️ Pagi &rarr; 🌙 Malam &rarr; ⚡ Standby &rarr; 🌴 Off
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Pagi (P1)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Malam (M2)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Standby (SBY)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Off (OFF)
                  </span>
                </div>
              </div>

              {/* Roster Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Personil</th>
                      <th className="py-3 px-2">Peran</th>
                      {DAYS_OF_WEEK.map(d => (
                        <th key={d.key} className="py-3 px-2 text-center">
                          <span className="block font-bold text-slate-700 dark:text-slate-300">{d.label}</span>
                          <span className="text-[9px] text-slate-400">{d.short}</span>
                        </th>
                      ))}
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {personnel.map(person => {
                      const roleBadge = getRoleBadge(person.role);

                      return (
                        <tr key={person.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 dark:text-white block">{person.name}</span>
                            <span className="text-[10px] text-slate-400">{person.nrp}</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${roleBadge.bg}`}>
                              {person.role}
                            </span>
                          </td>
                          {DAYS_OF_WEEK.map(d => {
                            const dayShift = getPersonDayShift(person, d.key);
                            const isPagi = dayShift === 'Shift 1 (Pagi)';
                            const isMalam = dayShift === 'Shift 2 (Malam)';
                            const isStandby = dayShift === 'Standby';

                            return (
                              <td key={d.key} className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleWeeklyRosterCycle(person, d.key)}
                                  className={`w-full py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                    isPagi
                                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
                                      : isMalam
                                      ? 'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800'
                                      : isStandby
                                      ? 'bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800'
                                      : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                  }`}
                                  title={`Klik untuk ubah jadwal ${d.label}`}
                                >
                                  {isPagi ? '☀️ P1' : isMalam ? '🌙 M2' : isStandby ? '⚡ SBY' : '🌴 OFF'}
                                </button>
                              </td>
                            );
                          })}
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenQuickShift(person)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Edit Shift Lengkap"
                            >
                              <Edit2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Daily Coverage Summary Footer */}
                  <tfoot className="bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-200 dark:border-slate-800 font-bold text-[10px]">
                    <tr>
                      <td colSpan={2} className="py-3 px-3 text-slate-700 dark:text-slate-300 uppercase">
                        Total Personil Aktif / Hari:
                      </td>
                      {DAYS_OF_WEEK.map(d => {
                        const activeCount = personnel.filter(p => {
                          const s = getPersonDayShift(p, d.key);
                          return s === 'Shift 1 (Pagi)' || s === 'Shift 2 (Malam)';
                        }).length;

                        return (
                          <td key={d.key} className="py-3 px-2 text-center text-blue-600 dark:text-blue-400">
                            <span>{activeCount} Hadir</span>
                          </td>
                        );
                      })}
                      <td className="py-3 px-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: KEPATUHAN SOP & SAFETY STAFFING */}
          {shiftSubTab === 'compliance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Shield size={18} className="text-emerald-500" />
                  <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-white uppercase">
                    STANDAR MINIMUM STAFFING OPERASIONAL
                  </h4>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Pengawas POP ESDM per Shift</span>
                      <span className="text-[11px] text-slate-500 font-sans">Kewajiban regulasi keselamatan pertambangan: 1 Foreman per regu</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ✓ Memenuhi
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Kesiapan Emergency Response Breakdown Pit</span>
                      <span className="text-[11px] text-slate-500 font-sans">Mekanik standby night shift untuk unit breakdown mendadak</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ✓ Memenuhi
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Fatigue Management (Batas Jam Kerja)</span>
                      <span className="text-[11px] text-slate-500 font-sans">Maksimal 12 jam continuous duty (termasuk overtime darurat)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Terkontrol
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <TrendingUp size={18} className="text-blue-500" />
                  <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-white uppercase">
                    REKOMENDASI DISTRIBUSI BEBAN KERJA
                  </h4>
                </div>

                <div className="space-y-2.5 font-sans text-xs text-slate-600 dark:text-slate-300">
                  <p className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 font-mono text-xs">
                    💡 <strong>Analisis Operasional:</strong> Shift 1 Pagi memegang 65% beban preventive maintenance overhaul terencana, sedangkan Shift 2 Malam difokuskan pada inspeksi backlog dan quick tire replace agar armada siap beroperasi di hauling pagi.
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-500">Rekomendasi Rotasi Selanjutnya:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Senin Depan (Mingguan)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: TAMBAH / EDIT PERSONIL MANPOWER */}
      {/* ==================================================== */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-scaleUp overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                  {editingPerson ? 'EDIT PROFIL PERSONIL' : 'TAMBAH PERSONIL MANPOWER'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Lengkapi data personil mekanik, foreman, helper, atau tireman
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPerson} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NRP */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NRP (Nomor Registrasi Pegawai) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nrp}
                    onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Suryadi Pratama"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peran / Posisi *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as ManpowerRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Foreman">Foreman (Pengawas Workshop)</option>
                    <option value="Mekanik">Mekanik (Heavy Equipment)</option>
                    <option value="Helper">Helper (Asisten Mekanik)</option>
                    <option value="Tireman">Tireman (Spesialis Ban OTR)</option>
                    <option value="Auto-Electrician">Auto-Electrician (Kelistrikan)</option>
                    <option value="Welder">Welder (Fabrikasi &amp; Pengelasan)</option>
                  </select>
                </div>

                {/* Level Keahlian */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat Keahlian
                  </label>
                  <select
                    value={formData.skillLevel}
                    onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value as ManpowerSkillLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                  >
                    <option value="Junior">Junior Technician</option>
                    <option value="Senior">Senior Technician</option>
                    <option value="Lead">Team Lead / Kepala Regu</option>
                    <option value="Spesialis">Spesialis Komponen</option>
                  </select>
                </div>

                {/* Shift */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shift Kerja
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as ManpowerShift })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                  >
                    <option value="Shift 1 (Pagi)">Shift 1 (Pagi 07:00 - 17:00)</option>
                    <option value="Shift 2 (Malam)">Shift 2 (Malam 19:00 - 05:00)</option>
                    <option value="Roster Off">Roster Off (Libur Bergilir)</option>
                    <option value="Standby">Standby On-Call</option>
                  </select>
                </div>

                {/* Status Kehadiran */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status Personil
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ManpowerStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                  >
                    <option value="On Duty">On Duty (Hadir Siap Tugas)</option>
                    <option value="In Job">In Job (Sedang Mengerjakan Unit)</option>
                    <option value="Standby">Standby</option>
                    <option value="Roster Off">Roster Off</option>
                    <option value="Cuti / Izin">Cuti / Izin</option>
                  </select>
                </div>

                {/* No Telepon */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Kontak / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+62 812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Assigned Bay */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Area / Bay Penugasan
                  </label>
                  <input
                    type="text"
                    placeholder="Bay 1 / Lube Bay / Tire Bay"
                    value={formData.assignedBay}
                    onChange={(e) => setFormData({ ...formData, assignedBay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Keahlian Khusus (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="Engine Overhaul, Troubleshooting Hidrolik, CAT Common Rail"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sertifikasi &amp; Pelatihan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="POP Pertambangan, Komatsu Specialist, TIA Earthmover OTR"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold shadow-xs cursor-pointer"
                >
                  {editingPerson ? 'Simpan Perubahan' : 'Tambahkan Personil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: TUGASKAN UNIT / PEKERJAAN (ASSIGN JOB) */}
      {/* ==================================================== */}
      {isAssignModalOpen && selectedPersonForAssign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                  TUGASKAN UNIT ARMADA
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Kepada: <strong>{selectedPersonForAssign.name}</strong> ({selectedPersonForAssign.role})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitAssign} className="space-y-4 text-xs font-sans">
              {/* Unit Selection */}
              <div>
                <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Unit Armada *
                </label>
                <select
                  required
                  value={assignForm.unitCode}
                  onChange={(e) => setAssignForm({ ...assignForm, unitCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.code}>
                      {u.code} - {u.name} ({u.status})
                    </option>
                  ))}
                  {units.length === 0 && (
                    <option value="EXCA-01">EXCA-01 - Caterpillar 320D</option>
                  )}
                </select>
              </div>

              {/* Task Description */}
              <div>
                <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Uraian Pekerjaan / Keluhan Unit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Overhaul Gigi 3 Transmisi & Ganti Kampas"
                  value={assignForm.jobType}
                  onChange={(e) => setAssignForm({ ...assignForm, jobType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Bay Location */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lokasi Workshop / Bay
                  </label>
                  <select
                    value={assignForm.bay}
                    onChange={(e) => setAssignForm({ ...assignForm, bay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                  >
                    <option value="Bay 1 (Heavy Repair)">Bay 1 (Heavy Repair)</option>
                    <option value="Bay 2 (Service PM)">Bay 2 (Service PM)</option>
                    <option value="Bay 3 (Electrical & AC)">Bay 3 (Electrical &amp; AC)</option>
                    <option value="Tire Bay & OTR Area">Tire Bay &amp; OTR Area</option>
                    <option value="Lube Bay (Oli & Greasing)">Lube Bay (Oli &amp; Greasing)</option>
                    <option value="Area Tambang (Field Quick Response)">Area Tambang (Field Pit)</option>
                  </select>
                </div>

                {/* Target Hours */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Jam Standar (Flat Rate)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={assignForm.targetHours}
                    onChange={(e) => setAssignForm({ ...assignForm, targetHours: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Wrench size={14} />
                  <span>Mulai Penugasan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: SELESAIKAN PEKERJAAN (COMPLETE TASK) */}
      {/* ==================================================== */}
      {isCompleteTaskModalOpen && selectedPersonForComplete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                  SELESAIKAN TUGAS PERBAIKAN
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Personil: <strong>{selectedPersonForComplete.name}</strong> &bull; Unit: <strong>{selectedPersonForComplete.activeJob?.unitCode || 'Armada'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCompleteTaskModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitComplete} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Uraian Pekerjaan Selesai
                </label>
                <input
                  type="text"
                  required
                  value={completeForm.taskTitle}
                  onChange={(e) => setCompleteForm({ ...completeForm, taskTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Jam Aktual */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Aktual Fisik (Jam) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    required
                    value={completeForm.actualHours}
                    onChange={(e) => setCompleteForm({ ...completeForm, actualHours: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Jam Standar Flat Rate */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Standar Flat Rate (Jam) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    required
                    value={completeForm.flatRateHours}
                    onChange={(e) => setCompleteForm({ ...completeForm, flatRateHours: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Calculated Live Efficiency Score Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">
                    Hasil Efisiensi Pengerjaan:
                  </span>
                  <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    {completeForm.actualHours > 0 
                      ? ((completeForm.flatRateHours / completeForm.actualHours) * 100).toFixed(1) 
                      : 100}%
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  (completeForm.flatRateHours / completeForm.actualHours) >= 1.05
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {(completeForm.flatRateHours / completeForm.actualHours) >= 1.0
                    ? 'Produktivitas Positif'
                    : 'Di Bawah Standar Flat Rate'}
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Teknisi / Hasil QC Lapangan
                </label>
                <textarea
                  rows={2}
                  value={completeForm.notes}
                  onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCompleteTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  <span>Simpan &amp; Perbarui Metrik</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: DETAIL PERSONIL & SERTIFIKASI */}
      {/* ==================================================== */}
      {isDetailModalOpen && detailPerson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black font-mono text-lg border border-blue-200 dark:border-blue-900">
                  {detailPerson.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    {detailPerson.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    {detailPerson.nrp} &bull; {detailPerson.role} ({detailPerson.skillLevel})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Efisiensi</span>
                  <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {detailPerson.efficiencyRatio}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Utilisasi</span>
                  <span className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">
                    {detailPerson.utilizationRate}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">WO Selesai</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {detailPerson.completedJobsCount} Unit
                  </span>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">
                  Keahlian &amp; Spesialisasi Komponen:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {detailPerson.specialties.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[11px] font-mono"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">
                  Sertifikasi &amp; Lisensi K3 / Pabrikan:
                </span>
                <div className="space-y-1.5">
                  {detailPerson.certifications.map((c, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                    >
                      <Award size={14} className="text-amber-500 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact info */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <Phone size={13} />
                  <span>Kontak: {detailPerson.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={13} />
                  <span>Mulai Bergabung: {detailPerson.joinedDate}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-mono font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: ATUR SHIFT & KEHADIRAN PERSONIL TUNGGAL */}
      {/* ==================================================== */}
      {isQuickShiftModalOpen && quickShiftPerson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-amber-500" />
                  <span>ATUR SHIFT &amp; KEHADIRAN</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Ubah jadwal shift, status kehadiran fisik, dan penempatan bay
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickShiftModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Person Card Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black font-mono text-sm border border-amber-500/20">
                {quickShiftPerson.name.charAt(0)}
              </div>
              <div className="flex-1">
                <span className="font-bold text-slate-900 dark:text-white block font-mono text-sm">
                  {quickShiftPerson.name}
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span>{quickShiftPerson.nrp}</span>
                  <span>&bull;</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{quickShiftPerson.role}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleQuickShiftSubmit} className="space-y-4">
              {/* Shift Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Shift Penugasan:
                </label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {[
                    { id: 'Shift 1 (Pagi)', label: 'Shift 1 (Pagi)', icon: Sun, color: 'border-amber-400 text-amber-600' },
                    { id: 'Shift 2 (Malam)', label: 'Shift 2 (Malam)', icon: Moon, color: 'border-indigo-400 text-indigo-600' },
                    { id: 'Standby', label: 'Standby On-Call', icon: Zap, color: 'border-cyan-400 text-cyan-600' },
                    { id: 'Roster Off', label: 'Roster Off (Libur)', icon: Calendar, color: 'border-slate-400 text-slate-600' }
                  ].map((s) => {
                    const Icon = s.icon;
                    const isChecked = quickShiftTarget === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setQuickShiftTarget(s.id as ManpowerShift)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-blue-50 border-blue-600 text-blue-800 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-200 font-bold ring-2 ring-blue-500/20'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={15} />
                        <span className="text-[11px] truncate">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attendance Status Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Status Kehadiran Hari Ini:
                </label>
                <select
                  value={quickStatusTarget}
                  onChange={(e) => setQuickStatusTarget(e.target.value as ManpowerStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="On Duty">On Duty (Hadir Siap Tugas)</option>
                  <option value="In Job">In Job (Sedang Mengerjakan Unit)</option>
                  <option value="Standby">Standby (Siaga Lapangan)</option>
                  <option value="Roster Off">Roster Off (Off Site / Cuti)</option>
                </select>
              </div>

              {/* Bay Penugasan */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Lokasi / Bay Penugasan:
                </label>
                <select
                  value={quickBayTarget}
                  onChange={(e) => setQuickBayTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bay 1 (Heavy Repair)">Bay 1 (Heavy Repair)</option>
                  <option value="Bay 2 (Heavy Repair)">Bay 2 (Heavy Repair)</option>
                  <option value="Bay 3 (Periodic Maintenance)">Bay 3 (Periodic Maintenance)</option>
                  <option value="Bay 4 (Periodic Maintenance)">Bay 4 (Periodic Maintenance)</option>
                  <option value="Bay 5 (Tire & Undercarriage)">Bay 5 (Tire &amp; Undercarriage)</option>
                  <option value="Bay 6 (Electrical & AC)">Bay 6 (Electrical &amp; AC)</option>
                  <option value="Bay 7 (Component Overhaul)">Bay 7 (Component Overhaul)</option>
                  <option value="Bay 8 (Fabrication & Welding)">Bay 8 (Fabrication &amp; Welding)</option>
                  <option value="Pit Stop & Field Service">Pit Stop &amp; Field Service (Mobile)</option>
                  <option value="Workshop Utama">Workshop Utama</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickShiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 6: ATUR SHIFT MASSAL (BULK SHIFT ASSIGNMENT) */}
      {/* ==================================================== */}
      {isBulkShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare size={18} className="text-blue-500" />
                  <span>ATUR SHIFT MASSAL ({selectedPersonnelIds.length} PERSONIL)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Terapkan perombakan shift dan status kehadiran serentak untuk efisiensi rotasi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkShiftModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selected Personnel Chips Preview */}
            <div>
              <span className="block text-[11px] font-mono font-bold text-slate-500 uppercase mb-1.5">
                Daftar Personil Yang Akan Diubah:
              </span>
              <div className="max-h-28 overflow-y-auto p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
                {selectedPersonnelIds.map(id => {
                  const p = personnel.find(item => item.id === id);
                  if (!p) return null;
                  return (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    >
                      {p.name} ({p.role})
                    </span>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleBulkShiftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Pilih Shift Sasaran:
                </label>
                <select
                  value={bulkShiftTarget}
                  onChange={(e) => setBulkShiftTarget(e.target.value as ManpowerShift)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Shift 1 (Pagi)">☀️ Shift 1 (Pagi) • 07:00 - 15:30</option>
                  <option value="Shift 2 (Malam)">🌙 Shift 2 (Malam) • 19:00 - 03:30</option>
                  <option value="Standby">⚡ Standby On-Call</option>
                  <option value="Roster Off">🌴 Roster Off / Cuti Rotasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Pilih Status Kehadiran:
                </label>
                <select
                  value={bulkStatusTarget}
                  onChange={(e) => setBulkStatusTarget(e.target.value as ManpowerStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="On Duty">On Duty (Siaga Kerja)</option>
                  <option value="Standby">Standby</option>
                  <option value="Roster Off">Roster Off (Libur)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Penempatan Bay / Area Workshop:
                </label>
                <select
                  value={bulkBayTarget}
                  onChange={(e) => setBulkBayTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Workshop Utama">Workshop Utama</option>
                  <option value="Bay 1 (Heavy Repair)">Bay 1 (Heavy Repair)</option>
                  <option value="Bay 2 (Heavy Repair)">Bay 2 (Heavy Repair)</option>
                  <option value="Bay 3 (Periodic Maintenance)">Bay 3 (Periodic Maintenance)</option>
                  <option value="Bay 4 (Periodic Maintenance)">Bay 4 (Periodic Maintenance)</option>
                  <option value="Bay 5 (Tire & Undercarriage)">Bay 5 (Tire &amp; Undercarriage)</option>
                  <option value="Bay 6 (Electrical & AC)">Bay 6 (Electrical &amp; AC)</option>
                  <option value="Pit Stop & Field Service">Pit Stop &amp; Field Service</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkShiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs shadow-md cursor-pointer"
                >
                  Terapkan Perubahan Massal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 7: KONFIRMASI ROTASI SHIFT MINGGUAN (1 <-> 2) */}
      {/* ==================================================== */}
      {isRotateConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <ArrowRightLeft size={24} />
              </div>
              <div>
                <h3 className="text-base font-extrabold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                  ROTASI SHIFT MINGGUAN?
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Tukar regu Shift 1 (Pagi) ⇄ Shift 2 (Malam)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-sans text-slate-600 dark:text-slate-300">
              <p>
                Sistem akan secara otomatis menukar regu kerja:
              </p>
              <ul className="space-y-1 font-mono text-[11px] list-disc list-inside text-slate-700 dark:text-slate-300">
                <li>Seluruh teknisi <strong>Shift 1 (Pagi)</strong> akan pindah ke <strong>Shift 2 (Malam)</strong>.</li>
                <li>Seluruh teknisi <strong>Shift 2 (Malam)</strong> akan pindah ke <strong>Shift 1 (Pagi)</strong>.</li>
                <li>Status Standby dan Roster Off tetap dipertahankan.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRotateConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRotateShifts}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <ArrowRightLeft size={14} />
                <span>Ya, Rotasi Shift Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 8: KONFIGURASI PARAMETER SHIFT KERJA */}
      {/* ==================================================== */}
      {isShiftConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings2 size={18} className="text-blue-500" />
                  <span>KONFIGURASI PARAMETER SHIFT</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Sesuaikan jam operasional shift dan ambang batas minimum personil
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShiftConfigModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Shift 1 Config */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold uppercase">
                  <Sun size={15} />
                  <span>Shift 1 (Pagi)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">Jam Mulai:</label>
                    <input
                      type="text"
                      value={shiftConfig.shift1Start}
                      onChange={(e) => setShiftConfig({ ...shiftConfig, shift1Start: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">Jam Selesai:</label>
                    <input
                      type="text"
                      value={shiftConfig.shift1End}
                      onChange={(e) => setShiftConfig({ ...shiftConfig, shift1End: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">Min Foreman POP:</label>
                    <input
                      type="number"
                      value={shiftConfig.shift1MinForeman}
                      onChange={(e) => setShiftConfig({ ...shiftConfig, shift1MinForeman: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">Min Mekanik:</label>
                    <input
                      type="number"
                      value={shiftConfig.shift1MinManpower}
                      onChange={(e) => setShiftConfig({ ...shiftConfig, shift1MinManpower: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>
              </div>

              {/* Shift 2 Config */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold uppercase">
                  <Moon size={15} />
                  <span>Shift 2 (Malam)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">Jam Mulai:</label>
                    <input
                      type="text"
                      value={shiftConfig.shift2Start}
                      onChange={(e) => setShiftConfig({ ...shiftConfig, shift2Start: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">Jam Selesai:</label>
                    <input
                      type="text"
                      value={shiftConfig.shift2End}
                      onChange={(e) => setShiftConfig({ ...shiftConfig, shift2End: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">Min Foreman POP:</label>
                    <input
                      type="number"
                      value={shiftConfig.shift2MinForeman}
                      onChange={(e) => setShiftConfig({ ...shiftConfig, shift2MinForeman: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">Min Mekanik:</label>
                    <input
                      type="number"
                      value={shiftConfig.shift2MinManpower}
                      onChange={(e) => setShiftConfig({ ...shiftConfig, shift2MinManpower: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsShiftConfigModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs shadow-md cursor-pointer"
              >
                Terapkan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
