'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { Evidence, EvidenceFile } from '@/types/evidence';
import { EvidenceService } from '@/services/evidence';

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

interface FilePreview { url: string; name: string; type?: string; }

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

export default function EvidenceDialog({
  subcontrolId,
  controlId,
  frameworkId,
  assessmentId,
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  existingEvidence = [],
  subcontrolName
}: EvidenceDialogProps) {
  // Simple state management hooks moved above the mounted guard to maintain hook order
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<FileListWrapper | null>(null);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const previewUrlsRef = useRef<string[]>([]);
  const [previewFile, setPreviewFile] = useState<FilePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setFiles(null);
      setFilePreviews([]);
      setEditingId(null);
      setEditingNotes('');
    }
  }, [isOpen]);

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notes.trim() && (!files || files.length === 0)) {
      toast.error('Please add notes or upload files');
      return;
    }
    
    setLoading(true);
    
    try {
      const service = new EvidenceService();
      // Process and upload files
      const uploadedFiles: EvidenceFile[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;
          const res = await service.uploadFile(file, `${frameworkId}/${subcontrolId}`);
          if (res.success && res.data) {
            uploadedFiles.push(res.data);
          } else {
            toast.error(`Failed to upload file: ${file.name}`);
          }
        }
      }
      
      // Create evidence object
      const evidence: Partial<Evidence> = {
        subcontrolId,
        controlId,
        frameworkId,
        notes: notes.trim(),
        files: uploadedFiles,
        status: 'submitted'
      };
      
      if (assessmentId) {
        evidence.assessmentId = assessmentId;
      }
      
      // Submit evidence
      await onSubmit(evidence);
      toast.success('Evidence submitted successfully');
      
      // Reset form
      setNotes('');
      setFiles(null);
      setFilePreviews([]);
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error('Error submitting evidence:', error);
      toast.error('Failed to submit evidence');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle evidence update
  const handleUpdate = async (evidenceId: string) => {
    if (!editingNotes.trim()) {
      toast.error('Please enter notes');
      return;
    }
    
    setLoading(true);
    
    try {
      await onUpdate(evidenceId, {
        notes: editingNotes.trim(),
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Evidence updated successfully');
      setEditingId(null);
      setEditingNotes('');
    } catch (error) {
      console.error('Error updating evidence:', error);
      toast.error('Failed to update evidence');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle evidence deletion
  const handleDelete = async (evidenceId: string) => {
    if (!window.confirm('Are you sure you want to delete this evidence?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onDelete(evidenceId);
      toast.success('Evidence deleted successfully');
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast.error('Failed to delete evidence');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const list = Array.from(e.target.files);
      setFiles(new FileListWrapper(list));
      // generate previews
      const previews = list.map(file => {
        const url = URL.createObjectURL(file);
        previewUrlsRef.current.push(url);
        return { url, name: file.name, type: file.type };
      });
      



      setFilePreviews(prev => [...prev, ...previews]);
    }
  };

  return (
    <>
    <Dialog open={isOpen} modal>
      <DialogContent 
        className="max-w-4xl" 
        onEscapeKeyDown={onClose}
        onPointerDownOutside={onClose}
      >
        <DialogHeader>
          <DialogTitle>{subcontrolName || 'Add Evidence'}</DialogTitle>
          <DialogDescription>
            {subcontrolName ? `Provide evidence for ${subcontrolName}` : 'Provide evidence details'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Existing Evidence */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Existing Evidence</h3>
          
          {existingEvidence.length === 0 ? (
            <p className="text-gray-500">No evidence added yet</p>
          ) : (
            <div className="space-y-4">
              {existingEvidence.map((evidence) => (
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
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingId(null)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleUpdate(evidence.id)}
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>{evidence.notes}</p>
                      
                      {evidence.files && evidence.files.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {evidence.files.map((file, index) => (
                            <div key={index} className="w-24 h-24 border rounded overflow-hidden cursor-pointer" onClick={() => setPreviewFile({ url: file.url!, name: file.name, type: file.type })}>
                              {file.type?.startsWith('image') ? (
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full p-1 text-xs text-gray-800">
                                  {file.name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="space-x-2 mt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingId(evidence.id);
                            setEditingNotes(evidence.notes);
                          }}
                          disabled={loading}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(evidence.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add Evidence Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Add notes about this evidence..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Files</label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              
              {filePreviews.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {filePreviews.map((preview, index) => (
                    <div key={index} className="w-24 h-24 border rounded overflow-hidden relative cursor-pointer" onClick={() => setPreviewFile(preview)}>
                      {preview.type?.startsWith('image') ? (
                        <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full p-1 truncate text-xs text-gray-800">
                          {preview.name}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          // remove preview and file
                          setFilePreviews(prev => {
                            const removed = prev[index];
                            if (removed) URL.revokeObjectURL(removed.url);
                            return prev.filter((_, i) => i !== index);
                          });
                          setFiles(prev => {
                            if (!prev) return null;
                            const arr = Array.from(prev).filter((_, i) => i !== index);
                            return arr.length > 0 ? new FileListWrapper(arr) : null;
                          });
                        }}
                        className="absolute top-1 right-1 text-white bg-black bg-opacity-50 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label htmlFor="file-upload" className="w-24 h-24 border-2 border-dashed rounded flex items-center justify-center cursor-pointer">
                    <Paperclip className="w-6 h-6 text-gray-400" />
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer p-4"
                >
                  <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-center">
                    <span className="text-blue-500">Upload files</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)
                  </p>
                </label>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Evidence'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>Preview: {previewFile?.name}</DialogTitle>
        </DialogHeader>
        <div className="h-[80vh] overflow-auto">
          {previewFile?.type?.startsWith('image') ? (
            <img src={previewFile?.url!} alt={previewFile?.name!} className="w-full h-full object-contain" />
          ) : previewFile?.type === 'application/pdf' ? (
            <embed src={previewFile?.url!} type="application/pdf" width="100%" height="100%" />
          ) : (
            <iframe src={previewFile?.url!} className="w-full h-full" />
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setPreviewFile(null)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}
