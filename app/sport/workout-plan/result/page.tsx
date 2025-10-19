import { redirect } from "next/navigation";

export default async function LegacyWorkoutPlanResultPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const planId = resolvedSearchParams?.id;
  const destination = planId
    ? `/dashboard/sport/workout-plan/result?id=${encodeURIComponent(planId)}`
    : "/dashboard/sport/workout-plan";

  redirect(destination);
}
