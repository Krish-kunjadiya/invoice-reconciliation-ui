import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface DropzoneProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onProcess: () => void;
  isProcessing: boolean;
  onCancel: () => void;
}

function ElapsedTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return <>{seconds}s elapsed</>;
}

export function Dropzone({ files, setFiles, onProcess, isProcessing, onCancel }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounterRef = useRef(0);

  const addFiles = useCallback((incoming: File[]) => {
    const pdfs = incoming.filter(file => file.type === 'application/pdf');
    const rejected = incoming.length - pdfs.length;
    if (rejected > 0) {
      toast(`${rejected} file${rejected > 1 ? 's were' : ' was'} skipped — only PDF files are supported.`, 'error');
    }
    if (pdfs.length > 0) setFiles((prev) => [...prev, ...pdfs]);
  }, [setFiles, toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragActive(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  if (isProcessing) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-12 text-center border-primary/20 bg-primary/5 shadow-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center space-y-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            <UploadCloud className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Processing Invoices...</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This can take up to 2 minutes — <ElapsedTimer />
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </motion.div>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload PDF invoices. Drag and drop files here, or press Enter to browse."
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => {
          e.preventDefault();
          dragCounterRef.current += 1;
          setIsDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dragCounterRef.current -= 1;
          if (dragCounterRef.current <= 0) {
            dragCounterRef.current = 0;
            setIsDragActive(false);
          }
        }}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "border-2 border-dashed border-muted-foreground/30 rounded-2xl hover:border-primary hover:bg-muted/30 transition-all cursor-pointer p-14 flex flex-col items-center justify-center bg-card shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isDragActive && "border-solid border-blue-500 bg-blue-500/10 scale-[1.02] shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/20"
        )}
      >
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors",
          isDragActive ? "bg-blue-500/20" : "bg-primary/10"
        )}>
          <UploadCloud className={cn("w-8 h-8 transition-colors", isDragActive ? "text-blue-500" : "text-primary")} />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {isDragActive ? "Drop to upload" : "Upload PDF Invoices"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">Drag and drop your files here, or click to browse</p>
        
        <input ref={inputRef} type="file" className="hidden" multiple accept="application/pdf" onChange={onFileSelect} />
        <Button variant="secondary" className="pointer-events-none">
          Browse Files
        </Button>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-medium">{files.length} file(s) selected</span>
              <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="h-8 text-muted-foreground hover:text-foreground">Clear all</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.map((file: File, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card text-card-foreground shadow-sm"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setFiles((prev: any) => prev.filter((_: any, i: number) => i !== idx))}>
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <Button size="lg" onClick={onProcess} className="w-full sm:w-auto px-10 rounded-full shadow-lg shadow-primary/20">
                Process {files.length} Invoice{files.length > 1 ? 's' : ''}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
