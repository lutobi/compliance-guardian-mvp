'use client';

import { useState } from 'react';
import { Evidence } from '@/types/evidence';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, X, Edit2, Trash2, Save } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EvidenceDialogProps {
  subcontrolId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidence: Evidence) => void;
  onDelete: (evidenceId: string) => void;
  onUpdate: (evidenceId: string, evidence: Evidence) => void;
  existingEvidence?: Evidence[];
  frameworkId?: string;
  subcontrolName?: string;
}

const EvidenceDialog: React.FC<EvidenceDialogProps> = ({ 
  subcontrolId, 
  isOpen, 
  onClose,
  onSubmit,
  onDelete,
  onUpdate,
  existingEvidence = [],
  frameworkId,
  subcontrolName
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = e.dataTransfer.files;
    setFiles(droppedFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newEvidence: Evidence = {
      id: Date.now().toString(),
      subcontrolId,
      frameworkId: frameworkId || '',
      files: files ? Array.from(files).map(f => ({ name: f.name, size: f.size })) : [],
      notes,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simulate file upload progress
    const interval = setInterval(() => {
      console.log('Uploading files...');
    }, 200);

    await onSubmit(newEvidence);
    clearInterval(interval);
    setFiles(null);
    setNotes('');
    setTags([]);
    onClose();
  };

  const handleUpdate = (evidenceId: string) => {
    const evidence = existingEvidence.find(e => e.id === evidenceId);
    if (evidence) {
      onUpdate(evidenceId, {
        ...evidence,
        notes: editingNotes,
        updatedAt: new Date().toISOString()
      });
    }
    setEditingId(null);
    setEditingNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {subcontrolName ? `Evidence for ${subcontrolName}` : 'Add Evidence'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Evidence Section */}
          {existingEvidence.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Existing Evidence</h3>
              <div className="space-y-2">
                {existingEvidence.map(evidence => (
                  <div key={evidence.id} className="border rounded-lg p-4">
                    {editingId === evidence.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditingNotes('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(evidence.id)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-grow">
                            <p className="text-sm text-gray-600">{evidence.notes}</p>
                            {evidence.files && evidence.files.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {evidence.files.map((file, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-1 text-xs text-gray-500"
                                  >
                                    <Paperclip className="w-3 h-3" />
                                    <span>{file.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-400">
                              Updated {formatDistanceToNow(new Date(evidence.updatedAt))} ago
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingId(evidence.id);
                                setEditingNotes(evidence.notes);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(evidence.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Evidence Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Files
              </label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800"
                >
                  Choose files
                </label>
                <span className="text-gray-500"> or drag and drop</span>
              </div>
              {files && (
                <div className="mt-2 space-y-1">
                  {Array.from(files).map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFiles(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Evidence</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceDialog;
