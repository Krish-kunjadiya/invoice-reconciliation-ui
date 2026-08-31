import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SummaryTableProps {
  data: any[][];
}

export function SummaryTable({ data }: SummaryTableProps) {
  if (!data || data.length < 3) {
    return (
      <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/10">
        No summary data found in the generated Excel file.
      </div>
    );
  }

  const rows = data.slice(2);

  // Helper to format currency only if it's a valid number
  const fmt = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    const num = Number(val);
    if (isNaN(num)) return val;
    return formatCurrency(num);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="shadow-sm border-muted overflow-hidden bg-card rounded-2xl">
        <div className="overflow-x-auto scrollbar-thin">
          <Table className="min-w-[1200px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead rowSpan={2} className="align-bottom pb-4 px-4 font-semibold text-foreground border-r border-muted whitespace-nowrap text-xs uppercase tracking-widest">Item</TableHead>
                <TableHead rowSpan={2} className="align-bottom pb-4 px-4 font-semibold text-foreground border-r border-muted whitespace-nowrap text-xs uppercase tracking-widest">Invoice Number</TableHead>
                <TableHead rowSpan={2} className="align-bottom pb-4 px-4 font-semibold text-foreground border-r border-muted whitespace-nowrap text-xs uppercase tracking-widest">Invoice Date</TableHead>
                
                <TableHead colSpan={4} className="text-center py-3 font-bold text-blue-900 bg-blue-50/80 dark:bg-blue-900/30 dark:text-blue-200 border-r border-b border-muted uppercase tracking-wider text-xs">
                  As per Invoice PDF
                </TableHead>
                
                <TableHead colSpan={4} className="text-center py-3 font-bold text-purple-900 bg-purple-50/80 dark:bg-purple-900/30 dark:text-purple-200 border-r border-b border-muted uppercase tracking-wider text-xs">
                  Abstracted (AI Line Level)
                </TableHead>
                
                <TableHead colSpan={4} className="text-center py-3 font-bold text-amber-900 bg-amber-50/80 dark:bg-amber-900/30 dark:text-amber-200 border-r border-b border-muted uppercase tracking-wider text-xs">
                  Difference
                </TableHead>
                
                <TableHead rowSpan={2} className="align-bottom pb-4 px-4 font-semibold text-foreground border-r border-muted whitespace-nowrap text-right text-xs uppercase tracking-widest">Transport Value</TableHead>
                <TableHead rowSpan={2} className="align-bottom pb-4 px-4 font-semibold text-foreground text-center text-xs uppercase tracking-widest">Status</TableHead>
              </TableRow>
              
              <TableRow className="hover:bg-transparent bg-muted/5 border-b border-muted">
                {/* PDF */}
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-medium text-xs text-muted-foreground bg-blue-50/30 dark:bg-blue-900/10">Lines</TableHead>
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-medium text-xs text-muted-foreground bg-blue-50/30 dark:bg-blue-900/10">Net Value</TableHead>
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-medium text-xs text-muted-foreground bg-blue-50/30 dark:bg-blue-900/10">GST</TableHead>
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-semibold text-xs text-blue-700 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10 border-r border-muted">Inv Value</TableHead>
                
                {/* AI */}
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-medium text-xs text-muted-foreground bg-purple-50/30 dark:bg-purple-900/10">Lines</TableHead>
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-medium text-xs text-muted-foreground bg-purple-50/30 dark:bg-purple-900/10">Net Value</TableHead>
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-medium text-xs text-muted-foreground bg-purple-50/30 dark:bg-purple-900/10">GST</TableHead>
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-semibold text-xs text-purple-700 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-900/10 border-r border-muted">Inv Value</TableHead>
                
                {/* Diff */}
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-medium text-xs text-muted-foreground bg-amber-50/30 dark:bg-amber-900/10">Lines</TableHead>
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-medium text-xs text-muted-foreground bg-amber-50/30 dark:bg-amber-900/10">Net Value</TableHead>
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-medium text-xs text-muted-foreground bg-amber-50/30 dark:bg-amber-900/10">GST</TableHead>
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-semibold text-xs text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-900/10 border-r border-muted">Inv Value</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {rows.map((row, idx) => {
                const status = String(row[16] || "").toLowerCase();
                const isMatched = status === "matched";
                
                return (
                  <TableRow key={idx} className="hover:bg-muted/30 transition-colors group">
                    {/* Basic Info */}
                    <TableCell className="font-medium px-4 py-3 border-r border-muted/30">{row[0]}</TableCell>
                    <TableCell className="px-4 py-3 border-r border-muted/30 font-medium text-foreground">{row[1]}</TableCell>
                    <TableCell className="px-4 py-3 border-r border-muted text-muted-foreground whitespace-nowrap text-sm">{row[2]}</TableCell>
                    
                    {/* PDF */}
                    <TableCell className="text-right px-3 py-3 text-muted-foreground">{row[3] || "-"}</TableCell>
                    <TableCell className="text-right px-3 py-3">{fmt(row[4])}</TableCell>
                    <TableCell className="text-right px-3 py-3 text-muted-foreground">{fmt(row[5])}</TableCell>
                    <TableCell className="text-right px-3 py-3 font-semibold text-blue-700 dark:text-blue-400 bg-blue-50/10 border-r border-muted">{fmt(row[6])}</TableCell>
                    
                    {/* AI */}
                    <TableCell className="text-right px-3 py-3 text-muted-foreground">{row[7] || "-"}</TableCell>
                    <TableCell className="text-right px-3 py-3">{fmt(row[8])}</TableCell>
                    <TableCell className="text-right px-3 py-3 text-muted-foreground">{fmt(row[9])}</TableCell>
                    <TableCell className="text-right px-3 py-3 font-semibold text-purple-700 dark:text-purple-400 bg-purple-50/10 border-r border-muted">{fmt(row[10])}</TableCell>
                    
                    {/* Diff */}
                    <TableCell className="text-right px-3 py-3 text-muted-foreground">{row[11] || "-"}</TableCell>
                    <TableCell className="text-right px-3 py-3 text-amber-600 dark:text-amber-500 font-medium">{fmt(row[12])}</TableCell>
                    <TableCell className="text-right px-3 py-3 text-amber-600 dark:text-amber-500 font-medium">{fmt(row[13])}</TableCell>
                    <TableCell className="text-right px-3 py-3 text-amber-600 dark:text-amber-500 font-bold bg-amber-50/10 border-r border-muted">{fmt(row[14])}</TableCell>
                    
                    {/* Transport */}
                    <TableCell className="text-right px-4 py-3 border-r border-muted/30 text-muted-foreground">{fmt(row[15])}</TableCell>
                    
                    {/* Status */}
                    <TableCell className="text-center px-4 py-3">
                      <Badge 
                        variant={isMatched ? 'secondary' : 'destructive'} 
                        className={isMatched 
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/90 shadow-none px-3 py-1 font-semibold tracking-wide" 
                          : "shadow-none px-3 py-1 font-semibold tracking-wide"
                        }
                      >
                        <span className="flex items-center justify-center gap-1.5 uppercase text-[10px]">
                          {isMatched ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          {isMatched ? 'Matched' : 'Unmatched'}
                        </span>
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </motion.div>
  );
}
