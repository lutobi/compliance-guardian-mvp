'use client';

import { useState } from 'react';
import { ControlHierarchy } from '@/types/control';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Props {
  controls: ControlHierarchy[];
  onControlClick?: (controlId: string) => void;
}

interface ControlNodeProps extends Props {
  level: number;
}

function ControlNode({ controls, level, onControlClick }: ControlNodeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (controlId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(controlId)) {
      newExpanded.delete(controlId);
    } else {
      newExpanded.add(controlId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      case 'not-applicable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ul className="space-y-1">
      {controls.map((control) => (
        <li key={control.id} className="relative">
          <div
            className={`flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${
              level > 0 ? 'ml-6' : ''
            }`}
            onClick={() => onControlClick?.(control.id)}
          >
            {control.children && control.children.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(control.id);
                }}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {expandedNodes.has(control.id) ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{control.name}</span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    control.status
                  )}`}
                >
                  {control.status.replace('-', ' ')}
                </span>
              </div>
              {control.description && (
                <p className="text-sm text-gray-600 mt-1">{control.description}</p>
              )}
            </div>
          </div>
          {control.children && control.children.length > 0 && expandedNodes.has(control.id) && (
            <ControlNode
              controls={control.children}
              level={level + 1}
              onControlClick={onControlClick}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export function ControlHierarchyView({ controls, onControlClick }: Props) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Controls</h2>
      </div>
      <div className="p-4">
        <ControlNode controls={controls} level={0} onControlClick={onControlClick} />
      </div>
    </div>
  );
}
