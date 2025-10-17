import { auth } from '@/lib/auth-helpers'
import { PublicLayout } from '@/components/layout/public-layout'
import { SportContent } from '@/components/sport/sport-content'

export default async function SportPage() {
  const session = await auth()

  return (
    <PublicLayout>
      <SportContent isAuthenticated={Boolean(session?.user)} />
    </PublicLayout>
  )
}
