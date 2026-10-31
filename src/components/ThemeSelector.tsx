import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Moon, Sun, Sparkles, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AppTheme } from '../types';

interface ThemeSelectorProps {
  compact?: boolean;
  align?: 'left' | 'right';
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  compact = false,
  align = 'right',
  className = '',
}) => {
  const { theme, setTheme, currentThemeOption, themeOptions } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getThemeIcon = (id: AppTheme) => {
    switch (id) {
      case 'dark':
        return <Moon className="h-3.5 w-3.5 text-indigo-400" />;
      case 'bone':
        return <span className="w-2.5 h-2.5 rounded-full bg-[#E5DDD0] border border-[#C5BBAE]" />;
      case 'powder':
        return <span className="w-2.5 h-2.5 rounded-full bg-[#D2E0EC] border border-[#AEC4D8]" />;
      case 'frost':
        return <Sparkles className="h-3.5 w-3.5 text-cyan-500" />;
      case 'white':
      default:
        return <Sun className="h-3.5 w-3.5 text-amber-500" />;
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        id="theme-selector-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs ${
          compact ? 'px-2 py-1.5 h-8' : 'px-2.5 py-1.5 h-8'
        }`}
        title={`Current theme: ${currentThemeOption.name}`}
      >
        {/* Color Swatch Dot */}
        <span
          className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: currentThemeOption.colorSwatch }}
        />

        {!compact && (
          <span className="truncate text-slate-800 font-medium">
            {currentThemeOption.name}
          </span>
        )}

        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-60 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl transition-all ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5">
              <Palette className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Background Theme
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              5 Styles
            </span>
          </div>

          <div className="space-y-1">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  id={`theme-opt-${opt.id}`}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 font-semibold text-blue-900 ring-1 ring-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {/* Swatch preview with subtle layered border */}
                    <div
                      className="w-4 h-4 rounded-full border shadow-2xs shrink-0 flex items-center justify-center"
                      style={{
                        backgroundColor: opt.colorSwatch,
                        borderColor: opt.borderHex,
                      }}
                    >
                      {isSelected && (
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: opt.isDark ? '#38BDF8' : '#2563EB' }}
                        />
                      )}
                    </div>

                    <div className="flex flex-col text-left">
                      <span className="font-medium text-slate-900 flex items-center space-x-1.5">
                        <span>{opt.name}</span>
                        {opt.id === 'dark' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-200 font-mono">
                            Night
                          </span>
                        )}
                        {opt.id === 'bone' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-mono">
                            Warm
                          </span>
                        )}
                        {opt.id === 'powder' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-mono">
                            Soft
                          </span>
                        )}
                        {opt.id === 'frost' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-100 text-cyan-800 font-mono">
                            Ice
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[155px]">
                        {opt.subtitle}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
