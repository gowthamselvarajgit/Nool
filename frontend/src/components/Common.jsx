import React from 'react';
import { Table } from '../components/Table';

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  loading = false,
  onClick,
  ...props
}) => {
  const busy = isLoading || loading;
  const baseStyles =
    'font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40',
    secondary: 'bg-surface hover:bg-surface-hover text-secondary-700 border border-border shadow-sm hover:shadow-md',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
    danger: 'bg-danger text-white hover:bg-red-600 shadow-lg shadow-danger/30',
    success: 'bg-success text-white hover:bg-emerald-600 shadow-lg shadow-success/30',
    ghost: 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || busy}
      onClick={onClick}
      {...props}
    >
      {busy ? (
        <>
          <Spinner size="sm" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export const Card = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`bg-surface rounded-2xl border border-border p-6 shadow-soft transition-all duration-300 ${
        hover ? 'hover:shadow-hover hover:border-secondary-300 hover:-translate-y-1' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const Input = ({
  label,
  error,
  className = '',
  required = false,
  type = 'text',
  placeholder,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-main mb-2">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-surface border rounded-xl text-text-main placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 shadow-sm ${
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-xs mt-1.5 font-medium animate-fade-in">{error}</p>}
    </div>
  );
};

export const Select = ({
  label,
  options = [],
  error,
  className = '',
  required = false,
  placeholder,
  ...props
}) => {
  const hasEmpty = options.some((o) => o.value === '' || o.value === null || o.value === undefined);
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-main mb-2">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 bg-surface border rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 shadow-sm appearance-none ${
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'
        } ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
        {...props}
      >
        {!hasEmpty && <option value="">{placeholder || 'Select an option'}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-danger text-xs mt-1.5 font-medium animate-fade-in">{error}</p>}
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    success: 'bg-success-light text-success border-success/20',
    warning: 'bg-warning-light text-warning border-warning/20',
    error: 'bg-danger-light text-danger border-danger/20',
    info: 'bg-info-light text-info border-info/20',
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-secondary-200 border-t-primary-600 ${sizes[size]} ${className}`}
    />
  );
};

export const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative">
        <Spinner size="lg" className="mb-6 relative z-10" />
        <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full z-0 animate-pulse"></div>
      </div>
      <p className="text-secondary-500 font-medium tracking-wide">{text}</p>
    </div>
  );
};

export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="bg-danger-light/50 border border-danger/20 rounded-2xl p-8 text-center max-w-md mx-auto animate-fade-in shadow-sm">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3 className="text-lg font-bold text-danger mb-2">Oops! Something went wrong</h3>
      <p className="text-danger/80 mb-6 text-sm">{message || 'We could not complete your request.'}</p>
      {onRetry && (
        <Button variant="danger" size="md" onClick={onRetry} className="mx-auto">
          Try Again
        </Button>
      )}
    </div>
  );
};

export const EmptyState = ({ message = 'No data available', icon = '📭', description }) => {
  return (
    <div className="text-center py-16 px-4 animate-fade-in">
      <div className="w-24 h-24 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <span className="text-5xl">{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-text-main mb-2">{message}</h3>
      {description && <p className="text-secondary-500 max-w-sm mx-auto">{description}</p>}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 bg-secondary-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className={`bg-surface rounded-3xl shadow-2xl w-full ${sizes[size]} max-w-[calc(100vw-2rem)] animate-slide-up border border-border/50 overflow-hidden flex flex-col max-h-[90vh] min-w-0`}>
        <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-surface-hover/50">
          <h2 className="text-xl font-bold text-text-main">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-danger hover:bg-danger-light/50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Tooltip = ({ children, text, position = 'top' }) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={`absolute hidden group-hover:block bg-secondary-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 animate-fade-in ${
          position === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : 'top-full mt-2 left-1/2 -translate-x-1/2'
        }`}
      >
        {text}
        <div className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
          position === 'top' ? 'top-full border-t-secondary-900' : 'bottom-full border-b-secondary-900'
        }`}></div>
      </div>
    </div>
  );
};

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 text-sm font-medium">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-secondary-300">/</span>}
          {item.href ? (
            <a href={item.href} className="text-secondary-500 hover:text-primary-600 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-text-main">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
