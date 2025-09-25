'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, X, Edit2, Trash2, Save } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import { Evidence as EvidenceType, EvidenceFile } from '@/types/evidence';

interface Evidence extends Omit<EvidenceType, 'files'> {
  files: Array<{
    name: string;
    size: number;
    type?: string;
    url?: string;
    id?: string;
  }>;
}

interface EvidenceDialogProps {
  subcontrolId: string;
  controlId: string;
  frameworkId: string;
  assessmentId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidence: Partial<Evidence>) => Promise<void>;
  onUpdate: (evidenceId: string, updates: Partial<Evidence>) => Promise<void>;
  onDelete: (evidenceId: string) => Promise<void>;
  existingEvidence?: Evidence[];
  subcontrolName?: string;
}

export const LegacyEvidenceDialog: React.FC<EvidenceDialogProps> = ({ 
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
}): React.ReactElement => {
  // State for evidence list and form
  const [localEvidence, setLocalEvidence] = useState<Evidence[]>(existingEvidence);
  const [files, setFiles] = useState<FileListWrapper | null>(null);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Update local evidence when external evidence changes
  useEffect(() => {
    if (JSON.stringify(existingEvidence) !== JSON.stringify(localEvidence)) {
      setLocalEvidence(existingEvidence);
    }
  }, [existingEvidence]);

  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Only reset if we're opening the dialog
      setFiles(null);
      setNotes('');
      setEditingId(null);
      setEditingNotes('');
      setTags([]);
      setSearchTerm('');
    }
    // We only want to run this effect when isOpen changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      // Validate file types before setting
      const validFiles = Array.from(droppedFiles).filter(file => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Unsupported file type: ${file.name}`);
          return false;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
          return false;
        }
        
        return true;
      });
      
      if (validFiles.length > 0) {
        setFiles(prevFiles => {
          // If there are existing files, combine them with the new ones
          const existingFiles = prevFiles ? Array.from(prevFiles) : [];
          return new FileListWrapper([...existingFiles, ...validFiles]);
        });
      }
    }
  };
  
  // Simple array-based FileList implementation
  class FileListWrapper extends Array<File> implements FileList {
    constructor(files: File[] = []) {
      super(...files);
      Object.setPrototypeOf(this, FileListWrapper.prototype);
    }
    
    item(index: number): File | null {
      return this[index] || null;
    }
    
    // This makes TypeScript happy with array access
    [index: number]: File;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!files || files.length === 0) {
      if (!notes.trim()) {
        toast.error('Please add at least one file or enter some notes');
        return;
      }
    }
    
    if (!frameworkId) {
      toast.error('Framework ID is required');
      return;
    }
    if (!validateFrameworkId(frameworkId)) {
      console.warn('Framework ID is not a UUID; proceeding with fallback identifier:', frameworkId);
    }
    
    if (!subcontrolId) {
      toast.error('Subcontrol ID is required');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Submitting evidence...');

    try {
      // Prepare files for upload
      const uploadedFiles: EvidenceFile[] = [];
      
      if (files && files.length > 0) {
        // In a real implementation, you would upload files here
        // For now, we'll just prepare the file metadata
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;
          
          try {
            // Generate a unique filename
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 10);
            const sanitizedFileName = file.name
              .replace(/[^a-zA-Z0-9.-]/g, '_')
              .replace(/\s+/g, '_')
              .replace(/__+/g, '_');
              
            const filePath = `evidence/${frameworkId}/${subcontrolId}/${timestamp}_${randomId}_${sanitizedFileName}`;
            
            // Simulate file upload
            await new Promise(resolve => setTimeout(resolve, 500));
            
            uploadedFiles.push({
              name: file.name,
              size: file.size,
              type: file.type,
              // In a real implementation, this would be the URL from your storage service
              url: `https://storage.example.com/${filePath}`,
              id: `${timestamp}_${randomId}`
            });
            
            console.log(`Processed file: ${file.name}`);
          } catch (fileError) {
            console.error(`Error processing file ${file.name}:`, fileError);
            toast.error(`Error processing ${file.name}`);
            // Continue with other files even if one fails
          }
        }
      }

      // Prepare evidence data
      const evidenceData: Omit<Partial<Evidence>, 'id' | 'createdAt' | 'updatedAt'> = {
        subcontrolId,
        frameworkId,
        controlId,
        notes: notes.trim(),
        files: uploadedFiles,
        tags,
        status: 'submitted',
        createdBy: 'current-user-id', // Replace with actual user ID from auth context
        updatedBy: 'current-user-id', // Replace with actual user ID from auth context
        // Only include assessmentId if it's provided
        ...(assessmentId && { assessmentId })
      };

      console.log('Submitting evidence with data:', evidenceData);

      // Call the onSubmit callback with the evidence data
      await onSubmit(evidenceData);
      
      // Reset form on success
      setFiles(null);
      setNotes('');
      setTags([]);
      
      toast.success('Evidence submitted successfully', { id: toastId });
      onClose();
    } catch (error) {
      console.error('Error submitting evidence:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit evidence',
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (evidenceId: string) => {
    if (!editingNotes.trim()) {
      toast.error('Please enter some notes');
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading('Updating evidence...');
    
    try {
      const evidence = existingEvidence.find(e => e.id === evidenceId);
      if (evidence) {
        const updates: Partial<Evidence> = {
          notes: editingNotes.trim(),
          updatedAt: new Date().toISOString(),
          updatedBy: 'current-user-id' // Replace with actual user ID from auth context
        };
        
        // Call the onUpdate callback and await the Promise
        await onUpdate(evidenceId, updates);
        
        // Reset edit state on success
        setEditingId(null);
        setEditingNotes('');
        toast.success('Evidence updated successfully', { id: toastId });
      }
    } catch (error) {
      console.error('Error updating evidence:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update evidence',
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (evidenceId: string) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to delete this evidence? This action cannot be undone.');
    if (!confirmDelete) return;
    
    setLoading(true);
    try {
      await onDelete(evidenceId);
      toast.success('Evidence deleted successfully');
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast.error('Failed to delete evidence');
      // Re-throw the error to allow the parent component to handle it if needed
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // Accept either a v4 UUID or a non-empty identifier (slug fallback)
  const validateFrameworkId = (value: string): boolean => {
    if (!value || typeof value !== 'string') return false;
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(value) || value.trim().length > 0;
  };

  // Only render the dialog when it's open to prevent infinite update loops
  if (!isOpen) {
    return <></>; // Return empty fragment instead of null
  }
  
  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{subcontrolName || 'Add Evidence'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Evidence List */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Existing Evidence</h3>
            <div className="space-y-4">
              {localEvidence.length === 0 ? (
                <p className="text-gray-500">No evidence added yet</p>
              ) : (
                localEvidence.map((evidence) => (
                  <div key={evidence.id} className="border p-4 rounded-lg">
                    {editingId === evidence.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          className="w-full p-2 border rounded"
                          rows={3}
                        />
                        <div className="space-x-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleUpdate(evidence.id);
                            }}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>{evidence.notes}</p>
                        <div className="space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(evidence.id);
                              setEditingNotes(evidence.notes);
                            }}
                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                            disabled={loading}
                          >
                            {editingId === evidence.id ? 'Editing...' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDelete(evidence.id)}
                            disabled={loading}
                            className={`px-3 py-1 text-sm border rounded text-red-500 hover:bg-red-50 ${
                              loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {loading ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Evidence Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Add notes about this evidence..."
              />
            </div>

            <div
              className="border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnter={(e) => e.preventDefault()}
            >
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    // Validate files before setting
                    const validFiles = Array.from(e.target.files).filter(file => {
                      const allowedTypes = [
                        'image/jpeg',
                        'image/png',
                        'application/pdf',
                        'text/plain',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                      ];
                      
                      if (!allowedTypes.includes(file.type)) {
                        toast.error(`Unsupported file type: ${file.name}`);
                        return false;
                      }
                      
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
                        return false;
                      }
                      
                      return true;
                    });
                    
                    if (validFiles.length > 0) {
                      setFiles(prevFiles => {
                        const existingFiles = prevFiles ? Array.from(prevFiles) : [];
                        return new FileListWrapper([...existingFiles, ...validFiles]);
                      });
                    }
                  }
                }}
                className="hidden"
                id="file-upload"
                accept="image/jpeg,image/png,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center p-6 w-full h-full min-h-[120px] transition-colors duration-200"
              >
                {files && files.length > 0 ? (
                  <div className="w-full space-y-3">
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {Array.from(files).map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles(prevFiles => {
                                if (!prevFiles) return null;
                                const filesArray = Array.from(prevFiles);
                                filesArray.splice(index, 1);
                                return filesArray.length > 0 ? new FileListWrapper(filesArray) : null;
                              });
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-blue-600 hover:text-blue-800">
                      Click to add more files or drag and drop
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Paperclip className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      <span className="text-blue-600 hover:text-blue-500">Upload files</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, TXT, JPG, or PNG (max 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Evidence'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LegacyEvidenceDialog;
