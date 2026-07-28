import React from 'react';
import { 
  Wrench, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  ArrowRight, 
  Shield, 
  Truck, 
  Activity, 
  Building2, 
  Sparkles,
  Layers,
  ChevronRight,
  ClipboardList,
  Cpu,
  Boxes
} from 'lucide-react';

interface ModulePortalProps {
  onSelectModule: (module: 'maintenance' | 'logistic' | 'purchasing' | 'consultation') => void;
  stats?: {
    totalUnits: number;
    breakdownUnits: number;
    lowStockCount: number;
    activeBookings: number;
  };
}

export default function ModulePortal({ onSelectModule, stats }: ModulePortalProps) {
  const modules = [
    {
      id: 'maintenance' as const,
      title: 'Maintenance',
      subtitle: 'Armada & Bengkel Tambang',
      description: 'Manajemen perbaikan unit, Work Order, jam kerja (HM/KM), inspeksi mekanik, & indikator keandalan armada (MTTR, MTBF, MA, PA).',
      icon: Wrench,
      badge: 'Utama',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      accentColor: 'border-emerald-500 hover:border-emerald-600 bg-emerald-50/30',
      iconBg: 'bg-emerald-500 text-white',
      highlights: ['Fleet Work Orders & Bay Status', 'Pencatatan HM/KM & Servis Berkala', 'Inspections & KPI Monitoring'],
      statText: `${stats?.totalUnits || 0} Unit Terdaftar (${stats?.breakdownUnits || 0} Breakdown)`
    },
    {
      id: 'logistic' as const,
      title: 'Logistic',
      subtitle: 'Gudang & Pergerakan Material',
      description: 'Kontrol stok sparepart, penerimaan barang, pergerakan material ke unit, minimum reorder alert, dan lacak pengiriman lapangan.',
      icon: Boxes,
      badge: 'Operational',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
      accentColor: 'border-blue-500 hover:border-blue-600 bg-blue-50/30',
      iconBg: 'bg-blue-600 text-white',
      highlights: ['Stock Movements & Bin Location', 'Auto Reorder & Safety Stock', 'Goods Issue to Work Order'],
      statText: `${stats?.lowStockCount || 0} Item Stok Minim Perlu Order`
    },
    {
      id: 'purchasing' as const,
      title: 'Purchasing',
      subtitle: 'Pengadaan & Purchase Order',
      description: 'Pengajuan Purchase Requisition (PR), pembuatan Purchase Order (PO), pembandingan kuotasi vendor, dan persetujuan anggaran.',
      icon: ShoppingCart,
      badge: 'Procurement',
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-200',
      accentColor: 'border-amber-500 hover:border-amber-600 bg-amber-50/30',
      iconBg: 'bg-amber-500 text-slate-950',
      highlights: ['Purchase Requisition (PR) Workflow', 'Purchase Order (PO) Tracking', 'Vendor & Supplier Directory'],
      statText: '5 PR Menunggu Approval Manager'
    },
    {
      id: 'consultation' as const,
      title: 'Consultation',
      subtitle: 'Pakar Teknis & AI Advisor',
      description: 'Konsultasi masalah teknis, analisa kode error (DTC), diagnosa hasil sampel oli (SOS), serta saran perbaikan otomatis dari pakar AI.',
      icon: MessageSquare,
      badge: 'AI Powered',
      badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-200',
      accentColor: 'border-purple-500 hover:border-purple-600 bg-purple-50/30',
      iconBg: 'bg-purple-600 text-white',
      highlights: ['AI Fault Diagnostics & Repair Guide', 'Konsultasi Spesialis Alat Berat', 'Analisa Hasil Sampel Oli (SOS)'],
      statText: 'Responsif Real-Time 24/7'
    }
  ];

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-8 animate-fadeIn" id="module-portal-container">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Truck size={320} />
        </div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Integrated Mining & Fleet Enterprise System</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-mono tracking-tight leading-tight text-white">
            Pilih Modul Aplikasi Utama
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
            Selamat datang di sistem manajemen armada pertambangan. Silakan pilih menu tampilan modul yang ingin Anda akses di bawah ini.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Layers size={15} className="text-emerald-400" />
              <span>4 Modul Terintegrasi</span>
            </div>
            <div className="h-3 w-px bg-slate-700"></div>
            <div className="flex items-center gap-1.5">
              <Activity size={15} className="text-blue-400" />
              <span>Real-Time Telemetry &amp; Database</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Menu Portal Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-extrabold font-mono uppercase tracking-wider text-slate-900">
              Menu Tampilan Utama
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Akses cepat sesuai peran operasional Anda di site tambang
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            Select Module to Continue
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="module-card-grid">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`bg-white rounded-3xl p-6 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between space-y-5 group relative overflow-hidden ${mod.accentColor}`}
                id={`module-card-${mod.id}`}
              >
                <div className="space-y-4">
                  {/* Top Bar Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3.5 rounded-2xl shadow-sm ${mod.iconBg}`}>
                        <Icon size={26} />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors font-mono">
                          {mod.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-500">{mod.subtitle}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase border ${mod.badgeColor}`}>
                      {mod.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {mod.description}
                  </p>

                  {/* Highlights Bullet */}
                  <div className="space-y-1.5 pt-2">
                    {mod.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] font-mono text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-emerald-500 transition-colors"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Link & Stat */}
                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-500 text-[11px] font-medium">{mod.statText}</span>
                  <div className="flex items-center gap-1.5 text-slate-900 group-hover:text-emerald-600 transition-colors">
                    <span>Buka Modul</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
