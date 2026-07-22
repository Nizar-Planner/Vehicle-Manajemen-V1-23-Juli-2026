/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  AreaChart,
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { TrendingUp, Package, AlertTriangle, Calendar, RefreshCw, BarChart2, Layers } from 'lucide-react';

interface TrendMonthData {
  month: string;
  monthKey: string;
  sparePartCost: number;
  sparePartItems: number;
  downtimeCount: number;
  breakdownHours: number;
  scheduledWO: number;
}

export default function DashboardCharts() {
  const [trendsData, setTrendsData] = useState<TrendMonthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<'parts' | 'downtime' | 'combined'>('parts');
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | '6-months' | '12-months'>('6-months');

  const fetchTrends = async (period: 'weekly' | '6-months' | '12-months') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trends?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setTrendsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch trends:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(selectedPeriod);
  }, [selectedPeriod]);

  const formatRupiahShort = (val: number) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}Jt`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}rb`;
    return `Rp ${val}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5" id="charts-dashboard-card">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={20} />
            <h2 className="text-base font-bold text-slate-900">
              Analisis Tren Operasional & Biaya Workshop
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi penggunaan suku cadang, pengeluaran logistik, dan rasio downtime armada untuk evaluasi berkala.
          </p>
        </div>

        {/* Filters & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector (Mingguan, 6 Bulan, 12 Bulan) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedPeriod('weekly')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPeriod === 'weekly' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setSelectedPeriod('6-months')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPeriod === '6-months' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 Bulan
            </button>
            <button
              onClick={() => setSelectedPeriod('12-months')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPeriod === '12-months' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12 Bulan / Tahunan
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveChartTab('parts')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === 'parts' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package size={14} />
              <span>Sparepart</span>
            </button>
            <button
              onClick={() => setActiveChartTab('downtime')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === 'downtime' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle size={14} />
              <span>Downtime Armada</span>
            </button>
            <button
              onClick={() => setActiveChartTab('combined')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === 'combined' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 size={14} />
              <span>Laporan Gabungan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Body */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span className="text-xs font-semibold">Memuat data tren Recharts...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: Consumsi Sparepart */}
          {activeChartTab === 'parts' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Tren Biaya (Rp) & Kuantitas Item Terpakai</span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Total 6 Bln: {formatRupiahShort(trendsData.reduce((s, t) => s + t.sparePartCost, 0))}
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendsData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis yAxisId="left" orientation="left" tickFormatter={formatRupiahShort} tick={{ fontSize: 11, fill: '#059669' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#3b82f6' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }} 
                      formatter={(value: any, name: any) => {
                        if (name === 'sparePartCost') return [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value), 'Biaya Sparepart'];
                        if (name === 'sparePartItems') return [`${value} Item`, 'Kuantitas Terpakai'];
                        return [value, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar yAxisId="left" dataKey="sparePartCost" name="sparePartCost" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                    <Line yAxisId="right" type="monotone" dataKey="sparePartItems" name="sparePartItems" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: '#2563eb' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: Downtime Armada */}
          {activeChartTab === 'downtime' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Jumlah Kejadian Kerusakan & Total Jam Downtime</span>
                <span className="font-mono text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Total Breakdown: {trendsData.reduce((s, t) => s + t.downtimeCount, 0)} Kejadian
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorDowntime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorWO" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                      formatter={(value: any, name: any) => {
                        if (name === 'downtimeCount') return [`${value} Unit`, 'Unit Breakdown'];
                        if (name === 'breakdownHours') return [`${value} Jam`, 'Jam Terhenti (Downtime)'];
                        if (name === 'scheduledWO') return [`${value} SPK`, 'Work Order Selesai'];
                        return [value, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="downtimeCount" name="downtimeCount" stroke="#e11d48" fillOpacity={1} fill="url(#colorDowntime)" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="breakdownHours" name="breakdownHours" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
                    <Area type="monotone" dataKey="scheduledWO" name="scheduledWO" stroke="#2563eb" fillOpacity={1} fill="url(#colorWO)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 3: Laporan Gabungan Data Metrics */}
          {activeChartTab === 'combined' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3">Bulan</th>
                      <th className="p-3">Biaya Sparepart (IDR)</th>
                      <th className="p-3">SKU Terpakai</th>
                      <th className="p-3">Kejadian Breakdown</th>
                      <th className="p-3">Downtime (Jam)</th>
                      <th className="p-3">Work Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {trendsData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{row.month}</td>
                        <td className="p-3 font-mono text-emerald-700 font-bold">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(row.sparePartCost)}
                        </td>
                        <td className="p-3 font-mono">{row.sparePartItems} item</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${row.downtimeCount > 4 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                            {row.downtimeCount} Unit
                          </span>
                        </td>
                        <td className="p-3 font-mono text-amber-700 font-bold">{row.breakdownHours} jam</td>
                        <td className="p-3 font-mono text-blue-700 font-bold">{row.scheduledWO} SPK</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
