import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Search, 
  Wrench, 
  FileText, 
  User, 
  Calendar,
  Filter,
  ArrowRight,
  MessageSquare,
  Image as ImageIcon,
  Send,
  HelpCircle
} from 'lucide-react';
import { MechanicInspection, UioUnit, Mechanic, SparePart } from '../types';

interface InspectionsPlannerProps {
  inspections: MechanicInspection[];
  units: UioUnit[];
  mechanics: Mechanic[];
  parts: SparePart[];
  onCreateInspection: (payload: any) => Promise<void>;
  onProcessBacklog: (id: string, action: 'approve' | 'reject' | 'need_info', payload: any) => Promise<void>;
  onAddComment?: (id: string, commentData: any) => Promise<void>;
}

export default function InspectionsPlanner({
  inspections,
  units,
  mechanics,
  parts,
  onCreateInspection,
  onProcessBacklog,
  onAddComment
}: InspectionsPlannerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'mechanic' | 'planner'>('planner');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBacklog, setSelectedBacklog] = useState<MechanicInspection | null>(null);
  const [processAction, setProcessAction] = useState<'approve' | 'reject' | 'need_info'>('approve');

  // Comment Thread state
  const [newCommentText, setNewCommentText] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [commentSenderRole, setCommentSenderRole] = useState<'Mekanik' | 'Planner' | 'Foreman'>('Planner');
  const [commentSenderName, setCommentSenderName] = useState('Planner Site');
  const [isSendingComment, setIsSendingComment] = useState(false);

  // New Inspection Form state
  const [newUnitId, setNewUnitId] = useState('');
  const [newInspectorName, setNewInspectorName] = useState(mechanics[0]?.name || '');
  const [newSystemCategory, setNewSystemCategory] = useState<MechanicInspection['systemCategory']>('Hydraulic');
  const [newFindings, setNewFindings] = useState('');
  const [newRecommendation, setNewRecommendation] = useState('');
  const [newUrgency, setNewUrgency] = useState<'Routine' | 'Urgent' | 'Critical'>('Routine');
  const [newPhotoInput, setNewPhotoInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Planner Action Form state
  const [plannerNotes, setPlannerNotes] = useState('');
  const [woDate, setWoDate] = useState(new Date().toISOString().split('T')[0]);
  const [woWorkshop, setWoWorkshop] = useState('Workshop Utama Maro');
  const [woServiceType, setWoServiceType] = useState<'Periodic Service' | 'Oil Change' | 'Repair' | 'General Inspection'>('Repair');
  const [selectedMechanics, setSelectedMechanics] = useState<string[]>([]);
  const [flatRateHours, setFlatRateHours] = useState(2);
  const [flatRateCost, setFlatRateCost] = useState(300000);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredInspections = inspections.filter(item => {
    const matchesSearch = item.unitCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.unitName && item.unitName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.findings.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.inspectorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || item.systemCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const pendingBacklogs = inspections.filter(i => i.status === 'Pending Planner' || i.status === 'Need Info');
  const scheduledBacklogs = inspections.filter(i => i.status === 'Scheduled');
  const rejectedBacklogs = inspections.filter(i => i.status === 'Rejected');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitId) {
      setErrorMsg('Pilih unit terlebih dahulu.');
      return;
    }
    if (!newFindings.trim()) {
      setErrorMsg('Isi temuan hasil pengecekan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onCreateInspection({
        unitId: newUnitId,
        inspectorName: newInspectorName || 'Mekanik Inspeksi',
        inspectionDate: new Date().toISOString().split('T')[0],
        systemCategory: newSystemCategory,
        findings: newFindings,
        recommendation: newRecommendation,
        urgency: newUrgency,
        photos: newPhotoInput.trim() ? [newPhotoInput.trim()] : []
      });
      setShowAddModal(false);
      setNewFindings('');
      setNewRecommendation('');
      setNewPhotoInput('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan hasil inspeksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBacklog) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onProcessBacklog(selectedBacklog.id, processAction, {
        plannerNotes,
        bookingData: processAction === 'approve' ? {
          bookingDate: woDate,
          workshopName: woWorkshop,
          serviceType: woServiceType,
          mechanicsAssigned: selectedMechanics,
          mechanicName: selectedMechanics.join(', '),
          flatRateHours,
          flatRateCost,
          notes: `Inspeksi Backlog #${selectedBacklog.id}: ${newRecommendation || selectedBacklog.recommendation}`
        } : null
      });
      setSelectedBacklog(null);
      setPlannerNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses backlog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBacklog || !onAddComment) return;
    if (!newCommentText.trim() && !newPhotoUrl.trim()) return;

    setIsSendingComment(true);
    try {
      await onAddComment(selectedBacklog.id, {
        senderName: commentSenderName,
        senderRole: commentSenderRole,
        commentText: newCommentText,
        photoUrl: newPhotoUrl || undefined
      });
      
      // Update local state copy
      const updatedItem = { ...selectedBacklog };
      if (!updatedItem.comments) updatedItem.comments = [];
      updatedItem.comments.push({
        id: `CMT-${Date.now()}`,
        senderName: commentSenderName,
        senderRole: commentSenderRole,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        commentText: newCommentText,
        photoUrl: newPhotoUrl || undefined
      });
      if (newPhotoUrl) {
        if (!updatedItem.photos) updatedItem.photos = [];
        updatedItem.photos.push(newPhotoUrl);
      }
      setSelectedBacklog(updatedItem);

      setNewCommentText('');
      setNewPhotoUrl('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim komentar');
    } finally {
      setIsSendingComment(false);
    }
  };

  const toggleMechanicSelection = (mechanicName: string) => {
    if (selectedMechanics.includes(mechanicName)) {
      setSelectedMechanics(selectedMechanics.filter(m => m !== mechanicName));
    } else {
      if (selectedMechanics.length >= 3) {
        alert('Maksimal 3 mekanik per Work Order.');
        return;
      }
      setSelectedMechanics([...selectedMechanics, mechanicName]);
    }
  };

  return (
    <div className="space-y-6" id="inspections-planner-module">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-emerald-600" size={24} />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
              Inspeksi Mekanik & Backlog Planner
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Sistem rekomendasi perawatan berkala dari temuan lapangan langsung ke penjadwalan Work Order.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('planner')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'planner' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench size={14} />
              <span>Planner Backlog ({pendingBacklogs.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('mechanic')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'mechanic' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={14} />
              <span>Input Mekanik ({inspections.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (units.length > 0) setNewUnitId(units[0].id);
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all rounded-xl shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Tambah Inspeksi</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black font-mono tracking-wider text-amber-700 uppercase">Perlu Review Planner</span>
            <p className="text-2xl font-black font-mono text-amber-900 mt-0.5">{pendingBacklogs.length} Temuan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black font-mono tracking-wider text-emerald-700 uppercase">Disetujui / Dijadwalkan WO</span>
            <p className="text-2xl font-black font-mono text-emerald-900 mt-0.5">{scheduledBacklogs.length} Work Order</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-rose-50/80 border border-rose-200/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black font-mono tracking-wider text-rose-700 uppercase">Ditolak Planner</span>
            <p className="text-2xl font-black font-mono text-rose-900 mt-0.5">{rejectedBacklogs.length} Temuan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-700">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode unit, temuan, atau nama mekanik..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={14} className="text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Sistem Katagori</option>
            <option value="Engine">Engine System</option>
            <option value="Hydraulic">Hydraulic System</option>
            <option value="Brakes">Brake System</option>
            <option value="Transmission">Transmission</option>
            <option value="Electrical">Electrical System</option>
            <option value="Undercarriage">Undercarriage</option>
            <option value="Cabin & AC">Cabin & AC</option>
            <option value="Structure">Structure & Attachment</option>
            <option value="Other">Lain-Lain</option>
          </select>
        </div>
      </div>

      {/* Backlog List / Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <span>Daftar Rekomendasi & Backlog Pengecekan</span>
            <span className="text-xs font-bold text-slate-400">({filteredInspections.length})</span>
          </h2>
        </div>

        {filteredInspections.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <ClipboardCheck size={40} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold uppercase tracking-wider font-sans">Belum Ada Rekomendasi Inspeksi</p>
            <p className="text-[11px]">Gunakan tombol "Tambah Inspeksi" untuk memasukkan catatan temuan mekanik.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInspections.map((item) => {
              const isPending = item.status === 'Pending Planner';
              const isScheduled = item.status === 'Scheduled';
              const isRejected = item.status === 'Rejected';

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isPending 
                      ? 'border-amber-200 bg-amber-50/20 hover:border-amber-400' 
                      : isScheduled 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : 'border-slate-200 bg-slate-50/40 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-black text-xs rounded-lg">
                          {item.unitCode}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{item.unitName}</span>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider ${
                        isPending 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                          : isScheduled 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {isPending ? 'Menunggu Review Planner' : isScheduled ? 'Dijadwalkan WO' : 'Ditolak Planner'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white/80 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Mekanik Inspector:</span>
                        <strong className="text-slate-800 font-semibold">{item.inspectorName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Sistem Komponen:</span>
                        <strong className="text-slate-800 font-semibold">{item.systemCategory}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Tingkat Urgensi:</span>
                        <span className={`font-extrabold ${
                          item.urgency === 'Critical' ? 'text-rose-600' : item.urgency === 'Urgent' ? 'text-amber-600' : 'text-slate-700'
                        }`}>
                          {item.urgency}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Tanggal Inspeksi:</span>
                        <span className="font-mono text-slate-700 font-bold">{item.inspectionDate}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase font-mono text-slate-500 tracking-wider">Catatan Temuan:</span>
                      <p className="text-xs text-slate-800 font-medium bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                        {item.findings}
                      </p>
                    </div>

                    {item.recommendation && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase font-mono text-emerald-700 tracking-wider">Rekomendasi Perbaikan:</span>
                        <p className="text-xs text-emerald-900 font-medium bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                          {item.recommendation}
                        </p>
                      </div>
                    )}

                    {item.plannerNotes && (
                      <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Catatan Planner:</span>
                        <p className="italic">{item.plannerNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions for Planner */}
                  {isPending && activeSubTab === 'planner' && (
                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBacklog(item);
                          setProcessAction('approve');
                          setPlannerNotes(`Disetujui untuk penjadwalan WO berdasarkan temuan ${item.inspectorName}`);
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 size={14} />
                        <span>Setujui & Buat WO Plan</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedBacklog(item);
                          setProcessAction('reject');
                          setPlannerNotes('Ditolak: belum prioritas / dapat ditunda.');
                        }}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <XCircle size={14} />
                        <span>Tolak</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Input Hasil Inspeksi Mekanik */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="text-emerald-600" size={20} />
                <h3 className="text-base font-extrabold text-slate-900 uppercase font-mono">Input Catatan Inspeksi Mekanik</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">Pilih Unit Armada</label>
                <select
                  value={newUnitId}
                  onChange={(e) => setNewUnitId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.code} - {u.name} ({u.location})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">Nama Mekanik Inspector</label>
                  <select
                    value={newInspectorName}
                    onChange={(e) => setNewInspectorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {mechanics.map(m => (
                      <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">Sistem Komponen</label>
                  <select
                    value={newSystemCategory}
                    onChange={(e) => setNewSystemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Engine">Engine System</option>
                    <option value="Hydraulic">Hydraulic System</option>
                    <option value="Brakes">Brake System</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Electrical">Electrical System</option>
                    <option value="Undercarriage">Undercarriage</option>
                    <option value="Cabin & AC">Cabin & AC</option>
                    <option value="Structure">Structure & Attachment</option>
                    <option value="Other">Lain-Lain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">Tingkat Urgensi</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Routine', 'Urgent', 'Critical'] as const).map(urg => (
                    <button
                      type="button"
                      key={urg}
                      onClick={() => setNewUrgency(urg)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer font-mono ${
                        newUrgency === urg 
                          ? urg === 'Critical' ? 'bg-rose-600 text-white border-rose-600' : urg === 'Urgent' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">Catatan Hasil Temuan Pengecekan</label>
                <textarea
                  rows={3}
                  value={newFindings}
                  onChange={(e) => setNewFindings(e.target.value)}
                  placeholder="Jelaskan kondisi fisik atau gejala kerusakaannya (contoh: Kebocoran seal oli cylinder boom, suara berdecit pada fanbelt)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">Rekomendasi Tindakan Perbaikan</label>
                <textarea
                  rows={2}
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  placeholder="Rekomendasi suku cadang / perbaikan yang diperlukan..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold uppercase font-mono tracking-wider cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase font-mono tracking-wider shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Kirim Ke Planner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Review Backlog oleh Planner */}
      {selectedBacklog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="text-emerald-600" size={20} />
                <h3 className="text-base font-extrabold text-slate-900 uppercase font-mono">
                  Proses Review Backlog - {selectedBacklog.unitCode}
                </h3>
              </div>
              <button onClick={() => setSelectedBacklog(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Temuan oleh: <strong>{selectedBacklog.inspectorName}</strong></span>
                <span>Kategori: <strong>{selectedBacklog.systemCategory}</strong></span>
              </div>
              <p className="text-slate-800 font-semibold italic">"{selectedBacklog.findings}"</p>
            </div>

            <form onSubmit={handleProcessSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">Keputusan Planner</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProcessAction('approve')}
                    className={`py-2.5 rounded-xl text-xs font-extrabold uppercase font-mono tracking-wider border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      processAction === 'approve'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    <span>Setujui & WO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProcessAction('need_info')}
                    className={`py-2.5 rounded-xl text-xs font-extrabold uppercase font-mono tracking-wider border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      processAction === 'need_info'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <HelpCircle size={15} />
                    <span>Minta Detail Info</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProcessAction('reject')}
                    className={`py-2.5 rounded-xl text-xs font-extrabold uppercase font-mono tracking-wider border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      processAction === 'reject'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle size={15} />
                    <span>Tolak Temuan</span>
                  </button>
                </div>
              </div>

              {processAction === 'approve' && (
                <div className="space-y-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-extrabold uppercase font-mono text-emerald-800 tracking-wider block">Form Pembuatan Work Order Plan:</span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Rencana Work Order</label>
                      <input
                        type="date"
                        value={woDate}
                        onChange={(e) => setWoDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipe Servis</label>
                      <select
                        value={woServiceType}
                        onChange={(e) => setWoServiceType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      >
                        <option value="Repair">Repair / Perbaikan</option>
                        <option value="Periodic Service">Periodic Service</option>
                        <option value="Oil Change">Oil Change</option>
                        <option value="General Inspection">General Inspection</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Lokasi Workshop / Bay</label>
                    <input
                      type="text"
                      value={woWorkshop}
                      onChange={(e) => setWoWorkshop(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  {/* Multi-Mechanic Picker (Up to 3) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Pilih Mekanik Ditugaskan (Maks. 3):
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                      {mechanics.map(m => {
                        const isSelected = selectedMechanics.includes(m.name);
                        return (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => toggleMechanicSelection(m.name)}
                            className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between border cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' 
                                : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{m.name}</span>
                            {isSelected && <CheckCircle2 size={14} className="text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flat Rate inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Standard Flat Rate (Jam)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={flatRateHours}
                        onChange={(e) => setFlatRateHours(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Flat Rate Labor Cost (Rp)</label>
                      <input
                        type="number"
                        value={flatRateCost}
                        onChange={(e) => setFlatRateCost(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase font-mono text-slate-600 mb-1">
                  Catatan / Instruksi Planner
                </label>
                <textarea
                  rows={2}
                  value={plannerNotes}
                  onChange={(e) => setPlannerNotes(e.target.value)}
                  placeholder="Masukkan alasan atau petunjuk pekerjaan..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Discussion / Comment Thread & Photos Section */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase font-mono text-slate-700 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-emerald-600" />
                     Diskusi & Foto Lampiran Temuan ({selectedBacklog.comments?.length || 0})
                  </span>
                </div>

                {/* Display Photos if any */}
                {selectedBacklog.photos && selectedBacklog.photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedBacklog.photos.map((url, pIdx) => (
                      <a key={pIdx} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img src={url} alt="Temuan" className="w-16 h-16 object-cover rounded-xl border border-slate-200 hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Comment list */}
                <div className="max-h-36 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  {(!selectedBacklog.comments || selectedBacklog.comments.length === 0) ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">Belum ada komentar / foto tambahan.</p>
                  ) : (
                    selectedBacklog.comments.map((cmt) => (
                      <div key={cmt.id} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-bold text-slate-800">{cmt.senderName} ({cmt.senderRole})</span>
                          <span>{cmt.timestamp}</span>
                        </div>
                        <p className="text-slate-700 font-medium">{cmt.commentText}</p>
                        {cmt.photoUrl && (
                          <img src={cmt.photoUrl} alt="Foto Lampiran" className="mt-1 w-24 h-24 object-cover rounded-lg border border-slate-200" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Send Comment / Photo Form */}
                {onAddComment && (
                  <div className="flex flex-col gap-2 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex gap-2">
                      <select 
                        value={commentSenderRole} 
                        onChange={(e) => {
                          const r = e.target.value as any;
                          setCommentSenderRole(r);
                          setCommentSenderName(r === 'Planner' ? 'Planner Site' : r === 'Foreman' ? 'Foreman Workshop' : mechanics[0]?.name || 'Mekanik');
                        }}
                        className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold"
                      >
                        <option value="Planner">Planner</option>
                        <option value="Foreman">Foreman</option>
                        <option value="Mekanik">Mekanik</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Ketik komentar / detail pertanyaan..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                        <ImageIcon size={14} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="URL Foto / Image (opsional)..."
                          value={newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          className="w-full text-[11px] focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendCommentSubmit}
                        disabled={isSendingComment}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Send size={12} />
                        <span>Kirim</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBacklog(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold uppercase font-mono tracking-wider cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-extrabold uppercase font-mono tracking-wider shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? 'Memproses...' : 'Simpan Keputusan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
