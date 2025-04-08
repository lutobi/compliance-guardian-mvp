'use client';

import React from 'react';
import { RefreshCw, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  lastUpdated: string;
  isLoading: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export function DashboardHeader({ 
  lastUpdated, 
  isLoading, 
  onRefresh, 
  onExport 
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center space-x-2 mt-4 md:mt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>All Frameworks</DropdownMenuItem>
            <DropdownMenuItem>High Priority Only</DropdownMenuItem>
            <DropdownMenuItem>Recent Activity</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
