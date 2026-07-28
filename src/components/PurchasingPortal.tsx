import React, { useState } from 'react';
import { 
  ShoppingCart, 
  FileText, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  DollarSign, 
  ChevronRight, 
  Filter,
  Send,
  FileCheck
} from 'lucide-react';

export default function PurchasingPortal() {
  const [activeTab, setActiveTab] = useState<'pr' | 'po' | 'suppliers'>('pr');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample Purchase Requisitions
  const [requisitions, setRequisitions] = useState([
    { id: 'PR-2026-042', date: '2026-07-28', dept: 'Logistik & Workshop', requester: 'Sugianto (Site Manager)', itemsCount: 4, estTotal: 48500000, status: 'Pending Approval', priority: 'High' },
    { id: 'PR-2026-041', date: '2026-07-27', dept: 'Maintenance Mining', requester: 'Ahmad Nizar (Lead Mech)', itemsCount: 2, estTotal: 120000000, status: 'Approved', priority: 'Urgent' },
    { id: 'PR-2026-040', date: '2026-07-25', dept: 'Safety & Field', requester: 'Hendra (HSE Specialist)', itemsCount: 12, estTotal: 15400000, status: 'PO Issued', priority: 'Medium' },
    { id: 'PR-2026-039', date: '2026-07-22', dept: 'Workshop Bay 1', requester: 'Budi Kurniawan', itemsCount: 1, estTotal: 8500000, status: 'Completed', priority: 'Low' },
  ]);

  // Sample Purchase Orders
  const [orders] = useState([
    { id: 'PO-77812', date: '2026-07-27', prRef: 'PR-2026-041', supplier: 'PT Bridgestone Mining Indonesia', amount: 120000000, status: 'In Transit', estDelivery: '2026-07-30' },
    { id: 'PO-77811', date: '2026-07-24', prRef: 'PR-2026-038', supplier: 'PT Trakindo Utama', amount: 84000000, status: 'Delivered', estDelivery: '2026-07-26' },
    { id: 'PO-77810', date: '2026-07-20', prRef: 'PR-2026-035', supplier: 'PT Pertamina Lubricants', amount: 45000000, status: 'Delivered', estDelivery: '2026-07-22' },
  ]);

  // Sample Vendors
  const [suppliers] = useState([
    { id: 'SUP-01', name: 'PT Trakindo Utama', category: 'Heavy Equipment Parts Caterpillar', rating: '4.9/5', contact: '021-7822000', status: 'Verified Vendor' },
    { id: 'SUP-02', name: 'PT United Tractors Tbk', category: 'Komatsu Parts & Attachments', rating: '4.8/5', contact: '021-2457999', status: 'Verified Vendor' },
    { id: 'SUP-03', name: 'PT Bridgestone Mining Indonesia', category: 'OHT & Mining Tires', rating: '4.7/5', contact: '021-5203388', status: 'Verified Vendor' },
    { id: 'SUP-04', name: 'PT Pertamina Lubricants', category: 'Heavy Duty Engine Oils & Lubricants', rating: '4.9/5', contact: '021-3815111', status: 'Official Vendor' },
  ]);

  const handleApprovePr = (id: string) => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="purchasing-portal">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-500 text-slate-950 rounded-2xl shadow-md font-bold">
            <ShoppingCart size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold font-mono text-slate-900 uppercase tracking-wider">
                Modul Purchasing &amp; Procurement
              </h1>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-mono text-[11px] font-bold rounded-md border border-amber-200">
                Procurement &amp; Vendor Management
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Pengelolaan Purchase Requisition (PR), penertiban Purchase Order (PO), persetujuan manajerial, dan kemitraan supplier.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert('Form Buat PR Baru dibuka')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus size={16} />
            <span>Buat PR Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">PR Menunggu Approval</span>
          <div className="text-2xl font-extrabold font-mono text-amber-600">
            {requisitions.filter(r => r.status === 'Pending Approval').length} <span className="text-xs font-normal text-slate-500">Berkas</span>
          </div>
          <span className="text-[10px] text-slate-400">Butuh konfirmasi Manager</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">PO Aktif Berjalan</span>
          <div className="text-2xl font-extrabold font-mono text-blue-600">
            {orders.filter(o => o.status === 'In Transit').length} <span className="text-xs font-normal text-slate-500">Pesanan</span>
          </div>
          <span className="text-[10px] text-slate-400">Dalam proses pengiriman vendor</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Total Pengadaan Bulan Ini</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">
            Rp 249M <span className="text-xs font-normal text-slate-500">IDR</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Sesuai Alokasi Budget Site</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Vendor Terverifikasi</span>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {suppliers.length} <span className="text-xs font-normal text-slate-500">Supplier</span>
          </div>
          <span className="text-[10px] text-slate-400">Mitra Resmi Alat Berat</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('pr')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'pr'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Purchase Requisitions (PR)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('po')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'po'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Purchase Orders (PO)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'suppliers'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Direktori Supplier / Vendor
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'pr' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900">
              Pengajuan Purchase Requisition (PR)
            </h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari ID PR atau pemohon..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3">No. PR</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Departemen &amp; Pemohon</th>
                  <th className="p-3 text-center">Prioritas</th>
                  <th className="p-3 text-right">Est. Biaya</th>
                  <th className="p-3 text-center">Status Approval</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requisitions.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-slate-900">{pr.id}</td>
                    <td className="p-3 text-slate-500">{pr.date}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{pr.requester}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{pr.dept} ({pr.itemsCount} Item)</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        pr.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                        pr.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {pr.priority}
                      </span>
                    </td>
                    <td className="p-3 text-right font-extrabold text-slate-900">
                      Rp {pr.estTotal.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pr.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        pr.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        pr.status === 'PO Issued' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {pr.status === 'Pending Approval' ? (
                        <button
                          type="button"
                          onClick={() => handleApprovePr(pr.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          Approve PR
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Telah Disetujui</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'po' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900">
            Daftar Purchase Order (PO) Aktif
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3">No. PO</th>
                  <th className="p-3">Tanggal PO</th>
                  <th className="p-3">Ref PR</th>
                  <th className="p-3">Vendor / Supplier</th>
                  <th className="p-3 text-right">Nilai Kontrak PO</th>
                  <th className="p-3 text-center">Est. Tiba</th>
                  <th className="p-3 text-center">Status Kirim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-amber-600">{po.id}</td>
                    <td className="p-3 text-slate-500">{po.date}</td>
                    <td className="p-3 text-slate-700 font-bold">{po.prRef}</td>
                    <td className="p-3 font-bold text-slate-900">{po.supplier}</td>
                    <td className="p-3 text-right font-extrabold text-slate-900">
                      Rp {po.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-center text-slate-600">{po.estDelivery}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        po.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800 animate-pulse'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-extrabold font-mono uppercase text-slate-900">
            Direktori Supplier Resmi &amp; Distributor Sparepart
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suppliers.map(sup => (
              <div key={sup.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 font-mono">{sup.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{sup.category}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-md">
                    {sup.rating}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-mono flex items-center justify-between pt-2 border-t border-slate-200">
                  <span>Kontak: <strong>{sup.contact}</strong></span>
                  <span className="text-emerald-700 font-bold">{sup.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
