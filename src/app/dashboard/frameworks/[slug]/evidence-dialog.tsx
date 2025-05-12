'use client';

import { useState, useEffect } from 'react';
import { EvidenceService } from '@/services/evidence';
import { Evidence, EvidenceFile } from '@/types/evidence';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, X, Edit2, Trash2, Save } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface EvidenceDialogProps {
  subcontrolId: string;
  controlId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidence: Evidence) => void;
  onDelete: (evidenceId: string) => void;
  onUpdate: (evidenceId: string, evidence: Evidence) => void;
  existingEvidence?: Evidence[];
  frameworkId?: string;
  assessmentId: string;
  subcontrolName?: string;
}

export const EvidenceDialog: React.FC<EvidenceDialogProps> = ({ 
  subcontrolId, 
  controlId,
  isOpen, 
  onClose,
  onSubmit,
  onDelete,
  onUpdate,
  existingEvidence = [],
  frameworkId,
  assessmentId,
  subcontrolName
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const evidenceService = new EvidenceService();

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

  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting evidence with framework ID:', frameworkId);
    if (!files && !notes.trim()) {
      toast.error('Please add files or notes');
      return;
    }
    if (!frameworkId) {
      toast.error('Framework ID is required');
      return;
    }
    if (!validateUUID(frameworkId)) {
      console.error('Invalid framework ID format:', frameworkId);
      toast.error('Invalid framework ID format');
      return;
    }

    setLoading(true);

    try {
      // First upload any files
      const uploadedFiles: EvidenceFile[] = [];
      if (files) {
        for (const file of Array.from(files)) {
          // Check file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`File ${file.name} is too large. Maximum size is 10MB`);
          }

          // Check file type
          const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
          if (!allowedTypes.includes(file.type)) {
            throw new Error(`File type ${file.type} is not supported`);
          }

          const path = `${frameworkId}/${subcontrolId}/${Date.now()}-${file.name}`;
          const result = await evidenceService.uploadFile(file, path);
          if (result.success && result.data) {
            uploadedFiles.push(result.data);
          } else {
            throw new Error(`Failed to upload file ${file.name}: ${result.error?.message}`);
          }
        }
      }

      // Create the evidence record
      const result = await evidenceService.addEvidence({
        controlId,
        assessmentId,
        subcontrolId,
        frameworkId: frameworkId || '',
        files: uploadedFiles,
        notes: notes.trim(),
        tags: tags.filter(tag => tag.trim() !== ''),
        controlName: subcontrolName || ''
      });

      if (result.success && result.data) {
        onSubmit(result.data);
        setFiles(null);
        setNotes('');
        setTags([]);
        onClose();
        toast.success('Evidence added successfully');
      } else {
        throw new Error(result.error?.message || 'Failed to add evidence');
      }
    } catch (error: any) {
      console.error('Error submitting evidence:', error);
      toast.error(error.message || 'Failed to add evidence');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (evidenceId: string) => {
    setLoading(true);
    try {
      const evidence = existingEvidence.find(e => e.id === evidenceId);
      if (evidence) {
        const result = await evidenceService.updateEvidence(evidenceId, {
          ...evidence,
          notes: editingNotes
        });

        if (result.success && result.data) {
          onUpdate(evidenceId, result.data);
        } else {
          throw new Error(result.error?.message || 'Failed to update evidence');
        }
      }
      setEditingId(null);
      setEditingNotes('');
    } catch (error) {
      console.error('Error updating evidence:', error);
    } finally {
      setLoading(false);
    }
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
                                if (loading) return;
                                setEditingId(evidence.id);
                                setEditingNotes(evidence.notes);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (loading) return;
                                setLoading(true);
                                await onDelete(evidence.id);
                                setLoading(false);
                              }}
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
              <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Evidence'}
            </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
