export type ActivityCategory = "sport" | "investing";

export interface FeatureUsage {
  key: string;
  label: string;
  category: ActivityCategory | "business" | "education";
  count: number;
  href: string;
  icon: string;
  accentClass: string;
}

export interface RecentActivity {
  id: string;
  category: ActivityCategory;
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  href: string;
  icon: string;
  accentClass: string;
}

export interface CategorySummary {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  accentClass: string;
}

export interface HomeDashboardData {
  features: FeatureUsage[];
  activities: RecentActivity[];
  summaries: CategorySummary[];
}
