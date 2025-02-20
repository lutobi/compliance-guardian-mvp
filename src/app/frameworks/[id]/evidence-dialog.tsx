'use client';

import { useState } from 'react';
import { Evidence } from '@/types/evidence';

interface EvidenceDialogProps {
  subcontrolId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidence: Evidence) => void;
  onDelete: (evidenceId: string) => void;
  onUpdate: (evidenceId: string, evidence: Evidence) => void;
  existingEvidence?: Evidence[];
}

const EvidenceDialog: React.FC<EvidenceDialogProps> = ({ 
  subcontrolId, 
  isOpen, 
  onClose,
  onSubmit,
  onDelete,
  onUpdate,
  existingEvidence = []
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evidence: Evidence = {
      type: 'document',
      description: '',
      frequency: 'as-needed',
      retention: '1 year',
      type: 'document',
      files: files ? Array.from(files).map(f => f.name) : [],
      notes: notes.trim() || '',
      timestamp: new Date().toISOString(),
      version: 1,
      required: [],
      optional: []
    };
    onSubmit(evidence);
    setFiles(null);
    setNotes('');
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Upload Evidence for {subcontrolId}</h3>
            {existingEvidence.length > 0 && (
              <p className="text-sm text-gray-600">
                {existingEvidence.length} existing {existingEvidence.length === 1 ? 'entry' : 'entries'}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {existingEvidence.length > 0 && (
          <div className="mb-6 border-b pb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Evidence</h4>
            <div className="space-y-3">
              {existingEvidence.map((evidence) => (
                <div key={evidence.type} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{evidence.frequency}</span>
                      {evidence.files && evidence.files.length > 0 && (
                        <span className="text-blue-600 text-xs px-2 py-0.5 bg-blue-50 rounded-full">
                          {evidence.files.length} {evidence.files.length === 1 ? 'file' : 'files'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(evidence.type);
                          setEditingNotes(evidence.notes || '');
                        }}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(evidence.type)}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {editingId === evidence.type ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        className="w-full border rounded p-2 text-sm"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdate(evidence.type, {
                              ...evidence,
                              notes: editingNotes.trim() || ''
                            });
                            setEditingId(null);
                          }}
                          className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    evidence.notes && <p className="text-gray-600 whitespace-pre-wrap">{evidence.notes}</p>
                  )}
                  {evidence.files && evidence.files.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {evidence.files.map((file, index) => (
                          <span key={index} className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded">
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-4 text-center ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => setFiles(e.target.files)}
                  />
                  <span className="text-blue-600 hover:text-blue-700">Choose files</span>
                </label>
                <span className="mx-2">or drag them here</span>
              </div>
              {files && (
                <div className="text-sm text-gray-600">
                  {Array.from(files).map(file => file.name).join(', ')}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg p-2"
              rows={3}
              placeholder="Add any relevant notes..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg ${
                files || notes.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!files && !notes.trim()}
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvidenceDialog;
