import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BusinessDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card px-6 py-7 text-center shadow-sm">
        <span aria-hidden className="text-4xl">📊</span>
        <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          Business deneyimi yakında.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Gelir/gider analizleri, pazarlama içgörüleri ve yapay zeka destekli raporlar üzerinde çalışıyoruz. Erken
          erişim listesine katıl, hazır olduğunda ilk sen haberdar ol.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="mailto:hello@ceku.ai?subject=Business%20Erken%20Eri%C5%9Fim"
            className="inline-flex items-center gap-2 rounded-full bg-business px-4 py-2 text-sm font-semibold text-background shadow-lg shadow-business/30 transition hover:bg-business/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-business focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Erken erişim için yaz
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-dashed border-border bg-card/80 p-6 text-center shadow-none">
        <h2 className="text-lg font-semibold text-foreground">Neler planlıyoruz?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          KPI takip panelleri, nakit akışı simülasyonları ve AI danışman görüşmeleri. Ürünün gelişimine yön vermek için
          geri bildirimlerini bizimle paylaş.
        </p>
      </section>
    </div>
  );
}
