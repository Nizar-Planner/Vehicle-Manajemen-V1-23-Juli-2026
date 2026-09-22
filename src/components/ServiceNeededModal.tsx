import React from 'react';
import { 
  X, 
  AlertTriangle, 
  Wrench, 
  Truck, 
  Clock, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Droplet 
} from 'lucide-react';
import { UioUnit } from '../types';

interface ServiceNeededModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: UioUnit[];
  onNavigateToBooking: () => void;
  onNavigateToUio: () => void;
}

export default function ServiceNeededModal({
  isOpen,
  onClose,
  units,
  onNavigateToBooking,
  onNavigateToUio
}: ServiceNeededModalProps) {
  if (!isOpen) return null;

  // Filter units where service interval is reached or exceeded
  const overdueUnits = units.filter(unit => {
    const elapsedService = unit.currentHm - (unit.lastServiceHm || 0);
    const serviceInterval = unit.serviceInterval || 250;
    return elapsedService >= serviceInterval;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
              <AlertTriangle size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Daftar Unit Perlu Servis Berkala
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-600 text-white shadow-2xs">
                  {overdueUnits.length} Unit
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Armada yang telah melewati batas akumulasi jam kerja (Hour Meter) dan wajib dilakukan pemeliharaan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Unit List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {overdueUnits.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Semua Armada Dalam Kondisi Prima
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">
                Tidak ada unit armada yang melewati jadwal servis berkala saat ini. Semua jam kerja (HM) terpantau di bawah batas interval servis.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueUnits.map(unit => {
                const elapsedService = unit.currentHm - (unit.lastServiceHm || 0);
                const serviceInterval = unit.serviceInterval || 250;
                const overdueHours = elapsedService - serviceInterval;
                const elapsedOil = unit.currentHm - (unit.lastOilChangeHm || 0);
                const oilInterval = unit.oilChangeInterval || 250;
                const isOilOverdue = elapsedOil >= oilInterval;

                return (
                  <div 
                    key={unit.id}
                    className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                  >
                    {/* Unit Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
                        <Truck size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {unit.code}
                          </span>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {unit.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {unit.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            unit.status === 'Breakdown' 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                              : unit.status === 'Under Maintenance'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {unit.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {unit.location || 'Lokasi tidak terdata'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> HM Terakhir: <strong>{unit.currentHm.toLocaleString()} HM</strong>
                          </span>
                          <span>•</span>
                          <span>Interval: {serviceInterval} HM</span>
                        </div>

                        {/* Badges of Overdue Details */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-2xs">
                            <AlertTriangle size={11} /> Overdue Servis: +{overdueHours.toLocaleString()} HM
                          </span>

                          {isOilOverdue && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-2xs">
                              <Droplet size={11} /> Ganti Oli Melewati Batas (+{(elapsedOil - oilInterval).toLocaleString()} HM)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToBooking();
                        }}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5 cursor-pointer"
                        title="Buat SPK / Jadwalkan Servis Sekarang"
                      >
                        <Wrench size={14} />
                        <span>Buat SPK Servis</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToUio();
            }}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Buka Seluruh Armada di UIO Manager</span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
