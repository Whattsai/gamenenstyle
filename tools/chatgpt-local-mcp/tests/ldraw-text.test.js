import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { ProjectService } from '../src/core.js';
import { loadConfig } from '../src/config.js';
import { allToolNames } from '../src/capabilities.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const prefix='brickhigh/artifacts/sources/ldraw-release/ldraw';
const source='0 Test part\r\n0 Author: 測試\r\n0 !LICENSE Test fixture\r\n1 16 0 0 0 1 0 0 0 1 0 0 0 1 s\\child.dat\r\n';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function fixture(){
  const base=await mkdtemp(join(tmpdir(),'ldraw-read-')),root=join(base,'repo');await mkdir(root);
  assert.equal(spawnSync('git',['init'],{cwd:root,encoding:'utf8'}).status,0);
  const service=new ProjectService({runtimeRoot:join(base,'runtime'),projectId:'ldraw-test',toolRoot:join(root,'tools/chatgpt-local-mcp'),repos:{main:{root,requiredInstructions:['README.md']}},tasks:[]});
  await service.init();await writeFile(join(root,'README.md'),'# Required instructions\n');
  const put=async(path,content=source)=>{await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),content);return path;};
  const path=await put(`${prefix}/parts/fixture.dat`);
  return {base,root,service,put,path,clean:()=>rm(base,{recursive:true,force:true,maxRetries:5,retryDelay:100})};
}
const methods=(service,path,hash=sha(Buffer.from(source)))=>[
  ()=>service.read('main',path),
  ()=>service.readChunk('main',path,0,131072,undefined,hash),
  ()=>service.readRange('main',path,1,3,undefined,hash),
];

test('all three readers allow only controlled LDraw parts, subparts and primitives',async()=>{
  const f=await fixture();try{
    for(const path of [f.path,`${prefix}/parts/s/child.dat`,`${prefix}/p/1-4cyli.dat`,`${prefix}/p/48/4-4disc.dat`,`${prefix}/p/8/4-4disc.dat`]){
      await f.put(path);
      assert.equal((await f.service.read('main',path)).text,source);
      assert.equal((await f.service.readChunk('main',path.replaceAll('/','\\'),0,131072)).text,source);
      assert.equal((await f.service.readRange('main',path,1,3,undefined,sha(Buffer.from(source)))).text,'1: 0 Test part\n2: 0 Author: 測試\n3: 0 !LICENSE Test fixture');
    }
    for(const path of ['arbitrary.dat','brickhigh/artifacts/other.dat',`${prefix}-other/parts/a.dat`,`${prefix}/models/a.dat`,`${prefix}/parts/a.dat.exe`,`${prefix}/parts/a.dat:hidden.dat`]){
      for(const read of methods(f.service,path))await assert.rejects(read,/TEXT_TYPE_BLOCKED/);
    }
  }finally{await f.clean();}
});

test('dat content validation rejects binary, malformed UTF-8, controls and binary after a readable prefix',async()=>{
  const f=await fixture();try{
    for(const bytes of [Buffer.from([0,1,2,255]),Buffer.from('0 text\0hidden'),Buffer.from([0x30,0x20,0xff]),Buffer.from('%PDF-1.7\n'),Buffer.from('0 text\x1bhidden'),Buffer.from('0 x\n'.repeat(1000)+'\0binary')]){
      await f.put(f.path,bytes);
      for(const read of methods(f.service,f.path,sha(bytes)))await assert.rejects(read,/TEXT_TYPE_BLOCKED/);
      await assert.rejects(f.service.readChunk('main',f.path,0,4),/TEXT_TYPE_BLOCKED/);
    }
  }finally{await f.clean();}
});

