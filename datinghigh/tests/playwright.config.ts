import {defineConfig} from '@playwright/test';import {fileURLToPath} from 'node:url';import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
export default defineConfig({testDir:'./e2e/web',workers:1,timeout:45000,expect:{timeout:20000},preserveOutput:'never',use:{baseURL:'http://localhost:8081',channel:'chrome',headless:true,trace:'off',screenshot:'off',video:'off'},webServer:{command:'node tools/serve-web.mjs',cwd:root,url:'http://localhost:8081',reuseExistingServer:true},reporter:[['list'],['json',{outputFile:path.join(root,['1','2'].includes(process.env.DATINGHIGH_E2E_SCENE_FRAMEWORK??'')?'.local/evidence/scene-framework-playwright.json':'.local/evidence/playwright.json')}]],outputDir:path.join(root,'.local/playwright')});

