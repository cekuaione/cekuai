import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from ExerciseDB
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v2.exercisedb.io',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.exercisedb.dev',
      },
      {
        protocol: 'https',
        hostname: 'exercisedb.io',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
