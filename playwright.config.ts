import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  use: {
    baseURL: 'http://localhost:5173/community-health/',
    headless: true,
  },
});