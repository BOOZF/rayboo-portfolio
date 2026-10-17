import { defineConfig, devices } from '@playwright/test';

// Touch-device checks in Chromium with emulated touch. SwiftShader gives headless Chromium WebGL for the 3D scene.
const touch = (device, extra = {}) => ({ ...devices[device], ...extra, browserName:'chromium', defaultBrowserType:'chromium' });

export default defineConfig({
  testDir:'e2e',
  timeout:120_000,
  expect:{ timeout:20_000 },
  workers:1,
  use:{ baseURL:'http://localhost:5181', launchOptions:{ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
  webServer:{ command:'pnpm exec vite --port 5181 --strictPort --mode e2e', url:'http://localhost:5181', reuseExistingServer:true, timeout:60_000 },
  projects:[
    { name:'phone', use:touch('iPhone 13') },
    { name:'phone-landscape', use:touch('iPhone 13 landscape') },
    { name:'ipad', use:touch('iPad Pro 11') },
    { name:'android', use:touch('Pixel 7') },
  ],
});
