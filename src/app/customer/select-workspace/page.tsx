'use client';
import { useAuth } from '@/lib/auth/context';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SelectWorkspace() {
  const { user, loading: authLoading, isCustomerUser, isSystemUser } = useAuth();
  const { workspace, loading: workspaceLoading, workspaces, selectWorkspace, createWorkspace } = useCustomerWorkspace();
  const router = useRouter();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  useEffect(() => {
    if (!authLoading && !workspaceLoading) {
      if (!isCustomerUser && !isSystemUser) {
        router.replace('/auth/login');
      } else if (isSystemUser) {
        router.replace('/customer/dashboard');
      } else if (workspace) {
        router.replace('/customer/dashboard');
      }
    }
  }, [authLoading, workspaceLoading, isCustomerUser, isSystemUser, workspace, router]);

  if (authLoading || workspaceLoading) return <div>Loading...</div>;
  if (!isCustomerUser && !isSystemUser) return null;
  if (workspace) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Select Workspace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => selectWorkspace(ws.id)}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold mb-2">{ws.name}</h2>
            <p className="text-gray-600">Workspace ID: {ws.id}</p>
          </button>
        ))}

        {workspaces.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-600">No workspaces found</p>
            <div className="mt-4 flex flex-col items-center">
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="New workspace name"
                className="border px-2 py-1 rounded mb-2"
              />
              <button
                disabled={!newWorkspaceName}
                onClick={async () => {
                  await createWorkspace(newWorkspaceName);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Create Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
