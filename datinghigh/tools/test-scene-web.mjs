import {spawn} from 'node:child_process';
import path from 'node:path';
import {root} from './local-policy.mjs';
const child=spawn(process.execPath,[path.join(root,'node_modules/@playwright/test/cli.js'),'test','--config','tests/playwright.config.ts','story-dialogue.spec.ts',...process.argv.slice(2)],{cwd:root,env:{...process.env,DATINGHIGH_E2E_SCENE_FRAMEWORK:'1'},stdio:'inherit',windowsHide:true});child.on('exit',code=>{process.exitCode=code??1;});
