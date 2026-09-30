import {
  Bot,
  ChartLine,
  Cloud,
  Code,
  Database,
  Gauge,
  LayoutTemplate,
  Palette,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { ServiceIconName } from "@/lib/constants";

/** Explicit allow-list keeps the bundle small and admin input safe. */
const ICONS: Record<ServiceIconName, LucideIcon> = {
  sparkles: Sparkles,
  code: Code,
  layout: LayoutTemplate,
  server: Server,
  database: Database,
  cloud: Cloud,
  shield: ShieldCheck,
  gauge: Gauge,
  smartphone: Smartphone,
  palette: Palette,
  workflow: Workflow,
  bot: Bot,
  rocket: Rocket,
  search: Search,
  users: Users,
  "line-chart": ChartLine,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name as ServiceIconName] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
