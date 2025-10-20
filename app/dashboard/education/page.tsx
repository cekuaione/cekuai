import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EducationDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card px-6 py-7 text-center shadow-sm">
        <span aria-hidden className="text-4xl">🎓</span>
        <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          Education hub için geri sayım başladı.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Kişiselleştirilmiş öğrenme akışları, öğrenme hedeflerini AI ile planlama ve ilerleme raporları yakında burada.
          İlgi alanlarını paylaşırsan, önceliklendirmemize yardımcı olursun.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="mailto:hello@ceku.ai?subject=Education%20%C3%96nceliklendirme"
            className="inline-flex items-center gap-2 rounded-full bg-education px-4 py-2 text-sm font-semibold text-background shadow-lg shadow-education/30 transition hover:bg-education/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-education focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            İlgi alanını paylaş
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/new-dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-education hover:text-education focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-education focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Ana sayfa
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-dashed border-border bg-card/80 p-6 text-center shadow-none">
        <h2 className="text-lg font-semibold text-foreground">Beta sürecine katılmak ister misin?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Eğitim içeriği kürasyon araçları ve AI öğrenme koçu deneyimini test edecek sınırlı bir ekiple ilerliyoruz. Adını
          bırak, davet gönderelim.
        </p>
      </section>
    </div>
  );
}
