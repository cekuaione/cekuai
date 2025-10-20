import { auth } from '@/lib/auth-helpers'
import { PublicLayout } from '@/components/layout/public-layout'
import { InvestingContent } from '@/components/investing/investing-content'

export default async function InvestingPage() {
  const session = await auth()

  return (
    <PublicLayout>
      <InvestingContent isAuthenticated={Boolean(session?.user)} />
    </PublicLayout>
  )
}