test('existing byte, chunk, range and SHA limits still apply to dat reads',async()=>{
  const f=await fixture();try{
    const bytes=Buffer.from('0 '+ 'x'.repeat(200000)+'\n');await f.put(f.path,bytes);
    await assert.rejects(f.service.read('main',f.path),/TEXT_TOO_LARGE/);
    const first=await f.service.readChunk('main',f.path,0,131072);
    assert.equal(first.nextOffset,131072);assert.equal(first.eof,false);assert.equal(first.sha256,sha(bytes));
    const last=await f.service.readChunk('main',f.path,first.nextOffset,131072,undefined,first.sha256);
    assert.equal(first.text+last.text,bytes.toString());assert.equal(last.eof,true);
    await assert.rejects(f.service.readChunk('main',f.path,0,131073),/INVALID_CHUNK/);
    await assert.rejects(f.service.readChunk('main',f.path,0,131072,undefined,'0'.repeat(64)),/SHA_CONFLICT/);
    await assert.rejects(f.service.readRange('main',f.path,1,1,undefined,'0'.repeat(64)),/SHA_CONFLICT/);
    await assert.rejects(f.service.readRange('main',f.path,1,2001,undefined,first.sha256),/INVALID_LINE_RANGE/);
    await assert.rejects(f.service.readRange('main',f.path,1,1,undefined,first.sha256),/RESULT_TOO_LARGE/);
    await f.put(f.path,'0 '+ 'x'.repeat(1024*1024));
    for(const read of methods(f.service,f.path))await assert.rejects(read,/TEXT_TOO_LARGE/);
  }finally{await f.clean();}
});

test('dat chunk reads retain UTF-8 boundaries, SHA fences and sequential session gates',async()=>{
  const f=await fixture();try{
    const bytes=Buffer.from('0 a'+'字'.repeat(50000)+'\n');await f.put(f.path,bytes);
    const session=await f.service.begin(['main']);
    await assert.rejects(f.service.readChunk('main',f.path,6,16,session.id),/CHUNK_SEQUENCE_CONFLICT/);
    const first=await f.service.readChunk('main',f.path,0,131072,session.id);
    assert.ok(first.nextOffset<131072);assert.ok(!first.text.includes('\uFFFD'));
    await assert.rejects(f.service.readChunk('main',f.path,first.nextOffset+1,131072,session.id,first.sha256),/CHUNK_SEQUENCE_CONFLICT|INVALID_CHUNK/);
    const last=await f.service.readChunk('main',f.path,first.nextOffset,131072,session.id,first.sha256);
    assert.equal(first.text+last.text,bytes.toString());assert.equal(last.eof,true);
    await f.put(f.path,'0 changed\n');
    await assert.rejects(f.service.readChunk('main',f.path,0,131072,session.id,first.sha256),/SHA_CONFLICT/);
    assert.equal((await f.service.read('main','README.md')).text,'# Required instructions\n');
    await assert.rejects(f.service.read('main','.env'),/SENSITIVE_PATH/);
    await assert.rejects(f.service.read('main','tools/chatgpt-local-mcp/config/project.json'),/SERVER_PATH_BLOCKED/);
  }finally{await f.clean();}
});

test('traversal, absolute paths and junction escapes remain blocked for all readers',async()=>{
  const f=await fixture();try{
    for(const path of [`${prefix}/parts/../parts/fixture.dat`,`${prefix}/parts/../../../../../../outside.dat`,join(f.root,f.path),`${prefix}/parts/./fixture.dat`]){
      for(const read of methods(f.service,path))await assert.rejects(read,/PATH_TRAVERSAL|PATH_NOT_RELATIVE/);
    }
    const external=join(f.base,'external');await mkdir(external);await writeFile(join(external,'child.dat'),source);
    await symlink(external,join(f.root,prefix,'parts','s'),process.platform==='win32'?'junction':'dir');
    for(const read of methods(f.service,`${prefix}/parts/s/child.dat`))await assert.rejects(read,/SYMLINK_BLOCKED|SYMLINK_ESCAPE/);
  }finally{await f.clean();}
});

