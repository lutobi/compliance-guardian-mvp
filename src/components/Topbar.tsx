'use client';

export default function Topbar() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Compliance Guardian</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Placeholder for future features */}
            <div className="text-sm text-gray-600">
              Demo Version
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
