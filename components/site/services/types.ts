export type ServiceCardVariant = "icon" | "image";

export interface ServiceItem {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  imagePath: string | null;
}