test('reading a dat SHA never grants mutation; instruction gates and ordinary text writes remain intact',async()=>{
  const f=await fixture();try{
    const session=await f.service.begin(['main']);
    const read=await f.service.read('main',f.path,session.id);
    const patch=()=>f.service.patch({sessionId:session.id,alias:'main',path:f.path,expectedSha256:read.sha256,changes:[{search:'Test part',replace:'Changed'}]});
    await assert.rejects(patch,/AGENT_INSTRUCTIONS_NOT_READ/);
    await f.service.read('main','README.md',session.id);
    await assert.rejects(patch,/READ_ONLY_SOURCE/);
    await assert.rejects(f.service.move(session.id,'main',f.path,'moved.dat',read.sha256),/READ_ONLY_SOURCE/);
    await assert.rejects(f.service.trash(session.id,'main',f.path,read.sha256),/READ_ONLY_SOURCE/);
    const note=await f.service.read('main','README.md',session.id);
    await assert.rejects(f.service.move(session.id,'main','README.md',`${prefix}/parts/new.dat`,note.sha256),/READ_ONLY_SOURCE/);
    await f.service.patch({sessionId:session.id,alias:'main',path:'README.md',expectedSha256:note.sha256,changes:[{search:'Required instructions',replace:'Updated instructions'}]});
    assert.equal(sha(await readFile(join(f.root,f.path))),read.sha256);
  }finally{await f.clean();}
});

test('real MCP reads 973p06/973 fully and follows every referenced subpart and primitive without changing bytes',async t=>{
  const tool=resolve(dirname(fileURLToPath(import.meta.url)),'..'),config=loadConfig();
  const client=new Client({name:'ldraw-real-files-test',version:'1.0'});
  const parse=r=>{assert.notEqual(r.isError,true,JSON.stringify(r));return JSON.parse(r.content[0].text);};
  await client.connect(new StdioClientTransport({command:process.execPath,args:[join(tool,'src/index.js')],cwd:tool,stderr:'pipe'}));
  try{
    assert.deepEqual(new Set((await client.listTools()).tools.map(x=>x.name)),allToolNames(config));
    const roots=[`${prefix}/parts/973p06.dat`,`${prefix}/parts/973.dat`],queue=[...roots],seen=new Map();
    while(queue.length){
      const path=queue.shift();if(seen.has(path))continue;
      const bytes=await readFile(join(config.projectRoot,path)),hash=sha(bytes),expected=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
      let offset=0,content='',chunk;
      do{
        chunk=parse(await client.callTool({name:'read_workspace_text_chunk',arguments:{alias:'main',path,offset,max_bytes:roots.includes(path)?512:131072,expected_sha256:hash}}));
        assert.equal(chunk.sha256,hash);assert.equal(chunk.offset,offset);content+=chunk.text;offset=chunk.nextOffset;
      }while(!chunk.eof);
      assert.equal(content,expected);assert.equal(offset,bytes.length);
      if(roots.includes(path)){
        const small=parse(await client.callTool({name:'read_workspace_text',arguments:{alias:'main',path}}));assert.equal(small.text,expected);assert.equal(small.sha256,hash);
        const lines=expected.split(/\r?\n/);
        const range=parse(await client.callTool({name:'read_workspace_text_range',arguments:{alias:'main',path,start_line:1,end_line:lines.length,expected_sha256:hash}}));
        assert.equal(range.text,lines.map((line,i)=>`${i+1}: ${line}`).join('\n'));
        assert.match(content,/0 Author:/);assert.match(content,/0 !LICENSE/);assert.match(content,/s\\973s01\.dat/);
        t.diagnostic(`${path}: ${bytes.length} bytes; sha256=${hash}; small/chunk/range identical`);
      }
      const references=content.split(/\r?\n/).filter(line=>/^1\s/.test(line)).map(line=>line.trim().split(/\s+/).slice(14).join(' ').replaceAll('\\','/'));
      seen.set(path,{hash,references});
      for(const reference of references){
        const child=[`${prefix}/parts/${reference}`,`${prefix}/p/${reference}`].find(candidate=>existsSync(join(config.projectRoot,candidate)));
        assert.ok(child,`Missing reference ${path} -> ${reference}`);if(!seen.has(child))queue.push(child);
      }
    }
    for(const [path,value] of seen)assert.equal(sha(await readFile(join(config.projectRoot,path))),value.hash);
    assert.ok(seen.has(`${prefix}/parts/s/973s01.dat`));assert.ok([...seen.keys()].some(path=>path.startsWith(`${prefix}/p/`)));
    t.diagnostic(`完整遞迴讀取 ${seen.size} 份來源，${[...seen.values()].reduce((n,v)=>n+v.references.length,0)} 個引用；所有來源 SHA 保持一致，未操作 tunnel。`);
  }finally{await client.close();}
});
