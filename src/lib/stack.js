import { StackClientApp } from '@stackframe/stack'

export const stackClient = new StackClientApp({
  baseUrl: import.meta.env.VITE_NEON_AUTH_URL,
  projectId: import.meta.env.VITE_STACK_PROJECT_ID,
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
  tokenStore: 'cookie',
})
