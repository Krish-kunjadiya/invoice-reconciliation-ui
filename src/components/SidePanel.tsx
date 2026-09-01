import React from 'react';
import { CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface SidePanelProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  threshold: number;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function SidePanel({ item, isOpen, onClose, threshold, onPrev, onNext, hasPrev, hasNext }: SidePanelProps) {
  if (!item) return null;
  const isMatched = item.status === 'matched';
  const diff = item.difference;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l">
        <SheetHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-center justify-between pr-8">
            <SheetTitle>Line Item Details</SheetTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!hasPrev}
                onClick={onPrev}
                aria-label="Previous item"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!hasNext}
                onClick={onNext}
                aria-label="Next item"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <SheetDescription>
            Reconciliation details for invoice {item.invoiceNumber}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{item.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{item.invoiceDate}</p>
              </div>
            </div>

            <Separator />

            <div className="bg-muted/50 p-4 rounded-xl border border-muted space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Material Code</p>
                <p className="font-semibold text-primary">{item.materialCode}</p>
              </div>
              <p className="text-sm leading-relaxed">{item.materialDescription}</p>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="font-medium">{item.quantity} {item.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rate</p>
                  <p className="font-medium">{formatCurrency(item.rate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Discount</p>
                  <p className="font-medium">{item.effectiveDiscount}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Invoice Amount</span>
                <span className="font-semibold">{formatCurrency(item.invoiceAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">System Before GST</span>
                <span className="font-semibold">{formatCurrency(item.systemBeforeGST)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">System With GST</span>
                <span className="font-medium text-muted-foreground">{formatCurrency(item.systemWithGST)}</span>
              </div>
              
              <Separator className="my-4 border-dashed" />
              
              <div className="flex justify-between items-center font-medium">
                <span className="text-foreground">Difference</span>
                <span className={diff > 0 ? "text-amber-500 font-bold" : diff < 0 ? "text-destructive font-bold" : "text-foreground font-bold"}>
                  {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Allowed Threshold</span>
                <span className="text-muted-foreground font-medium">±{formatCurrency(threshold)}</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className={`p-6 border-t ${isMatched ? 'bg-emerald-50/50' : 'bg-destructive/5'}`}>
          <div className="flex items-center justify-center gap-2">
            {isMatched ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-emerald-600 tracking-wide uppercase text-sm">Matched</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="font-bold text-destructive tracking-wide uppercase text-sm">Unmatched</span>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
