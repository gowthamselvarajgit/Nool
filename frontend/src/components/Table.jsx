/**
 * Table Component
 * Reusable data table with sorting, pagination, and actions
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Common';

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
      <div className="flex items-center justify-center py-20 bg-surface rounded-2xl border border-border shadow-soft">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-secondary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-20 bg-surface rounded-2xl border border-border shadow-soft">
        <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📭</span>
        </div>
        <p className="text-text-main font-medium text-lg mb-1">No data available</p>
        <p className="text-secondary-500 text-sm">There are no records to display at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden transition-all duration-300 hover:shadow-card">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-hover/80 border-b border-border">
              {selectable && (
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 transition-colors cursor-pointer"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-nowrap"
                >
                  {column.label}
                </th>
              ))}
              {actions && <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-primary-50/50 transition-colors duration-200 cursor-pointer group"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {selectable && (
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => toggleSelectRow(rowIndex)}
                      className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 transition-colors cursor-pointer"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-text-main font-medium">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {actions(row).map((action, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant={action.variant || 'secondary'}
                          onClick={action.onClick}
                          className="!py-1.5 !px-3 text-xs"
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
        <div className="px-6 py-4 border-t border-border bg-surface-hover/30 flex items-center justify-between">
          <p className="text-sm text-secondary-500 font-medium">
            Showing <span className="text-text-main font-bold">{pagination.page * pagination.pageSize - pagination.pageSize + 1}</span> to{' '}
            <span className="text-text-main font-bold">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> of <span className="text-text-main font-bold">{pagination.total}</span>
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page === 1}
              onClick={() => onPaginationChange?.(pagination.page - 1)}
              className="!py-1.5 !px-3"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              onClick={() => onPaginationChange?.(pagination.page + 1)}
              className="!py-1.5 !px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
