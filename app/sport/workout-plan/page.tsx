import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-helpers";

export default async function PublicWorkoutPlanPage() {
  const session = await auth();
  const destination = "/dashboard/sport/workout-plan";
  if (session?.user) {
    redirect(destination);
  }

  redirect(`/auth/login?redirect=${encodeURIComponent(destination)}`);
}
