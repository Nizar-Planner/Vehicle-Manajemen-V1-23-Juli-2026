/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  Coins, 
  Settings, 
  Check, 
  FileEdit,
  X,
  Edit,
  Wrench
} from 'lucide-react';
import { SparePart } from '../types';

interface WarehouseProps {
  parts: SparePart[];
  onAddPart: (partData: Partial<SparePart>) => Promise<void>;
  onUpdatePart: (partId: string, updatedFields: Partial<SparePart>) => Promise<void>;
}

export default function Warehouse({ parts, onAddPart, onUpdatePart }: WarehouseProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [isAdding, setIsAdding] = useState(false);
  const [isRestocking, setIsRestocking] = useState<SparePart | null>(null);
  const [restockQty, setRestockQty] = useState(1);
  
  const [isEditing, setIsEditing] = useState<SparePart | null>(null);
  const [editPartData, setEditPartData] = useState<Partial<SparePart>>({});

  // New part fields
  const [newPart, setNewPart] = useState<Partial<SparePart>>({
    code: '',
    name: '',
    category: 'Filter',
    stock: 10,
    minStock: 2,
    unit: 'Pcs',
    price: 150000
  });

  const categories = ['All', 'Oil', 'Filter', 'Engine Parts', 'Brakes', 'Tires', 'Hydraulics', 'Electrical', 'Other'];

  // Filter lists
  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitNewPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPart.code || !newPart.name) {
      alert('Harap lengkapi kode dan nama suku cadang!');
      return;
    }
    try {
      await onAddPart(newPart);
      setIsAdding(false);
      setNewPart({
        code: '',
        name: '',
        category: 'Filter',
        stock: 10,
        minStock: 2,
        unit: 'Pcs',
        price: 150000
      });
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan suku cadang');
    }
  };

  const handleOpenRestock = (part: SparePart) => {
    setIsRestocking(part);
    setRestockQty(10); // Default restock recommendation
  };

  const handleSubmitRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRestocking) return;
    if (restockQty <= 0) {
      alert('Jumlah restock harus lebih besar dari 0!');
      return;
    }

    try {
      await onUpdatePart(isRestocking.id, {
        stock: isRestocking.stock + Number(restockQty)
      });
      setIsRestocking(null);
    } catch (err: any) {
      alert(err.message || 'Gagal merestock suku cadang');
    }
  };

  const handleOpenEdit = (part: SparePart) => {
    setIsEditing(part);
    setEditPartData({ ...part });
  };

  const handleSubmitEditPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    if (!editPartData.code || !editPartData.name) {
      alert('Harap lengkapi kode dan nama suku cadang!');
      return;
    }
    try {
      await onUpdatePart(isEditing.id, editPartData);
      setIsEditing(null);
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah data suku cadang');
    }
  };

  return (
    <div className="space-y-6" id="warehouse-container">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="warehouse-header">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Gudang Logistik Suku Cadang</h1>
          <p className="text-slate-500 text-xs mt-1">Monitor persediaan stok suku cadang, re-stock barang kritis, dan kelola katalog material pemeliharaan armada secara real-time.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          <Plus size={14} /> Daftarkan Suku Cadang Baru
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="warehouse-quick-stats">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Model Item</span>
            <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">{parts.length} <span className="text-xs font-normal text-slate-400">SKU</span></span>
          </div>
          <Package className="text-slate-400" size={24} />
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Stok Kritis (Low Stock)</span>
            <span className="text-2xl font-bold text-rose-600 font-mono mt-1 block">
              {parts.filter(p => p.stock <= p.minStock).length} <span className="text-xs font-normal text-slate-400">Item</span>
            </span>
          </div>
          <AlertTriangle className="text-rose-500" size={24} />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Estimasi Total Aset Gudang</span>
            <span className="text-xl font-bold text-emerald-700 font-mono mt-1 block">
              Rp {parts.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('id-ID')}
            </span>
          </div>
          <Coins className="text-emerald-600" size={24} />
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 justify-between" id="warehouse-filters">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari Kode atau Nama Suku Cadang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900 font-sans"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none font-bold uppercase tracking-wider text-gray-700"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'Semua Kategori' : c.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" id="warehouse-table-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-widest font-mono">
                <th className="p-3 pl-4">Kode / Kategori</th>
                <th className="p-3">Nama Suku Cadang</th>
                <th className="p-3 text-right">Harga Satuan</th>
                <th className="p-3 text-center">Status & Stok</th>
                <th className="p-3 pr-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <Package className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="font-bold text-xs uppercase tracking-wider">Suku cadang tidak ditemukan</p>
                    <p className="text-[11px] text-gray-400 mt-1">Cari dengan kata kunci lain atau daftarkan item baru.</p>
                  </td>
                </tr>
              ) : (
                filteredParts.map(part => {
                  const isLow = part.stock <= part.minStock;
                  return (
                    <tr key={part.id} className={`hover:bg-gray-50/50 transition-colors ${isLow ? 'bg-rose-50/20' : ''}`} id={`part-row-${part.id}`}>
                      {/* Code and Category */}
                      <td className="p-3 pl-4 font-mono">
                      <span className="font-bold text-gray-900 block">{part.code}</span>
                        <span className="text-[9px] uppercase font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1 py-0.5 rounded-lg mt-1 inline-block">
                          {part.category}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="p-3 font-sans">
                        <strong className="text-gray-900 text-xs block uppercase tracking-wider">{part.name}</strong>
                        <span className="text-[10px] text-gray-400">Batas Minimum: {part.minStock} {part.unit}</span>
                      </td>

                      {/* Price */}
                      <td className="p-3 text-right font-mono font-bold text-gray-700">
                        Rp {part.price.toLocaleString('id-ID')}
                      </td>

                      {/* Stock status */}
                      <td className="p-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg border ${
                            isLow ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {part.stock} {part.unit}
                          </span>
                          {isLow && (
                            <span className="text-[9px] text-rose-600 font-bold mt-1 uppercase flex items-center gap-0.5 font-mono">
                              <AlertTriangle size={10} /> CRITICAL STOCK
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 pr-4 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleOpenRestock(part)}
                            className="px-2 py-1.5 border border-emerald-300 hover:border-emerald-600 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Restock Item"
                          >
                            <Plus size={11} /> Restock
                          </button>
                          <button
                            onClick={() => handleOpenEdit(part)}
                            className="px-2 py-1.5 border border-gray-300 hover:border-gray-800 bg-white rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-700 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Edit Data Item Suku Cadang"
                          >
                            <FileEdit size={11} /> Edit Item
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTER NEW SPARE PART */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="register-part-modal">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden my-8 border border-gray-300">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#1A1C1E] text-white">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider">Daftarkan Suku Cadang Baru</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">CREATE LOGISTICS CATALOG ENTRY</p>
              </div>
              <button 
                onClick={() => setIsAdding(false)} 
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitNewPart} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-3">
                {/* Code */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kode Suku Cadang (Part Number) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: FIL-OIL-CAT320"
                    value={newPart.code}
                    onChange={(e) => setNewPart({ ...newPart, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-gray-900"
                  />
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama Suku Cadang *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Filter Oli Excavator CAT 320D"
                    value={newPart.name}
                    onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                    <select
                      value={newPart.category}
                      onChange={(e) => setNewPart({ ...newPart, category: e.target.value as any })}
                      className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs focus:outline-none focus:border-gray-900"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Satuan Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="Pcs, Liter, Set, Box, Roll"
                      value={newPart.unit}
                      onChange={(e) => setNewPart({ ...newPart, unit: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Stock */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stok Awal</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newPart.stock}
                      onChange={(e) => setNewPart({ ...newPart, stock: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                    />
                  </div>

                  {/* Min Stock */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Minimum Stock Limit</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newPart.minStock}
                      onChange={(e) => setNewPart({ ...newPart, minStock: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Harga Satuan (Rupiah) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 350000"
                    value={newPart.price}
                    onChange={(e) => setNewPart({ ...newPart, price: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              {/* Form buttons */}
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
                  Simpan Suku Cadang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESTOCK EXISTING PART */}
      {isRestocking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="restock-modal">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden border border-gray-300">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#1A1C1E] text-white">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider">Penerimaan Barang (Restock)</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">UPDATE INVENTORY COUNT</p>
              </div>
              <button 
                onClick={() => setIsRestocking(null)} 
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitRestock} className="p-5 space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg text-[11px] space-y-1.5 border border-gray-200 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase font-bold">Nama Suku Cadang:</span>
                  <strong className="text-gray-900">{isRestocking.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase font-bold">Part Number:</span>
                  <strong className="text-gray-900">{isRestocking.code}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase font-bold">Stok Saat Ini:</span>
                  <strong className="text-gray-900">{isRestocking.stock} {isRestocking.unit}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jumlah Penambahan Stok *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-base font-bold font-mono text-gray-800 focus:outline-none focus:border-gray-900"
                  />
                  <span className="text-xs font-bold text-gray-500 font-mono uppercase">{isRestocking.unit}</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 uppercase font-bold font-mono">
                New Target Level: <strong className="text-emerald-600">{isRestocking.stock + Number(restockQty)} {isRestocking.unit}</strong>
              </p>

              {/* Form buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsRestocking(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A1C1E] hover:bg-[#2C2E33] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Verifikasi Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT SPARE PART MASTER DETAILS */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="edit-part-modal">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden my-8 border border-gray-300">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#1A1C1E] text-white">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider">Ubah Data Suku Cadang</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">EDIT MASTER LOGISTICS ENTRY</p>
              </div>
              <button 
                onClick={() => setIsEditing(null)} 
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEditPart} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-3">
                {/* Code */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kode Suku Cadang (Part Number) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: FIL-OIL-CAT320"
                    value={editPartData.code || ''}
                    onChange={(e) => setEditPartData({ ...editPartData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-gray-900"
                  />
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama Suku Cadang *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Filter Oli Excavator"
                    value={editPartData.name || ''}
                    onChange={(e) => setEditPartData({ ...editPartData, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                    <select
                      value={editPartData.category || 'Other'}
                      onChange={(e) => setEditPartData({ ...editPartData, category: e.target.value as any })}
                      className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs focus:outline-none focus:border-gray-900"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Satuan Unit (Satuan-Satuan Gudang)</label>
                    <input
                      type="text"
                      required
                      placeholder="Pcs, Liter, Set, Box, Roll, dll"
                      value={editPartData.unit || ''}
                      onChange={(e) => setEditPartData({ ...editPartData, unit: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Stock */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jumlah Stok Sekarang</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editPartData.stock !== undefined ? editPartData.stock : 0}
                      onChange={(e) => setEditPartData({ ...editPartData, stock: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                    />
                  </div>

                  {/* Min Stock */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Minimum Stock Limit</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editPartData.minStock !== undefined ? editPartData.minStock : 0}
                      onChange={(e) => setEditPartData({ ...editPartData, minStock: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Harga Satuan (Rupiah) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 350000"
                    value={editPartData.price !== undefined ? editPartData.price : 0}
                    onChange={(e) => setEditPartData({ ...editPartData, price: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A1C1E] hover:bg-[#2C2E33] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
