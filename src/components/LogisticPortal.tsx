import React, { useState, useEffect, useMemo } from 'react';
import { 
  Boxes, 
  Package, 
  AlertTriangle, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers, 
  TrendingDown, 
  CheckCircle2, 
  Truck, 
  Clock, 
  Building2,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  Maximize2,
  Minimize2,
  Settings,
  Link as LinkIcon,
  ShieldCheck,
  Activity,
  ArrowRight,
  Workflow,
  X,
  ChevronRight,
  Filter,
  Sparkles,
  Cpu,
  Check,
  Zap,
  Info,
  ChevronDown
} from 'lucide-react';
import { SparePart, UioUnit, AppUser } from '../types';
import AutoPartFlowControl from './auto-part-flow-control/AutoPartFlowControl';

export type PartFlowStage = 'inbound' | 'qc' | 'storage' | 'reserved' | 'dispatched';

export interface PartFlowItem {
  id: string;
  partCode: string;
  partName: string;
  category: string;
  quantity: number;
  unit: string;
  stage: PartFlowStage;
  binLocation: string;
  assignedUnit?: string;
  referenceNo: string;
  supplierOrVendor?: string;
  priority: 'Urgent Breakdown' | 'High' | 'Normal' | 'Buffer Stock';
  qcStatus: 'Passed' | 'Inspecting' | 'Quarantined' | 'N/A';
  coreReturnStatus?: 'Pending' | 'Returned' | 'Scrapped' | 'N/A';
  leadTimeHours: number;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

interface LogisticPortalProps {
  parts: SparePart[];
  units?: UioUnit[];
  currentUser?: AppUser;
  onAddPart?: (part: Partial<SparePart>) => void;
  onUpdatePart?: (partId: string, updatedFields: Partial<SparePart>) => void;
}

const DEFAULT_FLOW_ITEMS: PartFlowItem[] = [
  {
    id: 'PFC-901',
    partCode: 'FIL-CAT-1R1808',
    partName: 'Filter Oli Caterpillar 1R-1808',
    category: 'Filter',
    quantity: 6,
    unit: 'Pcs',
    stage: 'reserved',
    binLocation: 'RACK-A1-BIN04',
    assignedUnit: 'EXCA-01',
    referenceNo: 'WO-2026-088',
    supplierOrVendor: 'PT Trakindo Utama',
    priority: 'Urgent Breakdown',
    qcStatus: 'Passed',
    coreReturnStatus: 'Pending',
    leadTimeHours: 14,
    timestamp: '2026-09-23 09:30',
    updatedBy: 'Suryadi (Gudang)',
    notes: 'Dialokasikan untuk penggantian berkala 250 HM unit Excavator EXCA-01.'
  },
  {
    id: 'PFC-902',
    partCode: 'BRK-KOM-PC200',
    partName: 'Kampas Rem Brakes Komatsu PC200',
    category: 'Brakes',
    quantity: 2,
    unit: 'Set',
    stage: 'dispatched',
    binLocation: 'RACK-B2-BIN12',
    assignedUnit: 'DUMP-05',
    referenceNo: 'WO-2026-084',
    supplierOrVendor: 'PT United Tractors',
    priority: 'High',
    qcStatus: 'Passed',
    coreReturnStatus: 'Returned',
    leadTimeHours: 26,
    timestamp: '2026-09-22 14:15',
    updatedBy: 'M. Yusuf (Mekanik)',
    notes: 'Terpasang di Dump Truck DUMP-05. Core kampas lama diserahkan ke gudang scrap.'
  },
  {
    id: 'PFC-903',
    partCode: 'HYD-ISO-VG68',
    partName: 'Hydraulic Oil ISO VG 68 (Drum 200L)',
    category: 'Oil',
    quantity: 4,
    unit: 'Drum',
    stage: 'storage',
    binLocation: 'BAY-OIL-R01',
    referenceNo: 'PO-2026-112',
    supplierOrVendor: 'PT Pertamina Lubricants',
    priority: 'Buffer Stock',
    qcStatus: 'Passed',
    coreReturnStatus: 'N/A',
    leadTimeHours: 48,
    timestamp: '2026-09-21 11:20',
    updatedBy: 'Gudang Shift A',
    notes: 'Stok siap pakai di area penampungan oli drum. Level QC drum segel aman.'
  },
  {
    id: 'PFC-904',
    partCode: 'TYR-BRI-27R49',
    partName: 'Ban Tubeless Bridgestone 27.00R49 V-Steel',
    category: 'Tires',
    quantity: 4,
    unit: 'Pcs',
    stage: 'qc',
    binLocation: 'YARD-TIRE-02',
    referenceNo: 'PO-2026-110',
    supplierOrVendor: 'PT Bridgestone Mining',
    priority: 'High',
    qcStatus: 'Inspecting',
    coreReturnStatus: 'Pending',
    leadTimeHours: 8,
    timestamp: '2026-09-23 08:00',
    updatedBy: 'Hendra (Lead Tireman)',
    notes: 'Pemeriksaan ketebalan tapak (tread depth) dan kesesuaian serial barcode.'
  },
  {
    id: 'PFC-905',
    partCode: 'ENG-INJ-QSK50',
    partName: 'Fuel Injector Common Rail Cummins QSK50',
    category: 'Engine Parts',
    quantity: 12,
    unit: 'Set',
    stage: 'inbound',
    binLocation: 'RECEIVING-DOCK',
    referenceNo: 'PO-2026-115',
    supplierOrVendor: 'PT Altrak 1978',
    priority: 'Urgent Breakdown',
    qcStatus: 'Inspecting',
    coreReturnStatus: 'Pending',
    leadTimeHours: 2,
    timestamp: '2026-09-23 10:45',
    updatedBy: 'Ekspedisi Logistic',
    notes: 'Kiriman udara dari Jakarta, menunggu unboxing & verifikasi dokumen part number.'
  }
];

export default function LogisticPortal({ 
  parts, 
  units = [], 
  currentUser,
  onAddPart, 
  onUpdatePart 
}: LogisticPortalProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'native_app' | 'app_embed' | 'flow_control' | 'inventory' | 'movements' | 'reorder'>('native_app');

  // Google AI Studio external applet link configuration
  const [appUrl, setAppUrl] = useState<string>(() => {
    return localStorage.getItem('auto_part_flow_control_app_url') || '';
  });
  const [tempUrlInput, setTempUrlInput] = useState<string>(() => {
    return localStorage.getItem('auto_part_flow_control_app_url') || '';
  });
  const [isUrlConfigOpen, setIsUrlConfigOpen] = useState(false);
  const [isFullscreenEmbed, setIsFullscreenEmbed] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // In-app Toast message (replaces alert/confirm)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Flow Control Kanban State
  const [flowItems, setFlowItems] = useState<PartFlowItem[]>(() => {
    const saved = localStorage.getItem('auto_part_flow_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse flow items:', e);
      }
    }
    return DEFAULT_FLOW_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('auto_part_flow_items', JSON.stringify(flowItems));
  }, [flowItems]);

  // Save App URL
  const handleSaveAppUrl = (urlToSave: string) => {
    const cleanUrl = urlToSave.trim();
    setAppUrl(cleanUrl);
    localStorage.setItem('auto_part_flow_control_app_url', cleanUrl);
    setIsUrlConfigOpen(false);
    setIsIframeLoading(true);
    setIframeKey(prev => prev + 1);
    showToast(cleanUrl ? 'Tautan aplikasi auto-part-flow-control berhasil disimpan!' : 'Pengaturan URL dikosongkan.', 'success');
  };

  // Flow Stage filters & Search
  const [flowFilterPriority, setFlowFilterPriority] = useState<string>('ALL');
  const [flowSearchTerm, setFlowSearchTerm] = useState<string>('');
  const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);

  // Inventory Table filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Movements log
  const [movements, setMovements] = useState([
    { id: 'MOV-102', date: '2026-09-23 10:45', partName: 'Fuel Injector Common Rail Cummins QSK50', type: 'IN', qty: 12, refNo: 'PO-2026-115', supplier: 'PT Altrak 1978', user: 'Ekspedisi Logistic', status: 'Inbound Dock' },
    { id: 'MOV-101', date: '2026-09-23 09:30', partName: 'Filter Oli Caterpillar 1R-1808', type: 'OUT', qty: 6, refNo: 'WO-2026-088', unit: 'EXCA-01', user: 'Suryadi (Gudang)', status: 'Reserved Bay' },
    { id: 'MOV-100', date: '2026-09-22 14:15', partName: 'Kampas Rem Brakes Komatsu PC200', type: 'OUT', qty: 2, refNo: 'WO-2026-084', unit: 'DUMP-05', user: 'M. Yusuf (Mekanik)', status: 'Dispatched' },
    { id: 'MOV-099', date: '2026-09-21 11:20', partName: 'Hydraulic Oil ISO VG 68 (Drum 200L)', type: 'IN', qty: 4, refNo: 'PO-2026-112', supplier: 'PT Pertamina Lubricants', user: 'Gudang Shift A', status: 'Stocked Bin' },
  ]);

  // New Flow Ticket form state
  const [newTicket, setNewTicket] = useState({
    partCode: parts[0]?.code || 'FIL-CAT-1R1808',
    partName: parts[0]?.name || 'Filter Oli Caterpillar 1R-1808',
    category: parts[0]?.category || 'Filter',
    quantity: 1,
    unit: parts[0]?.unit || 'Pcs',
    stage: 'inbound' as PartFlowStage,
    binLocation: 'RECEIVING-DOCK',
    assignedUnit: units[0]?.code || 'EXCA-01',
    referenceNo: 'PO-2026-116',
    supplierOrVendor: 'PT Trakindo Utama',
    priority: 'Normal' as const,
    qcStatus: 'Inspecting' as const,
    notes: ''
  });

  const lowStockParts = useMemo(() => parts.filter(p => p.stock <= p.minStock), [parts]);
  const totalStockItems = useMemo(() => parts.reduce((acc, curr) => acc + curr.stock, 0), [parts]);

  // Advance flow stage action
  const handleAdvanceStage = (itemId: string) => {
    const stageOrder: PartFlowStage[] = ['inbound', 'qc', 'storage', 'reserved', 'dispatched'];
    setFlowItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const currentIdx = stageOrder.indexOf(item.stage);
      if (currentIdx < stageOrder.length - 1) {
        const nextStage = stageOrder[currentIdx + 1];
        let updatedBin = item.binLocation;
        let updatedQC = item.qcStatus;

        if (nextStage === 'storage') {
          updatedBin = `RACK-${item.category.toUpperCase().slice(0, 3)}-01`;
          updatedQC = 'Passed';
        } else if (nextStage === 'reserved') {
          updatedBin = `STAGING-${item.assignedUnit || 'BAY'}`;
        } else if (nextStage === 'dispatched') {
          updatedBin = `INSTALLED-${item.assignedUnit || 'FLEET'}`;
        }

        showToast(`Alur komponen ${item.partCode} dimajukan ke tahap: ${getStageName(nextStage).toUpperCase()}!`, 'success');
        return {
          ...item,
          stage: nextStage,
          binLocation: updatedBin,
          qcStatus: updatedQC,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          updatedBy: currentUser?.name || 'Petugas Alur Part'
        };
      }
      return item;
    }));
  };

  // Move back stage action
  const handleRegressStage = (itemId: string) => {
    const stageOrder: PartFlowStage[] = ['inbound', 'qc', 'storage', 'reserved', 'dispatched'];
    setFlowItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const currentIdx = stageOrder.indexOf(item.stage);
      if (currentIdx > 0) {
        const prevStage = stageOrder[currentIdx - 1];
        showToast(`Alur komponen ${item.partCode} dikembalikan ke tahap: ${getStageName(prevStage)}`, 'info');
        return {
          ...item,
          stage: prevStage,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          updatedBy: currentUser?.name || 'Petugas Alur Part'
        };
      }
      return item;
    }));
  };

  // Helper names & styling for flow stages
  function getStageName(stage: PartFlowStage) {
    switch (stage) {
      case 'inbound': return '1. Inbound & Penerimaan';
      case 'qc': return '2. QC & Karantina';
      case 'storage': return '3. Bin Gudang (Ready)';
      case 'reserved': return '4. Reservasi WO Unit';
      case 'dispatched': return '5. Dispatched & Retur Core';
      default: return stage;
    }
  }

  function getStageBadgeColor(stage: PartFlowStage) {
    switch (stage) {
      case 'inbound': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'qc': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'storage': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'reserved': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'dispatched': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
  }

  // Create new ticket
  const handleCreateNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `PFC-${Math.floor(100 + Math.random() * 900)}`;
    const ticket: PartFlowItem = {
      id: newId,
      partCode: newTicket.partCode,
      partName: newTicket.partName,
      category: newTicket.category,
      quantity: Number(newTicket.quantity) || 1,
      unit: newTicket.unit,
      stage: newTicket.stage,
      binLocation: newTicket.binLocation,
      assignedUnit: newTicket.assignedUnit,
      referenceNo: newTicket.referenceNo,
      supplierOrVendor: newTicket.supplierOrVendor,
      priority: newTicket.priority,
      qcStatus: newTicket.qcStatus,
      coreReturnStatus: 'Pending',
      leadTimeHours: 1,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedBy: currentUser?.name || 'Gudang Tim',
      notes: newTicket.notes
    };

    setFlowItems(prev => [ticket, ...prev]);
    setIsNewFlowModalOpen(false);
    showToast(`Tiket Alur Komponen ${newId} (${newTicket.partCode}) berhasil dibuat!`, 'success');

    // Also add to movement log
    setMovements(prev => [
      {
        id: `MOV-${Math.floor(103 + Math.random() * 900)}`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        partName: newTicket.partName,
        type: newTicket.stage === 'inbound' || newTicket.stage === 'storage' ? 'IN' : 'OUT',
        qty: newTicket.quantity,
        refNo: newTicket.referenceNo,
        unit: newTicket.assignedUnit,
        supplier: newTicket.supplierOrVendor,
        user: currentUser?.name || 'Petugas Logistik',
        status: newTicket.stage
      },
      ...prev
    ]);
  };

  // Filtered Flow Items
  const filteredFlowItems = useMemo(() => {
    return flowItems.filter(item => {
      const matchesSearch = 
        item.partName.toLowerCase().includes(flowSearchTerm.toLowerCase()) ||
        item.partCode.toLowerCase().includes(flowSearchTerm.toLowerCase()) ||
        item.referenceNo.toLowerCase().includes(flowSearchTerm.toLowerCase()) ||
        (item.assignedUnit && item.assignedUnit.toLowerCase().includes(flowSearchTerm.toLowerCase()));
      const matchesPriority = flowFilterPriority === 'ALL' || item.priority === flowFilterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [flowItems, flowSearchTerm, flowFilterPriority]);

  // Filtered master parts for Inventory Tab
  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchesLowStock = !showLowStockOnly || p.stock <= p.minStock;
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [parts, searchTerm, categoryFilter, showLowStockOnly]);

  // Stages count for summary
  const stagesCount = useMemo(() => {
    return {
      inbound: flowItems.filter(i => i.stage === 'inbound').length,
      qc: flowItems.filter(i => i.stage === 'qc').length,
      storage: flowItems.filter(i => i.stage === 'storage').length,
      reserved: flowItems.filter(i => i.stage === 'reserved').length,
      dispatched: flowItems.filter(i => i.stage === 'dispatched').length
    };
  }, [flowItems]);

  return (
    <div className="space-y-5 animate-fadeIn" id="auto-part-flow-control-portal">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border font-mono text-xs animate-in slide-in-from-bottom-5 duration-200 ${
          toast.type === 'success' 
            ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/40' 
            : toast.type === 'error'
            ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/40'
            : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/40'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle size={16} className="text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info size={16} className="text-blue-400 shrink-0" />}
          <span className="font-semibold">{toast.text}</span>
          <button 
            type="button" 
            onClick={() => setToast(null)} 
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Header Banner & Integration Status */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white rounded-2xl shadow-md shrink-0">
            <Workflow size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>Modul Logistik &amp; Auto Part Flow Control</span>
              </h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-mono text-[10px] font-bold rounded-md border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Cpu size={12} />
                <span>AI Studio Applet Integration</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Pengendalian terpusat siklus aliran sparepart: integrasi aplikasi <strong className="font-mono text-slate-800 dark:text-slate-200">auto-part-flow-control</strong> dari Google AI Studio, kontrol pipeline QC, bin location rak, dan alokasi Work Order armada.
            </p>
          </div>
        </div>

        {/* Action and Configuration Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Connector status badge */}
          <div 
            onClick={() => setIsUrlConfigOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              appUrl 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400' 
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:border-amber-400'
            }`}
            title="Klik untuk melihat atau memperbarui URL aplikasi auto-part-flow-control"
          >
            <span className={`w-2 h-2 rounded-full ${appUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span>{appUrl ? 'Terhubung: auto-part-flow-control' : 'Tautkan URL Aplikasi'}</span>
            <Settings size={13} className="text-slate-400 ml-1" />
          </div>

          <button
            type="button"
            onClick={() => setIsNewFlowModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Tiket Alur Baru</span>
          </button>
        </div>
      </div>

      {/* URL Connector Modal / Collapsible Bar */}
      {isUrlConfigOpen && (
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl animate-fadeIn space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
                <LinkIcon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-white">
                  Konfigurasi Tautan Aplikasi: auto-part-flow-control
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Masukkan tautan (Shared App URL atau Dev URL) dari aplikasi <strong>auto-part-flow-control</strong> yang ada di menu <em>My Apps</em> Google AI Studio Anda.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsUrlConfigOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 font-black flex items-center justify-center shrink-0">1</span>
              <span className="text-slate-300">Buka menu <strong>My Apps</strong> di Google AI Studio dan klik proyek <em>auto-part-flow-control</em>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 font-black flex items-center justify-center shrink-0">2</span>
              <span className="text-slate-300">Salin link <strong>Shared App URL</strong> (contoh: <code>https://ais-pre-...run.app</code>) atau <strong>Dev URL</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 font-black flex items-center justify-center shrink-0">3</span>
              <span className="text-slate-300">Tempelkan di kolom input di bawah ini lalu klik <strong>Simpan &amp; Hubungkan</strong>.</span>
            </div>
          </div>

          {/* Input field */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-slate-300 block">
              Google AI Studio Application URL (Shared / Dev URL):
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input
                  type="url"
                  value={tempUrlInput}
                  onChange={e => setTempUrlInput(e.target.value)}
                  placeholder="https://ais-pre-xxxxxxxxxxxx.asia-southeast1.run.app"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSaveAppUrl(tempUrlInput)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Simpan &amp; Hubungkan</span>
                </button>

                {appUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempUrlInput('');
                      handleSaveAppUrl('');
                    }}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-xl transition-colors cursor-pointer"
                    title="Hapus URL tersimpan"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main KPI Flow Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 uppercase font-bold">1. Inbound</span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </div>
          <div className="text-2xl font-black font-mono text-purple-700 dark:text-purple-300">
            {stagesCount.inbound} <span className="text-xs font-normal text-slate-400">Item</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Menunggu Unboxing</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 uppercase font-bold">2. QC &amp; Karantina</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300">
            {stagesCount.qc} <span className="text-xs font-normal text-slate-400">Item</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Uji Fisik &amp; Spek</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-blue-700 dark:text-blue-300 uppercase font-bold">3. Bin Gudang</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-black font-mono text-blue-700 dark:text-blue-300">
            {stagesCount.storage} <span className="text-xs font-normal text-slate-400">Item</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Ready in Bin Racks</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 uppercase font-bold">4. Reservasi WO</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
          <div className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-300">
            {stagesCount.reserved} <span className="text-xs font-normal text-slate-400">Item</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Siap Pasang di Armada</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 uppercase font-bold">5. Dispatched</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
            {stagesCount.dispatched} <span className="text-xs font-normal text-slate-400">Item</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Terpasang &amp; Retur Core</span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('native_app')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'native_app'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>🟢 Auto Part Flow Control (Native Source)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('app_embed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'app_embed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Zap size={14} className="text-amber-300" />
            <span>⚡ AI Studio Cloud Live Embed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flow_control')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'flow_control'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Workflow size={14} />
            <span>🔄 Kanban Siklus Komponen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Boxes size={14} />
            <span>Katalog Stok &amp; Bin ({parts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'movements'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Clock size={14} />
            <span>Riwayat Mutasi (In/Out)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reorder')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reorder'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle size={14} className={lowStockParts.length > 0 ? "text-amber-500" : ""} />
            <span>Safety Stock &amp; Reorder ({lowStockParts.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>Total Fisik: <strong className="text-slate-900 dark:text-white">{totalStockItems.toLocaleString()}</strong> Unit</span>
        </div>
      </div>

      {/* TAB NATIVE: AUTO PART FLOW CONTROL (NATIVE SOURCE CODE FROM REPO) */}
      {activeTab === 'native_app' && (
        <AutoPartFlowControl 
          fleetParts={parts}
          fleetUnits={units}
          currentUser={currentUser}
        />
      )}

      {/* TAB 1: LIVE APP: auto-part-flow-control EMBEDDED VIEWER */}
      {activeTab === 'app_embed' && (
        <div className={`space-y-4 ${isFullscreenEmbed ? 'fixed inset-4 z-50 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col' : ''}`}>
          {/* Controls Bar for Embedded App */}
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-slate-200">
                Google AI Studio Embed: <strong className="text-emerald-400">auto-part-flow-control</strong>
              </span>
              {appUrl && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] truncate max-w-xs">
                  {appUrl}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsUrlConfigOpen(!isUrlConfigOpen)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Atur Tautan Aplikasi"
              >
                <Settings size={13} />
                <span className="hidden sm:inline">Ganti URL</span>
              </button>

              {appUrl && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsIframeLoading(true);
                      setIframeKey(prev => prev + 1);
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Muat Ulang Tampilan"
                  >
                    <RefreshCw size={13} className={isIframeLoading ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">Reload</span>
                  </button>

                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
                    title="Buka di Jendela Tab Baru"
                  >
                    <ExternalLink size={13} />
                    <span className="hidden sm:inline">Buka Tab Baru</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenEmbed(!isFullscreenEmbed)}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    title={isFullscreenEmbed ? 'Kecilkan Tampilan' : 'Layar Penuh'}
                  >
                    {isFullscreenEmbed ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    <span className="hidden sm:inline">{isFullscreenEmbed ? 'Normal' : 'Layar Penuh'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* If URL is configured: render iframe */}
          {appUrl ? (
            <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-inner ${isFullscreenEmbed ? 'flex-1 min-h-0' : 'h-[760px]'}`}>
              {isIframeLoading && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 space-y-3">
                  <RefreshCw size={32} className="animate-spin text-blue-400" />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Memuat Aplikasi auto-part-flow-control...
                  </p>
                  <p className="text-[11px] font-mono text-slate-500">
                    Menghubungkan ke instance Google AI Studio ({appUrl.slice(0, 45)}...)
                  </p>
                </div>
              )}
              <iframe
                key={iframeKey}
                src={appUrl}
                title="auto-part-flow-control"
                onLoad={() => setIsIframeLoading(false)}
                className="w-full h-full border-0 bg-white"
                allow="camera; microphone; geolocation"
                sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts allow-downloads"
              />
            </div>
          ) : (
            /* If URL is not yet configured: show Setup Prompt & Built-in Engine Option */
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-xs font-bold">
                  <Sparkles size={14} />
                  <span>Integrasi Aplikasi Antar-Applet Google AI Studio</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wide">
                  Tautkan Aplikasi: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">auto-part-flow-control</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  Karena setiap aplikasi di Google AI Studio berjalan dalam ruang sandbox independen, Anda dapat menyematkan (embed) langsung aplikasi <strong>auto-part-flow-control</strong> ke dalam modul Logistik FLEET PARTNER dengan memasukkan tautan aplikasinya.
                </p>
              </div>

              {/* Step-by-Step Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center">1</div>
                  <h4 className="font-bold text-white text-xs">Buka Google AI Studio</h4>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Di browser Anda, buka dasbor Google AI Studio dan akses tab <strong>My Apps</strong>.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center">2</div>
                  <h4 className="font-bold text-white text-xs">Salin App URL</h4>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Pilih aplikasi <strong>auto-part-flow-control</strong> lalu salin <em>Shared App URL</em> atau <em>Dev URL</em>.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center">3</div>
                  <h4 className="font-bold text-white text-xs">Tempel &amp; Nikmati</h4>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Tempelkan link di formulir di bawah ini agar aplikasi tampil langsung di dalam modul ini.
                  </p>
                </div>
              </div>

              {/* URL Input Form */}
              <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-xs font-mono font-bold text-slate-300 block">
                  Tempelkan Tautan URL Aplikasi di sini:
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="url"
                    value={tempUrlInput}
                    onChange={e => setTempUrlInput(e.target.value)}
                    placeholder="https://ais-pre-xxxxxxxxxxxx.asia-southeast1.run.app"
                    className="flex-1 w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveAppUrl(tempUrlInput)}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 shrink-0"
                  >
                    <Check size={16} />
                    <span>Hubungkan Aplikasi Sekarang</span>
                  </button>
                </div>
              </div>

              {/* Alternative button: Explore native Kanban */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <Info size={15} className="text-blue-400" />
                  <span>Ingin melihat sistem alur komponen internal langsung?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('flow_control')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Buka Kanban Part Flow Control</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KANBAN SIKLUS KOMPONEN (BUILT-IN PART FLOW CONTROL ENGINE) */}
      {activeTab === 'flow_control' && (
        <div className="space-y-5">
          {/* Kanban Control Header */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari part number, WO, atau unit..."
                  value={flowSearchTerm}
                  onChange={e => setFlowSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 w-56 sm:w-64"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <span className="text-[10px] text-slate-400 px-1">Prioritas:</span>
                {['ALL', 'Urgent Breakdown', 'High', 'Buffer Stock'].map(pri => (
                  <button
                    key={pri}
                    type="button"
                    onClick={() => setFlowFilterPriority(pri)}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer text-[11px] ${
                      flowFilterPriority === pri
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {pri === 'ALL' ? 'Semua' : pri}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewFlowModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Tambah Alur Part</span>
              </button>
            </div>
          </div>

          {/* 5-Column Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
            {(['inbound', 'qc', 'storage', 'reserved', 'dispatched'] as PartFlowStage[]).map(stage => {
              const stageItems = filteredFlowItems.filter(i => i.stage === stage);
              return (
                <div 
                  key={stage}
                  className="bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-3 min-h-[500px] flex flex-col"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        stage === 'inbound' ? 'bg-purple-500' :
                        stage === 'qc' ? 'bg-amber-500' :
                        stage === 'storage' ? 'bg-blue-500' :
                        stage === 'reserved' ? 'bg-indigo-500' : 'bg-emerald-500'
                      }`}></span>
                      <h3 className="text-xs font-extrabold font-mono uppercase text-slate-800 dark:text-slate-200">
                        {getStageName(stage).split('. ')[1]}
                      </h3>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {stageItems.length}
                    </span>
                  </div>

                  {/* Cards in Column */}
                  <div className="space-y-2.5 flex-1">
                    {stageItems.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-[11px] font-mono border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <span>Tidak ada part</span>
                      </div>
                    ) : (
                      stageItems.map(item => (
                        <div
                          key={item.id}
                          className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all space-y-2 group"
                        >
                          {/* Top row: Priority & ID */}
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              item.priority === 'Urgent Breakdown' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                              item.priority === 'High' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {item.priority}
                            </span>
                            <span className="text-[10px] font-mono font-semibold text-slate-400">
                              {item.id}
                            </span>
                          </div>

                          {/* Part Details */}
                          <div>
                            <div className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 truncate">
                              {item.partCode}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                              {item.partName}
                            </h4>
                          </div>

                          {/* Qty & Bin Location */}
                          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Qty: <strong className="text-slate-900 dark:text-white">{item.quantity} {item.unit}</strong></span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[110px]" title={item.binLocation}>
                              {item.binLocation}
                            </span>
                          </div>

                          {/* Assigned Unit or Ref */}
                          {(item.assignedUnit || item.referenceNo) && (
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-lg">
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {item.assignedUnit ? `Unit: ${item.assignedUnit}` : item.supplierOrVendor}
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {item.referenceNo}
                              </span>
                            </div>
                          )}

                          {/* Flow Pipeline Actions */}
                          <div className="pt-1 flex items-center justify-between gap-1">
                            {stage !== 'inbound' ? (
                              <button
                                type="button"
                                onClick={() => handleRegressStage(item.id)}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                title="Kembalikan ke tahap sebelumnya"
                              >
                                &larr; Mundur
                              </button>
                            ) : <div></div>}

                            {stage !== 'dispatched' && (
                              <button
                                type="button"
                                onClick={() => handleAdvanceStage(item.id)}
                                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs ml-auto"
                                title="Majukan ke tahap alur selanjutnya"
                              >
                                <span>Lanjut</span>
                                <ChevronRight size={12} />
                              </button>
                            )}

                            {stage === 'dispatched' && (
                              <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 ml-auto">
                                <CheckCircle2 size={12} />
                                <span>Selesai</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: KATALOG INVENTORY & BIN LOCATION */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama barang, part number, atau kategori..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  showLowStockOnly
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {showLowStockOnly ? 'Menampilkan Stok Minim' : 'Filter Stok Minim'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <th className="p-3">Part Number</th>
                  <th className="p-3">Nama Sparepart</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Lokasi Bin</th>
                  <th className="p-3 text-right">Stok Fisik</th>
                  <th className="p-3 text-right">Batas Min.</th>
                  <th className="p-3 text-center">Status Alur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {filteredParts.map(part => {
                  const isLow = part.stock <= part.minStock;
                  return (
                    <tr key={part.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">{part.code}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{part.name}</div>
                        <div className="text-[10px] text-slate-400 font-sans">Harga Satuan: Rp {part.price.toLocaleString('id-ID')}</div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{part.category}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold text-[10px]">
                          RACK-{part.category.toUpperCase().slice(0, 3)}-01
                        </span>
                      </td>
                      <td className={`p-3 text-right font-extrabold ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        {part.stock} {part.unit}
                      </td>
                      <td className="p-3 text-right text-slate-500">{part.minStock} {part.unit}</td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px] rounded-full border border-rose-200 dark:border-rose-800">
                            <AlertTriangle size={12} />
                            <span>Perlu Reorder</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 size={12} />
                            <span>Stok Aman</span>
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
      )}

      {/* TAB 4: RIWAYAT PERGERAKAN (IN/OUT LOGS) */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white">
              Log Penerimaan &amp; Pengeluaran Barang (Audit Trail)
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: {movements.length} Transaksi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <th className="p-3">ID Log</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3">Tipe Mutasi</th>
                  <th className="p-3 text-right">Jumlah</th>
                  <th className="p-3">No. Ref / WO / PO</th>
                  <th className="p-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {movements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{m.id}</td>
                    <td className="p-3 text-slate-500">{m.date}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{m.partName}</td>
                    <td className="p-3">
                      {m.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] rounded-md">
                          <ArrowDownLeft size={12} />
                          <span>Penerimaan (IN)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px] rounded-md">
                          <ArrowUpRight size={12} />
                          <span>Pengeluaran (OUT)</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-extrabold">{m.qty} Unit</td>
                    <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">{m.refNo} {m.unit ? `(${m.unit})` : ''}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{m.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SAFETY STOCK & REORDER PO */}
      {activeTab === 'reorder' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white">
              Daftar Barang Mencapai Safety Stock (Rekomendasi Reorder PO)
            </h3>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              {lowStockParts.length} Item Kritis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockParts.map(part => (
              <div key={part.id} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{part.code}</span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{part.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono font-bold text-[10px] rounded-md">
                    Stok: {part.stock} / Min: {part.minStock}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                  <div>Kategori: <strong className="text-slate-800 dark:text-slate-200">{part.category}</strong></div>
                  <div>Lokasi Gudang: <strong className="text-slate-800 dark:text-slate-200">RACK-{part.category.toUpperCase().slice(0, 3)}-01</strong></div>
                  <div>Estimasi Rekomendasi Order: <strong className="text-blue-600 dark:text-blue-400">+{part.minStock * 3} {part.unit}</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">Kirim Ke Purchasing</span>
                  <button
                    type="button"
                    onClick={() => showToast(`Pengajuan PR otomatis untuk ${part.name} telah diteruskan ke Modul Purchasing!`, 'success')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    Buat Draft PR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH TIKET ALUR PART BARU */}
      {isNewFlowModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white">
                    Buat Tiket Alur Komponen Baru
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Daftarkan part baru ke dalam pipeline Auto Part Flow Control
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFlowModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewTicket} className="space-y-4 text-xs font-mono">
              {/* Part selection */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Pilih Sparepart:
                </label>
                <select
                  value={newTicket.partCode}
                  onChange={e => {
                    const selected = parts.find(p => p.code === e.target.value);
                    if (selected) {
                      setNewTicket({
                        ...newTicket,
                        partCode: selected.code,
                        partName: selected.name,
                        category: selected.category,
                        unit: selected.unit
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                >
                  {parts.map(p => (
                    <option key={p.id} value={p.code}>
                      [{p.code}] {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Jumlah (Qty):</label>
                  <input
                    type="number"
                    min="1"
                    value={newTicket.quantity}
                    onChange={e => setNewTicket({ ...newTicket, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Satuan:</label>
                  <input
                    type="text"
                    value={newTicket.unit}
                    onChange={e => setNewTicket({ ...newTicket, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Stage & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tahap Awal:</label>
                  <select
                    value={newTicket.stage}
                    onChange={e => setNewTicket({ ...newTicket, stage: e.target.value as PartFlowStage })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="inbound">1. Inbound &amp; Penerimaan</option>
                    <option value="qc">2. QC &amp; Karantina</option>
                    <option value="storage">3. Bin Gudang</option>
                    <option value="reserved">4. Reservasi WO Unit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Prioritas:</label>
                  <select
                    value={newTicket.priority}
                    onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="Urgent Breakdown">🚨 Urgent Breakdown</option>
                    <option value="High">⚠️ High Priority</option>
                    <option value="Normal">🟢 Normal</option>
                    <option value="Buffer Stock">📦 Buffer Stock</option>
                  </select>
                </div>
              </div>

              {/* Target Fleet Unit & Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Alokasi Unit Armada:</label>
                  <select
                    value={newTicket.assignedUnit}
                    onChange={e => setNewTicket({ ...newTicket, assignedUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Tanpa Alokasi --</option>
                    {units.map(u => (
                      <option key={u.id} value={u.code}>
                        {u.code} - {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">No. Ref PO / WO:</label>
                  <input
                    type="text"
                    value={newTicket.referenceNo}
                    onChange={e => setNewTicket({ ...newTicket, referenceNo: e.target.value })}
                    placeholder="PO-2026-117"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Vendor & Bin */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Supplier / Vendor:</label>
                  <input
                    type="text"
                    value={newTicket.supplierOrVendor}
                    onChange={e => setNewTicket({ ...newTicket, supplierOrVendor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Lokasi Bin Gudang:</label>
                  <input
                    type="text"
                    value={newTicket.binLocation}
                    onChange={e => setNewTicket({ ...newTicket, binLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Catatan Tambahan:</label>
                <textarea
                  rows={2}
                  value={newTicket.notes}
                  onChange={e => setNewTicket({ ...newTicket, notes: e.target.value })}
                  placeholder="Catatan inspeksi atau instruksi penanganan part..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewFlowModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
                >
                  Simpan Tiket Alur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
