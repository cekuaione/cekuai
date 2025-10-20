import { cn } from '@/lib/utils'
import { PublicHeader } from './public-header'

type PublicLayoutProps = {
  children: React.ReactNode
  className?: string
  showFooter?: boolean
}

export function PublicLayout({ children, className, showFooter = true }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <PublicHeader />
      <main className={cn('flex-1', className)}>{children}</main>
      {showFooter ? (
        <footer className="border-t border-border/60 bg-surface-muted/80 py-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Ceku.ai. All rights reserved.</p>
            <div className="flex gap-4">
              <a className="hover:text-text-primary" href="mailto:support@ceku.ai">
                Contact
              </a>
              <span className="hidden md:block">|</span>
              <a className="hover:text-text-primary" href="/auth/signup">
                Join the beta
              </a>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  )
}
