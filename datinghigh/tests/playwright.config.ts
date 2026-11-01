import {defineConfig} from '@playwright/test';import {fileURLToPath} from 'node:url';import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
export default defineConfig({testDir:'./e2e/web',workers:1,timeout:45000,preserveOutput:'never',use:{baseURL:'http://localhost:8081',channel:'chrome',headless:true,trace:'off',screenshot:'off',video:'off'},webServer:{command:'node tools/serve-web.mjs',cwd:root,url:'http://localhost:8081',reuseExistingServer:true},reporter:[['list'],['json',{outputFile:path.join(root,'.local/evidence/playwright.json')}]],outputDir:path.join(root,'.local/playwright')});

