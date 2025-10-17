import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function auth() {
  const session = await getServerSession(authOptions)
  return session as {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    provider?: string
  } | null
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}
