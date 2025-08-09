'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/Table';
import { Button } from '@/components/ui/button';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export interface Column<T> {
  /**
   * Unique identifier for the column
   */
  id: string;
  
  /**
   * Header text to display
   */
  header: React.ReactNode;
  
  /**
   * Function to get cell content from a row item
   */
  cell: (item: T) => React.ReactNode;
  
  /**
   * Whether this column is sortable
   */
  sortable?: boolean;
  
  /**
   * Class names to apply to the column header
   */
  headerClassName?: string;
  
  /**
   * Class names to apply to data cells in this column
   */
  cellClassName?: string;
}

interface DataGridProps<T> {
  /**
   * Columns definition
   */
  columns: Column<T>[];
  
  /**
   * Data to display
   */
  data: T[];
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Error message
   */
  error?: string | null;
  
  /**
   * Function to retry on error
   */
  onRetry?: () => void;
  
  /**
   * Function to handle row click
   */
  onRowClick?: (item: T) => void;
  
  /**
   * Function to get a unique ID from each row item
   */
  getRowId?: (item: T) => string;
  
  /**
   * Array of selected row IDs
   */
  selectedRowIds?: string[];
  
  /**
   * Function to handle row selection change
   */
  onSelectionChange?: (selectedIds: string[]) => void;
  
  /**
   * Whether rows are selectable
   */
  selectable?: boolean;
  
  /**
   * Sort column ID
   */
  sortColumn?: string;
  
  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc';
  
  /**
   * Function to handle sort change
   */
  onSortChange?: (columnId: string, direction: 'asc' | 'desc') => void;
  
  /**
   * Total number of items (for pagination)
   */
  totalItems?: number;
  
  /**
   * Current page (1-based)
   */
  page?: number;
  
  /**
   * Number of items per page
   */
  pageSize?: number;
  
  /**
   * Function to handle page change
   */
  onPageChange?: (page: number) => void;
  
  /**
   * Function to handle page size change
   */
  onPageSizeChange?: (pageSize: number) => void;
  
  /**
   * Page size options
   */
  pageSizeOptions?: number[];
  
  /**
   * Empty state props
   */
  emptyState?: {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  
  /**
   * Whether to highlight rows on hover
   */
  highlightOnHover?: boolean;
  
  /**
   * Additional CSS classes for the table
   */
  className?: string;
}

/**
 * DataGrid component for displaying tabular data with sorting, 
 * pagination, and row selection
 */
function DataGrid<T>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  onRowClick,
  getRowId = (item: any) => item.id,
  selectedRowIds = [],
  onSelectionChange,
  selectable = false,
  sortColumn,
  sortDirection = 'asc',
  onSortChange,
  totalItems,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  emptyState = {
    title: 'No data available',
    description: 'No records match your search criteria.',
  },
  highlightOnHover = true,
  className = '',
}: DataGridProps<T>) {
  // State for bulk selection checkbox in header
  const [selectAll, setSelectAll] = useState(false);
  
  // Calculate pagination information
  const hasPagination = Boolean(onPageChange);
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 
    data.length ? Math.ceil(data.length / pageSize) : 1;

  // Handle row selection
  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    
    const isSelected = selectedRowIds.includes(id);
    if (isSelected) {
      onSelectionChange(selectedRowIds.filter(rowId => rowId !== id));
    } else {
      onSelectionChange([...selectedRowIds, id]);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectAll) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(item => getRowId(item)));
    }
    setSelectAll(!selectAll);
  };

  // Handle sort toggle
  const handleSort = (columnId: string) => {
    if (!onSortChange) return;
    
    if (sortColumn === columnId) {
      onSortChange(columnId, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(columnId, 'asc');
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (onPageChange && newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!hasPagination) return null;
    
    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing{' '}
            <span className="font-medium">{Math.min((page - 1) * pageSize + 1, totalItems || data.length)}</span>
            {' '}to{' '}
            <span className="font-medium">
              {Math.min(page * pageSize, totalItems || data.length)}
            </span>
            {' '}of{' '}
            <span className="font-medium">{totalItems || data.length}</span> results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {onPageSizeChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                className="block w-full pl-3 pr-10 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <nav className="flex items-center space-x-1">
            <Button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              variant="outline"
              size="sm"
              className="px-2 py-1"
            >
              <span className="sr-only">First</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Button>
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              variant="outline"
              size="sm"
              className="px-2 py-1"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </Button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
              className="px-2 py-1"
            >
              <span className="sr-only">Next</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Button>
            <Button
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
              className="px-2 py-1"
            >
              <span className="sr-only">Last</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 6.707a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M12.293 15.707a1 1 0 010-1.414L16.586 10l-4.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Button>
          </nav>
        </div>
      </div>
    );
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="py-8">
          <LoadingState text="Loading data..." />
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4">
          <ErrorState 
            title="Error loading data"
            message={error}
            onRetry={onRetry}
            compact
          />
        </div>
      </div>
    );
  }

  // If no data, show empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="py-8">
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
            actionLabel={emptyState.actionLabel}
            onAction={emptyState.onAction}
          />
        </div>
      </div>
    );
  }

  // Render data grid
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={column.headerClassName}
                  sortable={column.sortable}
                  sorted={column.sortable && sortColumn === column.id ? sortDirection : null}
                  onClick={() => column.sortable && onSortChange && handleSort(column.id)}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const id = getRowId(item);
              const isSelected = selectedRowIds.includes(id);
              
              return (
                <TableRow
                  key={id}
                  isSelected={isSelected}
                  isClickable={Boolean(onRowClick)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={highlightOnHover ? 'hover:bg-gray-50' : ''}
                >
                  {selectable && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={`${id}-${column.id}`} className={column.cellClassName}>
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {hasPagination && (
        <div className="border-t border-gray-200">
          {renderPagination()}
        </div>
      )}
    </div>
  );
}

export default DataGrid;
