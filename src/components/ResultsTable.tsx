import React, { useState } from 'react';
import { Search, Download, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatCurrency, exportToExcel, downloadBase64Excel } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ResultsTableProps {
  items: any[];
  summary: any;
  excelBase64?: string | null;
  onRowClick: (item: any) => void;
}

export function ResultsTable({ items, summary, excelBase64, onRowClick }: ResultsTableProps) {
  const [filter, setFilter] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter((item: any) => {
    if (filter !== 'all' && item.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.invoiceNumber?.toLowerCase().includes(term) ||
        item.materialCode?.toLowerCase().includes(term) ||
        item.materialDescription?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="text-3xl font-bold">{summary.totalItems}</div>
              <p className="text-sm font-medium text-muted-foreground mt-1">Total Items</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-emerald-600">{summary.matched}</div>
              <p className="text-sm font-medium text-emerald-600/80 mt-1 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Matched</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-destructive">{summary.unmatched}</div>
              <p className="text-sm font-medium text-destructive/80 mt-1 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Unmatched</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary">±{formatCurrency(summary.threshold).replace('₹', '₹ ')}</div>
              <p className="text-sm font-medium text-primary/80 mt-1">Threshold</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm border-muted">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/10">
          <div className="flex bg-muted/50 p-1 rounded-lg">
            {(['all', 'matched', 'unmatched'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  filter === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials or invoices..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => {
                if (excelBase64) {
                  downloadBase64Excel(excelBase64, summary?.fileName || "Processed_Invoices.xlsx");
                } else {
                  exportToExcel(items, summary);
                }
              }} 
              variant="default" 
              className="flex gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export XLSX</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-semibold text-muted-foreground">Invoice</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Material</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Qty</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Rate</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Invoice ₹</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">System ₹</TableHead>
                <TableHead className="text-center font-semibold text-muted-foreground">Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No results found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item: any, idx: number) => {
                  const isMatched = item.status === 'matched';
                  return (
                    <TableRow 
                      key={`${item.invoiceNumber}-${idx}`}
                      onClick={() => onRowClick(item)}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="font-medium text-foreground">{item.invoiceNumber}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.invoiceDate}</div>
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <div className="font-medium truncate text-foreground">{item.materialCode}</div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5" title={item.materialDescription}>
                          {item.materialDescription}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.quantity} {item.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.invoiceAmount)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.systemBeforeGST)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={isMatched ? 'secondary' : 'destructive'} className={isMatched ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-transparent shadow-none" : "shadow-none"}>
                          {isMatched ? 'Matched' : 'Unmatched'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 inline-block" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </motion.div>
  );
}
