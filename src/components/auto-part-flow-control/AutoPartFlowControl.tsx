import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  BoxIcon, 
  ShoppingCart, 
  AlertCircle, 
  TrendingUp, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers, 
  MapPin, 
  Tag, 
  Coins, 
  Check, 
  X, 
  FileText, 
  Users, 
  Eye, 
  ChevronRight, 
  CheckCircle2, 
  SlidersHorizontal,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  Part, 
  Category, 
  LocationZone, 
  MaterialRequest, 
  Transaction, 
  StockOpnameRecord, 
  StockOpnameItem 
} from './flowTypes';
import { 
  getFlowStorage, 
  setFlowStorage, 
  initializeFlowData, 
  INITIAL_PARTS, 
  INITIAL_CATEGORIES, 
  INITIAL_LOCATIONS, 
  INITIAL_REQUESTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_OPNAME 
} from './flowStorage';
import { SparePart, UioUnit, AppUser } from '../../types';

interface AutoPartFlowControlProps {
  fleetParts?: SparePart[];
  fleetUnits?: UioUnit[];
  currentUser?: AppUser;
  onSyncFleetPart?: (partId: string, delta: number) => void;
}

export default function AutoPartFlowControl({
  fleetParts = [],
  fleetUnits = [],
  currentUser,
  onSyncFleetPart
}: AutoPartFlowControlProps) {
  // Initialize storage once
  useEffect(() => {
    initializeFlowData(fleetParts);
  }, []);

  // Main active tab inside auto-part-flow-control
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'requests' | 'inventory' | 'master_data' | 'opname' | 'reports'>('dashboard');

  // Application Data States
  const [parts, setParts] = useState<Part[]>(() => getFlowStorage<Part[]>('parts', INITIAL_PARTS));
  const [categories, setCategories] = useState<Category[]>(() => getFlowStorage<Category[]>('categories', INITIAL_CATEGORIES));
  const [locations, setLocations] = useState<LocationZone[]>(() => getFlowStorage<LocationZone[]>('locations', INITIAL_LOCATIONS));
  const [requests, setRequests] = useState<MaterialRequest[]>(() => getFlowStorage<MaterialRequest[]>('requests', INITIAL_REQUESTS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getFlowStorage<Transaction[]>('transactions', INITIAL_TRANSACTIONS));
  const [opnameRecords, setOpnameRecords] = useState<StockOpnameRecord[]>(() => getFlowStorage<StockOpnameRecord[]>('opname', INITIAL_OPNAME));

  // Sync to localStorage
  const updateParts = (newParts: Part[]) => {
    setParts(newParts);
    setFlowStorage('parts', newParts);
  };
  const updateRequests = (newReqs: MaterialRequest[]) => {
    setRequests(newReqs);
    setFlowStorage('requests', newReqs);
  };
  const updateTransactions = (newTrxs: Transaction[]) => {
    setTransactions(newTrxs);
    setFlowStorage('transactions', newTrxs);
  };
  const updateLocations = (newLocs: LocationZone[]) => {
    setLocations(newLocs);
    setFlowStorage('locations', newLocs);
  };
  const updateCategories = (newCats: Category[]) => {
    setCategories(newCats);
    setFlowStorage('categories', newCats);
  };
  const updateOpname = (newOp: StockOpnameRecord[]) => {
    setOpnameRecords(newOp);
    setFlowStorage('opname', newOp);
  };

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ----------------------------------------------------
  // DASHBOARD CALCULATIONS
  // ----------------------------------------------------
  const totalPartsCount = parts.length;
  const totalSparePartsUnits = useMemo(() => parts.reduce((acc, p) => acc + p.stockQuantity, 0), [parts]);
  const lowStockCount = useMemo(() => parts.filter(p => p.stockQuantity <= p.minStock).length, [parts]);
  const pendingRequestsCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);
  const totalInventoryValue = useMemo(() => parts.reduce((acc, p) => acc + (p.stockQuantity * (p.price || 0)), 0), [parts]);

  // Zone storage utilization
  const zoneUtilization = useMemo(() => {
    const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
    return zones.map(zoneName => {
      const zoneLocs = locations.filter(l => l.zone === zoneName);
      const cap = zoneLocs.reduce((acc, l) => acc + l.capacity, 0) || 100;
      const occ = zoneLocs.reduce((acc, l) => acc + l.occupied, 0) || 0;
      const util = Math.min(100, Math.round((occ / cap) * 100));
      return {
        name: zoneName,
        utilization: util,
        capacity: cap,
        occupied: occ,
        warning: util > 85
      };
    });
  }, [locations]);

  // ----------------------------------------------------
  // MATERIAL REQUESTS TAB STATES & ACTIONS
  // ----------------------------------------------------
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'rejected'>('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  // New Request Form
  const [newRequestForm, setNewRequestForm] = useState({
    requester: currentUser?.name || 'Mekanik Senior',
    department: 'Workshop Bay',
    targetUnit: fleetUnits[0]?.code || 'EXCA-01',
    priority: 'high' as 'high' | 'medium' | 'low',
    notes: '',
    selectedPartId: parts[0]?.id || '',
    quantity: 1
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const part = parts.find(p => p.id === newRequestForm.selectedPartId) || parts[0];
    if (!part) return;

    const newReq: MaterialRequest = {
      id: `MR-${Math.floor(100 + Math.random() * 900)}`,
      reference: `REQ-${new Date().toISOString().slice(0, 7)}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      requester: newRequestForm.requester,
      department: newRequestForm.department,
      targetUnit: newRequestForm.targetUnit,
      status: 'pending',
      priority: newRequestForm.priority,
      items: [
        {
          id: `mri-${Date.now()}`,
          partId: part.id,
          partNumber: part.partNumber,
          name: part.name,
          quantity: Number(newRequestForm.quantity) || 1,
          available: part.stockQuantity,
          location: part.location,
          uom: part.uom
        }
      ],
      notes: newRequestForm.notes
    };

    updateRequests([newReq, ...requests]);
    setIsNewRequestModalOpen(false);
    showToast(`Material Request ${newReq.reference} berhasil diajukan!`, 'success');
  };

  const handleApproveRequest = (reqId: string) => {
    const updated = requests.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: 'approved' as const,
          approvedBy: currentUser?.name || 'Agus Priyanto (Foreman)',
          approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return r;
    });
    updateRequests(updated);
    if (selectedRequest?.id === reqId) {
      setSelectedRequest(updated.find(r => r.id === reqId) || null);
    }
    showToast(`Material Request disetujui (Approved)!`, 'success');
  };

  const handleRejectRequest = (reqId: string) => {
    const updated = requests.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: 'rejected' as const
        };
      }
      return r;
    });
    updateRequests(updated);
    if (selectedRequest?.id === reqId) {
      setSelectedRequest(updated.find(r => r.id === reqId) || null);
    }
    showToast(`Material Request ditolak (Rejected).`, 'info');
  };

  const handleIssueParts = (req: MaterialRequest) => {
    // Check stock availability
    let canFulfill = true;
    req.items.forEach(item => {
      const part = parts.find(p => p.id === item.partId);
      if (!part || part.stockQuantity < item.quantity) {
        canFulfill = false;
      }
    });

    if (!canFulfill) {
      showToast('Stok tidak mencukupi untuk mengeluarkan material ini!', 'error');
      return;
    }

    // Deduct parts
    const updatedParts = parts.map(p => {
      const match = req.items.find(i => i.partId === p.id);
      if (match) {
        return {
          ...p,
          stockQuantity: p.stockQuantity - match.quantity,
          partOut: (p.partOut || 0) + match.quantity
        };
      }
      return p;
    });
    updateParts(updatedParts);

    // Create Outbound Transaction
    const newTrx: Transaction = {
      id: `TRX-${Math.floor(100 + Math.random() * 900)}`,
      reference: req.reference,
      transaction_type: 'outbound',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      created_by: currentUser?.name || 'Petugas Gudang Partman',
      notes: `Pengeluaran material request untuk unit ${req.targetUnit || 'Workshop'}`,
      status: 'completed',
      targetUnit: req.targetUnit,
      items: req.items.map(i => ({
        id: `ti-${Date.now()}-${i.partId}`,
        part_id: i.partId,
        part_number: i.partNumber,
        part_name: i.name,
        quantity: i.quantity,
        location: i.location,
        uom: i.uom
      }))
    };
    updateTransactions([newTrx, ...transactions]);

    // Mark request as completed
    const updatedRequests = requests.map(r => r.id === req.id ? { ...r, status: 'completed' as const } : r);
    updateRequests(updatedRequests);
    setSelectedRequest(null);

    showToast(`Barang berhasil dikeluarkan ke unit ${req.targetUnit || 'Workshop'}! Stok otomatis diperbarui.`, 'success');
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = r.reference.toLowerCase().includes(requestSearch.toLowerCase()) ||
                            r.requester.toLowerCase().includes(requestSearch.toLowerCase()) ||
                            (r.targetUnit && r.targetUnit.toLowerCase().includes(requestSearch.toLowerCase()));
      const matchesStatus = requestFilter === 'all' || r.status === requestFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, requestSearch, requestFilter]);

  // ----------------------------------------------------
  // INVENTORY TAB (STOCK & TRANSACTIONS)
  // ----------------------------------------------------
  const [inventorySubView, setInventorySubView] = useState<'stock' | 'transactions'>('stock');
  const [stockSearchTerm, setStockSearchTerm] = useState('');
  const [stockFilterLevel, setStockFilterLevel] = useState<'all' | 'instock' | 'low' | 'out'>('all');
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);

  // New Transaction Form
  const [newTrxForm, setNewTrxForm] = useState({
    type: 'inbound' as 'inbound' | 'outbound',
    reference: 'PO-2026-118',
    partId: parts[0]?.id || '',
    quantity: 1,
    notes: 'Penerimaan barang dari supplier',
    targetUnit: fleetUnits[0]?.code || '',
    supplier: 'PT Trakindo Utama'
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const part = parts.find(p => p.id === newTrxForm.partId) || parts[0];
    if (!part) return;

    const qty = Number(newTrxForm.quantity) || 1;
    if (newTrxForm.type === 'outbound' && part.stockQuantity < qty) {
      showToast('Gagal: Stok tidak mencukupi untuk transaksi pengeluaran!', 'error');
      return;
    }

    // Update stock
    const delta = newTrxForm.type === 'inbound' ? qty : -qty;
    const updatedParts = parts.map(p => {
      if (p.id === part.id) {
        return {
          ...p,
          stockQuantity: Math.max(0, p.stockQuantity + delta),
          partIn: newTrxForm.type === 'inbound' ? (p.partIn || 0) + qty : p.partIn,
          partOut: newTrxForm.type === 'outbound' ? (p.partOut || 0) + qty : p.partOut
        };
      }
      return p;
    });
    updateParts(updatedParts);

    // Save transaction
    const newTrx: Transaction = {
      id: `TRX-${Math.floor(100 + Math.random() * 900)}`,
      reference: newTrxForm.reference,
      transaction_type: newTrxForm.type,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      created_by: currentUser?.name || 'Petugas Gudang',
      notes: newTrxForm.notes,
      status: 'completed',
      targetUnit: newTrxForm.type === 'outbound' ? newTrxForm.targetUnit : undefined,
      vendorOrSupplier: newTrxForm.type === 'inbound' ? newTrxForm.supplier : undefined,
      items: [
        {
          id: `ti-${Date.now()}`,
          part_id: part.id,
          part_number: part.partNumber,
          part_name: part.name,
          quantity: qty,
          location: part.location,
          uom: part.uom
        }
      ]
    };
    updateTransactions([newTrx, ...transactions]);
    setIsNewTransactionModalOpen(false);
    showToast(`Transaksi ${newTrxForm.type.toUpperCase()} (${newTrxForm.reference}) berhasil diproses!`, 'success');
  };

  const filteredInventoryParts = useMemo(() => {
    return parts.filter(p => {
      const matchesSearch = p.partNumber.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
                            p.name.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
                            p.location.toLowerCase().includes(stockSearchTerm.toLowerCase());
      let matchesLevel = true;
      if (stockFilterLevel === 'instock') matchesLevel = p.stockQuantity > p.minStock;
      else if (stockFilterLevel === 'low') matchesLevel = p.stockQuantity <= p.minStock && p.stockQuantity > 0;
      else if (stockFilterLevel === 'out') matchesLevel = p.stockQuantity <= 0;
      return matchesSearch && matchesLevel;
    });
  }, [parts, stockSearchTerm, stockFilterLevel]);

  // ----------------------------------------------------
  // MASTER DATA TAB
  // ----------------------------------------------------
  const [masterDataTab, setMasterDataTab] = useState<'parts' | 'categories' | 'locations' | 'prices'>('parts');
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [newPartInput, setNewPartInput] = useState<Partial<Part>>({
    partNumber: '',
    name: '',
    category: 'Filters',
    location: 'A01',
    minStock: 5,
    maxStock: 25,
    stockQuantity: 10,
    uom: 'PCS',
    price: 250000,
    description: ''
  });

  const handleAddPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartInput.partNumber || !newPartInput.name) return;

    const newPartItem: Part = {
      id: `part-${Date.now()}`,
      partNumber: newPartInput.partNumber.toUpperCase(),
      name: newPartInput.name,
      category: newPartInput.category || 'General',
      location: newPartInput.location || 'A01',
      minStock: Number(newPartInput.minStock) || 2,
      maxStock: Number(newPartInput.maxStock) || 20,
      stockQuantity: Number(newPartInput.stockQuantity) || 0,
      uom: newPartInput.uom || 'PCS',
      price: Number(newPartInput.price) || 0,
      partIn: Number(newPartInput.stockQuantity) || 0,
      partOut: 0,
      description: newPartInput.description || '',
      created_at: new Date().toISOString().slice(0, 10)
    };

    updateParts([...parts, newPartItem]);
    setIsAddPartModalOpen(false);
    showToast(`Master part ${newPartItem.partNumber} berhasil ditambahkan!`, 'success');
  };

  // ----------------------------------------------------
  // STOCK OPNAME TAB
  // ----------------------------------------------------
  const [activeOpnameRecord, setActiveOpnameRecord] = useState<StockOpnameRecord | null>(opnameRecords[0] || null);
  const [countModalItem, setCountModalItem] = useState<StockOpnameItem | null>(null);
  const [physicalCountInput, setPhysicalCountInput] = useState<number>(0);

  const handleSaveItemCount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countModalItem || !activeOpnameRecord) return;

    const isMatch = physicalCountInput === countModalItem.systemQty;
    const updatedItems = activeOpnameRecord.items.map(item => {
      if (item.id === countModalItem.id) {
        return {
          ...item,
          countedQty: physicalCountInput,
          status: (isMatch ? 'matched' : 'discrepancy') as any
        };
      }
      return item;
    });

    const discrepanciesCount = updatedItems.filter(i => i.status === 'discrepancy').length;
    const countedItemsCount = updatedItems.filter(i => i.countedQty !== null).length;
    const progress = Math.round((countedItemsCount / updatedItems.length) * 100);

    const updatedRecord: StockOpnameRecord = {
      ...activeOpnameRecord,
      items: updatedItems,
      discrepancies: discrepanciesCount,
      progress: progress,
      status: progress === 100 ? 'completed' : 'in-progress'
    };

    const updatedRecords = opnameRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    updateOpname(updatedRecords);
    setActiveOpnameRecord(updatedRecord);
    setCountModalItem(null);
    showToast(`Pencatatan fisik untuk ${countModalItem.name} disimpan! Status: ${isMatch ? 'Cocok (Match)' : 'Selisih (Discrepancy)'}`, isMatch ? 'success' : 'info');
  };

  return (
    <div className="space-y-5 animate-fadeIn" id="auto-part-flow-control-native">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border font-mono text-xs animate-in slide-in-from-bottom-4 duration-200 ${
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

      {/* App Header & Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-md font-black text-sm tracking-wider flex items-center justify-center">
            HINO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                AUTO PART FLOW CONTROL
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Native v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Sistem Aliran Suku Cadang Terintegrasi: Permintaan Material, Manajemen Gudang, Master Data &amp; Stock Opname.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewRequestModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Buat Material Request</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold">
        <button
          type="button"
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <BarChart3 size={14} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('requests')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'requests'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <ShoppingCart size={14} />
          <span>Material Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('inventory')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Package size={14} />
          <span>Inventory &amp; Transaksi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('master_data')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'master_data'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Layers size={14} />
          <span>Master Data</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('opname')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'opname'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <FileText size={14} />
          <span>Stock Opname</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. DASHBOARD VIEW                                             */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-5">
          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500 uppercase font-bold">Total Jenis Part</span>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Package size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {totalPartsCount} <span className="text-xs font-normal text-slate-500">SKU</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">Terdaftar di master suku cadang</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-600 uppercase font-bold">Stok Kritis / Minim</span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-xl">
                  <AlertCircle size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600">
                {lowStockCount} <span className="text-xs font-normal text-slate-500">Item</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-sans font-semibold">Memerlukan PO Pengadaan</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-600 uppercase font-bold">Pending Requests</span>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-xl">
                  <ShoppingCart size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600">
                {pendingRequestsCount} <span className="text-xs font-normal text-slate-500">Permintaan</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">Menunggu persetujuan foreman</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-600 uppercase font-bold">Total Fisik Suku Cadang</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                  <BoxIcon size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
                {totalSparePartsUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">Unit</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                Nilai: Rp {(totalInventoryValue / 1000000).toFixed(1)} Juta
              </p>
            </div>
          </div>

          {/* Storage Utilization & Live Monitor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Storage Utilization */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" />
                  <span>Kapasitas Penyimpanan Gudang</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">Tingkat okupansi per zona gudang</p>
              </div>

              <div className="space-y-3.5">
                {zoneUtilization.map(zone => (
                  <div key={zone.name} className="space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{zone.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{zone.occupied} / {zone.capacity}</span>
                        <span className={`font-extrabold ${zone.warning ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {zone.utilization}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          zone.warning ? 'bg-rose-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${zone.utilization}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Realtime Monitor Box */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Realtime Monitor</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Status koneksi alur part</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  Connected
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Pembaruan Suku Cadang:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{parts.length} Master Part</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Kategori Part:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{categories.length} Kategori</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Lokasi Bin Terdaftar:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{locations.length} Lokasi</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Antrian Request:</span>
                  <span className="font-bold text-blue-600">{requests.length} Permintaan</span>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={16} className="text-slate-500" />
                <span>Aktivitas Alur Terkini</span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                {transactions.slice(0, 4).map(trx => (
                  <div key={trx.id} className="flex items-start gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className={`p-1.5 rounded-lg mt-0.5 ${
                      trx.transaction_type === 'inbound' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {trx.transaction_type === 'inbound' ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {trx.reference} ({trx.transaction_type.toUpperCase()})
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{trx.notes}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{trx.created_at} &bull; {trx.created_by}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MATERIAL REQUESTS VIEW                                     */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor request, pemohon, atau unit..."
                value={requestSearch}
                onChange={e => setRequestSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1 font-mono text-xs font-bold overflow-x-auto">
              {(['all', 'pending', 'approved', 'completed', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setRequestFilter(f)}
                  className={`px-3 py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
                    requestFilter === f
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {f === 'all' ? 'Semua' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <th className="p-3">No. Referensi</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Pemohon &amp; Dept</th>
                  <th className="p-3">Unit Armada</th>
                  <th className="p-3 text-center">Jumlah Item</th>
                  <th className="p-3">Prioritas</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Tidak ada material request yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-extrabold text-blue-600 dark:text-blue-400">{req.reference}</td>
                      <td className="p-3 text-slate-500">{req.date}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{req.requester}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{req.department}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{req.targetUnit || '-'}</td>
                      <td className="p-3 text-center font-extrabold">{req.items.length} Item</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.priority === 'high' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          req.priority === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {req.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          req.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          req.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {req.status === 'completed' ? 'Selesai' :
                           req.status === 'approved' ? 'Disetujui' :
                           req.status === 'rejected' ? 'Ditolak' : 'Menunggu (Pending)'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. INVENTORY & TRANSAKSI MUTASI                               */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          {/* Sub Tab switcher for Inventory */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInventorySubView('stock')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                  inventorySubView === 'stock'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Stok Fisik Saat Ini (Current Stock)
              </button>
              <button
                type="button"
                onClick={() => setInventorySubView('transactions')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                  inventorySubView === 'transactions'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Log Transaksi (In/Out)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsNewTransactionModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Input Mutasi Transaksi</span>
            </button>
          </div>

          {/* Current Stock View */}
          {inventorySubView === 'stock' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari part number, nama, atau lokasi bin..."
                    value={stockSearchTerm}
                    onChange={e => setStockSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1 font-mono text-xs">
                  {(['all', 'instock', 'low', 'out'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setStockFilterLevel(lvl)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-bold transition-colors cursor-pointer ${
                        stockFilterLevel === lvl
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lvl === 'all' ? 'Semua' : lvl === 'instock' ? 'Stok Aman' : lvl === 'low' ? 'Stok Minim' : 'Habis'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                      <th className="p-3">No</th>
                      <th className="p-3">Part Number</th>
                      <th className="p-3">Nama Suku Cadang</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Lokasi Bin</th>
                      <th className="p-3 text-center">Stok Fisik</th>
                      <th className="p-3 text-center">Batas Min</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredInventoryParts.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-extrabold text-slate-900 dark:text-white">{item.partNumber}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{item.category}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                            {item.location}
                          </span>
                        </td>
                        <td className="p-3 text-center font-extrabold text-blue-600 dark:text-blue-400">
                          {item.stockQuantity} {item.uom}
                        </td>
                        <td className="p-3 text-center text-slate-500">{item.minStock} {item.uom}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            item.stockQuantity <= 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            item.stockQuantity <= item.minStock ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {item.stockQuantity <= 0 ? 'Habis (Out of Stock)' :
                             item.stockQuantity <= item.minStock ? 'Stok Minim' : 'Stok Aman'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transactions View */}
          {inventorySubView === 'transactions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <th className="p-3">ID Transaksi</th>
                    <th className="p-3">No. Referensi</th>
                    <th className="p-3">Tipe</th>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Suku Cadang &amp; Qty</th>
                    <th className="p-3">Tujuan / Supplier</th>
                    <th className="p-3">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map(trx => (
                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-500">{trx.id}</td>
                      <td className="p-3 font-extrabold text-blue-600 dark:text-blue-400">{trx.reference}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                          trx.transaction_type === 'inbound' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {trx.transaction_type === 'inbound' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          <span>{trx.transaction_type.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{trx.created_at}</td>
                      <td className="p-3">
                        {trx.items.map((it, i) => (
                          <div key={i} className="font-bold text-slate-800 dark:text-slate-200">
                            {it.part_number} &times; {it.quantity} {it.uom}
                          </div>
                        ))}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {trx.targetUnit ? `Unit: ${trx.targetUnit}` : (trx.vendorOrSupplier || '-')}
                      </td>
                      <td className="p-3 text-slate-500">{trx.created_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MASTER DATA TAB                                            */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'master_data' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              {(['parts', 'categories', 'locations', 'prices'] as const).map(tabKey => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setMasterDataTab(tabKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-colors cursor-pointer ${
                    masterDataTab === tabKey
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tabKey === 'parts' ? 'Master Parts' :
                   tabKey === 'categories' ? 'Kategori' :
                   tabKey === 'locations' ? 'Lokasi & Bin' : 'Daftar Harga'}
                </button>
              ))}
            </div>

            {masterDataTab === 'parts' && (
              <button
                type="button"
                onClick={() => setIsAddPartModalOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Tambah Part Baru</span>
              </button>
            )}
          </div>

          {/* Master Parts View */}
          {masterDataTab === 'parts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <th className="p-3">Part Number</th>
                    <th className="p-3">Nama Suku Cadang</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Lokasi Bin</th>
                    <th className="p-3 text-right">Harga Satuan (IDR)</th>
                    <th className="p-3 text-center">Batas Min/Max</th>
                    <th className="p-3 text-center">Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-black text-slate-900 dark:text-white">{p.partNumber}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{p.category}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {p.location}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        Rp {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center text-slate-500">
                        {p.minStock} / {p.maxStock} {p.uom}
                      </td>
                      <td className="p-3 text-center font-black text-blue-600 dark:text-blue-400">
                        {p.stockQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Categories View */}
          {masterDataTab === 'categories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => {
                const count = parts.filter(p => p.category === cat.name).length;
                return (
                  <div key={cat.id} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold font-mono text-sm text-slate-900 dark:text-white">{cat.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {count} SKU
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-sans leading-relaxed">{cat.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Locations View */}
          {masterDataTab === 'locations' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map(loc => {
                const util = Math.round((loc.occupied / loc.capacity) * 100);
                return (
                  <div key={loc.id} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <div className="font-black text-sm text-slate-900 dark:text-white">{loc.code} ({loc.zone})</div>
                      <span className="text-xs font-bold text-blue-600">{util}%</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      <div>Rack: {loc.rack} &bull; Level: {loc.level}</div>
                      <div>Kapasitas: {loc.occupied} / {loc.capacity} Unit</div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${util}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Prices View */}
          {masterDataTab === 'prices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <th className="p-3">Part Number</th>
                    <th className="p-3">Nama Part</th>
                    <th className="p-3">Satuan</th>
                    <th className="p-3 text-right">Harga Beli / Satuan</th>
                    <th className="p-3 text-right">Nilai Total Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parts.map(p => (
                    <tr key={p.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{p.partNumber}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{p.name}</td>
                      <td className="p-3 text-slate-500">{p.uom}</td>
                      <td className="p-3 text-right font-bold text-blue-600">Rp {p.price.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                        Rp {(p.price * p.stockQuantity).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. STOCK OPNAME VIEW                                          */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'opname' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          {/* Active Audit Session Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">Sesi Stock Opname Aktif</span>
              <h3 className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                {activeOpnameRecord?.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Auditor: <strong>{activeOpnameRecord?.assignedTo}</strong> &bull; Periode: {activeOpnameRecord?.startDate} s/d {activeOpnameRecord?.endDate}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Progress Hitung</div>
                <div className="text-lg font-black text-blue-600">{activeOpnameRecord?.progress}%</div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-rose-600">Selisih Fisik</div>
                <div className="text-lg font-black text-rose-600">{activeOpnameRecord?.discrepancies} Item</div>
              </div>
            </div>
          </div>

          {/* Audit Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <th className="p-3">SKU / Part No</th>
                  <th className="p-3">Nama Suku Cadang</th>
                  <th className="p-3">Lokasi Bin</th>
                  <th className="p-3 text-center">Stok Sistem</th>
                  <th className="p-3 text-center">Hitungan Fisik</th>
                  <th className="p-3 text-center">Status Audit</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeOpnameRecord?.items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">{item.sku}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                    <td className="p-3 text-slate-500">{item.location}</td>
                    <td className="p-3 text-center font-bold">{item.systemQty}</td>
                    <td className="p-3 text-center font-black text-blue-600">
                      {item.countedQty !== null ? item.countedQty : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'matched' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        item.status === 'discrepancy' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {item.status === 'matched' ? 'Cocok (Match)' :
                         item.status === 'discrepancy' ? 'Selisih (Discrepancy)' : 'Belum Dihitung'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setCountModalItem(item);
                          setPhysicalCountInput(item.countedQty !== null ? item.countedQty : item.systemQty);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Input Fisik
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DETAIL MATERIAL REQUEST & WORKFLOW                      */}
      {/* ------------------------------------------------------------- */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block">Detail Material Request</span>
                <h3 className="text-base font-black font-mono text-slate-900 dark:text-white">
                  {selectedRequest.reference}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <div>Pemohon: <strong>{selectedRequest.requester}</strong></div>
                <div>Departemen: <strong>{selectedRequest.department}</strong></div>
                <div>Target Unit: <strong>{selectedRequest.targetUnit || '-'}</strong></div>
                <div>Status: <strong className="uppercase">{selectedRequest.status}</strong></div>
              </div>

              {selectedRequest.notes && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-600 dark:text-slate-400">
                  Catatan: {selectedRequest.notes}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-1 pt-2">
                <div className="font-bold text-slate-700 dark:text-slate-300">Daftar Suku Cadang Diminta:</div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {selectedRequest.items.map(it => (
                    <div key={it.id} className="p-3 flex items-center justify-between bg-white dark:bg-slate-900">
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">{it.partNumber}</div>
                        <div className="text-[11px] text-slate-500">{it.name}</div>
                        <div className="text-[10px] text-slate-400">Bin: {it.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-blue-600 text-sm">{it.quantity} {it.uom}</div>
                        <div className="text-[10px] text-slate-400">Tersedia: {it.available} {it.uom}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 text-xs font-mono font-bold">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleRejectRequest(selectedRequest.id)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-xl cursor-pointer"
                  >
                    Tolak (Reject)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer"
                  >
                    Setujui (Approve)
                  </button>
                </>
              )}

              {selectedRequest.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => handleIssueParts(selectedRequest)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>Keluarkan Barang (Issue Parts)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: BUAT MATERIAL REQUEST BARU                             */}
      {/* ------------------------------------------------------------- */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white">
                Buat Material Request Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsNewRequestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Pemohon:</label>
                  <input
                    type="text"
                    value={newRequestForm.requester}
                    onChange={e => setNewRequestForm({ ...newRequestForm, requester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Departemen / Bay:</label>
                  <input
                    type="text"
                    value={newRequestForm.department}
                    onChange={e => setNewRequestForm({ ...newRequestForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alokasi Unit Armada:</label>
                  <select
                    value={newRequestForm.targetUnit}
                    onChange={e => setNewRequestForm({ ...newRequestForm, targetUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {fleetUnits.map(u => (
                      <option key={u.id} value={u.code}>
                        {u.code} - {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prioritas:</label>
                  <select
                    value={newRequestForm.priority}
                    onChange={e => setNewRequestForm({ ...newRequestForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="high">Tinggi (High / Breakdown)</option>
                    <option value="medium">Sedang (Medium / PM)</option>
                    <option value="low">Rendah (Low / Stock)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Suku Cadang:</label>
                <select
                  value={newRequestForm.selectedPartId}
                  onChange={e => setNewRequestForm({ ...newRequestForm, selectedPartId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {parts.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.partNumber}] {p.name} (Stok: {p.stockQuantity} {p.uom} &bull; Bin: {p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah (Qty):</label>
                <input
                  type="number"
                  min="1"
                  value={newRequestForm.quantity}
                  onChange={e => setNewRequestForm({ ...newRequestForm, quantity: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Keperluan:</label>
                <textarea
                  rows={2}
                  value={newRequestForm.notes}
                  onChange={e => setNewRequestForm({ ...newRequestForm, notes: e.target.value })}
                  placeholder="Kebutuhan penggantian komponen berkala / emergency breakdown..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                >
                  Kirim Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: INPUT TRANSAKSI MUTASI                                 */}
      {/* ------------------------------------------------------------- */}
      {isNewTransactionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white">
                Input Transaksi Mutasi Gudang
              </h3>
              <button
                type="button"
                onClick={() => setIsNewTransactionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipe Mutasi:</label>
                  <select
                    value={newTrxForm.type}
                    onChange={e => setNewTrxForm({ ...newTrxForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="inbound">Penerimaan (Inbound / Masuk)</option>
                    <option value="outbound">Pengeluaran (Outbound / Keluar)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. Referensi PO / WO:</label>
                  <input
                    type="text"
                    value={newTrxForm.reference}
                    onChange={e => setNewTrxForm({ ...newTrxForm, reference: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Suku Cadang:</label>
                <select
                  value={newTrxForm.partId}
                  onChange={e => setNewTrxForm({ ...newTrxForm, partId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {parts.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.partNumber}] {p.name} (Stok: {p.stockQuantity} {p.uom} &bull; Bin: {p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah (Qty):</label>
                  <input
                    type="number"
                    min="1"
                    value={newTrxForm.quantity}
                    onChange={e => setNewTrxForm({ ...newTrxForm, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  {newTrxForm.type === 'inbound' ? (
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier / Vendor:</label>
                      <input
                        type="text"
                        value={newTrxForm.supplier}
                        onChange={e => setNewTrxForm({ ...newTrxForm, supplier: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alokasi Unit Armada:</label>
                      <select
                        value={newTrxForm.targetUnit}
                        onChange={e => setNewTrxForm({ ...newTrxForm, targetUnit: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        {fleetUnits.map(u => (
                          <option key={u.id} value={u.code}>{u.code} - {u.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan Transaksi:</label>
                <input
                  type="text"
                  value={newTrxForm.notes}
                  onChange={e => setNewTrxForm({ ...newTrxForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewTransactionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: INPUT FISIK STOCK OPNAME                               */}
      {/* ------------------------------------------------------------- */}
      {countModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white">
                Hitung Fisik Stock Opname
              </h3>
              <button
                type="button"
                onClick={() => setCountModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItemCount} className="space-y-3 font-mono text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-white">{countModalItem.sku}</div>
                <div className="text-slate-600 dark:text-slate-300">{countModalItem.name}</div>
                <div className="text-slate-400 text-[10px]">Lokasi: {countModalItem.location}</div>
                <div className="text-blue-600 font-bold pt-1">Stok di Sistem: {countModalItem.systemQty} Unit</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hasil Hitungan Fisik Aktual:</label>
                <input
                  type="number"
                  min="0"
                  value={physicalCountInput}
                  onChange={e => setPhysicalCountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold"
                  required
                />
              </div>

              {physicalCountInput !== countModalItem.systemQty && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-700 dark:text-rose-300 text-[11px] font-bold">
                  Selisih Terdeteksi: {physicalCountInput - countModalItem.systemQty > 0 ? `+${physicalCountInput - countModalItem.systemQty}` : physicalCountInput - countModalItem.systemQty} Unit
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 font-bold">
                <button
                  type="button"
                  onClick={() => setCountModalItem(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                >
                  Simpan Hitungan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: TAMBAH MASTER PART BARU                                */}
      {/* ------------------------------------------------------------- */}
      {isAddPartModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 dark:text-white">
                Tambah Master Suku Cadang Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPartModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPartSubmit} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Part Number:</label>
                  <input
                    type="text"
                    value={newPartInput.partNumber}
                    onChange={e => setNewPartInput({ ...newPartInput, partNumber: e.target.value })}
                    placeholder="ENG002 / TYR-001"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori:</label>
                  <select
                    value={newPartInput.category}
                    onChange={e => setNewPartInput({ ...newPartInput, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Suku Cadang:</label>
                <input
                  type="text"
                  value={newPartInput.name}
                  onChange={e => setNewPartInput({ ...newPartInput, name: e.target.value })}
                  placeholder="e.g. Starter Motor 24V Heavy Duty"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Bin:</label>
                  <input
                    type="text"
                    value={newPartInput.location}
                    onChange={e => setNewPartInput({ ...newPartInput, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stok Awal:</label>
                  <input
                    type="number"
                    min="0"
                    value={newPartInput.stockQuantity}
                    onChange={e => setNewPartInput({ ...newPartInput, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Satuan:</label>
                  <input
                    type="text"
                    value={newPartInput.uom}
                    onChange={e => setNewPartInput({ ...newPartInput, uom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Batas Minimum:</label>
                  <input
                    type="number"
                    min="0"
                    value={newPartInput.minStock}
                    onChange={e => setNewPartInput({ ...newPartInput, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Satuan (IDR):</label>
                  <input
                    type="number"
                    min="0"
                    value={newPartInput.price}
                    onChange={e => setNewPartInput({ ...newPartInput, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 font-bold">
                <button
                  type="button"
                  onClick={() => setIsAddPartModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                >
                  Simpan Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
