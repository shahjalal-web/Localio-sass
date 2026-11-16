import { Hero } from "@/components/home/Hero";
import { StatsStrip } from "@/components/home/StatsStrip";
import { CityGrid } from "@/components/home/CityGrid";
import { FeatureBento } from "@/components/home/FeatureBento";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CtaAdvertisers } from "@/components/home/CtaAdvertisers";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <CityGrid />
      <FeatureBento />
      <FeaturedCarousel />
      <HowItWorks />
      <CtaAdvertisers />
    </>
  );
}
