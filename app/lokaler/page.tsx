import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsPage } from "@/components/results/ResultsPage";
import { ResultsPageSkeleton } from "@/components/results/ResultsSkeleton";

export const metadata: Metadata = {
  title: "Lediga lokaler",
  description: "Lediga kontor, butiker, lager och andra kommersiella lokaler – sök, jämför och bevaka.",
};

export default function LokalerPage() {
  return (
    <Suspense fallback={<ResultsPageSkeleton />}>
      <ResultsPage />
    </Suspense>
  );
}
