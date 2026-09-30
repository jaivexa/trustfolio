import {
  Accessibility,
  Baby,
  BookOpen,
  Droplets,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Home,
  Landmark,
  Lightbulb,
  Scale,
  Sprout,
  Stethoscope,
  TreePine,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { ObjectiveIconName } from "@/lib/constants";

const ICONS: Record<ObjectiveIconName, LucideIcon> = {
  "heart-handshake": HeartHandshake,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  users: Users,
  "hand-heart": HandHeart,
  stethoscope: Stethoscope,
  home: Home,
  sprout: Sprout,
  droplets: Droplets,
  landmark: Landmark,
  scale: Scale,
  lightbulb: Lightbulb,
  baby: Baby,
  accessibility: Accessibility,
  utensils: UtensilsCrossed,
  tree: TreePine,
};

export function ObjectiveIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name as ObjectiveIconName] ?? HeartHandshake;
  return <Icon className={className} aria-hidden="true" />;
}
