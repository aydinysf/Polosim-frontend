"use client";

import { Signal, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveEsimCardProps {
  hasActivePlan?: boolean;
}

export function ActiveEsimCard({ hasActivePlan = true }: ActiveEsimCardProps) {
  if (!hasActivePlan) {
    return (
      <div className="mx-4 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">No Active eSIM</p>
            <p className="text-xs text-muted-foreground mt-0.5">Get your first plan now</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" />
            Get Plan
          </Button>
        </div>
      </div>
    );
  }

  const usedData = 3.2;
  const totalData = 10;
  const percentage = (usedData / totalData) * 100;
  const daysLeft = 12;

  return (
    <div className="mx-4 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Signal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Turkey eSIM</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs text-primary font-medium">
          Details
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Data Used</span>
          <span className="font-medium text-foreground">{usedData}GB / {totalData}GB</span>
        </div>
        <div className="h-2 bg-border/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{daysLeft}</p>
            <p className="text-[10px] text-muted-foreground">Days Left</p>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{(totalData - usedData).toFixed(1)}GB</p>
            <p className="text-[10px] text-muted-foreground">Remaining</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10 bg-transparent">
          <Plus className="w-3 h-3 mr-1" />
          Top Up
        </Button>
      </div>
    </div>
  );
}
