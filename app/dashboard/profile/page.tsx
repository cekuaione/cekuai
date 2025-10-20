export default function ProfileDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <h1 className="text-3xl font-semibold text-foreground">Profilim</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kişisel bilgilerini güncelle, hedeflerini düzenle ve Ceku.ai deneyimini kişiselleştir. Bu alan kısa süre içinde
          aktif olacak.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-card/70 px-6 py-10 text-center shadow-none">
        <p className="text-sm text-muted-foreground">
          Profil özetleri, başarı rozeti geçmişi ve platform kullanım istatistikleri üzerinde çalışıyoruz. Beta davet
          listemize katılmak için hello@ceku.ai adresine ulaşabilirsin.
        </p>
      </div>
    </div>
  );
}
