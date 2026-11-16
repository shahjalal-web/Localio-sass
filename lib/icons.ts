import {
  Briefcase,
  Building,
  Building2,
  Car,
  Coffee,
  Factory,
  Landmark,
  Presentation,
  Sofa,
  Store,
  TrainFront,
  Trees,
  Truck,
  UtensilsCrossed,
  Warehouse,
  Wifi,
  ArrowUpDown,
  MoveVertical,
  type LucideIcon,
  Wrench,
  Signpost,
} from "lucide-react";
import type { Category, Feature, PremisesType } from "@/types/listing";

export const TYPE_ICONS: Record<PremisesType, LucideIcon> = {
  Kontor: Building2,
  Butik: Store,
  Lager: Warehouse,
  Logistik: Truck,
  Verkstad: Wrench,
  Restaurang: UtensilsCrossed,
  Kontorshotell: Building,
  Showroom: Sofa,
};

export const FEATURE_ICONS: Record<Feature, LucideIcon> = {
  Parkering: Car,
  Pentry: Coffee,
  Lastkaj: Factory,
  Hiss: ArrowUpDown,
  Fiber: Wifi,
  "Nära kollektivtrafik": TrainFront,
  "Takhöjd 5 m": MoveVertical,
  Skyltläge: Signpost,
  Konferensrum: Presentation,
};

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  lokaler: Building2,
  fastigheter: Landmark,
  "mark-och-skog": Trees,
  foretag: Briefcase,
};
