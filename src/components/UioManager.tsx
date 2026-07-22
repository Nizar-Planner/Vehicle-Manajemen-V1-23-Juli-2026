/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Settings2, 
  MapPin, 
  Hammer, 
  ShieldAlert, 
  Compass, 
  Clock, 
  ChevronRight, 
  Activity, 
  FileCheck2, 
  CalendarClock, 
  Layers,
  Wrench,
  X,
  ArrowLeft,
  Printer,
  Download,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { UioUnit, RepairHistory, HmUpdateLog, WorkshopBooking, SparePart } from '../types';

interface UioManagerProps {
  units: UioUnit[];
  parts?: SparePart[];
  onAddUnit: (unitData: Partial<UioUnit>) => Promise<void>;
  onUpdateHm: (unitId: string, currentHm: number, currentKm?: number, notes?: string) => Promise<void>;
  onDeleteUnit: (unitId: string) => Promise<void>;
  repairs: RepairHistory[];
  hmLogs: HmUpdateLog[];
  bookings?: WorkshopBooking[];
}

export default function UioManager({ 
  units, 
  parts = [],
  onAddUnit, 
  onUpdateHm, 
  onDeleteUnit,
  repairs,
  hmLogs,
  bookings = []
}: UioManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Detail screen state
  const [selectedDetailUnit, setSelectedDetailUnit] = useState<UioUnit | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'repairs' | 'parts' | 'hm' | 'progress'>('repairs');
  const [showPrintModalUnit, setShowPrintModalUnit] = useState<UioUnit | null>(null);

  // Forms states
  const [isAdding, setIsAdding] = useState(false);
  const [newUnit, setNewUnit] = useState<Partial<UioUnit>>({
    code: '',
    name: '',
    category: 'Excavator',
    serialNumber: '',
    engineNumber: '',
    manufactureYear: new Date().getFullYear(),
    location: '',
    status: 'Operating',
    currentHm: 0,
    currentKm: 0,
    lastServiceHm: 0,
    lastOilChangeHm: 0,
    serviceInterval: 250,
    oilChangeInterval: 250,
    notes: '',
    photoUrl: ''
  });

  const [hmUpdateUnit, setHmUpdateUnit] = useState<UioUnit | null>(null);
  const [newHmValue, setNewHmValue] = useState<number>(0);
  const [newKmValue, setNewKmValue] = useState<number>(0);
  const [hmUpdateNotes, setHmUpdateNotes] = useState('');

  // Categories list
  const categories = ['All', 'Excavator', 'Bulldozer', 'Dump Truck', 'Wheel Loader', 'Light Vehicle', 'Other'];

  // Filter logic
  const filteredUnits = units.filter(u => {
    const matchesSearch = u.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.serialNumber && u.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (u.location && u.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || u.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || u.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSubmitNewUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAddUnit(newUnit);
      setIsAdding(false);
      // Reset form
      setNewUnit({
        code: '',
        name: '',
        category: 'Excavator',
        serialNumber: '',
        engineNumber: '',
        manufactureYear: new Date().getFullYear(),
        location: '',
        status: 'Operating',
        currentHm: 0,
        currentKm: 0,
        lastServiceHm: 0,
        lastOilChangeHm: 0,
        serviceInterval: 250,
        oilChangeInterval: 250,
        notes: '',
        photoUrl: ''
      });
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan unit');
    }
  };

  const handleOpenUpdateHm = (unit: UioUnit) => {
    setHmUpdateUnit(unit);
    setNewHmValue(unit.currentHm);
    setNewKmValue(unit.currentKm !== undefined ? unit.currentKm : (unit.currentHm * 2));
    setHmUpdateNotes('');
  };

  const handleSubmitHmUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hmUpdateUnit) return;
    
    if (newHmValue < hmUpdateUnit.currentHm) {
      alert(`Gagal Input HM: Update HM harus selalu bertambah! Nilai HM baru (${newHmValue}) tidak boleh berkurang atau lebih kecil dari HM saat ini (${hmUpdateUnit.currentHm}).`);
      return;
    }

    try {
      await onUpdateHm(hmUpdateUnit.id, newHmValue, newKmValue, hmUpdateNotes);
      setHmUpdateUnit(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui Hour Meter');
    }
  };

  const handleDeleteClick = async (unitId: string, unitCode: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus unit UIO [${unitCode}] dari sistem? Data sejarah terkait akan tetap terjaga di database.`)) {
      try {
        await onDeleteUnit(unitId);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus unit');
      }
    }
  };

  const handleExportCSV = (unit: UioUnit) => {
    const unitRepairs = repairs.filter(r => r.unitId === unit.id);
    const unitHmLogs = hmLogs.filter(h => h.unitId === unit.id);
    
    // Construct CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // 1. Unit Info
    csvContent += `LAPORAN SEJARAH & TRACEABILITY UNIT\r\n`;
    csvContent += `KODE UNIT,${unit.code}\r\n`;
    csvContent += `NAMA UNIT,${unit.name}\r\n`;
    csvContent += `S/N,${unit.serialNumber || "-"}\r\n`;
    csvContent += `ENGINE NO,${unit.engineNumber || "-"}\r\n`;
    csvContent += `STATUS SEKARANG,${unit.status}\r\n`;
    csvContent += `HM SEKARANG,${unit.currentHm}\r\n\r\n`;
    
    // 2. Repair History Section
    csvContent += `1. RIWAYAT PERBAIKAN & SERVIS\r\n`;
    csvContent += `ID REPAIR,TANGGAL,JENIS SERVIS,HM SERVIS,MEKANIK,DESKRIPSI,TOTAL BIAYA\r\n`;
    unitRepairs.forEach(r => {
      csvContent += `"${r.id}","${r.completionDate}","${r.serviceType}","${r.hmAtService}","${r.mechanicName}","${r.description.replace(/"/g, '""')}","Rp ${r.totalCost}"\r\n`;
    });
    csvContent += `\r\n`;

    // 3. Part Usage Section
    csvContent += `2. RIWAYAT PENGGUNAAN SUKU CADANG (PART)\r\n`;
    csvContent += `TANGGAL PERBAIKAN,KODE PART,NAMA PART,QTY,HARGA SATUAN,TOTAL BIAYA PART\r\n`;
    unitRepairs.forEach(r => {
      r.partsUsed.forEach(p => {
        csvContent += `"${r.completionDate}","${p.partCode}","${p.partName}","${p.quantity}","Rp ${p.price}","Rp ${p.price * p.quantity}"\r\n`;
      });
    });
    csvContent += `\r\n`;

    // 4. HM History Section
    csvContent += `3. RIWAYAT PERUBAHAN HOUR METER (HM)\r\n`;
    csvContent += `ID LOG,TANGGAL UPDATE,HM SEBELUMNYA,HM BARU,SELISIH HM,CATATAN/LOG\r\n`;
    unitHmLogs.forEach(h => {
      const diff = h.newHm - h.previousHm;
      csvContent += `"${h.id}","${h.updatedAt}","${h.previousHm}","${h.newHm}","+${diff}","${(h.notes || "").replace(/"/g, '""')}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Unit_${unit.code}_History.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintLaporan = (unit: UioUnit) => {
    setShowPrintModalUnit(unit);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Status Styling Helper
  const getStatusStyle = (status: UioUnit['status']) => {
    switch (status) {
      case 'Operating':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Standby':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Breakdown':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (selectedDetailUnit) {
    const unit = units.find(u => u.id === selectedDetailUnit.id) || selectedDetailUnit;
    const unitRepairs = repairs.filter(r => r.unitId === unit.id);
    const unitHmLogs = hmLogs.filter(h => h.unitId === unit.id);
    const unitBookings = bookings.filter(b => b.unitId === unit.id);
    
    // Combine completed repairs with active bookings
    const activeBookings = unitBookings.filter(b => b.status !== 'Completed');
    
    const completedRepairsMapped = unitRepairs.map(r => ({
      id: r.id,
      date: r.completionDate,
      serviceType: r.serviceType,
      hmAtService: r.hmAtService,
      mechanicName: r.mechanicName,
      description: r.description,
      totalCost: r.totalCost,
      status: 'Completed'
    }));

    const activeBookingsMapped = activeBookings.map(b => ({
      id: `WO-${b.id}`,
      date: b.bookingDate,
      serviceType: b.serviceType,
      hmAtService: b.hmAtBooking || b.targetHm,
      mechanicName: b.mechanicName || 'Belum Ditunjuk',
      description: `[AKTIF WO] ${b.complaint || b.notes || 'Pekerjaan bengkel aktif.'}`,
      totalCost: b.totalCost,
      status: b.status // 'Pending' or 'In Progress'
    }));

    const combinedRepairs = [...completedRepairsMapped, ...activeBookingsMapped];

    // Combine parts used from completed repairs and active bookings
    const completedPartsUsed = unitRepairs.flatMap(r => 
      r.partsUsed.map(p => ({
        date: r.completionDate,
        mechanic: r.mechanicName,
        repairId: r.id,
        partCode: p.partCode,
        partName: p.partName,
        quantity: p.quantity,
        price: p.price,
        totalPrice: p.price * p.quantity,
        status: 'Completed'
      }))
    );

    const activePartsUsed = activeBookings.flatMap(b => 
      b.partsUsed.map(p => {
        const foundPart = parts?.find(sp => sp.id === p.partId);
        return {
          date: b.bookingDate,
          mechanic: b.mechanicName || 'Belum Ditunjuk',
          repairId: `WO-${b.id}`,
          partCode: foundPart ? foundPart.code : 'UNKNOWN',
          partName: foundPart ? foundPart.name : 'Unknown Part',
          quantity: p.quantity,
          price: p.priceAtSale || (foundPart ? foundPart.price : 0),
          totalPrice: (p.priceAtSale || (foundPart ? foundPart.price : 0)) * p.quantity,
          status: b.status
        };
      })
    );

    const unitPartsUsed = [...completedPartsUsed, ...activePartsUsed];

    return (
      <div className="space-y-6 animate-fadeIn" id="unit-detail-screen">
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <button 
            onClick={() => setSelectedDetailUnit(null)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer font-sans"
          >
            <ArrowLeft size={14} /> Kembali ke Daftar Armada
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleExportCSV(unit)}
              className="flex items-center gap-1.5 border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer font-sans"
            >
              <FileSpreadsheet size={14} /> Export CSV
            </button>
            <button
              onClick={() => handlePrintLaporan(unit)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer font-sans"
            >
              <Printer size={14} /> Cetak Laporan Unit
            </button>
          </div>
        </div>

        {/* Unit Identity Panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-4 items-center">
              {unit.photoUrl && (
                <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden shrink-0 shadow-2xs">
                  <img src={unit.photoUrl} alt={unit.code} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase">{unit.category}</span>
                <h2 className="text-xl font-black text-gray-900 tracking-tight font-mono uppercase">{unit.code} &mdash; {unit.name}</h2>
                <div className="flex items-center gap-1 text-gray-500 mt-1.5 text-xs">
                  <MapPin size={13} className="text-gray-400" />
                  <span className="uppercase font-bold text-[11px] tracking-wide">LOKASI: {unit.location || "SITE MARO"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-6 items-center shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">OPERATIONAL HOUR METER</span>
                <span className="text-2xl font-black font-mono text-gray-900 tracking-tight">{unit.currentHm.toLocaleString()} <span className="text-sm text-gray-400 font-bold">HM</span></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">KILOMETER</span>
                <span className="text-2xl font-black font-mono text-gray-900 tracking-tight">{(unit.currentKm !== undefined ? unit.currentKm : (unit.currentHm * 2)).toLocaleString()} <span className="text-sm text-gray-400 font-bold">KM</span></span>
              </div>
              <span className={`text-xs font-bold font-mono uppercase px-3 py-1.5 border rounded-lg ${getStatusStyle(unit.status)}`}>
                {unit.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-dashed border-gray-100 text-xs">
            <div className="space-y-0.5">
              <span className="text-gray-400 uppercase font-mono font-bold text-[9px] tracking-wider">Serial Number (S/N):</span>
              <p className="font-bold text-gray-800 font-mono">{unit.serialNumber || "-"}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-gray-400 uppercase font-mono font-bold text-[9px] tracking-wider">Engine Number:</span>
              <p className="font-bold text-gray-800 font-mono">{unit.engineNumber || "-"}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-gray-400 uppercase font-mono font-bold text-[9px] tracking-wider">Tahun Pembuatan:</span>
              <p className="font-bold text-gray-800">{unit.manufactureYear}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-gray-400 uppercase font-mono font-bold text-[9px] tracking-wider">Interval Servis Berkala:</span>
              <p className="font-bold text-gray-800">{unit.serviceInterval} HM / Ganti Oli {unit.oilChangeInterval} HM</p>
            </div>
          </div>
        </div>

        {/* Traceability Tables Dashboard */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          {/* Tab Selector */}
          <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setDetailActiveTab('repairs')}
              className={`flex-1 sm:flex-initial px-5 py-3 border-r border-gray-200 font-sans cursor-pointer transition-colors ${
                detailActiveTab === 'repairs' 
                  ? 'bg-white border-t-2 border-blue-600 text-blue-700 font-black' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Riwayat Perbaikan ({combinedRepairs.length})
            </button>
            <button
              onClick={() => setDetailActiveTab('parts')}
              className={`flex-1 sm:flex-initial px-5 py-3 border-r border-gray-200 font-sans cursor-pointer transition-colors ${
                detailActiveTab === 'parts' 
                  ? 'bg-white border-t-2 border-blue-600 text-blue-700 font-black' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Konsumsi Suku Cadang ({unitPartsUsed.length})
            </button>
            <button
              onClick={() => setDetailActiveTab('hm')}
              className={`flex-1 sm:flex-initial px-5 py-3 border-r border-gray-200 font-sans cursor-pointer transition-colors ${
                detailActiveTab === 'hm' 
                  ? 'bg-white border-t-2 border-blue-600 text-blue-700 font-black' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Log Perubahan HM ({unitHmLogs.length})
            </button>
            <button
              onClick={() => setDetailActiveTab('progress')}
              className={`flex-1 sm:flex-initial px-5 py-3 border-r border-gray-200 font-sans cursor-pointer transition-colors ${
                detailActiveTab === 'progress' 
                  ? 'bg-white border-t-2 border-blue-600 text-blue-700 font-black' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Progress Kerja ({unitBookings.filter(b => b.status === 'Pending' || b.status === 'In Progress').length})
            </button>
          </div>

          <div className="p-5 overflow-x-auto">
            {/* RIWAYAT PERBAIKAN TAB */}
            {detailActiveTab === 'repairs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Daftar Pekerjaan Servis & Perbaikan</h3>
                </div>

                {combinedRepairs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200">
                    <Layers className="mx-auto text-gray-300 mb-2" size={24} />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">Belum ada riwayat perbaikan</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Seluruh penyelesaian work order akan terakumulasi otomatis di sini.</p>
                  </div>
                ) : (
                  <table className="w-full text-xs text-left text-gray-700 font-sans min-w-[700px]">
                    <thead className="text-[10px] uppercase bg-gray-50 text-gray-500 border border-gray-200 font-mono font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Tanggal</th>
                        <th className="px-4 py-2.5">ID / Ref Kerja</th>
                        <th className="px-4 py-2.5">Jenis Servis</th>
                        <th className="px-4 py-2.5">HM Servis</th>
                        <th className="px-4 py-2.5">Mekanik</th>
                        <th className="px-4 py-2.5">Deskripsi</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Total Biaya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 border border-gray-200 font-sans">
                      {combinedRepairs.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-mono font-bold whitespace-nowrap">{r.date}</td>
                          <td className="px-4 py-3 font-mono font-bold text-blue-700">{r.id}</td>
                          <td className="px-4 py-3">
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 font-bold uppercase tracking-wide text-[10px]">
                              {r.serviceType}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold">{r.hmAtService} HM</td>
                          <td className="px-4 py-3 font-bold uppercase text-gray-800">{r.mechanicName}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={r.description}>{r.description}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 border rounded-md uppercase whitespace-nowrap ${
                              r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              r.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">Rp {r.totalCost.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* KONSUMSI SUKU CADANG TAB */}
            {detailActiveTab === 'parts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Detail Penggunaan & Suku Cadang Habis Pakai</h3>
                </div>

                {unitPartsUsed.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200">
                    <Wrench className="mx-auto text-gray-300 mb-2" size={24} />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">Tidak ada suku cadang terpakai</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Suku cadang yang dipasang saat perbaikan otomatis tercatat di sini.</p>
                  </div>
                ) : (
                  <table className="w-full text-xs text-left text-gray-700 font-sans min-w-[700px]">
                    <thead className="text-[10px] uppercase bg-gray-50 text-gray-500 border border-gray-200 font-mono font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Tanggal</th>
                        <th className="px-4 py-2.5">Kode Part</th>
                        <th className="px-4 py-2.5">Nama Suku Cadang</th>
                        <th className="px-4 py-2.5">Qty</th>
                        <th className="px-4 py-2.5 text-right">Harga Satuan</th>
                        <th className="px-4 py-2.5 text-right">Subtotal</th>
                        <th className="px-4 py-2.5">Mekanik</th>
                        <th className="px-4 py-2.5">Ref Kerja</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 border border-gray-200">
                      {unitPartsUsed.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap">{p.date}</td>
                          <td className="px-4 py-3 font-mono font-bold uppercase text-gray-900">{p.partCode}</td>
                          <td className="px-4 py-3 uppercase text-gray-600 font-bold">{p.partName}</td>
                          <td className="px-4 py-3 font-mono font-black text-gray-900">x{p.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono">Rp {p.price.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">Rp {p.totalPrice.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-gray-700 font-semibold">{p.mechanic}</td>
                          <td className="px-4 py-3 font-mono text-blue-700 font-bold">{p.repairId}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 border rounded-md uppercase whitespace-nowrap ${
                              p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              p.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* LOG PERUBAHAN HM & KM TAB */}
            {detailActiveTab === 'hm' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Log Transparansi Perubahan Hour Meter (HM) & Kilometer (KM)</h3>
                </div>

                {unitHmLogs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200">
                    <Clock className="mx-auto text-gray-300 mb-2" size={24} />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">Belum ada Log update HM / KM</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Riwayat pembaruan HM & KM baik manual maupun otomatis akan tersimpan di sini.</p>
                  </div>
                ) : (
                  <table className="w-full text-xs text-left text-gray-700 font-sans min-w-[700px]">
                    <thead className="text-[10px] uppercase bg-gray-50 text-gray-500 border border-gray-200 font-mono font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Tanggal Update</th>
                        <th className="px-4 py-2.5">ID Log</th>
                        <th className="px-4 py-2.5">HM (Lama &rarr; Baru)</th>
                        <th className="px-4 py-2.5">KM (Lama &rarr; Baru)</th>
                        <th className="px-4 py-2.5">Akumulasi Selisih</th>
                        <th className="px-4 py-2.5">Catatan Log Aktivitas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 border border-gray-200 font-mono">
                      {unitHmLogs.map((h) => {
                        const hmDiff = h.newHm - h.previousHm;
                        const prevKm = h.previousKm !== undefined ? h.previousKm : (h.previousHm * 2);
                        const newKm = h.newKm !== undefined ? h.newKm : (h.newHm * 2);
                        const kmDiff = newKm - prevKm;
                        return (
                          <tr key={h.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-bold whitespace-nowrap">{h.updatedAt}</td>
                            <td className="px-4 py-3 font-bold text-slate-500">{h.id}</td>
                            <td className="px-4 py-3">
                              <span className="text-gray-400">{h.previousHm.toLocaleString()}</span> &rarr; <span className="font-bold text-gray-900">{h.newHm.toLocaleString()} HM</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-gray-400">{prevKm.toLocaleString()}</span> &rarr; <span className="font-bold text-gray-900">{newKm.toLocaleString()} KM</span>
                            </td>
                            <td className="px-4 py-3 font-black text-emerald-600">
                              {hmDiff > 0 ? `+${hmDiff.toLocaleString()} HM` : '0 HM'}
                              {kmDiff > 0 ? ` (${kmDiff.toLocaleString()} KM)` : ''}
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-sans uppercase font-bold text-[10px]">{h.notes || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* PROGRESS KERJA AKTIF TAB */}
            {detailActiveTab === 'progress' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono text-slate-800">Daftar Service & Progress Kerja Bengkel Aktif</h3>
                </div>

                {unitBookings.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200">
                    <Activity className="mx-auto text-gray-300 mb-2" size={24} />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">Belum ada booking atau work order aktif</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Seluruh pemesanan servis berkala yang sedang diproses admin atau mekanik akan tampil di sini.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {unitBookings.map((b) => (
                      <div key={b.id} className="border border-gray-200 p-4 bg-gray-50/50 space-y-4 rounded-xl">
                        <div className="flex justify-between items-start flex-wrap gap-2 border-b border-gray-200 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-gray-900">WO ID: #{b.id}</span>
                              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded-md uppercase ${
                                b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                b.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                Status WO: {b.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">Jenis Servis: <strong className="text-gray-800">{b.serviceType}</strong> | Tanggal: <strong>{b.bookingDate}</strong></p>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">Progress Lapangan</span>
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 border rounded-md uppercase ${
                              b.progressStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              b.progressStatus === 'Ready for Pickup' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                              b.progressStatus === 'On Repair' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              b.progressStatus === 'Waiting for Parts' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {b.progressStatus || 'ADMIN PROCESSING'}
                            </span>
                          </div>
                        </div>

                        {/* Timeline of progress logs inside this booking */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Kronologi Progress Update (Timeline)</h4>
                          
                          {(!b.progressLogs || b.progressLogs.length === 0) ? (
                            <p className="text-[11px] text-gray-400 italic font-mono uppercase">Belum ada kronologi progress terdokumentasi untuk pekerjaan ini.</p>
                          ) : (
                            <div className="relative pl-5 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-gray-200 space-y-3">
                              {b.progressLogs.map((log) => (
                                <div key={log.id} className="relative text-[11px] space-y-0.5">
                                  {/* timeline dot */}
                                  <div className="absolute -left-[17px] top-1 w-2 h-2 bg-gray-400 border border-white rounded-full"></div>
                                  
                                  <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                                    <span className="font-mono text-gray-400 font-bold">{log.timestamp}</span>
                                    <span className="font-bold text-gray-600 uppercase border border-gray-200 px-1 py-0.2 bg-white text-[9px]">{log.status}</span>
                                    <span className="text-gray-400">oleh: <strong className="text-gray-700 uppercase font-bold">{log.updatedBy}</strong></span>
                                  </div>
                                  <p className="text-gray-800 uppercase font-semibold pl-2 py-1 bg-white border border-gray-100">
                                    "{log.notes}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="uio-manager-container">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="uio-header">
        <div>
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Database Armada UIO</h1>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider font-semibold">Kelola seluruh Unit In Operation (UIO), pantau lifetime Hour Meter (HM), dan lacak kelayakan servis berkala.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-[#1A1C1E] hover:bg-[#2C2E33] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
        >
          <Plus size={14} /> Registrasi Unit Baru
        </button>
      </div>

      {/* Search & Filtering Control Rail */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 justify-between shadow-xs" id="filter-rail">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari Kode Unit, Nama, SN, Lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900 font-sans"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-1">
            <Settings2 size={13} /> Filter:
          </div>
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none font-bold uppercase tracking-wider text-gray-700"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'Semua Kategori' : c.toUpperCase()}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none font-bold uppercase tracking-wider text-gray-700"
          >
            <option value="All">SEMUA STATUS</option>
            <option value="Operating">OPERATING (AKTIF)</option>
            <option value="Standby">STANDBY (SIAGA)</option>
            <option value="Under Maintenance">UNDER MAINTENANCE</option>
            <option value="Breakdown">BREAKDOWN</option>
          </select>
        </div>
      </div>

      {/* Registered Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="fleet-grid">
        {filteredUnits.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-gray-200 rounded-xl shadow-xs">
            <Layers className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="font-bold text-xs uppercase tracking-wider">Tidak ada unit UIO ditemukan</p>
            <p className="text-[11px] text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        ) : (
          filteredUnits.map(unit => {
            return (
              <div 
                key={unit.id} 
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button')) return;
                  setSelectedDetailUnit(unit);
                }}
                className="bg-white border border-gray-200 rounded-xl p-3.5 hover:border-blue-500 hover:shadow-md transition-all relative overflow-hidden flex gap-4 cursor-pointer group shadow-2xs" 
                id={`unit-card-${unit.id}`}
              >
                {/* Small Left Thumbnail */}
                <div className="w-20 h-20 bg-gray-50 border border-gray-150 rounded-lg shrink-0 overflow-hidden flex items-center justify-center relative">
                  {unit.photoUrl ? (
                    <img 
                      src={unit.photoUrl} 
                      alt={unit.code} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <Layers size={24} />
                      <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{unit.category}</span>
                    </div>
                  )}
                </div>

                {/* Right details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-gray-950 text-sm font-mono tracking-tight group-hover:text-blue-600 transition-colors uppercase truncate">
                        {unit.code}
                      </h3>
                      <span className={`text-[8px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-md border shrink-0 ${getStatusStyle(unit.status)}`}>
                        {unit.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase leading-none truncate mt-0.5">{unit.name}</p>
                  </div>

                  {/* HM & KM side-by-side - Clean list format */}
                  <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-1.5 mt-1.5 text-[11px] font-mono">
                    <div>
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">HOUR METER</span>
                      <span className="font-bold text-gray-800">{unit.currentHm?.toLocaleString() || 0} HM</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">KILOMETER</span>
                      <span className="font-bold text-gray-800">{(unit.currentKm !== undefined ? unit.currentKm : (unit.currentHm * 2))?.toLocaleString() || 0} KM</span>
                    </div>
                  </div>

                  {/* Quick Compact Action buttons */}
                  <div className="flex items-center justify-between gap-1 border-t border-gray-100 pt-1.5 mt-1.5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedDetailUnit(unit)}
                        className="flex items-center gap-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        title="Lihat Detail & Lacak History"
                      >
                        <History size={10} /> Detail
                      </button>
                      <button
                        onClick={() => handleOpenUpdateHm(unit)}
                        className="flex items-center gap-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        title="Update HM / KM"
                      >
                        <Activity size={10} /> Update
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteClick(unit.id, unit.code)}
                      className="p-1 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Hapus Unit"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
 
      {/* MODAL 1: REGISTRASI UNIT BARU */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn" id="add-unit-modal">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl overflow-hidden my-8 border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#1A1C1E] text-white">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider">Registrasi Unit UIO Baru</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">CREATE TELEMETRY TRACKING PROFILE</p>
              </div>
              <button 
                onClick={() => setIsAdding(false)} 
                className="text-gray-400 hover:text-white p-1 cursor-pointer rounded-full hover:bg-gray-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
 
            <form onSubmit={handleSubmitNewUnit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kode Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: EXCA-02, DUMP-09"
                    value={newUnit.code}
                    onChange={(e) => setNewUnit({ ...newUnit, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900 font-mono uppercase"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama / Model Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Komatsu PC200-8"
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
 
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kategori Unit</label>
                  <select
                    value={newUnit.category}
                    onChange={(e) => setNewUnit({ ...newUnit, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs focus:outline-none focus:border-gray-900"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
 
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lokasi Penempatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Site Maro Timur"
                    value={newUnit.location}
                    onChange={(e) => setNewUnit({ ...newUnit, location: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
 
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Serial Number (S/N)</label>
                  <input
                    type="text"
                    placeholder="S/N rangka sasis"
                    value={newUnit.serialNumber}
                    onChange={(e) => setNewUnit({ ...newUnit, serialNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-gray-900"
                  />
                </div>
 
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Engine Number</label>
                  <input
                    type="text"
                    placeholder="Nomor blok mesin"
                    value={newUnit.engineNumber}
                    onChange={(e) => setNewUnit({ ...newUnit, engineNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-gray-900"
                  />
                </div>
 
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tahun Pembuatan</label>
                  <input
                    type="number"
                    value={newUnit.manufactureYear}
                    onChange={(e) => setNewUnit({ ...newUnit, manufactureYear: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                  />
                </div>
 
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status Awal</label>
                  <select
                    value={newUnit.status}
                    onChange={(e) => setNewUnit({ ...newUnit, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs focus:outline-none focus:border-gray-900"
                  >
                    <option value="Operating">Operating</option>
                    <option value="Standby">Standby</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Breakdown">Breakdown</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-full md:col-span-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Foto Unit (Upload)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewUnit({ ...newUnit, photoUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-950 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                  />
                  {newUnit.photoUrl && (
                    <div className="mt-1.5 flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-150">
                      <img src={newUnit.photoUrl} alt="Preview" className="w-10 h-10 object-cover rounded border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => setNewUnit({ ...newUnit, photoUrl: '' })}
                        className="text-[9px] font-bold text-rose-600 hover:text-rose-700 uppercase"
                      >
                        Hapus Foto
                      </button>
                    </div>
                  )}
                </div>
              </div>
 
              <div className="border-t border-gray-200 pt-3 mt-1">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">KONFIGURASI JADWAL & LIFETIME</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current HM *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newUnit.currentHm}
                      onChange={(e) => setNewUnit({ 
                        ...newUnit, 
                        currentHm: Number(e.target.value),
                        lastServiceHm: Number(e.target.value),
                        lastOilChangeHm: Number(e.target.value)
                      })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current KM *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newUnit.currentKm || 0}
                      onChange={(e) => setNewUnit({ 
                        ...newUnit, 
                        currentKm: Number(e.target.value)
                      })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                    />
                  </div>
 
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Interval Servis (HM)</label>
                    <input
                      type="number"
                      required
                      min="50"
                      value={newUnit.serviceInterval}
                      onChange={(e) => setNewUnit({ ...newUnit, serviceInterval: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                    />
                  </div>
 
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Interval Oli (HM)</label>
                    <input
                      type="number"
                      required
                      min="50"
                      value={newUnit.oilChangeInterval}
                      onChange={(e) => setNewUnit({ ...newUnit, oilChangeInterval: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Catatan Tambahan</label>
                <textarea
                  placeholder="Kondisi awal, riwayat kerusakan lama, dsb..."
                  value={newUnit.notes}
                  onChange={(e) => setNewUnit({ ...newUnit, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                ></textarea>
              </div>
 
              <div className="flex gap-2 justify-end pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A1C1E] hover:bg-[#2C2E33] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Simpan Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      {/* MODAL 2: UPDATE HOUR METER (HM) */}
      {hmUpdateUnit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="update-hm-modal">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 font-sans">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#1A1C1E] text-white">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider">Update Hour Meter (HM) / KM</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">SYNCHRONIZE UNIT OPERATIONAL HOURS</p>
              </div>
              <button 
                onClick={() => setHmUpdateUnit(null)} 
                className="text-gray-400 hover:text-white p-1 cursor-pointer rounded-full hover:bg-gray-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
 
            <form onSubmit={handleSubmitHmUpdate} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl text-[11px] space-y-1.5 border border-gray-150 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase font-bold text-[9px]">Unit:</span>
                  <strong className="text-gray-900">{hmUpdateUnit.code} - {hmUpdateUnit.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase font-bold text-[9px]">HM Terakhir:</span>
                  <strong className="text-gray-900">{hmUpdateUnit.currentHm} HM</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase font-bold text-[9px]">Terakhir Servis Rutin:</span>
                  <strong className="text-gray-900">{hmUpdateUnit.lastServiceHm} HM</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase font-bold text-[9px]">Terakhir Ganti Oli:</span>
                  <strong className="text-gray-900">{hmUpdateUnit.lastOilChangeHm} HM</strong>
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hour Meter (HM) Baru *</label>
                  <input
                    type="number"
                    required
                    min={hmUpdateUnit.currentHm}
                    value={newHmValue}
                    onChange={(e) => setNewHmValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold font-mono text-gray-800 focus:outline-none focus:border-gray-900"
                  />
                  <p className="text-[9px] text-gray-400 italic">HM tidak boleh &lt; {hmUpdateUnit.currentHm}.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kilometer (KM) Baru *</label>
                  <input
                    type="number"
                    required
                    min={hmUpdateUnit.currentKm || 0}
                    value={newKmValue}
                    onChange={(e) => setNewKmValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold font-mono text-gray-800 focus:outline-none focus:border-gray-900"
                  />
                  <p className="text-[9px] text-gray-400 italic">KM tidak boleh &lt; {hmUpdateUnit.currentKm || 0}.</p>
                </div>
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Log Aktivitas Operasional</label>
                <textarea
                  placeholder="Contoh: Unit beroperasi aman di sektor barat, dilaporkan oleh operator."
                  value={hmUpdateNotes}
                  onChange={(e) => setHmUpdateNotes(e.target.value)}
                  rows={2.5}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                ></textarea>
              </div>
 
              <div className="flex gap-2 justify-end pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setHmUpdateUnit(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A1C1E] hover:bg-[#2C2E33] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  Simpan HM Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL CETAK LAPORAN TRACEABILITY UNIT */}
      {showPrintModalUnit && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl" id="printable-unit-report">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3 no-print">
              <div>
                <span className="text-[10px] font-black font-mono text-slate-400 uppercase">DOKUMEN RESMI LAPORAN UNIT</span>
                <h3 className="text-lg font-black font-mono text-slate-900 uppercase">
                  {showPrintModalUnit.code} &mdash; {showPrintModalUnit.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Printer size={15} />
                  <span>Cetak Langsung / Save PDF</span>
                </button>
                <button 
                  onClick={() => setShowPrintModalUnit(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 cursor-pointer rounded-full hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4 font-sans text-xs text-slate-800">
              <div className="border-b-2 border-slate-800 pb-3">
                <h1 className="text-lg font-black font-mono uppercase text-slate-900">
                  LAPORAN RIWAYAT & TRACEABILITY ARMADA UIO
                </h1>
                <p className="text-[11px] font-mono text-slate-500 uppercase mt-0.5">
                  Sistem Informasi FleetCare Site Maro &bull; Tanggal Cetak: {new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID')}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                <div><span className="text-slate-400 block font-mono uppercase text-[9px]">Kode Unit:</span> <strong className="text-slate-900 font-mono text-xs">{showPrintModalUnit.code}</strong></div>
                <div><span className="text-slate-400 block font-mono uppercase text-[9px]">Model / Name:</span> <strong className="text-slate-900">{showPrintModalUnit.name}</strong></div>
                <div><span className="text-slate-400 block font-mono uppercase text-[9px]">Kategori:</span> <strong className="text-slate-900">{showPrintModalUnit.category}</strong></div>
                <div><span className="text-slate-400 block font-mono uppercase text-[9px]">Hour Meter (HM):</span> <strong className="text-emerald-700 font-mono">{showPrintModalUnit.currentHm.toLocaleString()} HM</strong></div>
                <div><span className="text-slate-400 block font-mono uppercase text-[9px]">Status Unit:</span> <strong className="text-blue-700">{showPrintModalUnit.status}</strong></div>
                <div><span className="text-slate-400 block font-mono uppercase text-[9px]">Serial Number:</span> <strong>{showPrintModalUnit.serialNumber || '-'}</strong></div>
                <div><span className="text-slate-400 block font-mono uppercase text-[9px]">Lokasi Penempatan:</span> <strong>{showPrintModalUnit.location || '-'}</strong></div>
                <div><span className="text-slate-400 block font-mono uppercase text-[9px]">Tahun Pembuatan:</span> <strong>{showPrintModalUnit.manufactureYear || '-'}</strong></div>
              </div>

              {/* 1. Repair History */}
              <div className="space-y-1.5 pt-2">
                <h2 className="text-xs font-black font-mono uppercase text-slate-900 border-l-4 border-slate-900 pl-2">
                  1. Riwayat Perbaikan & Servis Workshop
                </h2>
                {repairs.filter(r => r.unitId === showPrintModalUnit.id).length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] p-2 bg-slate-50 rounded-lg">Belum ada riwayat perbaikan terdaftar.</p>
                ) : (
                  <table className="w-full text-left text-[11px] font-mono border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-900 text-white font-bold text-[10px]">
                      <tr>
                        <th className="p-2">Tanggal</th>
                        <th className="p-2">ID Repair</th>
                        <th className="p-2">Jenis Servis</th>
                        <th className="p-2">HM Servis</th>
                        <th className="p-2">Mekanik</th>
                        <th className="p-2 text-right">Biaya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {repairs.filter(r => r.unitId === showPrintModalUnit.id).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-bold">{r.completionDate}</td>
                          <td className="p-2 text-slate-600">{r.id}</td>
                          <td className="p-2">{r.serviceType}</td>
                          <td className="p-2 font-bold">{r.hmAtService} HM</td>
                          <td className="p-2">{r.mechanicName}</td>
                          <td className="p-2 text-right font-bold text-emerald-700">Rp {r.totalCost.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* 2. Parts Used History */}
              <div className="space-y-1.5 pt-2">
                <h2 className="text-xs font-black font-mono uppercase text-slate-900 border-l-4 border-slate-900 pl-2">
                  2. Riwayat Konsumsi Suku Cadang (Part Gudang)
                </h2>
                {repairs.filter(r => r.unitId === showPrintModalUnit.id).flatMap(r => r.partsUsed).length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] p-2 bg-slate-50 rounded-lg">Belum ada konsumsi suku cadang terdaftar.</p>
                ) : (
                  <table className="w-full text-left text-[11px] font-mono border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-900 text-white font-bold text-[10px]">
                      <tr>
                        <th className="p-2">Tanggal</th>
                        <th className="p-2">Kode Part</th>
                        <th className="p-2">Nama Part</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Harga Satuan</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {repairs.filter(r => r.unitId === showPrintModalUnit.id).flatMap(r => r.partsUsed.map(p => ({ ...p, date: r.completionDate }))).map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-bold">{p.date}</td>
                          <td className="p-2 text-slate-600">{p.partCode}</td>
                          <td className="p-2">{p.partName}</td>
                          <td className="p-2 text-center font-bold">{p.quantity}</td>
                          <td className="p-2 text-right">Rp {p.price.toLocaleString('id-ID')}</td>
                          <td className="p-2 text-right font-bold text-emerald-700">Rp {(p.price * p.quantity).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* 3. HM Update Logs */}
              <div className="space-y-1.5 pt-2">
                <h2 className="text-xs font-black font-mono uppercase text-slate-900 border-l-4 border-slate-900 pl-2">
                  3. Log Perubahan Hour Meter (HM/KM)
                </h2>
                {hmLogs.filter(h => h.unitId === showPrintModalUnit.id).length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] p-2 bg-slate-50 rounded-lg">Belum ada log perubahan HM terdaftar.</p>
                ) : (
                  <table className="w-full text-left text-[11px] font-mono border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-900 text-white font-bold text-[10px]">
                      <tr>
                        <th className="p-2">Waktu Log</th>
                        <th className="p-2">HM Lama</th>
                        <th className="p-2">HM Baru</th>
                        <th className="p-2">Selisih</th>
                        <th className="p-2">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {hmLogs.filter(h => h.unitId === showPrintModalUnit.id).map((h, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-bold">{h.updatedAt}</td>
                          <td className="p-2 text-slate-500">{h.previousHm} HM</td>
                          <td className="p-2 font-bold text-emerald-700">{h.newHm} HM</td>
                          <td className="p-2 font-bold text-blue-700">+{h.newHm - h.previousHm} HM</td>
                          <td className="p-2 text-slate-600">{h.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-mono text-center">
                Sistem Informasi Management FleetCare Pro &bull; Laporan Resmi Traceability
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 no-print">
              <button
                onClick={() => setShowPrintModalUnit(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
