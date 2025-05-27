'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { Evidence, EvidenceFile } from '@/types/evidence';

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
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setFiles(null);
      setEditingId(null);
      setEditingNotes('');
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notes.trim() && (!files || files.length === 0)) {
      toast.error('Please add notes or upload files');
      return;
    }
    
    setLoading(true);
    
    try {
      // Process files
      const uploadedFiles: EvidenceFile[] = [];
      
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;
          
          // Simulate file upload
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 10);
          
          uploadedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            url: `https://storage.example.com/${timestamp}_${randomId}`,
            id: `${timestamp}_${randomId}`
          });
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
      setFiles(new FileListWrapper(Array.from(e.target.files)));
    }
  };

  return (
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
                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">Files:</h4>
                          <div className="space-y-1">
                            {evidence.files.map((file, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <Paperclip className="w-4 h-4 mr-1" />
                                <span>{file.name}</span>
                              </div>
                            ))}
                          </div>
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
              
              {files && files.length > 0 ? (
                <div className="space-y-2">
                  {Array.from(files).map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = Array.from(files).filter((_, i) => i !== index);
                          setFiles(newFiles.length > 0 ? new FileListWrapper(newFiles) : null);
                        }}
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label
                    htmlFor="file-upload"
                    className="block text-center text-sm text-blue-500 cursor-pointer mt-2"
                  >
                    Add more files
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
  );
}
