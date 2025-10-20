import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-text-primary">
      <div className="rounded-2xl border border-border bg-card px-8 py-10 text-center shadow-lg shadow-surface-muted/40">
        <h1 className="text-3xl font-semibold text-text-primary">Sayfa bulunamadı</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aradığınız sayfa kaldırılmış veya farklı bir adrese taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-md bg-business px-6 py-3 text-sm font-semibold text-background shadow-sm transition hover:bg-business/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-business focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  )
}
