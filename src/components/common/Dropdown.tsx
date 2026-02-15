import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps<T> {
  label?: string;
  options: readonly DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const Dropdown = <T extends string>({
  label,
  options,
  value,
  onChange,
  className = '',
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 font-bold transition-all duration-300 hover:border-indigo-100 dark:hover:border-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <div className="flex items-center gap-3">
          {selectedOption?.icon}
          <span>{selectedOption?.label}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-5 py-3 text-sm font-bold transition-colors ${
                value === option.id
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {option.icon}
                <span>{option.label}</span>
              </div>
              {value === option.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
