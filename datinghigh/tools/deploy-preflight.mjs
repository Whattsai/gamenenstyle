import fs from 'node:fs';import {root} from './local-policy.mjs';import {validateDeployment} from './foundation-policy.mjs';
const environment=process.argv[2];if(environment!=='staging')throw new Error('Only the configured staging target may be preflighted');
const targets=JSON.parse(fs.readFileSync(`${root}/cloudflare/deployment-targets.json`,'utf8'));
const config=JSON.parse(fs.readFileSync(`${root}/cloudflare/wrangler.${environment}.jsonc`,'utf8'));
validateDeployment(config,targets[environment]);console.log('Configuration preflight passed; verify account entitlement, sender domain and snapshot checkpoint before deployment.');
