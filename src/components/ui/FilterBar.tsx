'use client';

import React, { useState } from 'react';
import { Button } from './Button';

interface FilterOption {
  id: string;
  label: string;
  value: string | number | boolean;
}

interface FilterGroupProps {
  /**
   * Label for the filter group
   */
  label: string;
  
  /**
   * Available filter options
   */
  options: FilterOption[];
  
  /**
   * Currently selected option IDs
   */
  selected: string[];
  
  /**
   * Callback when selection changes
   */
  onChange: (selectedIds: string[]) => void;
  
  /**
   * Whether multiple options can be selected
   */
  multiSelect?: boolean;
}

interface SortOption {
  id: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  /**
   * Filter groups to display
   */
  filterGroups?: FilterGroupProps[];
  
  /**
   * Sort options to display
   */
  sortOptions?: SortOption[];
  
  /**
   * Currently selected sort option ID
   */
  selectedSortId?: string;
  
  /**
   * Current sort direction
   */
  sortDirection?: 'asc' | 'desc';
  
  /**
   * Callback when sort option changes
   */
  onSortChange?: (sortId: string, direction: 'asc' | 'desc') => void;
  
  /**
   * Search placeholder text
   */
  searchPlaceholder?: string;
  
  /**
   * Current search query
   */
  searchQuery?: string;
  
  /**
   * Callback when search query changes
   */
  onSearchChange?: (query: string) => void;
  
  /**
   * Whether to show advanced filters initially
   */
  showFiltersInitially?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * FilterGroup component for a set of related filters
 */
const FilterGroup: React.FC<FilterGroupProps> = ({
  label,
  options,
  selected,
  onChange,
  multiSelect = false
}) => {
  const toggleOption = (optionId: string) => {
    if (multiSelect) {
      if (selected.includes(optionId)) {
        onChange(selected.filter(id => id !== optionId));
      } else {
        onChange([...selected, optionId]);
      }
    } else {
      onChange([optionId]);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => toggleOption(option.id)}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selected.includes(option.id)
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * FilterBar component for filtering and sorting data
 */
const FilterBar: React.FC<FilterBarProps> = ({
  filterGroups = [],
  sortOptions = [],
  selectedSortId = '',
  sortDirection = 'asc',
  onSortChange = () => {},
  searchPlaceholder = 'Search...',
  searchQuery = '',
  onSearchChange = () => {},
  showFiltersInitially = false,
  className = '',
}) => {
  const [showFilters, setShowFilters] = useState(showFiltersInitially);

  const toggleSortDirection = () => {
    onSortChange(selectedSortId, sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value, sortDirection);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Search and sort section - always visible */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search input */}
          <div className="relative flex-1 w-full lg:max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
            {/* Sort controls */}
            {sortOptions.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <div className="flex items-center">
                  <select
                    value={selectedSortId}
                    onChange={handleSortChange}
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={toggleSortDirection}
                    className="ml-2 p-2 border border-gray-300 rounded-md"
                    title={sortDirection === 'asc' ? "Sort Ascending" : "Sort Descending"}
                  >
                    {sortDirection === 'asc' ? (
                      <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Filter toggle button */}
            {filterGroups.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="ml-auto sm:ml-2"
              >
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter groups - collapsible */}
      {filterGroups.length > 0 && showFilters && (
        <div className="p-4">
          {filterGroups.map((group, index) => (
            <FilterGroup 
              key={index}
              label={group.label}
              options={group.options}
              selected={group.selected}
              onChange={group.onChange}
              multiSelect={group.multiSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
