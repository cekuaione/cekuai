import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-helpers";

export default async function PublicCryptoAssessmentPage() {
  const session = await auth();
  const destination = "/dashboard/investing/crypto-assessment";

  if (session?.user) {
    redirect(destination);
  }

  redirect(`/auth/login?redirect=${encodeURIComponent(destination)}`);
}
