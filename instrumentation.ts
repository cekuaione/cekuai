import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
    })
  }
}

export function onRequestError(
  err: Error,
  request: {
    path: string
    headers: Record<string, string | string[] | undefined>
  },
  context: {
    routerType: string
  }
) {
  Sentry.captureException(err, {
    tags: {
      path: request.path,
      routerType: context.routerType,
    },
  })
}

