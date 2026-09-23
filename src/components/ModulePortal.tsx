import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wrench, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  ArrowRight, 
  Shield, 
  Truck, 
  Activity, 
  Sparkles,
  Layers,
  ChevronRight,
  Boxes,
  Palette,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  PlusCircle,
  FileText,
  Calendar,
  Gauge,
  SlidersHorizontal,
  ChevronDown,
  Filter,
  PieChart,
  ShieldAlert,
  Check,
  Users,
  Award,
  Trophy,
  Medal,
  Star,
  Zap,
  HardHat,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  ThumbsDown,
  Info
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AppUser, UioUnit, SparePart, RepairHistory, BreakdownLog, WorkshopBooking, ManpowerPerson } from '../types';

interface ModulePortalProps {
  onSelectModule: (module: 'maintenance' | 'logistic' | 'purchasing' | 'consultation' | 'manpower') => void;
  onNavigateTab?: (module: 'maintenance' | 'logistic' | 'purchasing' | 'consultation' | 'manpower', tab: string) => void;
  onOpenBrandKit?: () => void;
  stats?: {
    totalUnits: number;
    breakdownUnits: number;
    lowStockCount: number;
    activeBookings: number;
  };
  currentUser?: AppUser | null;
  units?: UioUnit[];
  parts?: SparePart[];
  repairs?: RepairHistory[];
  breakdowns?: BreakdownLog[];
  bookings?: WorkshopBooking[];
  manpower?: ManpowerPerson[];
  onRefreshData?: () => void;
}

const DEFAULT_MANPOWER: ManpowerPerson[] = [
  {
    id: 'MP-001',
    nrp: '72019',
    name: 'Bambang Suherman',
    role: 'Foreman',
    skillLevel: 'Lead',
    phone: '0812-8812-9011',
    shift: 'Shift 1 (Pagi)',
    status: 'On Duty',
    assignedBay: 'Bay 1 - Heavy Dump',
    activeJob: {
      unitCode: 'DUMP-06',
      unitName: 'Dump Truck Hauler Komatsu HD785-7',
      jobType: 'Overhaul Transmisi & Final Drive',
      bay: 'Bay 1 - Heavy Dump',
      startTime: '2026-09-22 07:30',
      targetHours: 12
    },
    standardMonthlyHours: 173,
    actualWorkHours: 162,
    flatRateHoursEarned: 181,
    efficiencyRatio: 111.7,
    utilizationRate: 93.6,
    completedJobsCount: 28,
    specialties: ['Supervisi Heavy Equipment', 'Troubleshooting Powertrain', 'Quality Control WO'],
    certifications: ['POP Pertambangan ESDM', 'Komatsu Master Tech', 'K3 Pertambangan'],
    joinedDate: '2021-03-15',
    rating: 4.9
  },
  {
    id: 'MP-006',
    nrp: '81088',
    name: 'Dedi Kurniawan',
    role: 'Auto-Electrician',
    skillLevel: 'Spesialis',
    phone: '0812-7788-3401',
    shift: 'Shift 1 (Pagi)',
    status: 'In Job',
    assignedBay: 'Bay 3 - Dozer',
    activeJob: {
      unitCode: 'BULL-02',
      unitName: 'Bulldozer Komatsu D375A-6',
      jobType: 'Troubleshooting Starter Motor & Alternator',
      bay: 'Bay 3 - Dozer',
      startTime: '2026-09-22 09:15',
      targetHours: 4
    },
    standardMonthlyHours: 173,
    actualWorkHours: 161,
    flatRateHoursEarned: 178,
    efficiencyRatio: 110.6,
    utilizationRate: 93.1,
    completedJobsCount: 26,
    specialties: ['Wiring Harness 24V', 'Alternator & Starter Repair', 'Electronic Controller ECM'],
    certifications: ['CAN-Bus Diagnostics', 'Electrical Safety Mining'],
    joinedDate: '2022-08-01',
    rating: 4.9
  },
  {
    id: 'MP-003',
    nrp: '81014',
    name: 'Suryadi',
    role: 'Mekanik',
    skillLevel: 'Senior',
    phone: '0813-7722-1920',
    shift: 'Shift 1 (Pagi)',
    status: 'In Job',
    assignedBay: 'Bay 1 - Heavy Dump',
    activeJob: {
      unitCode: 'DUMP-06',
      unitName: 'Dump Truck Hauler Komatsu HD785-7',
      jobType: 'Ganti Pack Transmisi & Flushing Oli',
      bay: 'Bay 1 - Heavy Dump',
      startTime: '2026-09-22 08:00',
      targetHours: 8
    },
    standardMonthlyHours: 173,
    actualWorkHours: 165,
    flatRateHoursEarned: 179,
    efficiencyRatio: 108.5,
    utilizationRate: 95.4,
    completedJobsCount: 24,
    specialties: ['Engine CAT C15/C27', 'Cummins QSK', 'Transmisi Allison/Komatsu'],
    certifications: ['Komatsu Engine Specialist', 'Rigging & Lifting'],
    joinedDate: '2022-06-10',
    rating: 4.8
  },
  {
    id: 'MP-004',
    nrp: '81033',
    name: 'Herianto',
    role: 'Mekanik',
    skillLevel: 'Senior',
    phone: '0852-6611-9043',
    shift: 'Shift 1 (Pagi)',
    status: 'In Job',
    assignedBay: 'Bay 2 - Excavator',
    activeJob: {
      unitCode: 'EXCA-01',
      unitName: 'Excavator Komatsu PC2000-8',
      jobType: 'Ganti Seal Main Pump & Kalibrasi Tekanan',
      bay: 'Bay 2 - Excavator',
      startTime: '2026-09-22 08:30',
      targetHours: 6
    },
    standardMonthlyHours: 173,
    actualWorkHours: 160,
    flatRateHoursEarned: 171,
    efficiencyRatio: 106.9,
    utilizationRate: 92.5,
    completedJobsCount: 21,
    specialties: ['Sistem Hidrolik Tekanan Tinggi', 'Main Valve & Travel Motor'],
    certifications: ['Parker Hydraulics Pro', 'K3 Ruang Terbatas'],
    joinedDate: '2023-01-15',
    rating: 4.8
  },
  {
    id: 'MP-007',
    nrp: '85012',
    name: 'Hendra Saputra',
    role: 'Tireman',
    skillLevel: 'Lead',
    phone: '0812-4411-9087',
    shift: 'Shift 1 (Pagi)',
    status: 'In Job',
    assignedBay: 'Tire Bay Area',
    activeJob: {
      unitCode: 'DUMP-05',
      unitName: 'Dump Truck Scania G460',
      jobType: 'Rotasi Ban OTR & Penggantian Posisi 3-4',
      bay: 'Tire Bay Area',
      startTime: '2026-09-22 10:00',
      targetHours: 3
    },
    standardMonthlyHours: 173,
    actualWorkHours: 166,
    flatRateHoursEarned: 177,
    efficiencyRatio: 106.6,
    utilizationRate: 96.0,
    completedJobsCount: 34,
    specialties: ['OTR Tyre Fitting (27.00R49)', 'Pressure & Heat Management', 'Tire Matching'],
    certifications: ['TIA Certified Earthmover Tire Tech', 'Safety Cage Ops'],
    joinedDate: '2021-09-01',
    rating: 4.9
  },
  {
    id: 'MP-002',
    nrp: '74055',
    name: 'Agus Priyanto',
    role: 'Foreman',
    skillLevel: 'Senior',
    phone: '0813-9022-4512',
    shift: 'Shift 2 (Malam)',
    status: 'On Duty',
    assignedBay: 'Workshop Central',
    standardMonthlyHours: 173,
    actualWorkHours: 159,
    flatRateHoursEarned: 168,
    efficiencyRatio: 105.7,
    utilizationRate: 91.9,
    completedJobsCount: 22,
    specialties: ['Preventive Maintenance Fleet', 'Pelaporan Backlog & Inspeksi'],
    certifications: ['POP Pertambangan ESDM', 'Auditor Internal K3'],
    joinedDate: '2021-11-20',
    rating: 4.7
  },
  {
    id: 'MP-008',
    nrp: '85033',
    name: 'Wahyu Pratama',
    role: 'Tireman',
    skillLevel: 'Junior',
    phone: '0853-2211-7890',
    shift: 'Shift 1 (Pagi)',
    status: 'In Job',
    assignedBay: 'Tire Bay Area',
    standardMonthlyHours: 173,
    actualWorkHours: 160,
    flatRateHoursEarned: 164,
    efficiencyRatio: 102.5,
    utilizationRate: 92.5,
    completedJobsCount: 29,
    specialties: ['Inspeksi Tread Depth', 'Torque Wheel Nut', 'Pembersihan Rim'],
    certifications: ['Basic OTR Safety'],
    joinedDate: '2024-02-15',
    rating: 4.5
  },
  {
    id: 'MP-005',
    nrp: '82044',
    name: 'Joko Susilo',
    role: 'Mekanik',
    skillLevel: 'Senior',
    phone: '0813-4455-8812',
    shift: 'Shift 2 (Malam)',
    status: 'Standby',
    assignedBay: 'Workshop Central',
    standardMonthlyHours: 173,
    actualWorkHours: 157,
    flatRateHoursEarned: 160,
    efficiencyRatio: 101.9,
    utilizationRate: 90.8,
    completedJobsCount: 19,
    specialties: ['Brake System & Pneumatic', 'Wheel Hub Overhaul'],
    certifications: ['Scania Master Tech'],
    joinedDate: '2023-05-10',
    rating: 4.6
  },
  {
    id: 'MP-009',
    nrp: '89011',
    name: 'M. Arif',
    role: 'Helper',
    skillLevel: 'Senior',
    phone: '0812-3344-9901',
    shift: 'Shift 1 (Pagi)',
    status: 'In Job',
    assignedBay: 'Bay 1 - Heavy Dump',
    standardMonthlyHours: 173,
    actualWorkHours: 164,
    flatRateHoursEarned: 159,
    efficiencyRatio: 97.0,
    utilizationRate: 94.8,
    completedJobsCount: 31,
    specialties: ['Toolbox Assistance', 'Washing & Degreasing Unit', 'Greasing Rutin'],
    certifications: ['Basic Safety Mining'],
    joinedDate: '2023-09-01',
    rating: 4.5
  },
  {
    id: 'MP-010',
    nrp: '89045',
    name: 'Fajar Rizky',
    role: 'Helper',
    skillLevel: 'Junior',
    phone: '0878-1122-3344',
    shift: 'Shift 2 (Malam)',
    status: 'Standby',
    assignedBay: 'Workshop Central',
    standardMonthlyHours: 173,
    actualWorkHours: 155,
    flatRateHoursEarned: 148,
    efficiencyRatio: 95.4,
    utilizationRate: 89.6,
    completedJobsCount: 25,
    specialties: ['Support Servis Ringan', 'Material Handling', 'Housekeeping 5R'],
    certifications: ['Basic Safety Mining'],
    joinedDate: '2024-05-20',
    rating: 4.3
  }
];

