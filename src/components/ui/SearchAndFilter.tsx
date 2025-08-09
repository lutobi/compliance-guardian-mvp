'use client';

import React, { useState } from 'react';
import FilterBar from './FilterBar';
import { Button } from '@/components/ui/button';

export interface FilterDefinition {
  id: string;
  label: string;
  options: Array<{ id: string; label: string; value: string | number | boolean }>;
  multiSelect?: boolean;
}

interface SearchAndFilterProps {
  /**
   * Title for the search and filter section
   */
  title?: string;
  
  /**
   * Filter definitions for available filters
   */
  filters: FilterDefinition[];
  
  /**
   * Sort options available
   */
  sortOptions?: Array<{ id: string; label: string; value: string }>;
  
  /**
   * Initial selected sort option ID
   */
  initialSortId?: string;
  
  /**
   * Initial sort direction
   */
  initialSortDirection?: 'asc' | 'desc';
  
  /**
   * Initial search query
   */
  initialSearchQuery?: string;
  
  /**
   * Callback when filter, sort, or search changes
   */
  onChange: (filters: Record<string, string[]>, sortId: string, sortDirection: 'asc' | 'desc', searchQuery: string) => void;
  
  /**
   * Whether to show filters initially
   */
  showFiltersInitially?: boolean;
  
  /**
   * Search placeholder text
   */
  searchPlaceholder?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SearchAndFilter component that combines search, filtering, and sorting
 * capabilities for data tables and lists
 */
const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  title,
  filters,
  sortOptions = [],
  initialSortId = sortOptions.length > 0 ? sortOptions[0].id : '',
  initialSortDirection = 'asc',
  initialSearchQuery = '',
  onChange,
  showFiltersInitially = false,
  searchPlaceholder = 'Search...',
  className = '',
}) => {
  // State for selected filters
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(() => {
    // Initialize empty arrays for each filter
    const initial: Record<string, string[]> = {};
    filters.forEach(filter => {
      initial[filter.id] = [];
    });
    return initial;
  });
  
  // State for search and sort
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedSortId, setSelectedSortId] = useState(initialSortId);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  
  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: Record<string, string[]> = {};
    filters.forEach(filter => {
      clearedFilters[filter.id] = [];
    });
    setSelectedFilters(clearedFilters);
    
    // Notify parent of changes
    onChange(clearedFilters, selectedSortId, sortDirection, searchQuery);
  };
  
  // Handle filter change
  const handleFilterChange = (filterId: string, selectedValues: string[]) => {
    const updatedFilters = {
      ...selectedFilters,
      [filterId]: selectedValues,
    };
    setSelectedFilters(updatedFilters);
    
    // Notify parent of changes
    onChange(updatedFilters, selectedSortId, sortDirection, searchQuery);
  };
  
  // Handle sort change
  const handleSortChange = (sortId: string, direction: 'asc' | 'desc') => {
    setSelectedSortId(sortId);
    setSortDirection(direction);
    
    // Notify parent of changes
    onChange(selectedFilters, sortId, direction, searchQuery);
  };
  
  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    // Notify parent of changes
    onChange(selectedFilters, selectedSortId, sortDirection, query);
  };
  
  // Format filters for FilterBar
  const filterGroups = filters.map(filter => ({
    label: filter.label,
    options: filter.options,
    selected: selectedFilters[filter.id] || [],
    onChange: (selected: string[]) => handleFilterChange(filter.id, selected),
    multiSelect: filter.multiSelect,
  }));
  
  // Count total active filters
  const totalActiveFilters = Object.values(selectedFilters)
    .reduce((total, values) => total + values.length, 0);
  
  return (
    <div className={className}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          
          {totalActiveFilters > 0 && (
            <Button 
              onClick={clearFilters} 
              variant="ghost" 
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              Clear all filters ({totalActiveFilters})
            </Button>
          )}
        </div>
      )}
      
      <FilterBar
        filterGroups={filterGroups}
        sortOptions={sortOptions}
        selectedSortId={selectedSortId}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        searchPlaceholder={searchPlaceholder}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        showFiltersInitially={showFiltersInitially}
      />
    </div>
  );
};

export default SearchAndFilter;
