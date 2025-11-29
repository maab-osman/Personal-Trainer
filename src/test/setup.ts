import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup JSDOM after each test
afterEach(() => {
  cleanup();
});

// Basic fetch mock fallback (tests can override per file)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any;
if (!g.fetch) {
  g.fetch = (..._args: any[]) => Promise.resolve({ ok: true, json: async () => ({}) });
}
