import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud, FileText, File as FileIcon, X, CheckCircle2, Sparkles, ScanSearch } from 'lucide-react';
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
  uploadProgress: number;
  processingStep: 'uploading' | 'extracting' | 'done';
}

function ElapsedTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return <>{seconds}s elapsed</>;
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const STEPS = [
  { key: 'uploading', label: 'Uploading', icon: UploadCloud },
  { key: 'extracting', label: 'Extracting & Matching', icon: ScanSearch },
  { key: 'done', label: 'Finalizing', icon: Sparkles },
] as const;

function ProcessingSteps({ processingStep, uploadProgress }: { processingStep: DropzoneProps['processingStep']; uploadProgress: number }) {
  const activeIndex = STEPS.findIndex((s) => s.key === processingStep);

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;
          const Icon = step.icon;
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={isActive ? { repeat: Infinity, duration: 1.4 } : undefined}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isDone && "bg-primary border-primary text-primary-foreground",
                    isActive && !isDone && "border-primary text-primary bg-primary/10",
                    !isActive && !isDone && "border-muted-foreground/20 text-muted-foreground/40"
                  )}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </motion.div>
                <span className={cn(
                  "text-[11px] font-medium text-center leading-tight",
                  (isActive || isDone) ? "text-foreground" : "text-muted-foreground/50"
                )}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="h-0.5 flex-1 -mt-5 rounded-full bg-muted-foreground/15 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: idx < activeIndex ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {processingStep === 'uploading' ? (
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full shimmer-bar"
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
        </div>
      ) : (
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
          <motion.div
            className="h-full w-1/3 rounded-full bg-primary absolute"
            animate={{ left: ['-33%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          />
        </div>
      )}
    </div>
  );
}

export function Dropzone({ files, setFiles, onProcess, isProcessing, onCancel, uploadProgress, processingStep }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounterRef = useRef(0);

  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const [fileReady, setFileReady] = useState<Record<string, boolean>>({});

  // Simulated per-file "landing" progress — every newly added file fills up locally
  // before it's considered ready to be sent in the real upload request.
  useEffect(() => {
    setFileProgress((prev) => {
      const next = { ...prev };
      for (const file of files) {
        const key = fileKey(file);
        if (!(key in next)) next[key] = 0;
      }
      return next;
    });
    setFileReady((prev) => {
      const next = { ...prev };
      for (const file of files) {
        const key = fileKey(file);
        if (!(key in next)) next[key] = false;
      }
      return next;
    });
  }, [files]);

  useEffect(() => {
    const pendingKeys = files.map(fileKey).filter((key) => (fileProgress[key] ?? 0) < 100);
    if (pendingKeys.length === 0) return;

    const timer = setInterval(() => {
      setFileProgress((prev) => {
        const next = { ...prev };
        for (const key of pendingKeys) {
          const current = next[key] ?? 0;
          if (current < 100) next[key] = Math.min(100, current + (6 + Math.random() * 10));
        }
        return next;
      });
    }, 220);
    return () => clearInterval(timer);
  }, [files, fileProgress]);

  useEffect(() => {
    const justFinished = files
      .map(fileKey)
      .filter((key) => (fileProgress[key] ?? 0) >= 100 && !fileReady[key]);
    if (justFinished.length === 0) return;

    const timers = justFinished.map((key) =>
      setTimeout(() => {
        setFileReady((prev) => ({ ...prev, [key]: true }));
      }, 350)
    );
    return () => timers.forEach(clearTimeout);
  }, [files, fileProgress, fileReady]);

  const readyCount = files.filter((f) => fileReady[fileKey(f)]).length;
  const allReady = files.length > 0 && readyCount === files.length;

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

  const removeFile = (key: string) => {
    setFiles((prev) => prev.filter((f) => fileKey(f) !== key));
    setFileProgress((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setFileReady((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  if (isProcessing) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-12 text-center border-primary/20 bg-primary/5 shadow-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          <div>
            <h3 className="text-xl font-semibold">Processing Invoices...</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This can take up to 2 minutes — <ElapsedTimer />
            </p>
          </div>

          <ProcessingSteps processingStep={processingStep} uploadProgress={uploadProgress} />

          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </motion.div>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-24">
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
          "relative overflow-hidden border-2 border-dashed border-muted-foreground/30 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer p-14 flex flex-col items-center justify-center bg-card shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isDragActive && "border-solid border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20 ring-4 ring-primary/20"
        )}
      >
        {files.length === 0 && (
          <>
            <FileText className="absolute left-8 top-9 w-6 h-6 text-primary/20 anim-float-1" />
            <FileText className="absolute right-10 top-14 w-5 h-5 text-primary/20 anim-float-2" />
            <FileText className="absolute left-16 bottom-10 w-4 h-4 text-primary/20 anim-float-3" />
          </>
        )}

        <div className="relative mb-6">
          <span className="absolute inset-0 rounded-full bg-primary anim-breathe" />
          <motion.div
            animate={isDragActive ? { scale: 1.1, rotate: [0, -6, 6, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 transition-colors"
          >
            <UploadCloud className="w-8 h-8 transition-colors text-primary" />
          </motion.div>
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

            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence>
                {files.map((file: File) => {
                  const key = fileKey(file);
                  const progress = fileProgress[key] ?? 0;
                  const isReady = !!fileReady[key];

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 14, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      key={key}
                      className="flex items-center gap-3 p-3 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="relative w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-4 h-4 text-primary" />
                        {isReady && (
                          <motion.span
                            initial={{ scale: 0, rotate: -8 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </motion.span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
                        </div>
                        {!isReady && (
                          <div className="mt-1.5 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full shimmer-bar"
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeFile(key)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-6 pb-6 pointer-events-none"
          >
            <div className="pointer-events-auto bg-background/95 backdrop-blur-md border shadow-2xl shadow-primary/10 rounded-full p-2 pl-5 flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {allReady ? `${files.length} file${files.length > 1 ? 's' : ''} ready` : `${readyCount}/${files.length} ready`}
              </span>
              <Button size="lg" onClick={onProcess} disabled={!allReady} className="px-8 rounded-full shadow-lg shadow-primary/20">
                Process {files.length} Invoice{files.length > 1 ? 's' : ''}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
