/**
 * Table Component
 * Reusable data table with sorting, pagination, and actions
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Table = ({
  columns,
  data = [],
  loading = false,
  onRowClick,
  selectable = false,
  actions,
  pagination = null,
  onPaginationChange,
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());

  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, i) => i)));
    }
  };

  const toggleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-text text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-card">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-light-gray border-b border-gray-border">
              {selectable && (
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-border"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-text-dark text-nowrap"
                >
                  {column.label}
                </th>
              ))}
              {actions && <th className="px-6 py-4 text-sm font-semibold text-text-dark">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-border hover:bg-light-gray transition-colors duration-200 cursor-pointer"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {selectable && (
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => toggleSelectRow(rowIndex)}
                      className="w-4 h-4 rounded border-gray-border"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-gray-text">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      {actions(row).map((action, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant={action.variant || 'secondary'}
                          onClick={action.onClick}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-border flex items-center justify-between">
          <p className="text-sm text-gray-text">
            Showing {pagination.page * pagination.pageSize - pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page === 1}
              onClick={() => onPaginationChange?.(pagination.page - 1)}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              onClick={() => onPaginationChange?.(pagination.page + 1)}
              icon={ChevronRight}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
