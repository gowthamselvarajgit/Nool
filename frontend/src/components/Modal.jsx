/**
 * Modal Component
 * Dialog/Modal overlay with title, content, and actions
 */

import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  closeButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-lg shadow-elevated max-h-screen overflow-y-auto ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-border">
          <h2 className="text-xl font-bold text-text-dark">{title}</h2>
          {closeButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-light-gray rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-text" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6">{children}</div>

        {/* Footer - Actions */}
        {actions && (
          <div className="px-6 py-4 border-t border-gray-border flex gap-3 justify-end">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'secondary'}
                onClick={() => {
                  action.onClick?.();
                  if (action.closeOnClick !== false) {
                    onClose();
                  }
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
