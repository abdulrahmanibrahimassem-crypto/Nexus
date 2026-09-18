import React, { useState, useRef } from 'react';
import { useI18n } from './I18nContext';
import { GlobalOverlay } from './GlobalOverlay';
import { Globe, Check, ChevronDown, Search, X } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { locale, updateLanguage, availableLocales, currentDictionary } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      setTriggerRect(buttonRef.current.getBoundingClientRect());
      setSearchQuery('');
    }
    setIsOpen(!isOpen);
  };

  const filteredLocales = availableLocales.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMeta = availableLocales.find((l) => l.code === locale) || availableLocales[0];

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-200 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-md cursor-pointer"
        title="Switch Language / Dil Değiştir / تغيير اللغة"
      >
        <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="font-semibold">{activeMeta.flag} {activeMeta.nativeName}</span>
        <span className="text-[10px] text-cyan-400/80 uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
          {locale}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-cyan-400/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <GlobalOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRect={triggerRect}
        align="right"
      >
        <div className="px-3 py-2.5 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-300 font-bold">
            Global Localization ({availableLocales.length})
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="p-2.5 bg-slate-950/80 border-b border-cyan-500/20">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-cyan-400/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search languages..."
              className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-xl pl-8 pr-8 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
          {filteredLocales.length > 0 ? (
            filteredLocales.map((lang) => {
              const isSelected = lang.code === locale;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    updateLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  title={`Switch to ${lang.nativeName} (${lang.name})`}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-150 text-left cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/25 text-cyan-100 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-cyan-200 border border-transparent'
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
            })
          ) : (
            <div className="text-center py-6 text-slate-400 font-mono text-xs">
              No matching languages found
            </div>
          )}
        </div>
        <div className="px-3 py-2 bg-slate-900/60 border-t border-cyan-500/20 text-[10px] font-mono text-cyan-400/80 text-center flex items-center justify-center gap-2">
          <span>Layout Direction:</span>
          <span className="font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
            {currentDictionary.direction}
          </span>
        </div>
      </GlobalOverlay>
    </div>
  );
};

export default LanguageSwitcher;
