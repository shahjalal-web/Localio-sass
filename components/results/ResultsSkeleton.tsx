import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card", className)}>
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b px-4 py-3">
      <Skeleton className="size-5 rounded-md" />
      <Skeleton className="h-14 w-20 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="hidden h-4 w-16 md:block" />
      <Skeleton className="hidden h-4 w-24 md:block" />
      <Skeleton className="hidden h-4 w-20 lg:block" />
    </div>
  );
}

export function ResultsSkeleton({ view, count = 6 }: { view: "karta" | "galleri" | "jamfor"; count?: number }) {
  if (view === "jamfor") {
    return (
      <div className="overflow-hidden rounded-2xl border bg-card">
        {Array.from({ length: count }, (_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className={cn("grid grid-cols-1 gap-4", view === "karta" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4")}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ResultsPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-24 sm:px-6 lg:px-10 lg:pt-28">
      <Skeleton className="h-14 w-full rounded-full" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="mt-8 h-9 w-72" />
      <div className="mt-6">
        <ResultsSkeleton view="galleri" count={8} />
      </div>
    </div>
  );
}
