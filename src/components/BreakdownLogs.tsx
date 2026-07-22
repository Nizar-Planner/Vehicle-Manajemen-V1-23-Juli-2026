/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  Clock, 
  User, 
  UserCheck, 
  Calendar, 
  Search,
  X,
  AlertOctagon,
  FileText,
  MapPin
} from 'lucide-react';
import { BreakdownLog, UioUnit } from '../types';

interface BreakdownLogsProps {
  breakdowns: BreakdownLog[];
  units: UioUnit[];
  onReportBreakdown: (payload: any) => Promise<void>;
  onResolveBreakdown: (id: string, payload: any) => Promise<void>;
}

export default function BreakdownLogs({ 
  breakdowns, 
  units, 
  onReportBreakdown, 
  onResolveBreakdown 
}: BreakdownLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  const [isReporting, setIsReporting] = useState(false);
  const [reportedUnitId, setReportedUnitId] = useState('');
  const [damageDescription, setDamageDescription] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [reportedBy, setReportedBy] = useState('');
  const [initialAction, setInitialAction] = useState('');

  // GPS Geolocation state
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);
  const [gpsAddress, setGpsAddress] = useState<string>('');
  const [isGettingGps, setIsGettingGps] = useState(false);

  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung Geolocation GPS');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLat(pos.coords.latitude);
        setGpsLng(pos.coords.longitude);
        setGpsAddress(`Lat: ${pos.coords.latitude.toFixed(6)}, Lng: ${pos.coords.longitude.toFixed(6)}`);
        setIsGettingGps(false);
      },
      (err) => {
        alert('Gagal mengambil koordinat GPS: ' + err.message);
        setIsGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Resolution Modal State
  const [resolveTarget, setResolveTarget] = useState<BreakdownLog | null>(null);
  const [finalAction, setFinalAction] = useState('');

  const severityOptions: Array<'Low' | 'Medium' | 'High' | 'Critical'> = ['Low', 'Medium', 'High', 'Critical'];

  // Filter logs
  const filteredBreakdowns = breakdowns.filter(b => {
    const matchesSearch = b.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.damageDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.actionTaken && b.actionTaken.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSeverity = selectedSeverity === 'All' || b.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportedUnitId) {
      alert('Harap pilih unit UIO yang mengalami kerusakan!');
      return;
    }
    if (!damageDescription) {
      alert('Harap masukkan deskripsi kerusakan secara detail!');
      return;
    }
    if (!reportedBy) {
      alert('Harap masukkan nama pelapor!');
      return;
    }

    try {
      await onReportBreakdown({
        unitId: reportedUnitId,
        damageDescription,
        severity,
        reportedBy,
        actionTaken: initialAction || null,
        gpsLocation: gpsLat && gpsLng ? {
          latitude: gpsLat,
          longitude: gpsLng,
          address: gpsAddress || `Lat: ${gpsLat}, Lng: ${gpsLng}`,
          googleMapsUrl: `https://www.google.com/maps?q=${gpsLat},${gpsLng}`
        } : undefined
      });

      setIsReporting(false);
      // Reset form fields
      setReportedUnitId('');
      setDamageDescription('');
      setSeverity('Medium');
      setReportedBy('');
      setInitialAction('');
      setGpsLat(null);
      setGpsLng(null);
      setGpsAddress('');
    } catch (err: any) {
      alert(err.message || 'Gagal melaporkan kerusakan');
    }
  };

  const handleResolveClick = (log: BreakdownLog) => {
    setResolveTarget(log);
    setFinalAction(log.actionTaken || '');
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTarget) return;
    if (!finalAction) {
      alert('Harap deskripsikan tindakan perbaikan yang telah dilakukan untuk menyelesaikan defek!');
      return;
    }

    try {
      await onResolveBreakdown(resolveTarget.id, {
        status: 'Resolved',
        actionTaken: finalAction
      });
      setResolveTarget(null);
    } catch (err: any) {
      alert(err.message || 'Gagal meresolusi kerusakan');
    }
  };

  const getSeverityStyle = (severity: BreakdownLog['severity']) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6" id="breakdowns-container">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="breakdowns-header">
        <div>
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Histori Kerusakan & Breakdown Log</h1>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">Pencatatan kerusakan unit, tingkat keparahan (severity), eskalasi penanganan, dan penyelesaian log teknis.</p>
        </div>
        <button
          onClick={() => setIsReporting(true)}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <AlertTriangle size={14} /> Laporkan Kerusakan (Breakdown)
        </button>
      </div>

      {/* Filtering Control Bar */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between" id="breakdowns-filters">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari kerusakan, unit, pelapor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900 font-sans"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Severity Dropdown */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-gray-900 font-sans uppercase font-bold"
          >
            <option value="All">Semua Keparahan (Severity)</option>
            <option value="Critical">Critical (Kritis)</option>
            <option value="High">High (Tinggi)</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-gray-900 font-sans uppercase font-bold"
          >
            <option value="All">Semua Status</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="On Repair">On Repair</option>
            <option value="Resolved">Resolved (Selesai)</option>
          </select>
        </div>
      </div>

      {/* Breakdown Timeline & Cards */}
      <div className="space-y-4" id="breakdowns-list">
        {filteredBreakdowns.length === 0 ? (
          <div className="py-16 text-center bg-white border border-gray-200 rounded-lg text-gray-500">
            <ShieldAlert className="mx-auto text-gray-300 mb-2" size={36} />
            <p className="font-bold text-xs uppercase tracking-wider">Tidak ada log kerusakan ditemukan</p>
            <p className="text-[11px] text-gray-400 mt-1">Gunakan form di kanan atas untuk mencatat kejadian breakdown baru.</p>
          </div>
        ) : (
          filteredBreakdowns.map(log => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-6 hover:border-gray-800 transition-colors" id={`breakdown-card-${log.id}`}>
              {/* Left Column: Details */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-gray-400">#{log.id}</span>
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-lg border ${getSeverityStyle(log.severity)}`}>
                    {log.severity.toUpperCase()}
                  </span>
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-lg border ${
                    log.status === 'Resolved' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  }`}>
                    {log.status === 'Resolved' ? 'RESOLVED' : log.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1 uppercase font-bold">
                    <Calendar size={11} /> {log.reportedDate}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                    Unit: <span className="text-blue-600">{log.unitCode}</span>
                  </h3>
                  <p className="text-xs text-gray-800 leading-relaxed font-sans font-semibold">
                    {log.damageDescription}
                  </p>
                </div>

                {/* Report and Action logs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Pelapor / Operator:</span>
                    <div className="flex items-center gap-1.5 text-gray-700 font-bold uppercase">
                      <User size={12} className="text-gray-400" />
                      <span>{log.reportedBy}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Tindakan / Action Taken:</span>
                    <div className="text-gray-700 italic">
                      {log.actionTaken ? (
                        <div className="flex items-start gap-1.5 font-sans not-italic text-gray-800 font-medium">
                          <FileText size={12} className="text-gray-400 shrink-0 mt-0.5" />
                          <span>{log.actionTaken}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium text-[11px]">Belum ada penanganan yang dilaporkan.</span>
                      )}
                    </div>
                  </div>
                </div>

                {log.resolvedDate && (
                  <div className="text-[9px] bg-emerald-50 text-emerald-800 px-2.5 py-1 border border-emerald-200 flex items-center gap-1.5 w-fit font-mono font-bold uppercase">
                    <UserCheck size={11} />
                    <span>RESOLVED DATE: <strong>{log.resolvedDate}</strong></span>
                  </div>
                )}
              </div>

              {/* Right Column: Actions */}
              <div className="shrink-0 self-end md:self-center">
                {log.status !== 'Resolved' && (
                  <button
                    onClick={() => handleResolveClick(log)}
                    className="flex items-center gap-1 bg-[#1A1C1E] hover:bg-[#2C2E33] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={11} /> Selesaikan Kerusakan
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: REPORT BREAKDOWN */}
      {isReporting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="report-breakdown-modal">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden my-8 border border-gray-300">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-rose-950 text-white">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                  <AlertOctagon className="text-rose-400 animate-bounce" size={16} /> Laporkan Breakdown / Kerusakan
                </h2>
                <p className="text-[10px] text-rose-200 font-mono uppercase tracking-wider mt-0.5">RECORD VEHICLE DEFECT LOG</p>
              </div>
              <button 
                onClick={() => setIsReporting(false)} 
                className="text-rose-300 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Select Unit */}
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pilih Unit UIO yang Bermasalah *</label>
                  <select
                    required
                    value={reportedUnitId}
                    onChange={(e) => setReportedUnitId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs focus:outline-none focus:border-gray-900 font-sans"
                  >
                    <option value="">-- Pilih Unit --</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.code} - {u.name} (Status Saat Ini: {u.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity Level */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tingkat Keparahan (Severity) *</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs focus:outline-none focus:border-gray-900 font-sans"
                  >
                    <option value="Low">Low (Defek minor, masih bisa beroperasi)</option>
                    <option value="Medium">Medium (Berisiko, perlu penanganan segera)</option>
                    <option value="High">High (Unit mati sebagian, butuh workshop)</option>
                    <option value="Critical">Critical (Unit mati total / No-Go!)</option>
                  </select>
                </div>

                {/* Reporter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama Pelapor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Nizar (Operator)"
                    value={reportedBy}
                    onChange={(e) => setReportedBy(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              {/* Damage Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deskripsi Kerusakan Unit *</label>
                <textarea
                  required
                  placeholder="Jelaskan kronologi, gejala visual/suara, atau alarm error yang menyala pada kabin..."
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                ></textarea>
              </div>

              {/* GPS Geolocation Storing */}
              <div className="space-y-1 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} className="text-rose-600" /> Deteksi Lokasi GPS Storing / Breakdown
                  </label>
                  <button
                    type="button"
                    onClick={handleGetGpsLocation}
                    disabled={isGettingGps}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white text-[10px] font-bold font-mono uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    {isGettingGps ? 'Mendeteksi GPS...' : '📍 Ambil Koordinat GPS Saat Ini'}
                  </button>
                </div>
                {gpsLat && gpsLng && (
                  <div className="mt-2 text-[10px] font-mono text-emerald-800 bg-white p-2 rounded-lg border border-emerald-300 flex items-center justify-between">
                    <span>📍 GPS Captured: Lat {gpsLat.toFixed(6)}, Lng {gpsLng.toFixed(6)}</span>
                    <a 
                      href={`https://www.google.com/maps?q=${gpsLat},${gpsLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-bold underline hover:text-blue-900"
                    >
                      Buka di Google Maps
                    </a>
                  </div>
                )}
              </div>

              {/* Initial action */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tindakan Sementara (Jika Ada)</label>
                <textarea
                  placeholder="Contoh: Unit diparkir aman di lokasi datar, kelistrikan dimatikan via emergency switch..."
                  value={initialAction}
                  onChange={(e) => setInitialAction(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                ></textarea>
              </div>

              {/* Form buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Kirim Laporan Kerusakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESOLVE BREAKDOWN */}
      {resolveTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="resolve-breakdown-modal">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden border border-gray-300">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#1A1C1E] text-white">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider">Penyelesaian Laporan Kerusakan</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">COMMIT DAMAGE RESOLUTION</p>
              </div>
              <button 
                onClick={() => setResolveTarget(null)} 
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitResolution} className="p-5 space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg text-[11px] space-y-1.5 border border-gray-200 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase font-bold text-[9px]">Log ID:</span>
                  <strong className="text-gray-900 font-bold">#{resolveTarget.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase font-bold text-[9px]">Unit:</span>
                  <strong className="text-gray-900 font-bold">{resolveTarget.unitCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase font-bold text-[9px]">Defek Dilaporkan:</span>
                  <span className="text-gray-700 max-w-[200px] truncate">{resolveTarget.damageDescription}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tindakan Perbaikan Final *</label>
                <textarea
                  required
                  placeholder="Contoh: Dilakukan penggantian gasket silinder radiator baru, flushing coolant, dan running test 30 menit. Hasil normal."
                  value={finalAction}
                  onChange={(e) => setFinalAction(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                ></textarea>
              </div>

              <p className="text-[10px] text-gray-400 italic font-medium">
                * Unit UIO yang terkait akan otomatis dialihkan kembali statusnya menjadi <strong className="text-emerald-700">Operating (Aktif)</strong> dari status Breakdown.
              </p>

              {/* Form buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setResolveTarget(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Tandai Selesai & Beroperasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
