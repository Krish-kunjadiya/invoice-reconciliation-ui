import React, { useMemo, useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SummaryTableProps {
  data: any[][];
}

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export function SummaryTable({ data }: SummaryTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  const rows = useMemo(() => (data && data.length >= 3 ? data.slice(2) : []), [data]);

  const sortedRows = useMemo(() => {
    if (!sortDir) return rows;
    const sorted = [...rows].sort((a, b) => (Number(a[14]) || 0) - (Number(b[14]) || 0));
    if (sortDir === 'desc') sorted.reverse();
    return sorted;
  }, [rows, sortDir]);

  if (!data || data.length < 3) {
    return (
      <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/10">
        No summary data found in the generated Excel file.
      </div>
    );
  }

  // Helper to format currency only if it's a valid number
  const fmt = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    const num = Number(val);
    if (isNaN(num)) return val;
    return formatCurrency(num);
  };

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = () => {
    setSortDir((d) => (d === null ? 'desc' : d === 'desc' ? 'asc' : null));
    setPage(1);
  };

  const applyPageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const sortIcon = sortDir === null
    ? <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />
    : sortDir === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5" />
      : <ArrowDown className="w-3.5 h-3.5" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="shadow-sm border-muted overflow-hidden bg-card rounded-2xl">
        <div className="px-4 py-2 border-b bg-muted/5 text-xs text-muted-foreground flex items-center justify-between gap-4">
          <span>
            {sortedRows.length === 0
              ? "No results"
              : `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, sortedRows.length)} of ${sortedRows.length} row${sortedRows.length !== 1 ? 's' : ''}`}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span>Rows per page</span>
            <Select value={pageSize} onValueChange={(value) => applyPageSize(Number(value))}>
              <SelectTrigger size="sm" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <Table className="min-w-[1200px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead rowSpan={2} className="sticky left-0 z-20 w-[90px] min-w-[90px] max-w-[90px] overflow-hidden text-ellipsis bg-muted align-bottom pb-4 px-4 font-semibold text-foreground border-r border-muted whitespace-nowrap text-xs uppercase tracking-widest shadow-[2px_0_4px_rgba(0,0,0,0.06)]">Item</TableHead>
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
                <TableHead className="px-3 py-2 text-right whitespace-nowrap font-semibold text-xs text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-900/10 border-r border-muted select-none">
                  <button onClick={toggleSort} className="inline-flex items-center gap-1 hover:text-amber-900 dark:hover:text-amber-300 transition-colors">
                    Inv Value {sortIcon}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedRows.map((row, idx) => {
                const status = String(row[16] || "").toLowerCase();
                const isMatched = status === "matched";

                return (
                  <TableRow key={idx} className="hover:bg-muted/30 transition-colors group">
                    {/* Basic Info */}
                    <TableCell className="sticky left-0 z-10 w-[90px] min-w-[90px] max-w-[90px] overflow-hidden text-ellipsis bg-card group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-colors font-medium px-4 py-3 border-r border-muted/30 shadow-[2px_0_4px_rgba(0,0,0,0.06)]">{row[0]}</TableCell>
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

        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between bg-muted/5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
