import type { ComponentType } from "react";
import type { ServiceItem, ServiceCardVariant } from "./types";
import { ServiceCardIcon } from "./ServiceCardIcon";
import { ServiceCardImage } from "./ServiceCardImage";

// Hero registry'siyle aynı ilke — kart varyantı seçimi tek burada.
export const SERVICE_CARD_VARIANTS: Record<ServiceCardVariant, ComponentType<ServiceItem>> = {
  icon: ServiceCardIcon,
  image: ServiceCardImage,
};
