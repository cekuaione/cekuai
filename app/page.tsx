import { auth } from '@/lib/auth-helpers'
import { PublicLayout } from '@/components/layout/public-layout'
import { LandingContent } from '@/components/home/landing-content'

export default async function HomePage() {
  const session = await auth()

  return (
    <PublicLayout>
      <LandingContent isAuthenticated={Boolean(session?.user)} />
    </PublicLayout>
  )
}
