'use client';

import React, { useState } from 'react';
import { Dropzone } from './Dropzone';
import { ResultsTable } from './ResultsTable';
import { SidePanel } from './SidePanel';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function Dashboard() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [excelBase64, setExcelBase64] = useState<string | null>(null);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://husband-tracing-rewind.ngrok-free.dev/webhook-test/pdf-to-excel';

  const processInvoices = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.items) {
        setSummary(data.summary);
        setResults(data.items);
        if (data.excelBase64) {
          setExcelBase64(data.excelBase64);
        }
      } else {
        alert("Webhook response did not indicate success or lacked items.");
      }
    } catch (error) {
      console.error("Failed to process invoices:", error);
      alert("Failed to process invoices. See console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsPanelOpen(true);
  };

  const hasResults = results.length > 0 && !isProcessing;

  return (
    <div className="w-full min-h-screen flex flex-col relative bg-background text-foreground">
      
      <header className="w-full flex items-center justify-between p-6 md:px-10 bg-background/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Invoice Reconciliation
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Upload invoices and automatically validate line items</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Connected to n8n</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-10 pb-24">
        
        {!hasResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 md:mt-20"
          >
            <Dropzone 
              files={files} 
              setFiles={setFiles} 
              onProcess={processInvoices} 
              isProcessing={isProcessing} 
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
                  setFiles([]);
                }}
              >
                Start New Session
              </Button>
            </motion.div>

            <ResultsTable 
              items={results} 
              summary={summary} 
              excelBase64={excelBase64}
              onRowClick={handleRowClick}
            />
          </div>
        )}
      </main>

      <SidePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        item={selectedItem}
        threshold={summary?.threshold || 5}
      />
      
    </div>
  );
}
