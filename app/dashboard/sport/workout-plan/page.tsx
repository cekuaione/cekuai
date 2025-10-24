"use client";

import { useRouter } from "next/navigation";

export default function WorkoutPlanPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/20">
            <svg className="h-10 w-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">
            Yeni Antrenman Planı Sistemi
          </h1>
          <p className="text-lg text-slate-300">
            Geliştiriliyor!
          </p>
        </div>
        
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
          <p className="mb-4 text-slate-300">
            🚀 Daha gelişmiş ve kişiselleştirilmiş antrenman planları için yeni sistemimizi hazırlıyoruz.
          </p>
          <p className="mb-6 text-sm text-slate-400">
            Yeni sistemde 5 adımlı kapsamlı anket, hedefe özel sorular ve daha akıllı AI önerileri olacak.
          </p>
          
          <button
            onClick={() => router.push("/dashboard/sport")}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Sport Dashboard&apos;a Dön
          </button>
        </div>
        
        <div className="mt-6 text-xs text-slate-500">
          Eski sistem geçici olarak devre dışı bırakılmıştır.
        </div>
      </div>
    </div>
  );
}
