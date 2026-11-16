"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const PAGE_SIZE = 24;

export function PageInfo({ page, total, className }: { page: number; total: number; className?: string }) {
  if (total === 0) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);
  return (
    <p className={cn("tabular text-sm text-muted-foreground", className)}>
      Visar {from}–{to} av {total}
    </p>
  );
}

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return <PageInfo page={page} total={total} className="mt-8 text-center" />;
  return (
    <nav aria-label="Sidnavigering" className="mt-10 flex flex-col items-center gap-3">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="Föregående sida"
          className="grid size-10 place-items-center rounded-full ring-1 ring-border hover:bg-card disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "tabular size-10 rounded-full text-sm font-semibold transition-colors",
              p === page ? "bg-primary text-primary-foreground" : "hover:bg-card",
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={page === pages}
          onClick={() => onChange(page + 1)}
          aria-label="Nästa sida"
          className="grid size-10 place-items-center rounded-full ring-1 ring-border hover:bg-card disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <PageInfo page={page} total={total} />
    </nav>
  );
}
