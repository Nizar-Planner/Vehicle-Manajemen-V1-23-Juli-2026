import React, { useState } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { SparePart } from '../types';

interface LogisticPortalProps {
  parts: SparePart[];
  onAddPart?: (part: Partial<SparePart>) => void;
  onUpdatePart?: (partId: string, updatedFields: Partial<SparePart>) => void;
}

export default function LogisticPortal({ parts, onAddPart, onUpdatePart }: LogisticPortalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements' | 'reorder'>('inventory');

  // Dummy Movement Logs for demonstration
  const [movements] = useState([
    { id: 'MOV-101', date: '2026-07-28 09:15', partName: 'Filter Oli Caterpillar 1R-1808', type: 'OUT', qty: 4, refNo: 'WO-2026-003', unit: 'EXC-201', user: 'Gudang Shift A' },
    { id: 'MOV-100', date: '2026-07-27 14:20', partName: 'Ban Tubeless Bridgestone 27.00R49', type: 'IN', qty: 10, refNo: 'PO-77812', supplier: 'PT Bridgestone Mining', user: 'Logistik Terima' },
    { id: 'MOV-099', date: '2026-07-27 11:00', partName: 'Kampas Rem Brakes Komatsu', type: 'OUT', qty: 2, refNo: 'WO-2026-001', unit: 'DT-102', user: 'Gudang Shift A' },
    { id: 'MOV-098', date: '2026-07-26 16:45', partName: 'Hydraulic Oil ISO VG 68 (Drum 200L)', type: 'IN', qty: 5, refNo: 'PO-77800', supplier: 'PT Pertamina Lubricants', user: 'Logistik Terima' },
  ]);

  const filteredParts = parts.filter(p => {
    const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesLowStock = !showLowStockOnly || p.stock <= p.minStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockParts = parts.filter(p => p.stock <= p.minStock);
  const totalStockItems = parts.reduce((acc, curr) => acc + curr.stock, 0);

  return (
    <div className="space-y-6 animate-fadeIn" id="logistic-portal">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-md">
            <Boxes size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold font-mono text-slate-900 uppercase tracking-wider">
                Modul Logistik &amp; Pergudangan
              </h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono text-[11px] font-bold rounded-md border border-blue-200">
                Supply Chain &amp; Inventory
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Kontrol stok komponen, pengeluaran barang ke Work Order, pemantauan batas minimum, dan rekonsiliasi material.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('reorder')}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <AlertTriangle size={16} className="text-amber-600" />
            <span>Peringatan Stok Minim ({lowStockParts.length})</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Total Jenis Sparepart</span>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{parts.length} <span className="text-xs font-normal text-slate-500">SKU</span></div>
          <span className="text-[10px] text-slate-400">Master database barang</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Total Fisik Barang Gudang</span>
          <div className="text-2xl font-extrabold font-mono text-blue-600">{totalStockItems.toLocaleString()} <span className="text-xs font-normal text-slate-500">Unit</span></div>
          <span className="text-[10px] text-slate-400">Siap dialokasikan ke unit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Status Stok Kritis / Reorder</span>
          <div className="text-2xl font-extrabold font-mono text-amber-600">{lowStockParts.length} <span className="text-xs font-normal text-slate-500">SKU</span></div>
          <span className="text-[10px] text-amber-700 font-semibold">Perlu proses Purchasing Segera</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Pergerakan Barang Hari Ini</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-600">12 <span className="text-xs font-normal text-slate-500">Transaksi</span></div>
          <span className="text-[10px] text-slate-400">Inbound &amp; Outbound Logs</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Katalog Inventory &amp; Bin Location
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'movements'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Riwayat Pergerakan Barang (In/Out)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reorder')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'reorder'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Rekomendasi Reorder PO
        </button>
      </div>

      {/* Content Tabs */}
      {activeTab === 'inventory' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama barang, part number, atau kategori..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  showLowStockOnly
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {showLowStockOnly ? 'Menampilkan Stok Minim' : 'Filter Stok Minim'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3">Part Number</th>
                  <th className="p-3">Nama Sparepart</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Lokasi Bin</th>
                  <th className="p-3 text-right">Stok Fisik</th>
                  <th className="p-3 text-right">Batas Min.</th>
                  <th className="p-3 text-center">Status Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredParts.map(part => {
                  const isLow = part.stock <= part.minStock;
                  return (
                    <tr key={part.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">{part.code}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{part.name}</div>
                        <div className="text-[10px] text-slate-400 font-sans">Harga Satuan: Rp {part.price.toLocaleString('id-ID')}</div>
                      </td>
                      <td className="p-3 text-slate-600">{part.category}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                          RACK-A1
                        </span>
                      </td>
                      <td className={`p-3 text-right font-extrabold ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {part.stock} {part.unit}
                      </td>
                      <td className="p-3 text-right text-slate-500">{part.minStock} {part.unit}</td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full border border-rose-200">
                            <AlertTriangle size={12} />
                            <span>Perlu Reorder</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
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

      {activeTab === 'movements' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900">
            Log Penerimaan &amp; Pengeluaran Barang
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3">ID Log</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3">Tipe Movement</th>
                  <th className="p-3 text-right">Jumlah</th>
                  <th className="p-3">No. Ref / WO / PO</th>
                  <th className="p-3">Petugas Logistik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{m.id}</td>
                    <td className="p-3 text-slate-500">{m.date}</td>
                    <td className="p-3 font-semibold text-slate-800">{m.partName}</td>
                    <td className="p-3">
                      {m.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                          <ArrowDownLeft size={12} />
                          <span>Penerimaan (IN)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-md">
                          <ArrowUpRight size={12} />
                          <span>Pengeluaran (OUT)</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-extrabold">{m.qty} Unit</td>
                    <td className="p-3 text-blue-600 font-bold">{m.refNo} {m.unit ? `(${m.unit})` : ''}</td>
                    <td className="p-3 text-slate-600">{m.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reorder' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900">
              Daftar Barang Mencapai Safety Stock (Rekomendasi Reorder PO)
            </h3>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {lowStockParts.length} Item Kritis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockParts.map(part => (
              <div key={part.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{part.code}</span>
                    <h4 className="text-sm font-extrabold text-slate-900 font-mono">{part.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-mono font-bold text-[10px] rounded-md">
                    Stok: {part.stock} / Min: {part.minStock}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 font-mono">
                  <div>Kategori: <strong>{part.category}</strong></div>
                  <div>Lokasi Gudang: <strong>RACK-A1</strong></div>
                  <div>Estimasi Rekomendasi Order: <strong className="text-blue-600">+{part.minStock * 3} {part.unit}</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">Kirim Ke Purchasing</span>
                  <button
                    type="button"
                    onClick={() => alert(`Pengajuan PR otomatis untuk ${part.name} telah dikirim ke Modul Purchasing!`)}
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
    </div>
  );
}
