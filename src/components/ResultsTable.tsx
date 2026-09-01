import React, { useMemo, useState } from 'react';
import { Search, Download, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';

interface ResultsTableProps {
  items: any[];
  summary: any;
  excelBase64?: string | null;
  onRowClick: (item: any, list: any[]) => void;
}

type SortKey = 'invoiceNumber' | 'materialCode' | 'quantity' | 'rate' | 'invoiceAmount' | 'systemBeforeGST';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 15;
const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

const SORTABLE_COLUMNS: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
  { key: 'invoiceNumber', label: 'Invoice', align: 'left' },
  { key: 'materialCode', label: 'Material', align: 'left' },
  { key: 'quantity', label: 'Qty', align: 'right' },
  { key: 'rate', label: 'Rate', align: 'right' },
  { key: 'invoiceAmount', label: 'Invoice ₹', align: 'right' },
  { key: 'systemBeforeGST', label: 'System ₹', align: 'right' },
];

export function ResultsTable({ items, summary, excelBase64, onRowClick }: ResultsTableProps) {
  const [filter, setFilter] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

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

  const sortedItems = useMemo(() => {
    if (!sortKey) return filteredItems;
    const sorted = [...filteredItems].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' || typeof bv === 'string') {
        return String(av ?? '').localeCompare(String(bv ?? ''));
      }
      return (Number(av) || 0) - (Number(bv) || 0);
    });
    if (sortDir === 'desc') sorted.reverse();
    return sorted;
  }, [filteredItems, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = sortedItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, sortedItems.length);
  const paginatedItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const applyFilter = (key: 'all' | 'matched' | 'unmatched') => {
    setFilter(key);
    setPage(1);
  };

  const applySearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const applyPageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
  };

  const statCardClick = (key: 'all' | 'matched' | 'unmatched') => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-pressed': filter === key,
    'aria-label': `Filter by ${key}`,
    onClick: () => applyFilter(key),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        applyFilter(key);
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            {...statCardClick('all')}
            className={cn(
              "shadow-sm cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              filter === 'all' && "ring-2 ring-offset-2 ring-primary"
            )}
          >
            <CardContent className="p-6">
              <div className="text-3xl font-bold">{summary.totalItems}</div>
              <p className="text-sm font-medium text-muted-foreground mt-1">Total Items</p>
            </CardContent>
          </Card>
          <Card
            {...statCardClick('matched')}
            className={cn(
              "border-emerald-200 bg-emerald-50/50 shadow-sm cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
              filter === 'matched' && "ring-2 ring-offset-2 ring-emerald-500"
            )}
          >
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-emerald-600">{summary.matched}</div>
              <p className="text-sm font-medium text-emerald-600/80 mt-1 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Matched</p>
            </CardContent>
          </Card>
          <Card
            {...statCardClick('unmatched')}
            className={cn(
              "border-destructive/20 bg-destructive/5 shadow-sm cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive",
              filter === 'unmatched' && "ring-2 ring-offset-2 ring-destructive"
            )}
          >
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
                onClick={() => applyFilter(f)}
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
                onChange={(e) => applySearch(e.target.value)}
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

        <div className="px-4 py-2 border-b bg-muted/5 text-xs text-muted-foreground flex items-center justify-between gap-4">
          <span>
            {sortedItems.length === 0
              ? "No results"
              : `Showing ${pageStart}-${pageEnd} of ${sortedItems.length} item${sortedItems.length !== 1 ? 's' : ''}`}
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                {SORTABLE_COLUMNS.map(({ key, label, align }) => (
                  <TableHead
                    key={key}
                    className={cn("font-semibold text-muted-foreground select-none", align === 'right' && "text-right")}
                  >
                    <button
                      onClick={() => toggleSort(key)}
                      className={cn("inline-flex items-center gap-1 hover:text-foreground transition-colors", align === 'right' && "flex-row-reverse")}
                    >
                      {label}
                      {sortIcon(key)}
                    </button>
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold text-muted-foreground">Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No results found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item: any, idx: number) => {
                  const isMatched = item.status === 'matched';
                  return (
                    <TableRow
                      key={`${item.invoiceNumber}-${idx}`}
                      onClick={() => onRowClick(item, sortedItems)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details for invoice ${item.invoiceNumber}, material ${item.materialCode}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(item, sortedItems);
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
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