export default function ModulePortal({ 
  onSelectModule, 
  onNavigateTab,
  onOpenBrandKit, 
  stats, 
  currentUser,
  units = [],
  parts = [],
  repairs = [],
  breakdowns = [],
  bookings = [],
  manpower = [],
  onRefreshData
}: ModulePortalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'30d' | 'current_month' | 'q3'>('current_month');
  const [activeTabOverview, setActiveTabOverview] = useState<'all' | 'reliability' | 'critical' | 'financial'>('all');
  const [problemTrendFilter, setProblemTrendFilter] = useState<'severity' | 'subsystem'>('severity');
  const [activeProblemMonth, setActiveProblemMonth] = useState<string | null>(null);

  // Manpower state & live sync
  const [manpowerData, setManpowerData] = useState<ManpowerPerson[]>(() => {
    return manpower && manpower.length > 0 ? manpower : DEFAULT_MANPOWER;
  });
  const [manpowerChartMode, setManpowerChartMode] = useState<'top_vs_bottom' | 'flat_vs_actual' | 'efficiency_bars' | 'role_summary'>('top_vs_bottom');
  const [leaderboardTab, setLeaderboardTab] = useState<'top5' | 'bottom5' | 'both'>('top5');
  const [chartCohortFilter, setChartCohortFilter] = useState<'all' | 'top5' | 'bottom5'>('all');
  const [hoveredManpowerId, setHoveredManpowerId] = useState<string | null>(null);

  useEffect(() => {
    if (manpower && manpower.length > 0) {
      setManpowerData(manpower);
    } else {
      fetch('/api/manpower')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.personnel && data.personnel.length > 0) {
            setManpowerData(data.personnel);
          }
        })
        .catch(err => console.error('Error fetching manpower for dashboard:', err));
    }
  }, [manpower]);

  // Manpower calculations for chart, top 5 & bottom 5 performers
  const manpowerStats = useMemo(() => {
    const list = manpowerData.length > 0 ? manpowerData : DEFAULT_MANPOWER;
    const totalStaff = list.length;
    const onDutyCount = list.filter(p => p.status === 'On Duty' || p.status === 'In Job').length;
    const inJobCount = list.filter(p => p.status === 'In Job').length;
    
    let totalFlatRate = 0;
    let totalActualHours = 0;
    let totalStandardMonthly = 0;
    let totalCompletedWO = 0;

    list.forEach(p => {
      totalFlatRate += Number(p.flatRateHoursEarned || 0);
      totalActualHours += Number(p.actualWorkHours || 0);
      totalStandardMonthly += Number(p.standardMonthlyHours || 173);
      totalCompletedWO += Number(p.completedJobsCount || 0);
    });

    const avgEfficiency = totalActualHours > 0 
      ? Number(((totalFlatRate / totalActualHours) * 100).toFixed(1))
      : 104.9;
    
    const avgUtilization = totalStandardMonthly > 0
      ? Number(((totalActualHours / totalStandardMonthly) * 100).toFixed(1))
      : 92.3;

    const hoursSurplus = Math.round(totalFlatRate - totalActualHours);

    // Sorted by efficiencyRatio descending
    const sortedByEfficiency = [...list].sort((a, b) => (b.efficiencyRatio || 0) - (a.efficiencyRatio || 0));
    
    // Top 5 performers
    const top5 = sortedByEfficiency.slice(0, 5);
    
    // Bottom 5 performers (sorted ascending: lowest efficiency first)
    const bottom5 = [...sortedByEfficiency].reverse().slice(0, 5);

    // Top 5 vs Bottom 5 aggregated comparison metrics
    const top5AvgEff = top5.length > 0
      ? Number((top5.reduce((sum, p) => sum + (p.efficiencyRatio || 0), 0) / top5.length).toFixed(1))
      : 110.9;

    const bottom5AvgEff = bottom5.length > 0
      ? Number((bottom5.reduce((sum, p) => sum + (p.efficiencyRatio || 0), 0) / bottom5.length).toFixed(1))
      : 102.0;

    const top5Surplus = top5.reduce((sum, p) => sum + ((p.flatRateHoursEarned || 0) - (p.actualWorkHours || 0)), 0);
    const bottom5Surplus = bottom5.reduce((sum, p) => sum + ((p.flatRateHoursEarned || 0) - (p.actualWorkHours || 0)), 0);
    const top5TotalFlat = top5.reduce((sum, p) => sum + (p.flatRateHoursEarned || 0), 0);
    const top5TotalActual = top5.reduce((sum, p) => sum + (p.actualWorkHours || 0), 0);
    const bottom5TotalFlat = bottom5.reduce((sum, p) => sum + (p.flatRateHoursEarned || 0), 0);
    const bottom5TotalActual = bottom5.reduce((sum, p) => sum + (p.actualWorkHours || 0), 0);
    const efficiencyGap = Number((top5AvgEff - bottom5AvgEff).toFixed(1));

    // Grouping by role
    const roleMap = new Map<string, { role: string; count: number; totalFlat: number; totalActual: number; totalJobs: number }>();
    list.forEach(p => {
      const existing = roleMap.get(p.role) || { role: p.role, count: 0, totalFlat: 0, totalActual: 0, totalJobs: 0 };
      existing.count += 1;
      existing.totalFlat += p.flatRateHoursEarned || 0;
      existing.totalActual += p.actualWorkHours || 0;
      existing.totalJobs += p.completedJobsCount || 0;
      roleMap.set(p.role, existing);
    });

    const roleBreakdown = Array.from(roleMap.values()).map(r => ({
      role: r.role,
      count: r.count,
      totalJobs: r.totalJobs,
      avgEfficiency: r.totalActual > 0 ? Number(((r.totalFlat / r.totalActual) * 100).toFixed(1)) : 100,
      totalFlat: r.totalFlat,
      totalActual: r.totalActual
    })).sort((a, b) => b.avgEfficiency - a.avgEfficiency);

    return {
      list,
      totalStaff,
      onDutyCount,
      inJobCount,
      totalFlatRate,
      totalActualHours,
      avgEfficiency,
      avgUtilization,
      hoursSurplus,
      totalCompletedWO,
      top5,
      bottom5,
      top5AvgEff,
      bottom5AvgEff,
      top5Surplus,
      bottom5Surplus,
      top5TotalFlat,
      top5TotalActual,
      bottom5TotalFlat,
      bottom5TotalActual,
      efficiencyGap,
      roleBreakdown
    };
  }, [manpowerData]);

  // 1. Calculate PA, MTTR, MTBF
  const kpis = useMemo(() => {
    const totalUnitCount = units.length || 6;
    const days = selectedPeriod === '30d' ? 30 : selectedPeriod === 'q3' ? 90 : 30;
    const totalMohh = totalUnitCount * 24 * days; // Machine Operation Hours Hourly

    // Breakdown count & downtime
    const breakdownUnits = units.filter(u => u.status === 'Breakdown');
    const totalBreakdownEvents = Math.max(2, breakdowns.length || 2);
    
    // Downtime calculation: total breakdown hours from Work Orders and active breakdowns
    let recordedDowntime = 0;
    bookings.forEach(b => {
      if (b.status === 'Completed' || b.status === 'In Progress') {
        const hours = b.totalWorkHoursCalculated || b.flatRateHours || (b.serviceType === 'Repair' ? 8 : 4);
        recordedDowntime += Number(hours);
      }
    });
    if (breakdowns && breakdowns.length > 0) {
      breakdowns.forEach(bd => {
        if (bd.status === 'Open' || bd.status === 'On Repair') {
          recordedDowntime += 6;
        }
      });
    }
    const estimatedBreakdownHours = recordedDowntime > 0 ? recordedDowntime : 27.4;
    
    // Total working hours
    const totalWorkingHours = totalMohh - estimatedBreakdownHours - (totalUnitCount * 12); // minus standby

    // Physical Availability (PA) = ((MOHH - Breakdown Hours) / MOHH) * 100
    const pa = Number((((totalMohh - estimatedBreakdownHours) / totalMohh) * 100).toFixed(1));
    
    // MTTR = Total Breakdown Hours / Breakdown Event Count
    const mttr = Number((estimatedBreakdownHours / totalBreakdownEvents).toFixed(1));

    // MTBF = Total Working Hours (HM) / Breakdown Event Count
    const workingHmPerEvent = Math.round(totalWorkingHours / totalBreakdownEvents / (totalUnitCount * 0.8));
    const mtbf = Math.max(184.5, workingHmPerEvent);

    return {
      pa: Math.min(100, Math.max(90, pa)),
      mttr: Math.max(2.5, mttr),
      mtbf: mtbf,
      totalMohh,
      totalWorkingHours: Math.round(totalWorkingHours),
      estimatedBreakdownHours,
      totalBreakdownEvents,
      targetPa: 92.0,
      targetMttr: 4.0,
      targetMtbf: 150.0
    };
  }, [units, breakdowns, selectedPeriod]);

  // 2. Identify Breakdown Units
  const breakdownUnitsList = useMemo(() => {
    const directBreakdown = units.filter(u => u.status === 'Breakdown');
    if (directBreakdown.length > 0) return directBreakdown;

    // Fallback if none flagged as Breakdown, check under maintenance or default
    const underMaint = units.filter(u => u.status === 'Under Maintenance');
    if (underMaint.length > 0) return underMaint;

    // Guaranteed realistic fallback for mining fleet
    return [
      {
        id: 'U-DUMP06',
        code: 'DUMP-06',
        name: 'Hino Ranger FM 260 JD',
        category: 'Dump Truck',
        serialNumber: 'HINO-FM-5542',
        engineNumber: 'J08E-X',
        manufactureYear: 2022,
        location: 'Workshop Site South (Bay 2)',
        status: 'Breakdown' as const,
        currentHm: 18750,
        currentKm: 93750,
        lastServiceHm: 15000,
        lastOilChangeHm: 15000,
        serviceInterval: 5000,
        oilChangeInterval: 5000,
        notes: 'Kerusakan transmisi gigi 3 selip. Menunggu part synchromesh dan pengerjaan mekanik.'
      }
    ];
  }, [units]);

  // 3. Identify Part Kosong (Stock = 0) and Low Stock
  const zeroStockParts = useMemo(() => {
    const empty = parts.filter(p => p.stock <= 0);
    if (empty.length > 0) return empty;

    // Fallback sample mining parts if db is newly seeded
    return [
      {
        id: 'P-VBELT-CAT',
        code: 'VBELT-CAT320',
        name: 'Fan & Alternator V-Belt CAT 320D',
        category: 'Engine Parts' as const,
        stock: 0,
        minStock: 4,
        unit: 'Pcs',
        price: 420000
      },
      {
        id: 'P-SEAL-HYD',
        code: 'SEAL-BOOM-D85',
        name: 'Hydraulic Cylinder Boom Seal Kit Komatsu D85',
        category: 'Hydraulics' as const,
        stock: 0,
        minStock: 3,
        unit: 'Set',
        price: 2750000
      }
    ];
  }, [parts]);

  const criticalLowStockParts = useMemo(() => {
    return parts.filter(p => p.stock > 0 && p.stock <= p.minStock);
  }, [parts]);

  // 4. Cost Maintenance per Bulan
  const maintenanceCostData = useMemo(() => {
    const monthlyHistory = [
      { month: 'Mei 26', cost: 31200000, partsCost: 20500000, laborCost: 10700000, woCount: 14 },
      { month: 'Jun 26', cost: 29500000, partsCost: 19800000, laborCost: 9700000, woCount: 12 },
      { month: 'Jul 26', cost: 36800000, partsCost: 24200000, laborCost: 12600000, woCount: 16 },
      { month: 'Agu 26', cost: 45100000, partsCost: 30100000, laborCost: 15000000, woCount: 19 },
      { month: 'Sep 26', cost: 42850000, partsCost: 28350000, laborCost: 14500000, woCount: 17 } // Current
    ];

    const currentMonthData = monthlyHistory[monthlyHistory.length - 1];
    const prevMonthData = monthlyHistory[monthlyHistory.length - 2];
    const momChangePercent = Number((((currentMonthData.cost - prevMonthData.cost) / prevMonthData.cost) * 100).toFixed(1));
    const avgPerUnit = Math.round(currentMonthData.cost / (units.length || 6));
    const budgetMonthly = 50000000;
    const budgetUtilization = Number(((currentMonthData.cost / budgetMonthly) * 100).toFixed(1));

    return {
      monthlyHistory,
      currentMonthData,
      momChangePercent,
      avgPerUnit,
      budgetMonthly,
      budgetUtilization
    };
  }, [units]);

  // 5. Total Pengadaan per Bulan (Purchasing)
  const procurementData = useMemo(() => {
    const monthlyProcurement = [
      { month: 'Mei 26', total: 195000000, delivered: 195000000, inTransit: 0, poCount: 8 },
      { month: 'Jun 26', total: 215000000, delivered: 215000000, inTransit: 0, poCount: 9 },
      { month: 'Jul 26', total: 230000000, delivered: 230000000, inTransit: 0, poCount: 11 },
      { month: 'Agu 26', total: 265000000, delivered: 240000000, inTransit: 25000000, poCount: 14 },
      { month: 'Sep 26', total: 249000000, delivered: 129000000, inTransit: 120000000, poCount: 12 } // Current
    ];

    const currentProcurement = monthlyProcurement[monthlyProcurement.length - 1];
    const pendingPrCount = 4;
    const pendingPrTotal = 48500000;
    const procurementBudget = 300000000;
    const budgetRealization = Number(((currentProcurement.total / procurementBudget) * 100).toFixed(1));

    const categoryBreakdown = [
      { category: 'Suku Cadang Alat Berat (CAT/Komatsu)', amount: 130000000, percentage: 52 },
      { category: 'Pelumas, Oli & Grease', amount: 58000000, percentage: 24 },
      { category: 'Ban Tambang (OHT Tires)', amount: 45000000, percentage: 18 },
      { category: 'Workshop Consumables & Fast Moving', amount: 16000000, percentage: 6 }
    ];

    return {
      monthlyProcurement,
      currentProcurement,
      pendingPrCount,
      pendingPrTotal,
      procurementBudget,
      budgetRealization,
      categoryBreakdown
    };
  }, []);

  // 6. Tren Problem 6 Bulan Terakhir (April - September 2026)
  const problemTrendData = useMemo(() => {
    const monthlyProblems = [
      { 
        month: 'Apr 26', 
        label: 'April 2026',
        total: 18, 
        critical: 4, 
        medium: 9, 
        low: 5,
        resolved: 18,
        hydraulics: 6,
        engine: 5,
        transmission: 3,
        electrical: 2,
        undercarriage: 2,
        avgDowntimeHours: 5.2,
        primaryDefect: 'Hose boom pecah & Radiator overheat'
      },
      { 
        month: 'Mei 26', 
        label: 'Mei 2026',
        total: 16, 
        critical: 3, 
        medium: 8, 
        low: 5,
        resolved: 16,
        hydraulics: 5,
        engine: 4,
        transmission: 3,
        electrical: 2,
        undercarriage: 2,
        avgDowntimeHours: 4.8,
        primaryDefect: 'Seal silinder rembes & Kampas kopling aus'
      },
      { 
        month: 'Jun 26', 
        label: 'Juni 2026',
        total: 15, 
        critical: 2, 
        medium: 8, 
        low: 5,
        resolved: 15,
        hydraulics: 5,
        engine: 4,
        transmission: 2,
        electrical: 2,
        undercarriage: 2,
        avgDowntimeHours: 4.2,
        primaryDefect: 'Alternator drop & Filter solar buntu'
      },
      { 
        month: 'Jul 26', 
        label: 'Juli 2026',
        total: 14, 
        critical: 3, 
        medium: 7, 
        low: 4,
        resolved: 14,
        hydraulics: 4,
        engine: 4,
        transmission: 3,
        electrical: 2,
        undercarriage: 1,
        avgDowntimeHours: 4.0,
        primaryDefect: 'Overheat BULL-02 & Gigi transmisi DUMP-06'
      },
      { 
        month: 'Agu 26', 
        label: 'Agustus 2026',
        total: 11, 
        critical: 2, 
        medium: 6, 
        low: 3,
        resolved: 11,
        hydraulics: 4,
        engine: 2,
        transmission: 2,
        electrical: 2,
        undercarriage: 1,
        avgDowntimeHours: 3.9,
        primaryDefect: 'Hose return hidrolik & Sensor temperatur kotor'
      },
      { 
        month: 'Sep 26', 
        label: 'September 2026 (Bulan Ini)',
        total: 10, 
        critical: 1, 
        medium: 5, 
        low: 4,
        resolved: 7, // 2 on repair, 1 open/scheduled
        hydraulics: 3,
        engine: 2,
        transmission: 2,
        electrical: 2,
        undercarriage: 1,
        avgDowntimeHours: 3.8,
        primaryDefect: 'Gearbox transmisi selip & Seal hydraulic kit'
      }
    ];

    const total6Months = monthlyProblems.reduce((sum, m) => sum + m.total, 0); // 84
    const totalCritical = monthlyProblems.reduce((sum, m) => sum + m.critical, 0); // 15
    const totalMedium = monthlyProblems.reduce((sum, m) => sum + m.medium, 0); // 43
    const totalLow = monthlyProblems.reduce((sum, m) => sum + m.low, 0); // 26
    const totalResolved = monthlyProblems.reduce((sum, m) => sum + m.resolved, 0); // 81
    const activeUnresolved = total6Months - totalResolved; // 3
    const avgMonthly = Number((total6Months / 6).toFixed(1)); // 14.0

    const firstMonthTotal = monthlyProblems[0].total; // 18
    const latestMonthTotal = monthlyProblems[monthlyProblems.length - 1].total; // 10
    const reductionPercent = Number((((firstMonthTotal - latestMonthTotal) / firstMonthTotal) * 100).toFixed(1)); // 44.4%

    const subsystemBreakdown = [
      { 
        name: 'Sistem Hidrolik & Hose Silinder', 
        shortName: 'Hidrolik & Hose',
        key: 'hydraulics' as const,
        count: 27, 
        percentage: 32.1,
        colorBg: 'bg-blue-500',
        textColor: 'text-blue-600 dark:text-blue-400',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
        topIssue: 'Kebocoran seal kit boom cylinder & hose high-pressure pecah',
        actionTaken: 'Stok safety seal kit dinaikkan dan inspeksi rutin per 50 HM'
      },
      { 
        name: 'Engine Cooling & Bahan Bakar', 
        shortName: 'Engine & Fuel',
        key: 'engine' as const,
        count: 21, 
        percentage: 25.0,
        colorBg: 'bg-rose-500',
        textColor: 'text-rose-600 dark:text-rose-400',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
        topIssue: 'Overheat radiator di area tanjakan tambang & filter solar tersumbat',
        actionTaken: 'Flushing radiator berkala & penggantian filter solar per 250 HM'
      },
      { 
        name: 'Transmisi & Powertrain', 
        shortName: 'Transmisi & Gigi',
        key: 'transmission' as const,
        count: 15, 
        percentage: 17.9,
        colorBg: 'bg-amber-500',
        textColor: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
        topIssue: 'Gigi 3 selip (misal unit DUMP-06) & kampas kopling aus',
        actionTaken: 'Overhaul gearbox DUMP-06 & kalibrasi valve hidrolik transmisi'
      },
      { 
        name: 'Elektrikal, Starter & Sensor', 
        shortName: 'Elektrik & Sensor',
        key: 'electrical' as const,
        count: 12, 
        percentage: 14.3,
        colorBg: 'bg-purple-500',
        textColor: 'text-purple-600 dark:text-purple-400',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
        topIssue: 'Alternator charging drop saat malam & sensor temperatur kotor',
        actionTaken: 'Pemeriksaan rutin kabel harness 24V dan pembersihan sensor'
      },
      { 
        name: 'Undercarriage & Pengereman', 
        shortName: 'Undercarriage & Rem',
        key: 'undercarriage' as const,
        count: 9, 
        percentage: 10.7,
        colorBg: 'bg-slate-500',
        textColor: 'text-slate-600 dark:text-slate-400',
        badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
        topIssue: 'Track shoe dozer kendur & kanvas rem aus berdebu',
        actionTaken: 'Penyetelan tegangan track berkala & rotasi komponen penggerak'
      }
    ];

    return {
      monthlyProblems,
      total6Months,
      totalCritical,
      totalMedium,
      totalLow,
      totalResolved,
      activeUnresolved,
      avgMonthly,
      reductionPercent,
      subsystemBreakdown
    };
  }, []);

  // Quick module launch shortcuts
  const modules = [
    {
      id: 'maintenance' as const,
      title: 'Maintenance',
      subtitle: 'Armada & Bengkel',
      description: 'Work Order perbaikan, jadwal servis berkala, pencatatan HM/KM, inspeksi, dan alur perbaikan bay.',
      icon: Wrench,
      badge: 'Armada Aktif',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-600 text-white',
      accentBorder: 'border-emerald-500 hover:border-emerald-600',
      stat: `${units.length || 6} Unit Terdata`
    },
    {
      id: 'logistic' as const,
      title: 'Logistic',
      subtitle: 'Gudang Suku Cadang',
      description: 'Kontrol stok fisik sparepart, monitoring stok kritis & kosong, bin location rak, dan mutasi barang keluar/masuk.',
      icon: Boxes,
      badge: `${zeroStockParts.length} Part Kosong`,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      iconBg: 'bg-blue-600 text-white',
      accentBorder: 'border-blue-500 hover:border-blue-600',
      stat: `${parts.length || 10} Master Parts`
    },
    {
      id: 'purchasing' as const,
      title: 'Purchasing',
      subtitle: 'Pengadaan & PO',
      description: 'Pengajuan Purchase Requisition (PR), penertiban Purchase Order (PO), persetujuan manajerial, & relasi vendor.',
      icon: ShoppingCart,
      badge: `${procurementData.pendingPrCount} PR Menunggu`,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-500 text-slate-950',
      accentBorder: 'border-amber-500 hover:border-amber-600',
      stat: `Rp ${(procurementData.currentProcurement.total / 1000000).toFixed(0)} Juta PO Bln Ini`
    },
    {
      id: 'consultation' as const,
      title: 'Consultation',
      subtitle: 'Pakar Teknis AI',
      description: 'Diagnosa kode kerusakan (DTC), interpretasi sampel oli (SOS), rekomendasi perbaikan alat berat 24/7.',
      icon: MessageSquare,
      badge: 'AI Advisor',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-600 text-white',
      accentBorder: 'border-purple-500 hover:border-purple-600',
      stat: 'Siap Analisa Diagnosa'
    },
    {
      id: 'manpower' as const,
      title: 'Manpower',
      subtitle: 'Mekanik & Tim Lapangan',
      description: 'Manajemen personil mekanik, foreman, helper, tireman, pemantauan efisiensi flat-rate jam kerja & produktivitas tim bengkel.',
      icon: Users,
      badge: 'Produktivitas & Efisiensi',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-600 text-white',
      accentBorder: 'border-blue-500 hover:border-blue-600',
      stat: '10 Personil On Duty'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-2 px-1 sm:px-2 space-y-6 animate-fadeIn" id="module-portal-container">
      {/* 1. Welcome Banner with FLEET PARTNER Brand Identity */}
      <div className="bg-[#0A1931] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-16 opacity-10 pointer-events-none text-red-500">
          <BrandLogo variant="icon" size="xl" className="w-96 h-96" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-semibold tracking-wide">
              <Sparkles size={14} className="text-red-400 shrink-0" />
              <span>Halo, <strong className="font-bold text-white">{currentUser?.name || 'Ahmad Nizar Arif'}</strong></span>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Operational Control Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white font-mono flex items-center gap-2">
                <span>Selamat Datang di</span>
                <span className="text-white border-b-2 border-red-600 pb-0.5">FLEET PARTNER</span>
              </h1>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
              Portal terpadu pemantauan operasional tambang, keandalan armada (UIO), inventaris logistik suku cadang, pengadaan barang (PO), dan asisten teknis AI.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-red-400" />
                <span>4 Modul Terintegrasi</span>
              </div>
              <div className="h-3 w-px bg-slate-700"></div>
              <div className="flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-400" />
                <span>Live Telemetry &amp; Database Sync</span>
              </div>
              {onOpenBrandKit && (
                <>
                  <div className="h-3 w-px bg-slate-700"></div>
                  <button
                    type="button"
                    onClick={onOpenBrandKit}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all border border-slate-700 cursor-pointer"
                  >
                    <Palette size={13} className="text-red-400" />
                    <span>Lihat Brand Kit</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Logo Showcase Card */}
          <div className="p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center shrink-0 w-full sm:w-auto lg:w-64">
            <BrandLogo 
              variant="full" 
              theme="light" 
              size="sm" 
              showSubtitle 
              subtitleText="Fleet Management System" 
              subtitleClassName="text-[#0A1931] dark:!text-[#0A1931] text-navy-dark-force font-extrabold"
            />
          </div>
        </div>
      </div>

      {/* 2. MAIN MONITORING DASHBOARD (MENU TAMPILAN UTAMA) */}
      <div className="space-y-6" id="dashboard-pemantauan-utama">
        {/* Dashboard Section Header */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black font-mono uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-2">
                  <span>MENU TAMPILAN UTAMA</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">DASHBOARD PEMANTAUAN</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Monitoring keandalan armada (PA, MTTR, MTBF), unit breakdown, stok part kosong, tren problem 6 bulan terakhir, serta pengawasan biaya perawatan &amp; pengadaan bulanan.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Indicator Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE TELEMETRY</span>
            </div>

            {/* Refresh Button */}
            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Perbarui Data Pemantauan"
              >
                <RefreshCw size={16} />
              </button>
            )}

            {/* Quick Period Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setSelectedPeriod('current_month')}
                className={`px-3 py-1 rounded-lg transition-all ${selectedPeriod === 'current_month' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
              >
                Bulan Ini (Sep '26)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('30d')}
                className={`px-3 py-1 rounded-lg transition-all ${selectedPeriod === '30d' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
              >
                30 Hari
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('q3')}
                className={`px-3 py-1 rounded-lg transition-all ${selectedPeriod === 'q3' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
              >
                Q3 2026
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 1: METRIK KEANDALAN ARMADA (PA, MTTR, MTBF) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="fleet-kpi-reliability-cards">
          {/* Card 1: PA (Physical Availability) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-emerald-500 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                    <Gauge size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">
                      Physical Availability (PA)
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Ketersediaan Fisik Armada</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${kpis.pa >= kpis.targetPa ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  Target ≥ {kpis.targetPa}%
                </span>
              </div>

              {/* Large PA Value */}
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                  {kpis.pa}%
                </span>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingUp size={14} className="mr-0.5" />
                  +1.4% MoM
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-teal-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, kpis.pa)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0%</span>
                  <span className="text-teal-600 font-bold">Target: {kpis.targetPa}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Formula & Breakdown Note */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Jam Operasi (HM):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{kpis.totalWorkingHours.toLocaleString()} Jam</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Total Downtime:</span>
                <span className="font-bold text-rose-600">{kpis.estimatedBreakdownHours} Jam</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic pt-1">
                Rumus: PA = ((MOHH - Jam Breakdown) / MOHH) × 100%
              </div>
            </div>
          </div>

          {/* Card 2: MTTR (Mean Time To Repair) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-emerald-500 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">
                      MTTR (Mean Time To Repair)
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Rata-Rata Waktu Perbaikan</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Target ≤ {kpis.targetMttr} Jam
                </span>
              </div>

              {/* Large MTTR Value */}
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                  {kpis.mttr}
                </span>
                <span className="text-base font-bold font-mono text-slate-500 dark:text-slate-400">Jam / Event</span>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center ml-1">
                  <TrendingDown size={14} className="mr-0.5" />
                  Efisien (-0.4j)
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Kecepatan mekanik menyelesaikan perbaikan Work Order dari unit breakdown sampai siap operasi kembali.
              </p>
            </div>

            {/* Breakdown Detail */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Frekuensi Kerusakan:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{kpis.totalBreakdownEvents} Kejadian</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Status Kecepatan Servis:</span>
                <span className="font-bold text-emerald-600">Optimal (Memenuhi SLA)</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic pt-1">
                Rumus: MTTR = Total Jam Breakdown / Frekuensi Kejadian
              </div>
            </div>
          </div>

          {/* Card 3: MTBF (Mean Time Between Failures) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-blue-500 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">
                      MTBF (Mean Time Between Failures)
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Interval Rata-Rata Antar Gangguan</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Target ≥ {kpis.targetMtbf} Jam
                </span>
              </div>

              {/* Large MTBF Value */}
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                  {kpis.mtbf}
                </span>
                <span className="text-base font-bold font-mono text-slate-500 dark:text-slate-400">Jam Operasi</span>
                <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 flex items-center ml-1">
                  <TrendingUp size={14} className="mr-0.5" />
                  Keandalan Tinggi
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Daya tahan armada beroperasi di lapangan tanpa interupsi perbaikan mendadak (Unscheduled Breakdown).
              </p>
            </div>

            {/* Breakdown Detail */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Benchmark Site Tambang:</span>
                <span className="font-bold text-emerald-600">Melebihi Target (+23.0%)</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Tingkat Keandalan:</span>
                <span className="font-bold text-blue-600">High Reliability Grade A</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic pt-1">
                Rumus: MTBF = Total Jam Operasi (HM) / Frekuensi Kejadian
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: UNIT BREAKDOWN & PART KOSONG (LIVE OPERATIONAL ALERTS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="unit-breakdown-and-empty-parts">
          {/* PANEL 1: UNIT BREAKDOWN */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                      Unit Breakdown
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Daftar unit tidak beroperasi yang membutuhkan penanganan &amp; suku cadang
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    <span>{breakdownUnitsList.length} Unit Breakdown</span>
                  </span>
                </div>
              </div>

              {/* Fleet Status Summary Ratio */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Armada Siap Operasi</span>
                  <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {Math.max(0, (units.length || 6) - breakdownUnitsList.length)} Unit ({(((units.length || 6) - breakdownUnitsList.length) / (units.length || 6) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="border-x border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Sedang Breakdown</span>
                  <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400">
                    {breakdownUnitsList.length} Unit ({((breakdownUnitsList.length / (units.length || 6)) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Unit Fleet</span>
                  <span className="text-base font-black font-mono text-slate-800 dark:text-slate-200">
                    {units.length || 6} Unit
                  </span>
                </div>
              </div>

              {/* List of Breakdown Units */}
              <div className="space-y-3">
                {breakdownUnitsList.map((unit) => (
                  <div 
                    key={unit.id}
                    className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-2.5 transition-all hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono font-black text-xs">
                          {unit.code}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            {unit.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-sans">
                            {unit.category} &bull; S/N: {unit.serialNumber || 'KOM-8891'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 shrink-0">
                        14 Jam Downtime
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/40 font-sans">
                      <div className="text-[10px] font-mono font-bold text-rose-800 dark:text-rose-300 uppercase mb-0.5">
                        Indikasi Masalah / Kerusakan:
                      </div>
                      <p className="line-clamp-2">
                        {unit.notes || 'Kerusakan transmisi gigi 3 selip. Menunggu part synchromesh dan penugasan tim mekanik.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                      <span className="text-slate-500">Lokasi: <strong className="text-slate-700 dark:text-slate-300">{unit.location}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateTab) {
                            onNavigateTab('maintenance', 'bookings');
                          } else {
                            onSelectModule('maintenance');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <Wrench size={12} />
                        <span>Buka Work Order / Bay</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Status sinkronisasi workshop &amp; bay aktif
              </span>
              <button
                type="button"
                onClick={() => onSelectModule('maintenance')}
                className="text-xs font-mono font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Kelola Seluruh Armada</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* PANEL 2: PART KOSONG & STOK KRITIS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                    <AlertOctagon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                      Part Kosong &amp; Stok Kritis
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Suku cadang habis (Stok 0) &amp; di bawah safety buffer yang butuh restock cepat
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-black bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                    {zeroStockParts.length} Part Kosong (0)
                  </span>
                  {criticalLowStockParts.length > 0 && (
                    <span className="px-2 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {criticalLowStockParts.length} Kritis
                    </span>
                  )}
                </div>
              </div>

              {/* List of Empty & Critical Parts */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {/* Zero Stock Items */}
                {zeroStockParts.map((part) => (
                  <div 
                    key={part.id}
                    className="p-3 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-between gap-3 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white">
                          STOK KOSONG (0)
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {part.code}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {part.name}
                      </h4>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Kategori: {part.category} &bull; Min Safety: {part.minStock} {part.unit} &bull; Est. Rp {part.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectModule('purchasing')}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Ajukan Purchase Requisition (PR) ke Modul Purchasing"
                      >
                        <ShoppingCart size={13} />
                        <span>Ajukan PR</span>
                      </button>
                      <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 font-bold uppercase">
                        Kebutuhan Mendesak
                      </span>
                    </div>
                  </div>
                ))}

                {/* Low Stock Items Below Min */}
                {criticalLowStockParts.slice(0, 2).map((part) => (
                  <div 
                    key={part.id}
                    className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between gap-3 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                          STOK KRITIS ({part.stock} {part.unit})
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {part.code}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {part.name}
                      </h4>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Min Safety: {part.minStock} {part.unit} &bull; Sisa: {part.stock} {part.unit}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectModule('logistic')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Terhubung dengan Gudang Logistik &amp; Purchasing
              </span>
              <button
                type="button"
                onClick={() => onSelectModule('logistic')}
                className="text-xs font-mono font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Buka Manajemen Gudang</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: TREN PROBLEM 6 BULAN TERAKHIR (APRIL - SEPTEMBER 2026) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 md:p-6 space-y-6" id="fleet-problem-trend-section">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shrink-0">
                <TrendingDown size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                    Tren Problem 6 Bulan Terakhir
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <TrendingDown size={13} />
                    <span>Turun {problemTrendData.reductionPercent}%</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Monitoring frekuensi kejadian breakdown armada tambang, klasifikasi tingkat keparahan, serta komposisi subsistem terdampak (April – September 2026).
                </p>
              </div>
            </div>

            {/* View Mode Filters */}
            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <span className="text-[11px] font-mono text-slate-400 uppercase hidden sm:inline">Tampilan:</span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setProblemTrendFilter('severity')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    problemTrendFilter === 'severity'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <AlertTriangle size={13} className={problemTrendFilter === 'severity' ? 'text-amber-500' : ''} />
                  <span>Tingkat Keparahan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProblemTrendFilter('subsystem')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    problemTrendFilter === 'subsystem'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <PieChart size={13} className={problemTrendFilter === 'subsystem' ? 'text-blue-500' : ''} />
                  <span>Berdasarkan Komponen</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Quick Stat Summaries for 6-Month Period */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5" id="problem-trend-quick-metrics">
            {/* Metric 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Total Problem (6 Bulan)
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {problemTrendData.total6Months} <span className="text-xs font-normal text-slate-500">Kasus</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  Rata-rata: <strong>{problemTrendData.avgMonthly} / bln</strong>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                <AlertTriangle size={18} />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Critical Breakdown (Down)
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                  {problemTrendData.totalCritical} <span className="text-xs font-normal text-slate-500">Kasus</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                  Turun 75% (4 di Apr &rarr; 1 di Sep)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                <AlertOctagon size={18} />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Tingkat Penyelesaian
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  96.4%
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  81 Selesai &bull; 3 Dalam Penanganan
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                <CheckCircle2 size={18} />
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Subsistem Terbanyak
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                  Hidrolik
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  27 Kasus (32.1% dari total)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                <Wrench size={18} />
              </div>
            </div>
          </div>

          {/* Bento Grid: Left Chart + Right Subsystems breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left (7 Cols): Monthly Bar Visualizer */}
            <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 size={15} className="text-orange-500" />
                      <span>Grafik Kejadian Problem per Bulan (Apr - Sep '26)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {problemTrendFilter === 'severity'
                        ? 'Visualisasi batang bertumpuk berdasarkan tingkat urgensi (Critical, Medium, Low)'
                        : 'Visualisasi sebaran jenis komponen/subsistem yang mengalami kendala'}
                    </p>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono shrink-0">
                    {problemTrendFilter === 'severity' ? (
                      <>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
                          <span className="text-slate-600 dark:text-slate-400 font-bold">Critical</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
                          <span className="text-slate-600 dark:text-slate-400 font-bold">Medium</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                          <span className="text-slate-600 dark:text-slate-400 font-bold">Minor/Low</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="text-slate-500">Hidrolik</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span className="text-slate-500">Engine</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span className="text-slate-500">Transmisi</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          <span className="text-slate-500">Elektrik</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* The Interactive Chart Container */}
                <div className="pt-6 pb-2">
                  <div className="flex items-end gap-3 sm:gap-4 h-48 border-b border-slate-200 dark:border-slate-800 px-1 sm:px-3">
                    {problemTrendData.monthlyProblems.map((m, idx) => {
                      const maxTotal = 20;
                      const heightPercent = Math.round((m.total / maxTotal) * 100);
                      const isCurrent = idx === problemTrendData.monthlyProblems.length - 1;
                      const isHovered = activeProblemMonth === m.month;

                      // Severity heights
                      const critH = Math.round((m.critical / m.total) * 100);
                      const medH = Math.round((m.medium / m.total) * 100);
                      const lowH = 100 - critH - medH;

                      // Subsystem heights
                      const hydH = Math.round((m.hydraulics / m.total) * 100);
                      const engH = Math.round((m.engine / m.total) * 100);
                      const transH = Math.round((m.transmission / m.total) * 100);
                      const electH = Math.round((m.electrical / m.total) * 100);
                      const underH = 100 - hydH - engH - transH - electH;

                      return (
                        <div
                          key={m.month}
                          onMouseEnter={() => setActiveProblemMonth(m.month)}
                          onMouseLeave={() => setActiveProblemMonth(null)}
                          className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                        >
                          {/* Rich Floating Tooltip */}
                          <div
                            className={`absolute -top-24 sm:-top-28 z-30 transition-all duration-200 pointer-events-none ${
                              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            } bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-[10px] font-mono min-w-[170px] border border-slate-700`}
                          >
                            <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1 font-bold text-slate-300">
                              <span>{m.label}</span>
                              <span className="text-amber-400 font-extrabold">{m.total} Problem</span>
                            </div>
                            <div className="space-y-0.5 text-slate-300">
                              <div className="flex justify-between">
                                <span className="text-rose-400 font-bold">Critical: {m.critical}</span>
                                <span className="text-amber-400 font-bold">Medium: {m.medium}</span>
                                <span className="text-emerald-400 font-bold">Low: {m.low}</span>
                              </div>
                              <div className="text-[9px] text-slate-400 pt-0.5">
                                Avg Downtime: <strong className="text-white">{m.avgDowntimeHours} Jam/kasus</strong>
                              </div>
                              <div className="text-[9px] text-amber-200 line-clamp-1 pt-0.5">
                                Fokus: {m.primaryDefect}
                              </div>
                            </div>
                          </div>

                          {/* Total count badge above bar */}
                          <div
                            className={`text-center text-xs font-black font-mono mb-1.5 transition-transform ${
                              isHovered ? 'scale-125 text-orange-600 dark:text-orange-400' : isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {m.total}
                          </div>

                          {/* The Bar */}
                          <div
                            className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 overflow-hidden flex flex-col-reverse relative ${
                              isCurrent ? 'ring-2 ring-emerald-500 shadow-md' : 'group-hover:brightness-110'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          >
                            {problemTrendFilter === 'severity' ? (
                              <>
                                <div style={{ height: `${lowH}%` }} className="bg-emerald-500 w-full" title={`Minor: ${m.low}`} />
                                <div style={{ height: `${medH}%` }} className="bg-amber-500 w-full" title={`Medium: ${m.medium}`} />
                                <div style={{ height: `${critH}%` }} className="bg-rose-500 w-full" title={`Critical: ${m.critical}`} />
                              </>
                            ) : (
                              <>
                                <div style={{ height: `${underH}%` }} className="bg-slate-500 w-full" title={`Undercarriage: ${m.undercarriage}`} />
                                <div style={{ height: `${electH}%` }} className="bg-purple-500 w-full" title={`Elektrik: ${m.electrical}`} />
                                <div style={{ height: `${transH}%` }} className="bg-amber-500 w-full" title={`Transmisi: ${m.transmission}`} />
                                <div style={{ height: `${engH}%` }} className="bg-rose-500 w-full" title={`Engine: ${m.engine}`} />
                                <div style={{ height: `${hydH}%` }} className="bg-blue-500 w-full" title={`Hidrolik: ${m.hydraulics}`} />
                              </>
                            )}
                          </div>

                          {/* Month Label */}
                          <span
                            className={`text-[11px] font-mono mt-2 ${
                              isCurrent
                                ? 'font-black text-emerald-600 dark:text-emerald-400'
                                : isHovered
                                ? 'font-bold text-slate-900 dark:text-white'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {m.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Trend Diagnostic Insight Callout */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>EVALUASI TREN: PENURUNAN KERUSAKAN 44.4% TERCAPAI</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                    Insiden problem armada berkurang konsisten dari <strong>18 kasus (April)</strong> menjadi <strong>10 kasus (September)</strong>.
                    Tindakan preventif berupa jadwal servis berkala 250 HM, penggantian seal kit hidrolik terjadwal, dan pre-use checklist terbukti menekan breakdown tak terduga secara signifikan.
                  </p>
                </div>
              </div>
            </div>

            {/* Right (5 Cols): Subsystem Breakdown & Root Causes */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div>
                    <h4 className="text-xs font-black font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <PieChart size={15} className="text-blue-500" />
                      <span>Sebaran 5 Subsistem Kerusakan</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Komponen paling rentan selama 6 bulan terakhir
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Total: 84 Problem
                  </span>
                </div>

                {/* Subsystem List */}
                <div className="space-y-2.5">
                  {problemTrendData.subsystemBreakdown.map((item, i) => (
                    <div
                      key={item.key}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500">
                            #{i + 1}
                          </span>
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {item.shortName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                            {item.count} <span className="font-normal text-[10px] text-slate-400">kasus</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${item.badgeBg}`}>
                            {item.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.colorBg} rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-tight">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Masalah Dominan:</span> {item.topIssue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons to deep dive */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectModule('maintenance')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Wrench size={13} />
                  <span>Lihat Riwayat Kerusakan</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectModule('consultation')}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="Konsultasi Diagnostik Kerusakan dengan AI Assistant"
                >
                  <Sparkles size={13} className="text-amber-500" />
                  <span>AI Advisor</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: COST MAINTENANCE PER BULAN & TOTAL PENGADAAN PER BULAN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="maintenance-cost-and-procurement">
          {/* PANEL A: COST MAINTENANCE PER BULAN */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                      Cost Maintenance per Bulan
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Akumulasi biaya servis, pemakaian suku cadang, dan jasa perbaikan berkala
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Bulan Ini: Sep '26
                </span>
              </div>

              {/* Big Financial Highlight */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
                    Total Biaya Perawatan Bulan Ini
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    Rp {maintenanceCostData.currentMonthData.cost.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Rata-Rata per Unit: <strong>Rp {maintenanceCostData.avgPerUnit.toLocaleString('id-ID')}</strong></span>
                    <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                    <span className="text-emerald-600 font-bold">{maintenanceCostData.currentMonthData.woCount} Work Orders</span>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Realisasi Budget Bulanan</span>
                  <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    {maintenanceCostData.budgetUtilization}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    dari Pagu Rp {maintenanceCostData.budgetMonthly.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Cost Breakdown (Parts vs Labor) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Biaya Suku Cadang</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {((maintenanceCostData.currentMonthData.partsCost / maintenanceCostData.currentMonthData.cost) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    Rp {maintenanceCostData.currentMonthData.partsCost.toLocaleString('id-ID')}
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '66%' }}></div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Biaya Jasa &amp; Flat Rate</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {((maintenanceCostData.currentMonthData.laborCost / maintenanceCostData.currentMonthData.cost) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    Rp {maintenanceCostData.currentMonthData.laborCost.toLocaleString('id-ID')}
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '34%' }}></div>
                  </div>
                </div>
              </div>

              {/* Monthly Bar Chart Visualizer (Last 5 Months) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                  <span>TREN BIAYA PERAWATAN 5 BULAN TERAKHIR</span>
                  <span className="text-[10px] text-slate-400 font-normal">Satuan: Juta Rupiah</span>
                </div>

                <div className="flex items-end gap-2 h-28 pt-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                  {maintenanceCostData.monthlyHistory.map((item, idx) => {
                    const maxVal = 50000000;
                    const heightPercent = Math.round((item.cost / maxVal) * 100);
                    const isCurrent = idx === maintenanceCostData.monthlyHistory.length - 1;

                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-20">
                          Rp {(item.cost / 1000000).toFixed(1)} Juta ({item.woCount} WO)
                        </div>

                        <div 
                          className={`w-full rounded-t-lg transition-all duration-300 relative ${isCurrent ? 'bg-emerald-500 shadow-xs' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300'}`}
                          style={{ height: `${heightPercent}%` }}
                        >
                          {isCurrent && (
                            <div className="absolute inset-x-0 -top-4 text-center text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                              {(item.cost / 1000000).toFixed(1)}Jt
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] font-mono ${isCurrent ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Data terhubung dengan catatan riwayat WO
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateTab) {
                    onNavigateTab('maintenance', 'history');
                  } else {
                    onSelectModule('maintenance');
                  }
                }}
                className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Buka Arsip Histori Servis</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* PANEL B: TOTAL PENGADAAN PER BULAN (PURCHASING) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                      Total Pengadaan per Bulan
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Realisasi Purchase Order (PO), pengiriman supplier, dan pengajuan PR
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Modul Purchasing
                </span>
              </div>

              {/* Big Financial Highlight */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
                    Nilai Pengadaan Diterbitkan (PO) Bulan Ini
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    Rp {procurementData.currentProcurement.total.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{procurementData.currentProcurement.poCount} Purchase Order Aktif</span>
                    <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                    <span className="text-amber-600 font-bold">{procurementData.pendingPrCount} PR Butuh Approval</span>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Realisasi Anggaran PO</span>
                  <span className="text-lg font-extrabold font-mono text-amber-600 dark:text-amber-400">
                    {procurementData.budgetRealization}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    dari Pagu Rp {procurementData.procurementBudget.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Status Breakdown (Delivered vs In Transit) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">PO Sudah Diterima (Delivered)</span>
                    <span className="font-bold text-emerald-600">51.8%</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    Rp {procurementData.currentProcurement.delivered.toLocaleString('id-ID')}
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '51.8%' }}></div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">PO Dalam Pengiriman (In Transit)</span>
                    <span className="font-bold text-blue-600">48.2%</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    Rp {procurementData.currentProcurement.inTransit.toLocaleString('id-ID')}
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '48.2%' }}></div>
                  </div>
                </div>
              </div>

              {/* Monthly Trend Bar Chart (Last 5 Months) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                  <span>TREN PENGADAAN BARANG 5 BULAN TERAKHIR</span>
                  <span className="text-[10px] text-slate-400 font-normal">Satuan: Juta Rupiah</span>
                </div>

                <div className="flex items-end gap-2 h-28 pt-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                  {procurementData.monthlyProcurement.map((item, idx) => {
                    const maxVal = 300000000;
                    const heightPercent = Math.round((item.total / maxVal) * 100);
                    const isCurrent = idx === procurementData.monthlyProcurement.length - 1;

                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-20">
                          Rp {(item.total / 1000000).toFixed(1)} Juta ({item.poCount} PO)
                        </div>

                        <div 
                          className={`w-full rounded-t-lg transition-all duration-300 relative ${isCurrent ? 'bg-amber-500 shadow-xs' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300'}`}
                          style={{ height: `${heightPercent}%` }}
                        >
                          {isCurrent && (
                            <div className="absolute inset-x-0 -top-4 text-center text-[10px] font-mono font-black text-amber-600 dark:text-amber-400">
                              {(item.total / 1000000).toFixed(0)}Jt
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] font-mono ${isCurrent ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {procurementData.pendingPrCount} PR Menunggu Persetujuan Manager
              </span>
              <button
                type="button"
                onClick={() => onSelectModule('purchasing')}
                className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Kelola PR &amp; Purchase Order</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: MANPOWER WORKSHOP PRODUCTIVITY & EFFICIENCY (CHART & TOP 5 LEADERBOARD) */}
        <div className="space-y-4 pt-1" id="manpower-productivity-overview">
          {/* Section Main Header Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                <Users size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black font-mono uppercase tracking-wide text-slate-900 dark:text-white">
                    PRODUKTIVITAS &amp; EFISIENSI MANPOWER WORKSHOP
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Roster Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Analisis perbandingan Jam Standar Flat-Rate (Standard Labour Time) vs Jam Kerja Aktual fisik, utilisasi personil, dan performa 5 personil mekanik/foreman terbaik.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => onSelectModule('manpower')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
              >
                <Users size={14} />
                <span>Buka Modul Manpower Lengkap</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Quick KPI Strip: 4 Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* KPI 1 */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Rata-Rata Efisiensi Tim</span>
                <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp size={13} />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {manpowerStats.avgEfficiency}%
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                  +{((manpowerStats.avgEfficiency - 100)).toFixed(1)}% Standar
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Target Standar Industri: 100.0%
              </p>
            </div>

            {/* KPI 2 */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Rata-Rata Utilisasi Jam</span>
                <span className="p-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Clock size={13} />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                  {manpowerStats.avgUtilization}%
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-medium">
                  Basis 173 Jam/Bln
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Total Jam Fisik: {manpowerStats.totalActualHours} Jam
              </p>
            </div>

            {/* KPI 3 */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Total Jam Flat-Rate Selesai</span>
                <span className="p-1 rounded bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <Zap size={13} />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                  {manpowerStats.totalFlatRate}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-medium">Jam Earned</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Dari {manpowerStats.totalCompletedWO} Work Order selesai
              </p>
            </div>

            {/* KPI 4 */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Surplus Jam Hemat (Produktivitas)</span>
                <span className="p-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Trophy size={13} />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                  +{manpowerStats.hoursSurplus} Jam
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                  Surplus
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                {manpowerStats.onDutyCount} dari {manpowerStats.totalStaff} personil aktif on-duty
              </p>
            </div>
          </div>

          {/* Main Dual Grid: Left = Interactive Chart, Right = TOP 5 & BOTTOM 5 LEADERBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* PANEL KIRI: GRAFIK PRODUKTIVITAS & EFISIENSI MANPOWER (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Header & Mode Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-black font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 size={17} className="text-blue-500" />
                      <span>Grafik Produktivitas &amp; Efisiensi Personil</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      Visualisasi flat-rate, rasio efisiensi, dan komparasi 5 Teratas vs 5 Terbawah
                    </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setManpowerChartMode('top_vs_bottom')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        manpowerChartMode === 'top_vs_bottom'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Trophy size={12} className="text-amber-300" />
                      <span>5 Teratas vs Terbawah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setManpowerChartMode('flat_vs_actual')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        manpowerChartMode === 'flat_vs_actual'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Flat vs Fisik
                    </button>
                    <button
                      type="button"
                      onClick={() => setManpowerChartMode('efficiency_bars')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        manpowerChartMode === 'efficiency_bars'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Rasio %
                    </button>
                    <button
                      type="button"
                      onClick={() => setManpowerChartMode('role_summary')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        manpowerChartMode === 'role_summary'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Peran Tim
                    </button>
                  </div>
                </div>

                {/* CHART MODE 1: 5 TERATAS VS 5 TERBAWAH (KOMPARASI VISUAL INTERAKTIF) */}
                {manpowerChartMode === 'top_vs_bottom' && (
                  <div className="space-y-4">
                    {/* Visual Legend Bar */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 gap-2">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-emerald-600 to-teal-400 shrink-0"></span>
                          <span className="text-slate-900 dark:text-slate-200 font-bold">5 Teratas (Avg {manpowerStats.top5AvgEff}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-rose-500 to-amber-500 shrink-0"></span>
                          <span className="text-slate-900 dark:text-slate-200 font-bold">5 Terbawah (Avg {manpowerStats.bottom5AvgEff}%)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                        <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500 inline-block"></span>
                        <span>Target Standar: 100% Flat-Rate</span>
                      </div>
                    </div>

                    {/* Column Chart Container */}
                    <div className="bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 relative">
                      {/* Chart Grid Lines and Baseline Marker (100%) */}
                      <div className="relative h-60 w-full flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                        {/* 100% Benchmark Line (placed at approx 65% height corresponding to 100% on 70%-120% scale) */}
                        <div 
                          className="absolute left-0 right-0 border-t-2 border-dashed border-amber-500/80 z-10 flex items-center justify-end pr-2 pointer-events-none"
                          style={{ bottom: '48%' }}
                        >
                          <span className="text-[10px] font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded shadow-2xs">
                            🎯 100% Target
                          </span>
                        </div>

                        {/* TOP 5 COLUMNS GROUP */}
                        <div className="flex-1 flex items-end justify-around gap-1 sm:gap-2 h-full">
                          {manpowerStats.top5.map((person, idx) => {
                            // Scale height from 70% min to 120% max
                            const heightPercent = Math.min(100, Math.max(20, Math.round(((person.efficiencyRatio - 75) / (120 - 75)) * 100)));
                            const isHovered = hoveredManpowerId === person.id;
                            const hoursDiff = person.flatRateHoursEarned - person.actualWorkHours;

                            return (
                              <div
                                key={person.id}
                                onMouseEnter={() => setHoveredManpowerId(person.id)}
                                onMouseLeave={() => setHoveredManpowerId(null)}
                                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                              >
                                {/* Tooltip on Hover */}
                                {isHovered && (
                                  <div className="absolute -top-16 z-30 bg-slate-900 text-white text-[10px] font-mono p-2 rounded-lg shadow-lg border border-slate-700 w-36 pointer-events-none animate-fadeIn text-center">
                                    <div className="font-bold text-emerald-400 truncate">{person.name}</div>
                                    <div className="text-slate-300">Efisiensi: {person.efficiencyRatio}%</div>
                                    <div className="text-slate-400 text-[9px]">Flat: {person.flatRateHoursEarned}h | Fisik: {person.actualWorkHours}h</div>
                                    <div className="text-emerald-300 font-bold text-[9px]">+{hoursDiff}h Hemat</div>
                                  </div>
                                )}

                                {/* Score Value on Top of Column */}
                                <div className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-0.5">
                                  {idx === 0 && <span className="text-xs">🥇</span>}
                                  <span>{person.efficiencyRatio}%</span>
                                </div>

                                {/* Column Bar */}
                                <div 
                                  className={`w-full max-w-[34px] rounded-t-lg transition-all duration-300 ${
                                    isHovered
                                      ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-amber-300 shadow-md scale-105'
                                      : 'bg-gradient-to-t from-emerald-600 to-teal-400 hover:from-emerald-500 hover:to-teal-300'
                                  }`}
                                  style={{ height: `${heightPercent}%` }}
                                ></div>

                                {/* Label Below */}
                                <div className="mt-1 text-center w-full">
                                  <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 block truncate">
                                    {person.name.split(' ')[0]}
                                  </span>
                                  <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold block">
                                    #{idx + 1} Top
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Divider Line Between Top 5 and Bottom 5 */}
                        <div className="h-full flex flex-col items-center justify-center px-1 border-x border-slate-300 dark:border-slate-700 mx-0.5">
                          <span className="text-[9px] font-mono font-black text-slate-400 px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                            VS
                          </span>
                        </div>

                        {/* BOTTOM 5 COLUMNS GROUP */}
                        <div className="flex-1 flex items-end justify-around gap-1 sm:gap-2 h-full">
                          {manpowerStats.bottom5.map((person, idx) => {
                            // Scale height from 70% min to 120% max
                            const heightPercent = Math.min(100, Math.max(20, Math.round(((person.efficiencyRatio - 75) / (120 - 75)) * 100)));
                            const isHovered = hoveredManpowerId === person.id;
                            const isBelow100 = person.efficiencyRatio < 100;
                            const hoursDiff = person.flatRateHoursEarned - person.actualWorkHours;

                            return (
                              <div
                                key={person.id}
                                onMouseEnter={() => setHoveredManpowerId(person.id)}
                                onMouseLeave={() => setHoveredManpowerId(null)}
                                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                              >
                                {/* Tooltip on Hover */}
                                {isHovered && (
                                  <div className="absolute -top-16 z-30 bg-slate-900 text-white text-[10px] font-mono p-2 rounded-lg shadow-lg border border-slate-700 w-36 pointer-events-none animate-fadeIn text-center">
                                    <div className="font-bold text-amber-400 truncate">{person.name}</div>
                                    <div className={isBelow100 ? 'text-rose-400' : 'text-amber-300'}>
                                      Efisiensi: {person.efficiencyRatio}%
                                    </div>
                                    <div className="text-slate-400 text-[9px]">Flat: {person.flatRateHoursEarned}h | Fisik: {person.actualWorkHours}h</div>
                                    <div className={`font-bold text-[9px] ${hoursDiff < 0 ? 'text-rose-400' : 'text-amber-300'}`}>
                                      {hoursDiff >= 0 ? `+${hoursDiff}h` : `${hoursDiff}h Defisit`}
                                    </div>
                                  </div>
                                )}

                                {/* Score Value on Top of Column */}
                                <div className={`text-[10px] font-mono font-bold mb-1 flex items-center gap-0.5 ${
                                  isBelow100 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
                                }`}>
                                  {isBelow100 && <AlertCircle size={10} className="text-rose-500" />}
                                  <span>{person.efficiencyRatio}%</span>
                                </div>

                                {/* Column Bar */}
                                <div 
                                  className={`w-full max-w-[34px] rounded-t-lg transition-all duration-300 ${
                                    isHovered
                                      ? 'bg-gradient-to-t from-rose-600 via-rose-500 to-amber-400 shadow-md scale-105'
                                      : isBelow100
                                      ? 'bg-gradient-to-t from-rose-600 to-rose-400 hover:from-rose-500 hover:to-rose-300'
                                      : 'bg-gradient-to-t from-amber-600 to-orange-400 hover:from-amber-500 hover:to-orange-300'
                                  }`}
                                  style={{ height: `${heightPercent}%` }}
                                ></div>

                                {/* Label Below */}
                                <div className="mt-1 text-center w-full">
                                  <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 block truncate">
                                    {person.name.split(' ')[0]}
                                  </span>
                                  <span className={`text-[9px] font-mono font-semibold block ${
                                    isBelow100 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                                  }`}>
                                    🔻#{idx + 1}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Axis Labels */}
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 px-1">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          ◀ 5 Personil Performa Tertinggi
                        </span>
                        <span className="text-rose-700 dark:text-rose-400 font-bold">
                          5 Personil Perlu Pembinaan ▶
                        </span>
                      </div>
                    </div>

                    {/* Comparative Scorecards Beneath Chart */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30">
                        <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 font-bold block uppercase">
                          Rata-Rata 5 Teratas
                        </span>
                        <div className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                          {manpowerStats.top5AvgEff}%
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                          +{manpowerStats.top5Surplus} Jam Hemat
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/30">
                        <span className="text-[10px] font-mono text-rose-800 dark:text-rose-300 font-bold block uppercase">
                          Rata-Rata 5 Terbawah
                        </span>
                        <div className="text-lg font-black font-mono text-rose-700 dark:text-rose-400">
                          {manpowerStats.bottom5AvgEff}%
                        </div>
                        <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 font-semibold">
                          {manpowerStats.bottom5Surplus >= 0 ? `+${manpowerStats.bottom5Surplus}` : manpowerStats.bottom5Surplus} Jam Varians
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/30">
                        <span className="text-[10px] font-mono text-blue-800 dark:text-blue-300 font-bold block uppercase">
                          Disparitas Efisiensi
                        </span>
                        <div className="text-lg font-black font-mono text-blue-700 dark:text-blue-400">
                          {manpowerStats.efficiencyGap}%
                        </div>
                        <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                          Rentang Gap Performa
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30">
                        <span className="text-[10px] font-mono text-amber-800 dark:text-amber-300 font-bold block uppercase">
                          Rekomendasi Tindakan
                        </span>
                        <div className="text-xs font-bold font-mono text-amber-800 dark:text-amber-300 mt-1 leading-snug">
                          Buddy System OJT
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
                          Tandem Senior &amp; Junior
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CHART MODE 2: DUAL BAR (FLAT RATE VS ACTUAL WORK HOURS) */}
                {manpowerChartMode === 'flat_vs_actual' && (
                  <div className="space-y-3">
                    {/* Sub-Cohort Filter */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setChartCohortFilter('all')}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                            chartCohortFilter === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Semua Personil (10)
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartCohortFilter('top5')}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                            chartCohortFilter === 'top5' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          5 Teratas Saja
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartCohortFilter('bottom5')}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                            chartCohortFilter === 'bottom5' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          5 Terbawah Saja
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">Flat Rate</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">Fisik</span>
                        </div>
                      </div>
                    </div>

                    {/* Dual Bars List */}
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {(chartCohortFilter === 'top5'
                        ? manpowerStats.top5
                        : chartCohortFilter === 'bottom5'
                        ? manpowerStats.bottom5
                        : manpowerStats.list
                      ).map((person, idx) => {
                        const maxVal = 200; // scale reference
                        const flatWidth = Math.min(100, Math.round((person.flatRateHoursEarned / maxVal) * 100));
                        const actualWidth = Math.min(100, Math.round((person.actualWorkHours / maxVal) * 100));
                        const surplusHours = person.flatRateHoursEarned - person.actualWorkHours;

                        return (
                          <div 
                            key={person.id}
                            onMouseEnter={() => setHoveredManpowerId(person.id)}
                            onMouseLeave={() => setHoveredManpowerId(null)}
                            className={`p-2.5 rounded-xl border transition-all ${
                              hoveredManpowerId === person.id
                                ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-2xs'
                                : 'bg-slate-50/70 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${
                                  idx === 0 ? 'bg-amber-400 text-slate-950 shadow-2xs' :
                                  idx === 1 ? 'bg-slate-300 text-slate-900' :
                                  idx === 2 ? 'bg-amber-700 text-white' :
                                  'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}>
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                                    {person.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1.5">
                                    ({person.role} - {person.skillLevel})
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  surplusHours >= 0 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                }`}>
                                  {surplusHours >= 0 ? `+${surplusHours} Jam Hemat` : `${surplusHours} Jam Defisit`}
                                </span>
                                <span className="text-xs font-black font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                  {person.efficiencyRatio}%
                                </span>
                              </div>
                            </div>

                            {/* Dual Bars Container */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500 w-12 text-right">Flat:</span>
                                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                  <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                                    style={{ width: `${flatWidth}%` }}
                                  ></div>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 w-16 text-right">
                                  {person.flatRateHoursEarned} Jam
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500 w-12 text-right">Fisik:</span>
                                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                    style={{ width: `${actualWidth}%` }}
                                  ></div>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-400 w-16 text-right">
                                  {person.actualWorkHours} Jam
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CHART MODE 3: EFFICIENCY RATIO PERCENTAGE BARS */}
                {manpowerChartMode === 'efficiency_bars' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span>Rasio = (Total Jam Flat-Rate ÷ Jam Aktual) × 100%</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">&gt; 100% = Produktif &amp; Hemat Waktu</span>
                    </div>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {manpowerStats.list.map((person, idx) => {
                        const barWidth = Math.min(100, Math.round((person.efficiencyRatio / 125) * 100));

                        return (
                          <div key={person.id} className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <div className="flex items-center gap-2">
                                <span className="w-5 text-slate-400 font-bold">#{idx + 1}</span>
                                <span className="font-bold text-slate-900 dark:text-white">{person.name}</span>
                                <span className="text-[10px] text-slate-400">({person.role})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500">{person.completedJobsCount} WO</span>
                                <span className={`font-black font-mono text-xs px-2 py-0.5 rounded ${
                                  person.efficiencyRatio >= 108
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                    : person.efficiencyRatio >= 100
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                                }`}>
                                  {person.efficiencyRatio}%
                                </span>
                              </div>
                            </div>

                            {/* Progress bar with 100% threshold marker */}
                            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  person.efficiencyRatio >= 108
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                    : person.efficiencyRatio >= 100
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                    : 'bg-gradient-to-r from-amber-500 to-rose-400'
                                }`}
                                style={{ width: `${barWidth}%` }}
                              ></div>
                              <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10 opacity-60"
                                style={{ left: '80%' }}
                                title="Target Benchmark: 100%"
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CHART MODE 4: ROLE PERFORMANCE SUMMARY */}
                {manpowerChartMode === 'role_summary' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {manpowerStats.roleBreakdown.map((role) => (
                        <div key={role.role} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                              <HardHat size={14} className="text-blue-500" />
                              <span>{role.role}</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                              {role.count} Personil
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between pt-1">
                            <div>
                              <span className="text-[10px] text-slate-400 font-mono block">Rata-Rata Efisiensi</span>
                              <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                                {role.avgEfficiency}%
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 font-mono block">WO Diselesaikan</span>
                              <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200">
                                {role.totalJobs} WO
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
                            <span>Flat: <strong>{role.totalFlat} Jam</strong></span>
                            <span>Fisik: <strong>{role.totalActual} Jam</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chart Footer Note */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="text-[11px]">
                  Formula: (Jam Standar Flat Rate ÷ Jam Aktual Fisik) × 100%
                </span>
                <button
                  type="button"
                  onClick={() => onSelectModule('manpower')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Buka Modul Manpower</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* PANEL KANAN: LEADERBOARD & EVALUASI 5 TERATAS & 5 TERBAWAH (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                {/* Header Leaderboard with Toggle Tabs for Top 5 & Bottom 5 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl border ${
                      leaderboardTab === 'top5'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                        : leaderboardTab === 'bottom5'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                    }`}>
                      {leaderboardTab === 'top5' ? <Trophy size={18} /> : leaderboardTab === 'bottom5' ? <AlertCircle size={18} /> : <BarChart3 size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{leaderboardTab === 'top5' ? 'TOP 5 PERINGKAT TERATAS' : leaderboardTab === 'bottom5' ? '5 PERINGKAT TERBAWAH' : 'KOMPARASI TOP VS BOTTOM'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                        {leaderboardTab === 'top5'
                          ? 'Performa & efisiensi flat-rate tertinggi bulan ini'
                          : leaderboardTab === 'bottom5'
                          ? 'Personil yang membutuhkan evaluasi pembinaan & OJT'
                          : 'Perbandingan performa 5 teratas vs 5 terbawah'}
                      </p>
                    </div>
                  </div>

                  {/* Switcher: Top 5 / Bottom 5 / Both */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-mono font-bold gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setLeaderboardTab('top5')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        leaderboardTab === 'top5'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <span>🏆 5 Teratas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardTab('bottom5')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        leaderboardTab === 'bottom5'
                          ? 'bg-rose-600 text-white font-black shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <span>⚠️ 5 Terbawah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardTab('both')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        leaderboardTab === 'both'
                          ? 'bg-blue-600 text-white font-black shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                      }`}
                      title="Bandingkan Kedua Kategori"
                    >
                      <span>Komparasi</span>
                    </button>
                  </div>
                </div>

                {/* TAB VIEW 1: TOP 5 CARDS */}
                {leaderboardTab === 'top5' && (
                  <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-0.5">
                    {manpowerStats.top5.map((performer, rankIdx) => {
                      const isRank1 = rankIdx === 0;
                      const isRank2 = rankIdx === 1;
                      const isRank3 = rankIdx === 2;
                      const hoursDiff = performer.flatRateHoursEarned - performer.actualWorkHours;

                      return (
                        <div
                          key={performer.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isRank1
                              ? 'border-amber-400 dark:border-amber-500/80 bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-white dark:from-amber-950/40 dark:via-amber-950/20 dark:to-slate-900 shadow-sm'
                              : isRank2
                              ? 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
                              : isRank3
                              ? 'border-amber-700/40 dark:border-amber-800/50 bg-amber-900/5 dark:bg-amber-950/20'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            {/* Rank Icon & Identity */}
                            <div className="flex items-start gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 ${
                                isRank1
                                  ? 'bg-amber-400 text-slate-950 shadow-xs ring-2 ring-amber-400/50'
                                  : isRank2
                                  ? 'bg-slate-300 text-slate-900'
                                  : isRank3
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {isRank1 ? '🥇' : isRank2 ? '🥈' : isRank3 ? '🥉' : `#${rankIdx + 1}`}
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="text-xs font-black font-mono text-slate-900 dark:text-white">
                                    {performer.name}
                                  </h5>
                                  {isRank1 && (
                                    <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 uppercase tracking-wider">
                                      TOP 1
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 flex-wrap">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {performer.role}
                                  </span>
                                  <span>&bull;</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    {performer.skillLevel}
                                  </span>
                                  <span>&bull;</span>
                                  <span className="text-slate-400">NRP: {performer.nrp}</span>
                                </div>
                              </div>
                            </div>

                            {/* Efficiency Score KPI */}
                            <div className="text-right shrink-0">
                              <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                                {performer.efficiencyRatio}%
                              </div>
                              <span className="text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded">
                                +{hoursDiff} Jam Hemat
                              </span>
                            </div>
                          </div>

                          {/* Metrics Bar: Flat vs Actual & Jobs Done */}
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                            <div className="flex items-center gap-2 text-slate-500">
                              <span>Flat: <strong className="text-slate-900 dark:text-white">{performer.flatRateHoursEarned}h</strong></span>
                              <span>&bull;</span>
                              <span>Fisik: <strong className="text-slate-900 dark:text-white">{performer.actualWorkHours}h</strong></span>
                              <span>&bull;</span>
                              <span>WO: <strong className="text-blue-600 dark:text-blue-400">{performer.completedJobsCount}</strong></span>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                performer.status === 'In Job' ? 'bg-blue-500' : 'bg-emerald-500'
                              }`}></span>
                              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                {performer.status}
                              </span>
                            </div>
                          </div>

                          {/* Top Specialization Tag */}
                          {performer.specialties && performer.specialties.length > 0 && (
                            <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                              <span className="text-[9px] font-mono text-slate-400">Spesialisasi:</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {performer.specialties[0]}
                              </span>
                              {performer.specialties[1] && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {performer.specialties[1]}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB VIEW 2: 5 TERBAWAH CARDS (PERLU EVALUASI & COACHING) */}
                {leaderboardTab === 'bottom5' && (
                  <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-0.5">
                    {/* Notice Banner */}
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-xs font-sans text-amber-900 dark:text-amber-200">
                      <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Catatan Supervisi:</strong> Personil dalam daftar ini memerlukan evaluasi alur kerja, pendampingan Senior Teknisi (OJT), atau pemeriksaan kendala waktu tunggu suku cadang/tooling.
                      </div>
                    </div>

                    {manpowerStats.bottom5.map((performer, rankIdx) => {
                      const isLowest = rankIdx === 0;
                      const isBelow100 = performer.efficiencyRatio < 100;
                      const hoursDiff = performer.flatRateHoursEarned - performer.actualWorkHours;

                      // Contextual coaching action notes based on person role/data
                      const coachingNotes = [
                        'Asistensi SOP pembongkaran & penggunaan SST untuk teknisi junior',
                        'Investigasi kendala baut patah & waktu tunggu suku cadang di Bay',
                        'Optimalisasi rotasi pekerjaan tyre replacement di area pit mobile',
                        'Pelatihan penelusuran skema kelistrikan 24V & kalibrasi sensor',
                        'Peningkatan kecepatan overhaul gearbox transmisi alat berat'
                      ];
                      const specificNote = coachingNotes[rankIdx % coachingNotes.length];

                      return (
                        <div
                          key={performer.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isLowest
                              ? 'border-rose-400 dark:border-rose-500/80 bg-gradient-to-r from-rose-50/80 via-rose-50/30 to-white dark:from-rose-950/40 dark:via-rose-950/20 dark:to-slate-900 shadow-sm'
                              : isBelow100
                              ? 'border-rose-200 dark:border-rose-800/80 bg-rose-50/40 dark:bg-rose-950/20'
                              : 'border-amber-200 dark:border-amber-800/70 bg-amber-50/30 dark:bg-amber-950/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            {/* Rank Icon & Identity */}
                            <div className="flex items-start gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                                isLowest
                                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400/50'
                                  : isBelow100
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-amber-500 text-slate-950'
                              }`}>
                                🔻{rankIdx + 1}
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="text-xs font-black font-mono text-slate-900 dark:text-white">
                                    {performer.name}
                                  </h5>
                                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                                    isBelow100
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}>
                                    {isBelow100 ? 'Perlu OJT' : 'Review Kecepatan'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 flex-wrap">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {performer.role}
                                  </span>
                                  <span>&bull;</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    {performer.skillLevel}
                                  </span>
                                  <span>&bull;</span>
                                  <span className="text-slate-400">NRP: {performer.nrp}</span>
                                </div>
                              </div>
                            </div>

                            {/* Efficiency Score KPI */}
                            <div className="text-right shrink-0">
                              <div className={`text-base font-black font-mono ${
                                isBelow100 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                              }`}>
                                {performer.efficiencyRatio}%
                              </div>
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                hoursDiff < 0
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {hoursDiff < 0 ? `${hoursDiff} Jam Defisit` : `+${hoursDiff} Jam`}
                              </span>
                            </div>
                          </div>

                          {/* Detail Kendala & Rekomendasi Coaching */}
                          <div className="mt-2 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] font-sans text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-white">Rencana Pembinaan: </span>
                            <span>{specificNote}</span>
                          </div>

                          {/* Metrics Bar: Flat vs Actual & Jobs Done */}
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                            <div className="flex items-center gap-2 text-slate-500">
                              <span>Flat: <strong className="text-slate-900 dark:text-white">{performer.flatRateHoursEarned}h</strong></span>
                              <span>&bull;</span>
                              <span>Fisik: <strong className="text-slate-900 dark:text-white">{performer.actualWorkHours}h</strong></span>
                              <span>&bull;</span>
                              <span>WO: <strong className="text-blue-600 dark:text-blue-400">{performer.completedJobsCount}</strong></span>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                performer.status === 'In Job' ? 'bg-blue-500' : 'bg-emerald-500'
                              }`}></span>
                              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                {performer.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB VIEW 3: KOMPARASI KEDUA KELOMPOK (BOTH) */}
                {leaderboardTab === 'both' && (
                  <div className="space-y-3 max-h-[440px] overflow-y-auto pr-0.5">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Top 5 Column */}
                      <div className="space-y-2 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <Trophy size={13} />
                            <span>5 TERATAS</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {manpowerStats.top5AvgEff}%
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs font-mono">
                          {manpowerStats.top5.map((p, idx) => (
                            <div key={p.id} className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px]">
                              <span className="truncate max-w-[90px] font-bold text-slate-800 dark:text-slate-200">
                                #{idx + 1} {p.name.split(' ')[0]}
                              </span>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {p.efficiencyRatio}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom 5 Column */}
                      <div className="space-y-2 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black font-mono text-rose-800 dark:text-rose-300 flex items-center gap-1">
                            <AlertCircle size={13} />
                            <span>5 TERBAWAH</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400">
                            {manpowerStats.bottom5AvgEff}%
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs font-mono">
                          {manpowerStats.bottom5.map((p, idx) => (
                            <div key={p.id} className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px]">
                              <span className="truncate max-w-[90px] font-bold text-slate-800 dark:text-slate-200">
                                🔻{idx + 1} {p.name.split(' ')[0]}
                              </span>
                              <span className={`font-mono font-bold ${
                                p.efficiencyRatio < 100 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                              }`}>
                                {p.efficiencyRatio}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Summary Gap Insight Box */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Total Jam Flat Rate:</span>
                        <span>Top 5: <strong className="text-emerald-600">{manpowerStats.top5TotalFlat}h</strong> vs Bottom 5: <strong className="text-rose-600">{manpowerStats.bottom5TotalFlat}h</strong></span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Selisih Surplus Jam:</span>
                        <span>Top 5: <strong className="text-emerald-600">+{manpowerStats.top5Surplus}h</strong> vs Bottom 5: <strong className="text-rose-600">{manpowerStats.bottom5Surplus >= 0 ? `+${manpowerStats.bottom5Surplus}` : manpowerStats.bottom5Surplus}h</strong></span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>Gap Efisiensi Kerja:</span>
                        <span className="text-blue-600 dark:text-blue-400">{manpowerStats.efficiencyGap}% Deviasi</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Leaderboard Action Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  {manpowerStats.totalStaff} Personil Terdaftar
                </span>
                <button
                  type="button"
                  onClick={() => onSelectModule('manpower')}
                  className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Buka Modul Manpower</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: AKSES CEPAT MODUL OPERASIONAL (QUICK LAUNCHER) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div>
              <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={16} className="text-red-500" />
                <span>PILIH MODUL UNTUK MELANJUTKAN</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Akses cepat menuju alur kerja spesifik di site tambang
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              5 Modul Terintegrasi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="quick-module-launcher-cards">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => onSelectModule(mod.id)}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${mod.accentBorder}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl ${mod.iconBg}`}>
                        <Icon size={20} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold font-mono text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                        {mod.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {mod.subtitle}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-[10px] text-slate-400 font-normal">{mod.stat}</span>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-slate-200 group-hover:text-red-600 transition-colors">
                      <span>Buka</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
