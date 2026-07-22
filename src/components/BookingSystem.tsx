/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Wrench, 
  FileText, 
  Plus, 
  Play, 
  CheckCircle2, 
  XCircle, 
  PackageOpen, 
  ArrowRight, 
  AlertCircle,
  X,
  PlusCircle,
  MinusCircle,
  Search,
  Layers,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  DollarSign,
  Printer
} from 'lucide-react';
import { WorkshopBooking, UioUnit, SparePart, Mechanic, UserRole, PauseReason } from '../types';

interface BookingSystemProps {
  bookings: WorkshopBooking[];
  units: UioUnit[];
  parts: SparePart[];
  mechanics: Mechanic[];
  currentUserRole?: UserRole;
  onCreateBooking: (bookingData: any) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, payload: any) => Promise<void>;
}

export default function BookingSystem({ 
  bookings, 
  units, 
  parts, 
  mechanics = [],
  onCreateBooking, 
  onUpdateBookingStatus 
}: BookingSystemProps) {
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [workshopName, setWorkshopName] = useState('Workshop Utama Maro');
  const [serviceType, setServiceType] = useState<'Periodic Service' | 'Oil Change' | 'Repair' | 'General Inspection'>('Periodic Service');
  const [notes, setNotes] = useState('');
  
  // Multi-Mechanic selection
  const [selectedMechanicIds, setSelectedMechanicIds] = useState<string[]>([]);
  
  // Flat rate system
  const [flatRateHours, setFlatRateHours] = useState<number>(2.5);
  const [flatRateCost, setFlatRateCost] = useState<number>(150000);

  // Extended fields
  const [kmAtBooking, setKmAtBooking] = useState<number>(0);
  const [hmAtBooking, setHmAtBooking] = useState<number>(0);
  const [damageType, setDamageType] = useState('Routine Periodic Maintenance');
  const [complaint, setComplaint] = useState('');

  // Portal selection: planner (Admin) vs workshop (Mekanik / Workshop Team)
  const [currentPortal, setCurrentPortal] = useState<'planner' | 'workshop'>('planner');

  // Detailed popup / WO Print modal
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<WorkshopBooking | null>(null);

  // Workshop log update popup state
  const [workshopLogBooking, setWorkshopLogBooking] = useState<WorkshopBooking | null>(null);
  const [workshopProgressStatus, setWorkshopProgressStatus] = useState<'Admin Processing' | 'Waiting for Parts' | 'On Repair' | 'Quality Control' | 'Ready for Pickup' | 'Completed'>('On Repair');
  const [workshopLogNotes, setWorkshopLogNotes] = useState('');
  const [workshopLogUpdatedBy, setWorkshopLogUpdatedBy] = useState('');
  
  // Spare parts selection for new WO (with search query)
  const [selectedParts, setSelectedParts] = useState<Array<{ partId: string; quantity: number }>>([]);
  const [partSearchQuery, setPartSearchQuery] = useState('');
  
  // Completion Modal State
  const [completionBooking, setCompletionBooking] = useState<WorkshopBooking | null>(null);
  const [completionHm, setCompletionHm] = useState<number>(0);
  const [completionNotes, setCompletionNotes] = useState('');

  // Manage Booking Parts Modal state
  const [managePartsBooking, setManagePartsBooking] = useState<WorkshopBooking | null>(null);
  const [manageSelectedParts, setManageSelectedParts] = useState<Array<{ partId: string; quantity: number }>>([]);
  const [managePartSearchQuery, setManagePartSearchQuery] = useState('');

  // Foreman Allocation State
  const [assignForemanBooking, setAssignForemanBooking] = useState<WorkshopBooking | null>(null);
  const [assignPrimaryMechanicId, setAssignPrimaryMechanicId] = useState<string>('');
  const [assignSecondaryMechanicIds, setAssignSecondaryMechanicIds] = useState<string[]>([]);

  // Foreman Pause Job State
  const [pauseBooking, setPauseBooking] = useState<WorkshopBooking | null>(null);
  const [pauseReason, setPauseReason] = useState<PauseReason>('Waiting for Parts');
  const [pauseNotes, setPauseNotes] = useState('');

  // Gudang Sparepart Input State
  const [gudangBooking, setGudangBooking] = useState<WorkshopBooking | null>(null);
  const [gudangSelectedParts, setGudangSelectedParts] = useState<Array<{ partId: string; quantity: number }>>([]);
  const [gudangPartSearchQuery, setGudangPartSearchQuery] = useState('');

  const handleOpenAssignForeman = (booking: WorkshopBooking) => {
    setAssignForemanBooking(booking);
    // Find current assigned mechanic IDs if available
    const assignedNames = booking.mechanicsAssigned || [booking.mechanicName];
    const foundPrimary = mechanics.find(m => assignedNames.includes(m.name));
    setAssignPrimaryMechanicId(foundPrimary ? foundPrimary.id : (mechanics[0]?.id || ''));
    
    const foundSecondaries = mechanics.filter(m => assignedNames.includes(m.name) && m.id !== foundPrimary?.id).map(m => m.id);
    setAssignSecondaryMechanicIds(foundSecondaries);
  };

  const handleToggleSecondaryMechanic = (mechanicId: string) => {
    if (assignSecondaryMechanicIds.includes(mechanicId)) {
      setAssignSecondaryMechanicIds(assignSecondaryMechanicIds.filter(id => id !== mechanicId));
    } else {
      setAssignSecondaryMechanicIds([...assignSecondaryMechanicIds, mechanicId]);
    }
  };

  const handleSaveForemanAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForemanBooking) return;
    const primary = mechanics.find(m => m.id === assignPrimaryMechanicId);
    const secondaries = mechanics.filter(m => assignSecondaryMechanicIds.includes(m.id));
    
    const assignedNames = [primary?.name, ...secondaries.map(s => s.name)].filter(Boolean) as string[];

    try {
      const res = await fetch(`/api/bookings/${assignForemanBooking.id}/assign-foreman`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mechanicsAssigned: assignedNames,
          mechanicName: assignedNames.join(', ') || 'Belum Alokasi',
          assignedBy: 'Foreman / Leader'
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan alokasi mekanik');
      }
      setAssignForemanBooking(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan alokasi mekanik');
    }
  };

  const handleSavePauseJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pauseBooking) return;

    try {
      const res = await fetch(`/api/bookings/${pauseBooking.id}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: pauseReason,
          notes: pauseNotes,
          pausedBy: 'Foreman / Leader Workshop'
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menjeda pekerjaan');
      }
      setPauseBooking(null);
      setPauseNotes('');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Gagal menjeda pekerjaan');
    }
  };

  const handleResumeJob = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumedBy: 'Foreman / Leader Workshop'
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal melanjutkan pekerjaan');
      }
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Gagal melanjutkan pekerjaan');
    }
  };

  const handleOpenGudangInput = (booking: WorkshopBooking) => {
    setGudangBooking(booking);
    setGudangSelectedParts([]);
    setGudangPartSearchQuery('');
  };

  const handleAddPartToGudangList = (part: SparePart) => {
    const exists = gudangSelectedParts.find(sp => sp.partId === part.id);
    if (!exists) {
      setGudangSelectedParts([...gudangSelectedParts, { partId: part.id, quantity: 1 }]);
    }
    setGudangPartSearchQuery('');
  };

  const handleSaveGudangParts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gudangBooking) return;
    if (gudangSelectedParts.length === 0) {
      alert('Pilih minimal 1 suku cadang!');
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${gudangBooking.id}/add-parts-gudang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newParts: gudangSelectedParts,
          addedBy: 'Tim Gudang'
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menambahkan suku cadang ke SPK');
      }
      setGudangBooking(null);
      setGudangSelectedParts([]);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan suku cadang');
    }
  };

  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      setHmAtBooking(unit.currentHm);
      setKmAtBooking(unit.currentKm || unit.currentHm * 5);
    } else {
      setHmAtBooking(0);
      setKmAtBooking(0);
    }
  };

  const handleToggleMechanic = (mechanicId: string) => {
    if (selectedMechanicIds.includes(mechanicId)) {
      setSelectedMechanicIds(selectedMechanicIds.filter(id => id !== mechanicId));
    } else {
      if (selectedMechanicIds.length >= 3) {
        alert('Maksimal 3 mekanik dapat dialokasikan per Work Order.');
        return;
      }
      setSelectedMechanicIds([...selectedMechanicIds, mechanicId]);
    }
  };

  const handleOpenManageParts = (booking: WorkshopBooking) => {
    setManagePartsBooking(booking);
    setManageSelectedParts([...booking.partsUsed]);
  };

  const handleAddPartToManage = (part: SparePart) => {
    if (manageSelectedParts.some(sp => sp.partId === part.id)) {
      alert('Suku cadang ini sudah ada dalam daftar alokasi.');
      return;
    }
    setManageSelectedParts([...manageSelectedParts, { partId: part.id, quantity: 1 }]);
  };

  const handleRemovePartFromManage = (index: number) => {
    setManageSelectedParts(manageSelectedParts.filter((_, i) => i !== index));
  };

  const handleManageQuantityChange = (index: number, qty: number) => {
    const updated = [...manageSelectedParts];
    const part = parts.find(p => p.id === updated[index].partId);
    if (part) {
      if (qty > part.stock) {
        alert(`Pengambilan melebihi stok gudang (${part.stock} ${part.unit})!`);
        updated[index].quantity = part.stock;
      } else if (qty < 1) {
        updated[index].quantity = 1;
      } else {
        updated[index].quantity = qty;
      }
      setManageSelectedParts(updated);
    }
  };

  const handleSubmitManageParts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managePartsBooking) return;

    for (const sp of manageSelectedParts) {
      const part = parts.find(p => p.id === sp.partId);
      if (part && part.stock < sp.quantity) {
        alert(`Stok tidak mencukupi untuk ${part.name}. Sisa stok: ${part.stock}`);
        return;
      }
    }

    try {
      await onUpdateBookingStatus(managePartsBooking.id, {
        partsUsed: manageSelectedParts
      });
      setManagePartsBooking(null);
    } catch (err: any) {
      alert(err.message || 'Gagal merubah alokasi suku cadang');
    }
  };

  const workshops = [
    'Workshop Utama Maro',
    'Workshop Site North',
    'Workshop Site South',
    'Bengkel Rekanan Mitra A',
    'Bengkel Keliling (Mobile Service)'
  ];

  // Part selector helpers for Create Modal
  const handleAddPartToBooking = (part: SparePart) => {
    if (selectedParts.some(sp => sp.partId === part.id)) {
      alert('Suku cadang ini sudah ditambahkan.');
      return;
    }
    setSelectedParts([...selectedParts, { partId: part.id, quantity: 1 }]);
  };

  const handleRemovePartFromBooking = (index: number) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...selectedParts];
    const part = parts.find(p => p.id === updated[index].partId);
    if (part) {
      if (qty > part.stock) {
        alert(`Pengambilan suku cadang melebihi stok yang tersedia (${part.stock} ${part.unit})!`);
        updated[index].quantity = part.stock;
      } else if (qty < 1) {
        updated[index].quantity = 1;
      } else {
        updated[index].quantity = qty;
      }
      setSelectedParts(updated);
    }
  };

  // Submit Work Order creation
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId) {
      alert('Harap pilih unit UIO!');
      return;
    }
    if (!bookingDate) {
      alert('Harap pilih tanggal servis!');
      return;
    }

    // Determine mechanic primary name and mechanicsAssigned array
    const selectedMechObjs = mechanics.filter(m => selectedMechanicIds.includes(m.id));
    const primaryMechName = selectedMechObjs.map(m => m.name).join(', ') || 'Team Workshop';
    const mechanicsAssignedNames = selectedMechObjs.map(m => m.name);

    try {
      await onCreateBooking({
        unitId: selectedUnitId,
        bookingDate,
        workshopName,
        serviceType,
        mechanicName: primaryMechName,
        mechanicsAssigned: mechanicsAssignedNames,
        flatRateHours: Number(flatRateHours),
        flatRateCost: Number(flatRateCost),
        notes,
        partsUsed: selectedParts,
        kmAtBooking: Number(kmAtBooking),
        hmAtBooking: Number(hmAtBooking),
        damageType,
        complaint
      });

      setIsAdding(false);
      // Reset form
      setSelectedUnitId('');
      setBookingDate(new Date().toISOString().split('T')[0]);
      setWorkshopName('Workshop Utama Maro');
      setServiceType('Periodic Service');
      setSelectedMechanicIds([]);
      setFlatRateHours(2.5);
      setFlatRateCost(150000);
      setNotes('');
      setKmAtBooking(0);
      setHmAtBooking(0);
      setDamageType('Routine Periodic Maintenance');
      setComplaint('');
      setSelectedParts([]);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan Work Order');
    }
  };

  // Status transitions / Kanban updates
  const handleMoveKanbanStatus = async (bookingId: string, newStatus: 'Pending' | 'In Progress' | 'Completed', newProgressStatus?: string) => {
    try {
      await onUpdateBookingStatus(bookingId, { 
        status: newStatus,
        ...(newProgressStatus ? { progressStatus: newProgressStatus } : {})
      });
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status Work Order');
    }
  };

  const handleOpenCompletion = (booking: WorkshopBooking) => {
    const unit = units.find(u => u.id === booking.unitId);
    setCompletionBooking(booking);
    setCompletionHm(unit ? unit.currentHm : booking.targetHm);
    setCompletionNotes(booking.notes);
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionBooking) return;

    const unit = units.find(u => u.id === completionBooking.unitId);
    if (unit && completionHm < unit.currentHm) {
      alert(`HM penyelesaian (${completionHm}) tidak boleh kurang dari HM saat ini (${unit.currentHm})!`);
      return;
    }

    try {
      await onUpdateBookingStatus(completionBooking.id, {
        status: 'Completed',
        actualCompletionHm: completionHm,
        notes: completionNotes,
        partsUsed: completionBooking.partsUsed
      });
      setCompletionBooking(null);
    } catch (err: any) {
      alert(err.message || 'Transaksi gagal diproses.');
    }
  };

  const handleSubmitWorkshopLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopLogBooking) return;
    if (!workshopLogNotes.trim()) {
      alert('Harap masukkan catatan progress!');
      return;
    }

    try {
      await onUpdateBookingStatus(workshopLogBooking.id, {
        progressStatus: workshopProgressStatus,
        newProgressLog: {
          notes: workshopLogNotes,
          updatedBy: workshopLogUpdatedBy || 'Staff Workshop'
        }
      });
      setWorkshopLogBooking(null);
      setWorkshopLogNotes('');
      setWorkshopLogUpdatedBy('');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan update progress kerja');
    }
  };

  const getPartName = (partId: string) => {
    const part = parts.find(p => p.id === partId);
    return part ? `${part.name} (${part.code})` : 'Suku cadang tidak dikenal';
  };

  // Filter parts for Create/Manage search
  const filteredParts = parts.filter(p => 
    p.code.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(partSearchQuery.toLowerCase())
  );

  const filteredManageParts = parts.filter(p => 
    p.code.toLowerCase().includes(managePartSearchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(managePartSearchQuery.toLowerCase())
  );

  // Kanban Columns categorization
  const kanbanQueue = bookings.filter(b => b.status === 'Pending');
  const kanbanProgress = bookings.filter(b => b.status === 'In Progress' && b.progressStatus !== 'Waiting for Parts');
  const kanbanPending = bookings.filter(b => b.status === 'In Progress' && b.progressStatus === 'Waiting for Parts');
  const kanbanCompleted = bookings.filter(b => b.status === 'Completed');

  return (
    <div className="space-y-6" id="booking-system-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="booking-header">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="text-blue-600" size={22} />
            Manajemen Work Order & Antrian Perbaikan
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-sans">
            Kelola Work Order perbaikan, alokasi tim mekanik, estimasi biaya, suku cadang, dan alur papan Kanban interaktif.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} /> Buat Work Order Baru
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-slate-200 p-1 rounded-xl max-w-xs border border-slate-300" id="portal-toggle-bar">
        <button
          type="button"
          onClick={() => setCurrentPortal('planner')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold text-center transition-all cursor-pointer rounded-lg ${
            currentPortal === 'planner' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Planner & Admin
        </button>
        <button
          type="button"
          onClick={() => setCurrentPortal('workshop')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold text-center transition-all cursor-pointer rounded-lg ${
            currentPortal === 'workshop' 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tim Workshop
        </button>
      </div>

      {/* 4-SECTION KANBAN BOARD */}
      <div className="space-y-3" id="kanban-board-wrapper">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            Papan Kanban Work Order
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Role: {currentPortal === 'planner' ? 'Planner / Admin' : 'Mekanik Workshop'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="kanban-4-columns">
          
          {/* Column 1: Menunggu Antrian */}
          <div className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200 flex flex-col space-y-3 min-h-[500px]">
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-3xs">
              <span className="text-xs font-black font-mono uppercase text-blue-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                Menunggu Antrian
              </span>
              <span className="text-xs font-black font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-lg">
                {kanbanQueue.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {kanbanQueue.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-mono text-xs border border-dashed border-slate-300 rounded-xl bg-white/50">
                  Kosong
                </div>
              ) : (
                kanbanQueue.map(b => (
                  <div key={b.id} className="bg-amber-50/60 hover:bg-amber-50 border-2 border-amber-200 p-3.5 rounded-xl shadow-xs space-y-2.5 transition-all relative group">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black font-mono text-amber-800">WO #{b.id}</span>
                      <span className="text-[9px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md uppercase">
                        {b.serviceType}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black font-mono text-slate-900 uppercase">{b.unitCode}</h4>
                      <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">{b.damageType || 'Perawatan Rutin'}</p>
                      {b.complaint && (
                        <p className="text-[10px] text-slate-500 italic mt-1 bg-white/80 p-1.5 rounded-md border border-amber-200">
                          "{b.complaint}"
                        </p>
                      )}
                    </div>

                    <div className="text-[10px] font-mono text-slate-600 space-y-0.5 border-t border-amber-200/60 pt-2">
                      <p>🔧 Mekanik: <strong className="text-slate-900 font-bold">{b.mechanicName || 'Team'}</strong></p>
                      <p>⏱ Flat Rate: <strong>{b.flatRateHours || 2} Jam</strong> (Rp {(b.flatRateCost || 150000).toLocaleString('id-ID')})</p>
                    </div>

                    {/* Quick Move Action */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setSelectedBookingDetail(b)}
                        className="text-[9px] font-extrabold font-mono text-blue-700 hover:underline uppercase"
                      >
                        Detail WO
                      </button>
                      <button
                        onClick={() => handleMoveKanbanStatus(b.id, 'In Progress', 'On Repair')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold font-mono uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-3xs"
                      >
                        <span>Mulai Progress</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Progress Pekerjaan */}
          <div className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200 flex flex-col space-y-3 min-h-[500px]">
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-3xs">
              <span className="text-xs font-black font-mono uppercase text-amber-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                Progress Pekerjaan
              </span>
              <span className="text-xs font-black font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg">
                {kanbanProgress.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {kanbanProgress.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-mono text-xs border border-dashed border-slate-300 rounded-xl bg-white/50">
                  Kosong
                </div>
              ) : (
                kanbanProgress.map(b => (
                  <div key={b.id} className="bg-blue-50/60 hover:bg-blue-50 border-2 border-blue-200 p-3.5 rounded-xl shadow-xs space-y-2.5 transition-all">
                    <div 
                      onClick={() => setSelectedBookingDetail(b)}
                      className="flex justify-between items-start cursor-pointer group"
                    >
                      <span className="text-[10px] font-black font-mono text-blue-800 group-hover:underline">WO #{b.id} &bull; Detail</span>
                      <span className="text-[9px] font-mono font-bold bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded-md uppercase">
                        {b.progressStatus || 'ON REPAIR'}
                      </span>
                    </div>

                    <div onClick={() => setSelectedBookingDetail(b)} className="cursor-pointer">
                      <h4 className="text-xs font-black font-mono text-slate-900 uppercase hover:text-blue-700">{b.unitCode}</h4>
                      <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">{b.damageType || 'Perawatan Rutin'}</p>
                    </div>

                    <div className="text-[10px] font-mono text-slate-600 space-y-0.5 border-t border-blue-200/60 pt-2">
                      <p>👤 Mekanik: <strong className="text-slate-900 font-bold">{b.mechanicName || 'Belum Alokasi'}</strong></p>
                      <p>🏢 Lokasi: {b.workshopName}</p>
                    </div>

                    {/* Quick Move Action Buttons */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-blue-200/60">
                      <button
                        onClick={() => setSelectedBookingDetail(b)}
                        className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[9px] font-extrabold font-mono uppercase rounded-md transition-all cursor-pointer"
                      >
                        Detail WO
                      </button>
                      <button
                        onClick={() => handleMoveKanbanStatus(b.id, 'In Progress', 'Waiting for Parts')}
                        className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[9px] font-extrabold font-mono uppercase rounded-md transition-all cursor-pointer"
                      >
                        Wait Parts
                      </button>
                      <button
                        onClick={() => handleOpenCompletion(b)}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-extrabold font-mono uppercase rounded-lg transition-all flex items-center gap-0.5 cursor-pointer shadow-3xs"
                      >
                        <span>Selesai</span>
                        <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Pending / Waiting for Parts */}
          <div className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200 flex flex-col space-y-3 min-h-[500px]">
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-3xs">
              <span className="text-xs font-black font-mono uppercase text-rose-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                Pending (Suku Cadang)
              </span>
              <span className="text-xs font-black font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded-lg">
                {kanbanPending.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {kanbanPending.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-mono text-xs border border-dashed border-slate-300 rounded-xl bg-white/50">
                  Kosong
                </div>
              ) : (
                kanbanPending.map(b => (
                  <div key={b.id} className="bg-rose-50/60 hover:bg-rose-50 border-2 border-rose-200 p-3.5 rounded-xl shadow-xs space-y-2.5 transition-all">
                    <div 
                      onClick={() => setSelectedBookingDetail(b)}
                      className="flex justify-between items-start cursor-pointer group"
                    >
                      <span className="text-[10px] font-black font-mono text-rose-800 group-hover:underline">WO #{b.id} &bull; Detail</span>
                      <span className="text-[9px] font-mono font-bold bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded-md uppercase">
                        WAIT PARTS
                      </span>
                    </div>

                    <div onClick={() => setSelectedBookingDetail(b)} className="cursor-pointer">
                      <h4 className="text-xs font-black font-mono text-slate-900 uppercase hover:text-rose-700">{b.unitCode}</h4>
                      <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">{b.damageType || 'Perawatan Rutin'}</p>
                    </div>

                    <div className="text-[10px] font-mono text-slate-600 border-t border-rose-200/60 pt-2 space-y-1">
                      <p className="text-rose-700 font-bold">⚠️ Menunggu Suku Cadang Gudang</p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setSelectedBookingDetail(b)}
                          className="text-[9px] text-blue-700 font-bold hover:underline uppercase"
                        >
                          Lihat Detail WO
                        </button>
                        <button
                          onClick={() => handleOpenManageParts(b)}
                          className="text-[9px] text-emerald-700 font-black hover:underline uppercase"
                        >
                          + Input Part Gudang
                        </button>
                      </div>
                    </div>

                    {/* Resume Progress Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-rose-200/60">
                      <button
                        onClick={() => handleMoveKanbanStatus(b.id, 'In Progress', 'On Repair')}
                        className="w-full py-1 bg-slate-900 hover:bg-black text-white text-[10px] font-extrabold font-mono uppercase rounded-lg transition-all text-center cursor-pointer shadow-3xs"
                      >
                        Lanjutkan Progress Kerja
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 4: Selesai */}
          <div className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200 flex flex-col space-y-3 min-h-[500px]">
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-3xs">
              <span className="text-xs font-black font-mono uppercase text-emerald-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Selesai / RFU
              </span>
              <span className="text-xs font-black font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg">
                {kanbanCompleted.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {kanbanCompleted.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-mono text-xs border border-dashed border-slate-300 rounded-xl bg-white/50">
                  Kosong
                </div>
              ) : (
                kanbanCompleted.slice(0, 10).map(b => (
                  <div key={b.id} className="bg-emerald-50/50 hover:bg-emerald-50 border-2 border-emerald-200 p-3.5 rounded-xl shadow-xs space-y-2 transition-all opacity-90 hover:opacity-100">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black font-mono text-emerald-800">WO #{b.id}</span>
                      <span className="text-[9px] font-mono font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md uppercase">
                        COMPLETED
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black font-mono text-slate-900 uppercase">{b.unitCode}</h4>
                      <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">{b.serviceType}</p>
                    </div>

                    <div className="text-[10px] font-mono text-slate-600 border-t border-emerald-200/60 pt-1.5 flex justify-between">
                      <span>Mekanik: {b.mechanicName}</span>
                      <button
                        onClick={() => setSelectedBookingDetail(b)}
                        className="text-[9px] font-bold text-blue-700 hover:underline uppercase"
                      >
                        WO PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* CREATE WORK ORDER MODAL */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold font-mono text-slate-900 uppercase flex items-center gap-2">
                <Plus size={18} className="text-blue-600" /> Buat Work Order Perbaikan Baru
              </h3>
              <button 
                onClick={() => setIsAdding(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-900 cursor-pointer rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Unit UIO */}
                <div>
                  <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">Pilih Unit Armada UIO *</label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Unit Armada --</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.code} &mdash; {u.name} (HM: {u.currentHm})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">Tanggal Rencana Masuk *</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Service Type */}
                <div>
                  <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">Jenis Pekerjaan *</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Periodic Service">Periodic Service (Servis Berkala)</option>
                    <option value="Oil Change">Oil Change (Ganti Oli)</option>
                    <option value="Repair">Repair (Perbaikan/Korektif)</option>
                    <option value="General Inspection">General Inspection (Inspeksi Umum)</option>
                  </select>
                </div>

                {/* Workshop Name */}
                <div>
                  <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">Lokasi Workshop / Bengkel *</label>
                  <select
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {workshops.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Mechanic Selection */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-600">
                  Alokasi Mekanik Pelaksana (Pilih 1 s/d 3 Mekanik)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {mechanics.map(m => {
                    const isSelected = selectedMechanicIds.includes(m.id);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => handleToggleMechanic(m.id)}
                        className={`p-2 rounded-lg text-left border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-3xs' 
                            : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300'
                        }`}
                      >
                        <span className="truncate">{m.name}</span>
                        <span className={`text-[9px] font-mono font-bold px-1 rounded ${
                          isSelected ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {m.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Flat Rate Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-600 mb-1">Flat Rate Jam Kerja (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={flatRateHours}
                    onChange={(e) => setFlatRateHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-600 mb-1">Flat Rate Estimasi Biaya Jasa (Rp)</label>
                  <input
                    type="number"
                    value={flatRateCost}
                    onChange={(e) => setFlatRateCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Complaint & Notes */}
              <div>
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">Keluhan / Deskripsi Masalah</label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="Ketik detail keluhan operator / hasil inspeksi..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Spare Parts Selection with Search Menu */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-600">Alokasi Suku Cadang Gudang</label>
                  <span className="text-[10px] font-mono text-slate-400">Search & Select</span>
                </div>

                {/* Search input for spare parts */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={partSearchQuery}
                    onChange={(e) => setPartSearchQuery(e.target.value)}
                    placeholder="Cari suku cadang (kode / nama)..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Quick Add Part Results */}
                {partSearchQuery && (
                  <div className="bg-white border border-slate-200 rounded-xl max-h-36 overflow-y-auto divide-y divide-slate-100 shadow-lg">
                    {filteredParts.length === 0 ? (
                      <p className="p-3 text-xs text-slate-400 text-center font-mono">Suku cadang tidak ditemukan</p>
                    ) : (
                      filteredParts.map(p => (
                        <div key={p.id} className="p-2 flex items-center justify-between hover:bg-slate-50 text-xs font-mono">
                          <div>
                            <span className="font-bold text-slate-900">{p.name}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({p.code})</span>
                            <span className="text-[10px] text-emerald-600 block">Stok: {p.stock} {p.unit} &bull; Rp {p.price.toLocaleString('id-ID')}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddPartToBooking(p)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                          >
                            + Pilih
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Selected parts list */}
                {selectedParts.length > 0 && (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[9px] font-bold font-mono text-slate-500 uppercase block">Daftar Suku Cadang Terpilih:</span>
                    {selectedParts.map((sp, idx) => {
                      const pObj = parts.find(p => p.id === sp.partId);
                      return (
                        <div key={idx} className="flex items-center justify-between gap-3 text-xs font-mono bg-white p-2 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-900 truncate flex-1">{pObj?.name}</span>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-slate-500">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              max={pObj?.stock || 100}
                              value={sp.quantity}
                              onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                              className="w-16 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-center font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePartFromBooking(idx)}
                              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase font-mono tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Simpan Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE PARTS MODAL */}
      {managePartsBooking && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold font-mono text-slate-900 uppercase">
                Alokasi Part WO #{managePartsBooking.id} &mdash; {managePartsBooking.unitCode}
              </h3>
              <button 
                onClick={() => setManagePartsBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer rounded-full hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Part Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={managePartSearchQuery}
                onChange={(e) => setManagePartSearchQuery(e.target.value)}
                placeholder="Cari suku cadang gudang..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>

            {managePartSearchQuery && (
              <div className="bg-white border border-slate-200 rounded-xl max-h-36 overflow-y-auto divide-y divide-slate-100 shadow-md">
                {filteredManageParts.map(p => (
                  <div key={p.id} className="p-2 flex items-center justify-between text-xs font-mono">
                    <span>{p.name} ({p.code})</span>
                    <button
                      type="button"
                      onClick={() => handleAddPartToManage(p)}
                      className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {manageSelectedParts.length === 0 ? (
                <p className="text-xs text-slate-400 font-mono text-center py-4">Belum ada suku cadang dialokasikan</p>
              ) : (
                manageSelectedParts.map((sp, idx) => {
                  const pObj = parts.find(p => p.id === sp.partId);
                  return (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
                      <span className="font-bold text-slate-900 truncate flex-1">{pObj?.name}</span>
                      <input
                        type="number"
                        min="1"
                        max={pObj?.stock || 100}
                        value={sp.quantity}
                        onChange={(e) => handleManageQuantityChange(idx, Number(e.target.value))}
                        className="w-16 px-2 py-0.5 bg-white border border-slate-200 rounded text-center font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePartFromManage(idx)}
                        className="text-rose-600 p-1 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setManagePartsBooking(null)}
                className="px-3 py-1.5 text-xs text-slate-600 font-bold uppercase rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitManageParts}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold font-mono uppercase rounded-lg"
              >
                Simpan Part
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOREMAN ALLOCATION MODAL */}
      {assignForemanBooking && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold font-mono text-slate-900 uppercase">
                Alokasi Mekanik &mdash; WO #{assignForemanBooking.id} ({assignForemanBooking.unitCode})
              </h3>
              <button onClick={() => setAssignForemanBooking(null)} className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveForemanAllocation} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">
                  Mekanik Utama (Leader Lead) *
                </label>
                <select
                  value={assignPrimaryMechanicId}
                  onChange={(e) => setAssignPrimaryMechanicId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                >
                  {mechanics.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">
                  Mekanik Pendamping (Opsional Multi-Mekanik)
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
                  {mechanics.filter(m => m.id !== assignPrimaryMechanicId).map(m => {
                    const isSelected = assignSecondaryMechanicIds.includes(m.id);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => handleToggleSecondaryMechanic(m.id)}
                        className={`w-full p-2 rounded-lg text-left text-xs font-mono font-semibold flex items-center justify-between cursor-pointer border ${
                          isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-800 border-slate-200'
                        }`}
                      >
                        <span>{m.name} ({m.role})</span>
                        <span>{isSelected ? '✓ Terpilih' : '+ Pilih'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignForemanBooking(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-bold uppercase rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold font-mono uppercase rounded-lg cursor-pointer shadow-3xs"
                >
                  Simpan Alokasi Mekanik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOREMAN PAUSE JOB MODAL */}
      {pauseBooking && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold font-mono text-slate-900 uppercase">
                Kontrol Jeda Pekerjaan &mdash; WO #{pauseBooking.id}
              </h3>
              <button onClick={() => setPauseBooking(null)} className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePauseJob} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">
                  Alasan Menjeda Pekerjaan *
                </label>
                <select
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value as PauseReason)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                >
                  <option value="Waiting for Parts">Waiting for Parts (Menunggu Suku Cadang Gudang)</option>
                  <option value="Waiting Approval">Waiting Approval (Menunggu Persetujuan Atasan/Planner)</option>
                  <option value="End of Shift">End of Shift (Jam Kerja Berakhir / Pulang Kerja)</option>
                </select>
                {pauseReason === 'End of Shift' && (
                  <p className="text-[10px] text-amber-700 font-medium bg-amber-50 border border-amber-200 p-2 rounded-lg mt-1.5">
                    ℹ️ Status Jeda "End of Shift" akan mencatat akumulasi hari terjeda tanpa menghitung sebagai penundaan/inefisiensi pengerjaan teknis.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">
                  Catatan Penundaan / Keterangan
                </label>
                <textarea
                  value={pauseNotes}
                  onChange={(e) => setPauseNotes(e.target.value)}
                  placeholder="Deskripsikan detail penyebab jeda..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPauseBooking(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-bold uppercase rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-mono uppercase rounded-lg cursor-pointer shadow-3xs"
                >
                  Konfirmasi Jeda SPK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIM GUDANG INPUT PART MODAL */}
      {gudangBooking && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold font-mono text-slate-900 uppercase">
                Input Part Gudang &mdash; SPK WO #{gudangBooking.id} ({gudangBooking.unitCode})
              </h3>
              <button onClick={() => setGudangBooking(null)} className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGudangParts} className="space-y-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={gudangPartSearchQuery}
                  onChange={(e) => setGudangPartSearchQuery(e.target.value)}
                  placeholder="Cari item suku cadang gudang..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>

              {gudangPartSearchQuery && (
                <div className="bg-white border border-slate-200 rounded-xl max-h-36 overflow-y-auto divide-y divide-slate-100 shadow-md">
                  {parts.filter(p => p.code.toLowerCase().includes(gudangPartSearchQuery.toLowerCase()) || p.name.toLowerCase().includes(gudangPartSearchQuery.toLowerCase())).map(p => (
                    <div key={p.id} className="p-2 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="text-[10px] text-emerald-600 block">Stok: {p.stock} {p.unit} &bull; Rp {p.price.toLocaleString('id-ID')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddPartToGudangList(p)}
                        className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase rounded cursor-pointer"
                      >
                        + Tambah
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 font-mono block uppercase">Daftar Part Di-Input Gudang:</span>
                {gudangSelectedParts.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono text-center py-4">Belum ada part dipilih</p>
                ) : (
                  gudangSelectedParts.map((sp, idx) => {
                    const pObj = parts.find(p => p.id === sp.partId);
                    return (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono">
                        <span className="font-bold text-slate-900 truncate flex-1">{pObj?.name}</span>
                        <input
                          type="number"
                          min="1"
                          max={pObj?.stock || 100}
                          value={sp.quantity}
                          onChange={(e) => {
                            const updated = [...gudangSelectedParts];
                            updated[idx].quantity = Number(e.target.value);
                            setGudangSelectedParts(updated);
                          }}
                          className="w-16 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-center font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setGudangSelectedParts(gudangSelectedParts.filter((_, i) => i !== idx))}
                          className="text-rose-600 p-1 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGudangBooking(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-bold uppercase rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono uppercase rounded-lg cursor-pointer shadow-3xs"
                >
                  Simpan Input Gudang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORK ORDER DETAIL & PRINT MODAL */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl" id="printable-spk">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black font-mono text-slate-400 uppercase">DOKUMEN WORK ORDER RESMI</span>
                <h3 className="text-lg font-black font-mono text-slate-900 uppercase">WO #{selectedBookingDetail.id} &mdash; {selectedBookingDetail.unitCode}</h3>
              </div>
              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono uppercase rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all"
                  title="Cetak Laporan ke PDF / Printer"
                >
                  <Printer size={14} />
                  <span>Cetak / Unduh PDF</span>
                </button>
                <button 
                  onClick={() => setSelectedBookingDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 cursor-pointer rounded-full hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Header Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div><span className="text-[10px] text-slate-400 block font-sans">KODE UNIT:</span> <strong className="text-slate-900 text-sm">{selectedBookingDetail.unitCode}</strong></div>
                <div><span className="text-[10px] text-slate-400 block font-sans">JENIS PEKERJAAN:</span> <strong className="text-slate-900">{selectedBookingDetail.serviceType}</strong></div>
                <div><span className="text-[10px] text-slate-400 block font-sans">STATUS SPK:</span> <strong className="text-blue-700">{selectedBookingDetail.status} ({selectedBookingDetail.progressStatus || 'ON REPAIR'})</strong></div>
                <div><span className="text-[10px] text-slate-400 block font-sans">LOKASI WORKSHOP:</span> <strong className="text-slate-900">{selectedBookingDetail.workshopName}</strong></div>
                <div><span className="text-[10px] text-slate-400 block font-sans">FLAT RATE JASA:</span> <strong>{selectedBookingDetail.flatRateHours || 2.5} Jam (Rp {(selectedBookingDetail.flatRateCost || 150000).toLocaleString('id-ID')})</strong></div>
                <div><span className="text-[10px] text-slate-400 block font-sans">PERIODE PENGERJAAN:</span> <strong>{selectedBookingDetail.bookingDate}</strong></div>
              </div>

              {/* TIM MEKANIK (Mekanik Utama & Mekanik Ke dua) */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-2 border border-slate-800 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-sans tracking-wider">
                    TIM MEKANIK WORKSHOP TERALOKASI:
                  </span>
                  <button
                    onClick={() => {
                      const b = selectedBookingDetail;
                      setSelectedBookingDetail(null);
                      handleOpenAssignForeman(b);
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold font-mono uppercase rounded-lg cursor-pointer transition-all no-print"
                  >
                    + Alokasi / Tambah Mekanik Ke-2
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(() => {
                    const list = selectedBookingDetail.mechanicsAssigned?.length
                      ? selectedBookingDetail.mechanicsAssigned
                      : (selectedBookingDetail.mechanicName ? selectedBookingDetail.mechanicName.split(',').map(s => s.trim()) : ['Belum Alokasi']);

                    return list.map((mName, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 ${
                          idx === 0
                            ? 'bg-emerald-500 text-slate-950 shadow-3xs'
                            : 'bg-slate-800 text-amber-300 border border-slate-700'
                        }`}
                      >
                        <span>{idx === 0 ? '👑 Mekanik Utama (1):' : `🔧 Mekanik Ke-${idx + 1} (Pendamping):`}</span>
                        <strong className="underline">{mName}</strong>
                      </span>
                    ));
                  })()}
                </div>
              </div>

              {/* Telemetry Durasi Pengerjaan & Jeda Telemetry Breakdown */}
              <div className="bg-amber-50/90 border border-amber-200 p-3.5 rounded-xl space-y-3 text-amber-950">
                <span className="text-[10px] font-black uppercase text-amber-800 block font-sans tracking-wider">
                  ⏱ ANALISIS TELEMETRI DURASI & breakdown JEDA PENGERJAAN:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 shadow-3xs">
                    <span className="text-[9px] font-bold uppercase text-emerald-800 block">1. WAKTU PENGERJAAN (AKTIF):</span>
                    <span className="text-base font-black text-emerald-700">{selectedBookingDetail.totalWorkHoursCalculated || 0} Jam</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Fisik mekanik di unit</span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 shadow-3xs">
                    <span className="text-[9px] font-bold uppercase text-rose-800 block">2. WAITING FOR PARTS:</span>
                    <span className="text-base font-black text-rose-700">
                      {(selectedBookingDetail.pausedLogs || []).filter(p => p.reason === 'Waiting for Parts').reduce((s, p) => s + (p.durationHours || 0), 0) || (selectedBookingDetail.status === 'Pending' ? selectedBookingDetail.totalPausedHoursCalculated || 0 : 0)} Jam
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Menunggu stok gudang</span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 shadow-3xs">
                    <span className="text-[9px] font-bold uppercase text-amber-800 block">3. JEDA APPROVAL:</span>
                    <span className="text-base font-black text-amber-700">
                      {(selectedBookingDetail.pausedLogs || []).filter(p => p.reason === 'Waiting Approval').reduce((s, p) => s + (p.durationHours || 0), 0)} Jam
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Acc atasan/planner</span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 shadow-3xs">
                    <span className="text-[9px] font-bold uppercase text-indigo-800 block">4. OFF-SHIFT / PULANG:</span>
                    <span className="text-base font-black text-indigo-700">
                      🌙 {selectedBookingDetail.offShiftPausedDaysCalculated || 0} Hari
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Jam istirahat malam (Non-SLA)</span>
                  </div>
                </div>
              </div>

              {selectedBookingDetail.complaint && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-sans text-xs">
                  <span className="font-bold text-[10px] uppercase text-slate-400 block font-mono">KELUHAN / KETENTUAN PERBAIKAN:</span>
                  "{selectedBookingDetail.complaint}"
                </div>
              )}

              {/* Parts used Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-100 p-2 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-black uppercase text-slate-900 text-xs block font-mono">Rincian Detail Pemakaian Suku Cadang (Part):</span>
                    <span className="text-[10px] text-slate-500 font-sans">Daftar item part yang digunakan dari gudang workshop</span>
                  </div>
                  <button
                    onClick={() => {
                      const b = selectedBookingDetail;
                      setSelectedBookingDetail(null);
                      handleOpenGudangInput(b);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold font-mono uppercase rounded-lg cursor-pointer transition-all shadow-3xs no-print"
                  >
                    + Input Part Gudang
                  </button>
                </div>
                
                {selectedBookingDetail.partsUsed.length === 0 ? (
                  <p className="text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center border border-slate-200 text-xs">
                    Belum ada suku cadang di-input untuk SPK ini. Klik "+ Input Part Gudang" untuk menambahkan.
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="p-2.5">Kode Part</th>
                          <th className="p-2.5">Nama Suku Cadang</th>
                          <th className="p-2.5 text-center">Jumlah</th>
                          <th className="p-2.5 text-right">Harga Satuan</th>
                          <th className="p-2.5 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selectedBookingDetail.partsUsed.map((p, idx) => {
                          const pObj = parts.find(sp => sp.id === p.partId);
                          const price = p.priceAtSale || (pObj ? pObj.price : 0);
                          const subtotal = price * p.quantity;
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-800">{pObj?.code || 'PART'}</td>
                              <td className="p-2.5 text-slate-900 font-semibold">{pObj?.name || 'Suku Cadang'}</td>
                              <td className="p-2.5 text-center font-bold bg-slate-50">{p.quantity} {pObj?.unit || 'Pcs'}</td>
                              <td className="p-2.5 text-right font-mono">Rp {price.toLocaleString('id-ID')}</td>
                              <td className="p-2.5 text-right font-bold font-mono text-emerald-700">Rp {subtotal.toLocaleString('id-ID')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100 font-bold border-t border-slate-200 text-slate-900">
                        <tr>
                          <td colSpan={4} className="p-2.5 text-right uppercase">Total Biaya Suku Cadang:</td>
                          <td className="p-2.5 text-right text-emerald-800 text-sm font-black">
                            Rp {selectedBookingDetail.partsUsed.reduce((sum, p) => {
                              const pObj = parts.find(sp => sp.id === p.partId);
                              const price = p.priceAtSale || (pObj ? pObj.price : 0);
                              return sum + (price * p.quantity);
                            }, 0).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Approval Signatures Section */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-[10px] font-sans">
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <span className="block font-bold text-slate-500">FOREMAN LEADER</span>
                  <div className="h-10"></div>
                  <span className="block font-semibold text-slate-800">( {selectedBookingDetail.mechanicName?.split(',')[0] || 'Foreman'} )</span>
                </div>
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <span className="block font-bold text-slate-500">LOGISTIK GUDANG</span>
                  <div className="h-10"></div>
                  <span className="block font-semibold text-slate-800">( Tim Gudang )</span>
                </div>
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <span className="block font-bold text-slate-500">PLANNER WORKSHOP</span>
                  <div className="h-10"></div>
                  <span className="block font-semibold text-slate-800">( Planner Admin )</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedBookingDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETION MODAL */}
      {completionBooking && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold font-mono text-slate-900 uppercase">
                Konfirmasi Penyelesaian WO #{completionBooking.id}
              </h3>
              <button onClick={() => setCompletionBooking(null)} className="p-1 text-slate-400 hover:text-slate-900">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitCompletion} className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">HM Aktual Selesai *</label>
                <input
                  type="number"
                  value={completionHm}
                  onChange={(e) => setCompletionHm(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold font-mono uppercase text-slate-500 mb-1">Catatan Akhir Perbaikan</label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Catatan pengerjaan selesai..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompletionBooking(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-bold uppercase rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono uppercase rounded-lg"
                >
                  Selesaikan WO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
