"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={3000}
        toastOptions={{
          style: {
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#f1f5f9',
          },
        }}
      />
    </NextAuthSessionProvider>
  )
}

