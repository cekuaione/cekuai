import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default function VerifyEmailPage() {
  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-2xl px-4 py-16 md:px-6">
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-business-soft">
              <span className="text-4xl">📧</span>
            </div>
            <CardTitle className="text-3xl text-text-primary">Email Adresinizi Kontrol Edin</CardTitle>
            <CardDescription className="text-base text-text-secondary">
              Hesabınızı aktifleştirmek için email kutunuzu kontrol edin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-center text-text-secondary">
              <p className="text-lg">
                Size bir onay emaili gönderdik. Lütfen email kutunuzu kontrol edin ve hesabınızı aktifleştirmek için linke tıklayın.
              </p>
              
              <div className="rounded-lg border border-business/30 bg-business-soft/70 p-4 text-left">
                <p className="mb-2 text-sm font-semibold text-business">💡 İpucu:</p>
                <ul className="space-y-1 text-sm text-business/90">
                  <li>• Email spam klasörünüzü de kontrol etmeyi unutmayın</li>
                  <li>• Email gelmediyse 1-2 dakika bekleyin</li>
                  <li>• Email gelmezse tekrar gönderebilirsiniz</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/auth/signin">Email&apos;i Onayladım, Giriş Yap</Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/">Ana Sayfaya Dön</Link>
              </Button>
            </div>

            <div className="border-t border-border pt-6 text-center">
              <p className="mb-3 text-sm text-text-secondary">Email gelmedi mi?</p>
              <Button variant="ghost" size="sm">
                Onay Emailini Tekrar Gönder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
