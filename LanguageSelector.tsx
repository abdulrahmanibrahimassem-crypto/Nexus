import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from './I18nContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { locale, setLocale, availableLocales, currentDictionary } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeMeta = availableLocales.find((l) => l.code === locale) || availableLocales[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md cursor-pointer"
        title="Switch Language / Dil Değiştir / تغيير اللغة"
      >
        <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="font-semibold">{activeMeta.flag} {activeMeta.nativeName}</span>
        <span className="text-[10px] text-cyan-400/70 uppercase tracking-widest px-1 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20">
          {locale}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-cyan-400/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950/95 border border-cyan-500/35 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 bg-slate-900/80 border-b border-cyan-500/20 flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-semibold">
              Global Localization
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {availableLocales.length} Languages
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {availableLocales.map((lang) => {
              const isSelected = lang.code === locale;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocale(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-150 text-left cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-bold'
                      : 'text-slate-300 hover:bg-slate-900/90 hover:text-cyan-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="px-3 py-1.5 bg-slate-900/40 border-t border-cyan-500/10 text-[9px] font-mono text-cyan-400/60 text-center">
            Direction: {currentDictionary.direction.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
};
