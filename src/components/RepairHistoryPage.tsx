/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  User, 
  Settings, 
  Gauge, 
  Coins, 
  Tag, 
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { RepairHistory, UioUnit } from '../types';

interface RepairHistoryPageProps {
  repairs: RepairHistory[];
  units: UioUnit[];
}

export default function RepairHistoryPage({ repairs, units }: RepairHistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('All');
  const [selectedUnit, setSelectedUnit] = useState('All');

  // Service types list
  const serviceTypes = ['All', 'Periodic Service', 'Oil Change', 'Repair', 'General Inspection', 'Other'];

  // Filter list
  const filteredRepairs = repairs.filter(r => {
    const matchesSearch = r.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.mechanicName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesServiceType = selectedServiceType === 'All' || r.serviceType === selectedServiceType;
    const matchesUnit = selectedUnit === 'All' || r.unitId === selectedUnit;

    return matchesSearch && matchesServiceType && matchesUnit;
  });

  // Calculate sum of total expenses
  const totalCostAccumulated = filteredRepairs.reduce((sum, r) => sum + r.totalCost, 0);

  return (
    <div className="space-y-6" id="repair-history-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="repair-history-header">
        <div>
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Histori Perbaikan & Servis Detail</h1>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">Arsip kronologis seluruh aktivitas pemeliharaan unit, konsumsi suku cadang riil, serta rekapitulasi biaya perawatan.</p>
        </div>
      </div>

      {/* Financial Summary card */}
      <div className="bg-[#1A1C1E] text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-800" id="expenses-sum-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-800 text-emerald-400 rounded-lg">
            <Coins size={22} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">TOTAL BIAYA PERAWATAN TERFILTER</span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              Rp {totalCostAccumulated.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 uppercase font-mono tracking-wider text-center sm:text-right">
          Mencakup <strong className="text-white">{filteredRepairs.length}</strong> CATATAN SERVIS SESUAI FILTER.
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between" id="repair-filters">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari deskripsi kerja, nama mekanik, unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900 font-sans"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-gray-900 font-sans uppercase font-bold"
          >
            <option value="All">Semua Unit</option>
            {units.map(u => (
              <option key={u.id} value={u.id}>{u.code}</option>
            ))}
          </select>

          {/* Service Type Filter */}
          <select
            value={selectedServiceType}
            onChange={(e) => setSelectedServiceType(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-gray-900 font-sans uppercase font-bold"
          >
            {serviceTypes.map(st => (
              <option key={st} value={st}>{st === 'All' ? 'Semua Jenis Servis' : st.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Repair Logs Lists */}
      <div className="space-y-4" id="repairs-history-list">
        {filteredRepairs.length === 0 ? (
          <div className="py-16 text-center bg-white border border-gray-200 rounded-lg text-gray-500">
            <FileText className="mx-auto text-gray-300 mb-2" size={36} />
            <p className="font-bold text-xs uppercase tracking-wider">Tidak ada catatan perbaikan ditemukan</p>
            <p className="text-[11px] text-gray-400 mt-1">Selesaikan pemesanan bengkel untuk memicu pencatatan histori otomatis.</p>
          </div>
        ) : (
          filteredRepairs.map(log => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 hover:border-gray-800 transition-colors" id={`repair-history-item-${log.id}`}>
              {/* Header inside row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-gray-400">#{log.id}</span>
                  <span className="font-bold text-gray-900 text-xs bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200 font-mono">{log.unitCode}</span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {log.serviceType}
                  </span>
                  {log.bookingId && (
                    <span className="text-[9px] font-mono bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-lg border border-gray-200 uppercase">
                      BOOKING: #{log.bookingId}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase font-bold">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{log.completionDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge size={12} />
                    <span>{log.hmAtService.toLocaleString()} HM/KM</span>
                  </div>
                </div>
              </div>

              {/* Core description */}
              <div className="space-y-2">
                <p className="text-xs text-gray-800 leading-relaxed font-sans font-semibold">
                  {log.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-sans">
                  <User size={12} className="text-gray-400" />
                  <span className="text-[11px]">Dikerjakan oleh Mekanik: <strong className="text-gray-900 font-bold uppercase">{log.mechanicName}</strong></span>
                </div>
              </div>

              {/* Detailed spare parts consumed listing */}
              {log.partsUsed.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                  <span className="text-[9px] font-bold text-gray-400 tracking-wider block uppercase font-mono">RINCIAN KONSUMSI SUKU CADANG GUDANG:</span>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px] font-mono">
                      <thead>
                        <tr className="border-b border-gray-300 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="pb-1.5">Suku Cadang (Part No)</th>
                          <th className="pb-1.5 text-center">Jumlah</th>
                          <th className="pb-1.5 text-right">Harga Satuan</th>
                          <th className="pb-1.5 text-right">Total Sub</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700">
                        {log.partsUsed.map((p, pidx) => (
                          <tr key={pidx} className="align-middle">
                            <td className="py-2 pr-2">
                              <span className="font-bold text-gray-900 block">{p.partName}</span>
                              <span className="text-[9px] text-gray-400 font-mono">({p.partCode})</span>
                            </td>
                            <td className="py-2 text-center text-gray-900 font-bold">
                              {p.quantity}
                            </td>
                            <td className="py-2 text-right font-mono">
                              Rp {p.price.toLocaleString('id-ID')}
                            </td>
                            <td className="py-2 text-right text-gray-900 font-bold font-mono">
                              Rp {(p.price * p.quantity).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Expense Row */}
              <div className="flex justify-between items-center pt-2 text-xs border-t border-dashed border-gray-200">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Biaya Penyelesaian Total (Suku Cadang + Jasa):</span>
                <strong className="text-gray-900 text-xs font-bold font-mono bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                  Rp {log.totalCost.toLocaleString('id-ID')}
                </strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
