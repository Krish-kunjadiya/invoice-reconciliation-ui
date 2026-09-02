'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Dropzone } from './Dropzone';
import { ResultsTable } from './ResultsTable';
import { SummaryTable } from './SummaryTable';
import { SidePanel } from './SidePanel';
import { CheckCircle2, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { downloadBase64Excel, exportToExcel, parseSummaryFromExcel } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToastProvider, useToast } from '@/components/ui/toast';

const PROCESSING_TIMEOUT_MS = 120000;

export function Dashboard() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}

function DashboardContent() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [excelBase64, setExcelBase64] = useState<string | null>(null);
  const [summarySheetData, setSummarySheetData] = useState<any[][] | null>(null);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [navigableItems, setNavigableItems] = useState<any[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<'uploading' | 'extracting' | 'done'>('uploading');

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const cancelledRef = useRef(false);

  const webhookUrl = process.env.NEXT_PUBLIC_WORKFLOW_URL;

  const processInvoices = async () => {
    if (files.length === 0) return;

    if (!webhookUrl) {
      toast("Workflow URL is not configured. Set NEXT_PUBLIC_WORKFLOW_URL.", "error");
      return;
    }

    cancelledRef.current = false;
    setUploadProgress(0);
    setProcessingStep('uploading');
    setIsProcessing(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const { status, statusText, body } = await new Promise<{ status: number; statusText: string; body: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("POST", webhookUrl);
        xhr.timeout = PROCESSING_TIMEOUT_MS;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.upload.onload = () => {
          setUploadProgress(100);
          setProcessingStep('extracting');
        };

        xhr.onload = () => resolve({ status: xhr.status, statusText: xhr.statusText, body: xhr.responseText });
        xhr.onerror = () => reject(new Error("Network error while contacting the workflow."));
        xhr.ontimeout = () => reject(Object.assign(new Error("timeout"), { name: "TimeoutError" }));
        xhr.onabort = () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }));

        xhr.send(formData);
      });

      if (status < 200 || status >= 300) {
        throw new Error(`Error: ${status} ${statusText}`);
      }

      let data: any;
      try {
        data = body ? JSON.parse(body) : null;
      } catch {
        throw new Error("Workflow returned a response that wasn't valid JSON.");
      }

      if (data?.success && data.items) {
        setProcessingStep('done');
        setSummary(data.summary);
        setResults(data.items);
        if (data.excelBase64) {
          setExcelBase64(data.excelBase64);
          const parsed = parseSummaryFromExcel(data.excelBase64);
          if (parsed) setSummarySheetData(parsed);
        }
      } else {
        toast("Workflow response did not indicate success or lacked items.", "error");
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        if (cancelledRef.current) {
          toast("Processing cancelled.", "info");
        } else {
          toast(`Request timed out after ${PROCESSING_TIMEOUT_MS / 1000}s. Please try again.`, "error");
        }
      } else if (error?.name === "TimeoutError") {
        toast(`Request timed out after ${PROCESSING_TIMEOUT_MS / 1000}s. Please try again.`, "error");
      } else {
        console.error("Failed to process invoices:", error);
        toast(error?.message ? `Failed to process invoices: ${error.message}` : "Failed to process invoices. See console for details.", "error");
      }
    } finally {
      xhrRef.current = null;
      setIsProcessing(false);
    }
  };

  const cancelProcessing = () => {
    cancelledRef.current = true;
    xhrRef.current?.abort();
  };

  const handleRowClick = (item: any, list: any[]) => {
    setSelectedItem(item);
    setNavigableItems(list);
    setIsPanelOpen(true);
  };

  const selectedIndex = selectedItem ? navigableItems.indexOf(selectedItem) : -1;
  const goToOffset = (offset: number) => {
    if (selectedIndex === -1) return;
    const newIndex = selectedIndex + offset;
    if (newIndex >= 0 && newIndex < navigableItems.length) {
      setSelectedItem(navigableItems[newIndex]);
    }
  };

  const hasResults = results.length > 0 && !isProcessing;

  return (
    <div className="w-full min-h-screen flex flex-col relative bg-background text-foreground bg-[radial-gradient(circle_at_top,rgba(100,116,139,0.12),transparent_55%)]">

      <header className="w-full flex items-center justify-between p-6 md:px-10 bg-background/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-70 transition-opacity">
              Invoice Reconciliation
            </Link>
            <p className="text-muted-foreground text-sm mt-1">Upload invoices and automatically validate line items</p>
          </div>
        </div>
        {isProcessing ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Agent Running</span>
          </div>
        ) : webhookUrl ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Agent Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border">
            <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
            <span className="text-xs font-medium text-muted-foreground">Agent Offline</span>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-10 pb-24 flex flex-col">

        {!hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex items-center justify-center min-h-[65vh]"
          >
            <Dropzone
              files={files}
              setFiles={setFiles}
              onProcess={processInvoices}
              isProcessing={isProcessing}
              onCancel={cancelProcessing}
              uploadProgress={uploadProgress}
              processingStep={processingStep}
            />
          </motion.div>
        )}

        {hasResults && (
          <div className="w-full space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col md:flex-row items-center justify-between bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Processing Complete</h2>
                  <p className="text-muted-foreground text-sm">Successfully reconciled {files.length} invoice{files.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <Button 
                variant="outline"
                className="mt-4 md:mt-0"
                onClick={() => {
                  setResults([]);
                  setSummary(null);
                  setExcelBase64(null);
                  setSummarySheetData(null);
                  setFiles([]);
                }}
              >
                Start New Session
              </Button>
            </motion.div>

            <Tabs defaultValue="summary" className="w-full">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <TabsList className="grid w-full sm:w-auto sm:min-w-md grid-cols-2">
                  <TabsTrigger value="summary">Invoice Summary</TabsTrigger>
                  <TabsTrigger value="line-items">Detailed Line Items</TabsTrigger>
                </TabsList>
                <Button
                  onClick={() => {
                    if (excelBase64) {
                      downloadBase64Excel(excelBase64, summary?.fileName || "Processed_Invoices.xlsx");
                    } else {
                      exportToExcel(results, summary);
                    }
                  }}
                  variant="default"
                  className="flex gap-2 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  Export XLSX
                </Button>
              </div>

              <TabsContent value="summary" className="focus-visible:outline-none">
                {summarySheetData ? (
                  <SummaryTable data={summarySheetData} />
                ) : (
                  <div className="p-12 text-center border rounded-xl bg-muted/20">
                    <p className="text-muted-foreground">The Excel summary data was not returned by the workflow.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="line-items" className="focus-visible:outline-none">
                <ResultsTable
                  items={results}
                  summary={summary}
                  onRowClick={handleRowClick}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        item={selectedItem}
        threshold={summary?.threshold || 5}
        onPrev={() => goToOffset(-1)}
        onNext={() => goToOffset(1)}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex >= 0 && selectedIndex < navigableItems.length - 1}
      />
      
    </div>
  );
}
