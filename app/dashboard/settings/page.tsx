export default function SettingsDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <h1 className="text-3xl font-semibold text-foreground">Ayarlar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hesap tercihlerin, bildirimler ve görünüm seçenekleri burada toplu halde yaşayacak. Şimdilik temel bilgiler
          üzerinde çalışıyoruz.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-card/70 px-6 py-10 text-center shadow-none">
        <p className="text-sm text-muted-foreground">
          Yeni 3-zon düzenine uygun ayar modülleri tasarlanıyor. Yakında buradan temayı, dil tercihlerini ve bağlı
          uygulamaları yönetebileceksin.
        </p>
      </div>
    </div>
  );
}
