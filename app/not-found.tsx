import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-xl backdrop-blur">
        <h1 className="text-3xl font-semibold">Sayfa bulunamadı</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aradığınız sayfa kaldırılmış veya farklı bir adrese taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-purple-700"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  )
}
