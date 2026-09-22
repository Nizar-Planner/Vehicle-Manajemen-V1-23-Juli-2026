import React, { useState } from 'react';
import { X, Download, Copy, Check, Sparkles, Shield, Palette } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrandKitModal({ isOpen, onClose }: BrandKitModalProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const downloadSvg = (path: string, filename: string) => {
    const a = document.createElement('a');
    a.href = path;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/10 text-red-600 rounded-xl">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-mono">Identitas Merk &amp; Logo Resmi</h3>
              <p className="text-xs text-slate-500">Panduan visual &amp; logo terbaru FLEET PARTNER</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Logo Showcase Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Canvas */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-4">Versi Light Background</span>
              <div className="p-4 bg-white rounded-xl w-full flex items-center justify-center">
                <BrandLogo variant="full" theme="light" size="md" />
              </div>
              <button
                type="button"
                onClick={() => downloadSvg('/fleet-partner-logo.svg', 'fleet-partner-logo.svg')}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Unduh Logo SVG</span>
              </button>
            </div>

            {/* Dark Canvas */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-4">Versi Dark Background</span>
              <div className="p-4 bg-slate-900 rounded-xl w-full flex items-center justify-center">
                <BrandLogo variant="full" theme="dark" size="md" />
              </div>
              <button
                type="button"
                onClick={() => downloadSvg('/fleet-partner-horizontal.svg', 'fleet-partner-horizontal.svg')}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Unduh Horizontal SVG</span>
              </button>
            </div>
          </div>

          {/* Color Palette Specification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
              Palet Warna Utama (Official Palette)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Deep Navy */}
              <div 
                onClick={() => copyToClipboard('#0A1931', 'Navy Blue')}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0A1931] border border-slate-700 shrink-0 shadow-xs"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">Fleet Deep Navy</div>
                  <div className="text-[11px] font-mono text-slate-500">#0A1931</div>
                </div>
                {copiedColor === 'Navy Blue' ? <Check size={14} className="text-emerald-600" /> : <Copy size={13} className="text-slate-400" />}
              </div>

              {/* Racing / Power Red */}
              <div 
                onClick={() => copyToClipboard('#E5192D', 'Fleet Red')}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-[#E5192D] shrink-0 shadow-xs"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">Dynamic Red</div>
                  <div className="text-[11px] font-mono text-slate-500">#E5192D</div>
                </div>
                {copiedColor === 'Fleet Red' ? <Check size={14} className="text-emerald-600" /> : <Copy size={13} className="text-slate-400" />}
              </div>

              {/* Clean Titanium Slate */}
              <div 
                onClick={() => copyToClipboard('#F8FAFC', 'Titanium Light')}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shrink-0 shadow-xs"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">Pure Light Slate</div>
                  <div className="text-[11px] font-mono text-slate-500">#F8FAFC</div>
                </div>
                {copiedColor === 'Titanium Light' ? <Check size={14} className="text-emerald-600" /> : <Copy size={13} className="text-slate-400" />}
              </div>
            </div>
          </div>

          {/* Meaning & Symbolism */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Shield size={14} className="text-red-600" />
              <span>Filosofi Desain FLEET PARTNER:</span>
            </div>
            <p className="leading-relaxed">
              Dua mata panah (chevron) yang saling mengunci melambangkan kemitraan kokoh (<strong>Partner</strong>) dan akselerasi pergerakan armada (<strong>Fleet</strong>). Warna merah melambangkan tenaga, ketangguhan mesin dan respon cepat teknis, sedangkan warna navy blue melambangkan presisi, integritas operasional tambang, serta keandalan jangka panjang.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
