import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default function VerifyEmailPage() {
  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-2xl px-4 py-16 md:px-6">
        <Card className="border border-white/10 bg-white/5 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
              <span className="text-4xl">📧</span>
            </div>
            <CardTitle className="text-3xl text-white">Email Adresinizi Kontrol Edin</CardTitle>
            <CardDescription className="text-base text-white/70">
              Hesabınızı aktifleştirmek için email kutunuzu kontrol edin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-center text-gray-300">
              <p className="text-lg">
                Size bir onay emaili gönderdik. Lütfen email kutunuzu kontrol edin ve hesabınızı aktifleştirmek için linke tıklayın.
              </p>
              
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-left">
                <p className="text-sm font-semibold text-blue-300 mb-2">💡 İpucu:</p>
                <ul className="space-y-1 text-sm text-blue-200">
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

            <div className="border-t border-slate-700 pt-6 text-center">
              <p className="text-sm text-gray-400 mb-3">Email gelmedi mi?</p>
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

