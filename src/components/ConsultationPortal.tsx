import React, { useState } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  Wrench, 
  AlertCircle, 
  Bot, 
  UserCheck, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  Activity, 
  FileText,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { UioUnit } from '../types';

interface ConsultationPortalProps {
  units: UioUnit[];
}

export default function ConsultationPortal({ units }: ConsultationPortalProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'tickets' | 'sos'>('ai');
  
  // AI Consultation Query State
  const [unitModel, setUnitModel] = useState('CAT 777D');
  const [faultInput, setFaultInput] = useState('');
  const [aiDiagnosis, setAiDiagnosis] = useState<null | {
    title: string;
    possibleCauses: string[];
    recommendedActions: string[];
    requiredParts: string[];
    severity: string;
  }>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Tickets State
  const [tickets, setTickets] = useState([
    { id: 'TKT-801', date: '2026-07-28', unit: 'EXC-201 (PC2000-8)', issue: 'Hydraulic temperature high above 95°C on heavy digging', expert: 'Ir. Yudi (Senior Hyd Specialist)', status: 'Answered', response: 'Periksa cooler hydraulic fan motor pressure & bypass valve setting. Bersihkan radiator fins dari debu tambang.' },
    { id: 'TKT-800', date: '2026-07-26', unit: 'DT-104 (CAT 777D)', issue: 'Transmission slipping when shifting 3rd to 4th gear under load', expert: 'Bambang (CAT Specialist Field Support)', status: 'In Review', response: 'Tim spesialis sedang menganalisa data pressure test clutch #3.' },
  ]);

  const [newTicketUnit, setNewTicketUnit] = useState('');
  const [newTicketIssue, setNewTicketIssue] = useState('');

  // SOS Oil Analysis State
  const [sosUnit, setSosUnit] = useState('DT-101');
  const [fePpm, setFePpm] = useState('45');
  const [cuPpm, setCuPpm] = useState('12');
  const [sosResult, setSosResult] = useState<string | null>(null);

  const handleRunAiDiagnostics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faultInput.trim()) return;

    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      setAiDiagnosis({
        title: `Hasil Analisa Sistem untuk Kode/Gejala: "${faultInput}"`,
        severity: faultInput.toLowerCase().includes('engine') || faultInput.toLowerCase().includes('oil') ? 'Tinggi (Critical)' : 'Sedang (Warning)',
        possibleCauses: [
          'Penurunan tekanan oli akibat penyumbatan pada Filter Oli Utama.',
          'Kerusakan Relief Valve pada Pompa Utama.',
          'Kontaminasi partikel aus berlebih pada sensor tekanan/suhu.'
        ],
        recommendedActions: [
          'Lakukan pemeriksaan visual kebocoran di sekitar jalur pipa hidrolik.',
          'Ukur pressure test port M1 dan M2 menggunakan Hydraulic Pressure Gauge Set.',
          'Ganti cartridge filter oli jika differential pressure indicator berwarna merah.'
        ],
        requiredParts: [
          '1R-1808 Filter Oli Caterpillar (1 unit)',
          'O-Ring Seal Set Hydraulic (1 set)'
        ]
      });
    }, 1000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketIssue.trim()) return;
    const newTkt = {
      id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      unit: newTicketUnit || 'DT-101 (CAT 777D)',
      issue: newTicketIssue,
      expert: 'Tim Expert Support Engine & Hydraulic',
      status: 'Open Ticket',
      response: 'Tiket berhasil dibuat. Pakar teknis sedang memverifikasi laporan Anda.'
    };
    setTickets([newTkt, ...tickets]);
    setNewTicketIssue('');
    alert('Tiket konsultasi pakar berhasil diajukan!');
  };

  const handleAnalyzeSos = (e: React.FormEvent) => {
    e.preventDefault();
    const fe = parseFloat(fePpm) || 0;
    const cu = parseFloat(cuPpm) || 0;
    if (fe > 50 || cu > 25) {
      setSosResult('CRITICAL WARNING: Tingkat keausan Fe/Cu di atas ambang batas normal. Indikasi keausan berlebih pada Cylinder Liner / Bearing. Disarankan inspeksi kamera Borescope & ganti oli segera.');
    } else {
      setSosResult('NORMAL STATUS: Kandungan partikel keausan dalam toleransi aman operasional. Lanjutkan periode drain interval standar.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="consultation-portal">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-600 text-white rounded-2xl shadow-md">
            <MessageSquare size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold font-mono text-slate-900 uppercase tracking-wider">
                Modul Konsultasi &amp; AI Maintenance Advisor
              </h1>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 font-mono text-[11px] font-bold rounded-md border border-purple-200">
                AI Diagnostics &amp; Technical Experts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Konsultasi teknis masalah alat berat, panduan pemecahan kode error (DTC), saran perbaikan otomatis AI, dan diagnosa sampel oli.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-purple-50 text-purple-800 rounded-xl border border-purple-200 font-mono text-xs font-bold flex items-center gap-1.5">
            <Sparkles size={16} className="text-purple-600 animate-spin" />
            <span>AI Advisor Ready</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'ai'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Bot size={16} />
          <span>AI Maintenance Diagnostician</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UserCheck size={16} />
          <span>Tiket Konsultasi Pakar Teknis</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sos')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'sos'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity size={16} />
          <span>Diagnosa Sampel Oli (SOS)</span>
        </button>
      </div>

      {/* Tab AI Diagnostician */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="text-purple-600" size={20} />
              <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900">
                Pencarian Masalah &amp; Kode Error
              </h3>
            </div>

            <form onSubmit={handleRunAiDiagnostics} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Model Unit Alat Berat</label>
                <select 
                  value={unitModel}
                  onChange={e => setUnitModel(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="CAT 777D">Caterpillar 777D Off-Highway Truck</option>
                  <option value="Komatsu PC2000-8">Komatsu PC2000-8 Hydraulic Excavator</option>
                  <option value="Komatsu D375A-6">Komatsu D375A-6 Bulldozer</option>
                  <option value="Scania P410 CB">Scania P410 CB Tipper Truck</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Kode Fault / Gejala Kerusakan</label>
                <textarea
                  rows={4}
                  placeholder="Contoh: Kode DTC E360 Engine Oil Pressure Low, atau asap hitam pekat saat menanjak muatan berat..."
                  value={faultInput}
                  onChange={e => setFaultInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isAiLoading || !faultInput.trim()}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menganalisa Database Teknis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Analisa dengan AI Maintenance</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900">
                Rekomendasi Tindakan &amp; Root Cause Analysis
              </h3>
              <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold">
                Automated Expert Advice
              </span>
            </div>

            {aiDiagnosis ? (
              <div className="space-y-4 font-sans text-xs animate-fadeIn">
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
                  <div className="font-extrabold font-mono text-slate-900 text-sm">{aiDiagnosis.title}</div>
                  <div className="mt-1 font-mono text-purple-900 font-bold">
                    Tingkat Urgensi: <span className="uppercase font-extrabold text-rose-600">{aiDiagnosis.severity}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold font-mono text-slate-900 uppercase text-[11px]">Potensi Penyebab Utamanya:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 font-mono text-[11px]">
                    {aiDiagnosis.possibleCauses.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold font-mono text-slate-900 uppercase text-[11px]">Langkah Inspeksi &amp; Perbaikan:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 font-mono text-[11px]">
                    {aiDiagnosis.recommendedActions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ol>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold font-mono text-slate-900 uppercase text-[11px]">Estimasi Kebutuhan Sparepart:</h4>
                  <ul className="space-y-1 text-slate-700 font-mono text-[11px]">
                    {aiDiagnosis.requiredParts.map((p, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-blue-800 font-bold">
                        <CheckCircle2 size={12} className="text-blue-600" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Bot size={40} className="text-slate-300" />
                <p className="font-mono text-xs text-slate-500 font-bold">Belum Ada Analisa Yang Dijalankan</p>
                <p className="text-xs max-w-sm">
                  Ketik kode error atau keluhan teknis alat berat pada form di samping untuk memperoleh saran troubleshooting otomatis dari AI.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Tiket Konsultasi Pakar */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 border-b border-slate-100 pb-3">
              Ajukan Konsultasi Ke Specialist
            </h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Unit Armada</label>
                <select 
                  value={newTicketUnit} 
                  onChange={e => setNewTicketUnit(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="">-- Pilih Unit Armada --</option>
                  {units.map(u => (
                    <option key={u.id} value={`${u.code} (${u.name})`}>
                      {u.code} - {u.name} ({u.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Rincian Pertanyaan Teknis / Kendala</label>
                <textarea
                  rows={4}
                  placeholder="Jelaskan secara rinci permasalahan teknis yang membutuhkan tanggapan dari Master Mechanic..."
                  value={newTicketIssue}
                  onChange={e => setNewTicketIssue(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={14} />
                <span>Kirim Tiket Ke Pakar Teknis</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900 border-b border-slate-100 pb-3">
              Riwayat Tiket Konsultasi Pakar
            </h3>
            <div className="space-y-3">
              {tickets.map(tkt => (
                <div key={tkt.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-slate-900 text-xs">{tkt.id} - {tkt.unit}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      tkt.status === 'Answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tkt.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-sans font-medium">{tkt.issue}</p>

                  {tkt.response && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="text-[10px] font-mono text-purple-700 font-bold flex items-center gap-1">
                        <UserCheck size={12} />
                        <span>Respon dari: {tkt.expert}</span>
                      </div>
                      <p className="text-xs text-slate-800 font-mono leading-relaxed">{tkt.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab SOS Oil Sampling */}
      {activeTab === 'sos' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="text-purple-600" size={20} />
            <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900">
              Analisa Laboratorium Sampel Oli SOS (Scheduled Oil Sampling)
            </h3>
          </div>

          <form onSubmit={handleAnalyzeSos} className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Pilih Unit Armada</label>
              <select 
                value={sosUnit}
                onChange={e => setSosUnit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {units.map(u => (
                  <option key={u.id} value={u.code}>{u.code} ({u.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Partikel Fe (Besi - PPM)</label>
              <input 
                type="number"
                value={fePpm}
                onChange={e => setFePpm(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Partikel Cu (Tembaga - PPM)</label>
              <input 
                type="number"
                value={cuPpm}
                onChange={e => setCuPpm(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Jalankan Evaluasi Sampel Oli
              </button>
            </div>
          </form>

          {sosResult && (
            <div className={`p-4 rounded-2xl border font-mono text-xs leading-relaxed ${
              sosResult.includes('CRITICAL') ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="font-extrabold uppercase mb-1">Hasil Evaluasi Oli Untuk {sosUnit}:</div>
              <p>{sosResult}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
