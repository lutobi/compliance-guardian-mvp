'use client';

import { Control } from '@/types/control';
import {
  DocumentTextIcon,
  LinkIcon,
  ArrowPathIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface Props {
  control: Control;
  onStatusChange?: (status: Control['status']) => void;
}

export function ControlDetail({ control, onStatusChange }: Props) {
  const statusOptions: Control['status'][] = [
    'not-started',
    'in-progress',
    'implemented',
    'not-applicable',
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not-started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'not-applicable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{control.name}</h2>
            <p className="text-gray-600 mt-2">{control.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={control.status}
              onChange={(e) => onStatusChange?.(e.target.value as Control['status'])}
              className={`px-4 py-2 rounded-full border ${getStatusColor(control.status)}`}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {control.category && (
            <div className="flex items-start">
              <TagIcon className="h-6 w-6 text-gray-400 mt-1" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Category</h3>
                <p className="mt-1 text-gray-600">{control.category}</p>
              </div>
            </div>
          )}

          {control.reference_links && control.reference_links.length > 0 && (
            <div className="flex items-start">
              <LinkIcon className="h-6 w-6 text-gray-400 mt-1" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">References</h3>
                <ul className="mt-1 space-y-1">
                  {control.reference_links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {control.dependency_ids && control.dependency_ids.length > 0 && (
            <div className="flex items-start">
              <ArrowPathIcon className="h-6 w-6 text-gray-400 mt-1" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Dependencies</h3>
                <ul className="mt-1 space-y-1">
                  {control.dependency_ids.map((id, index) => (
                    <li key={index} className="text-gray-600">
                      {id}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-start">
            <DocumentTextIcon className="h-6 w-6 text-gray-400 mt-1" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Last Updated</h3>
              <p className="mt-1 text-gray-600">
                {new Date(control.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
