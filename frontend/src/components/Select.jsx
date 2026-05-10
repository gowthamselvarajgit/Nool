/**
 * Select Component
 * Dropdown select input with options
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error,
  required = false,
  searchable = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-text-dark mb-2">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-2.5 text-left border border-gray-border rounded-base
            flex items-center justify-between
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
            transition-all duration-200
            disabled:bg-light-gray disabled:cursor-not-allowed
            ${isOpen ? 'ring-2 ring-primary ring-offset-1' : ''}
            ${error ? 'border-danger focus:ring-danger' : ''}
            ${className}
          `}
          disabled={disabled}
        >
          <span className={selectedLabel === placeholder ? 'text-gray-text' : 'text-text-dark'}>
            {selectedLabel}
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-text transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-border rounded-base shadow-elevated z-10 overflow-hidden">
            {searchable && (
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-b border-gray-border focus:outline-none text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-gray-text text-sm text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`
                      w-full text-left px-4 py-3 text-sm
                      hover:bg-light-gray transition-colors duration-200
                      flex items-center gap-2
                      ${value === option.value ? 'bg-primary-light text-primary font-semibold' : 'text-text-dark'}
                    `}
                  >
                    {option.icon && <span>{option.icon}</span>}
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-danger text-sm mt-1 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
