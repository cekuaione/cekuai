import { redirect } from "next/navigation";
interface CryptoAssessmentResultPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CryptoAssessmentResultRedirect({
  params,
  searchParams,
}: CryptoAssessmentResultPageProps) {
  const { id } = await params;
  const rawParams = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(rawParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
    } else if (typeof value === "string") {
      query.set(key, value);
    }
  }

  if (id) {
    query.set("id", id);
  }
  redirect(`/dashboard/investing/crypto-assessment/result?${query.toString()}`);
}
