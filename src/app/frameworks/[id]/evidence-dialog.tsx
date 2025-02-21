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
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

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
    setFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files && !notes) return;

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

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    await onSubmit(newEvidence);
    clearInterval(interval);
    setFiles(null);
    setNotes('');
    setTags([]);
    setUploadProgress(0);
  };

  const handleEdit = (evidence: Evidence) => {
    setEditingId(evidence.id);
    setEditingNotes(evidence.notes);
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

        <div className="space-y-3">
          {/* Existing Evidence Section */}
          {existingEvidence.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Existing Evidence</h3>
              <div className="space-y-2">
                {existingEvidence.map((evidence) => (
                  <div
                    key={evidence.id}
                    className="p-2 border rounded-md bg-gray-50"
                  >
                    {editingId === evidence.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          className="w-full min-h-[60px] text-sm"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
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
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <p className="text-sm flex-1">{evidence.notes}</p>
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() => handleEdit(evidence)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => onDelete(evidence.id)}
                              className="p-1 hover:bg-gray-200 rounded text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <time>
                            {formatDistanceToNow(new Date(evidence.createdAt), {
                              addSuffix: true,
                            })}
                          </time>
                          {evidence.files?.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{evidence.files.length} files</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Evidence Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div
              className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setFiles(e.target.files)}
              />
              <Paperclip className="mx-auto h-6 w-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Drop files here or click to upload
              </p>
            </div>

            {files && (
              <div className="space-y-2">
                {Array.from(files).map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                  >
                    <span className="truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles(null)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Textarea
                placeholder="Add notes about this evidence..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[80px]"
              />
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!files && !notes}
                className="w-full sm:w-auto"
              >
                Add Evidence
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceDialog;
