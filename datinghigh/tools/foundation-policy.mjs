export function validateBuild({sdk,expo,wrangler,compatibilityDate,images,output,workerFirst,locks}){
 if(!/^10\.0\.\d+$/.test(sdk)||!/^58\.\d+\.\d+$/.test(expo)||!/^4\.\d+\.\d+$/.test(wrangler)||Number(wrangler.split('.')[1])<136||compatibilityDate!=='2026-10-24')throw new Error('Unsupported or unpinned toolchain');
 if(images.length!==2||images.some(i=>!/^mcr\.microsoft\.com\/dotnet\/(sdk|aspnet):10\.0(?:\.\d+)?@sha256:[0-9a-f]{64}$/.test(i)))throw new Error('Pinned .NET image digests required');
 if(output!=='single'||!['/api/*','/health/*','/internal/*','/v1/commands/*'].every(p=>workerFirst.includes(p)))throw new Error('API-first SPA routing required');
 if(locks.some(p=>!p))throw new Error('Missing dependency lock');return true;
}
export function validateDeployment(config,target){
 if(!target||config.account_id!==target.accountId||config.name!==target.worker||config.vars.APP_ENV!==target.environment||config.vars.WEB_ORIGIN!==target.origin||!target.origin.startsWith('https://'))throw new Error('Deployment target mismatch');
 if(config.d1_databases.length!==1||config.d1_databases[0].binding!=='DB'||config.d1_databases[0].database_id!==target.d1||config.r2_buckets.length!==1||config.r2_buckets[0].binding!=='FILES'||config.r2_buckets[0].bucket_name!==target.r2)throw new Error('Binding mismatch');
 if(config.vars.EmailDeliveryMode!=='Cloudflare'||!config.send_email?.some(b=>b.name==='EMAIL')||!config.vars.EMAIL_FROM)throw new Error('Verified Cloudflare sender binding and EMAIL_FROM required');
 if(config.compatibility_date!=='2026-10-24'||config.containers.length!==1||config.containers[0].max_instances!==1)throw new Error('Incompatible platform configuration');return true;
}
export function assessEvidence(evidence){
 const requirements={web:'account-flow',android:'development-account-flow',ios:'development-account-flow',staging:'worker-container-d1-r2',google:'real-first-and-existing',email:'real-registration-and-reset',restart:'persistent-artifacts'};
 const valid=(item,kind)=>!!item&&item.status==='passed'&&item.kind===kind&&!!item.reference&&Number.isFinite(Date.parse(item.executedAt))&&item.substitute!==true;
 const missing=[],deferred=[];for(const [area,kind] of Object.entries(requirements)){
  const decision=evidence.acceptanceScope?.deferred?.find(d=>d.area===area&&d.userDecision&&d.reference&&Number.isFinite(Date.parse(d.recordedAt)));
  if(['ios','staging'].includes(area)&&decision&&evidence[area]?.status==='deferred-by-user'){deferred.push(area);continue;}
  if(!valid(evidence[area],kind))missing.push(area);
 }
 if(evidence.cases?.passed!==227||evidence.cases?.total!==227||evidence.scenarios?.passed!==92||evidence.scenarios?.total!==92)missing.push('planned-case-matrix');
 let scopedMissing=missing;
 if(evidence.acceptanceScope?.environment==='local'){
  scopedMissing=missing.filter(area=>!['google','email','planned-case-matrix'].includes(area));
  if(!valid(evidence.google?.web,'real-account-login'))scopedMissing.push('google-web');
  if(!valid(evidence.google?.android,'real-existing'))scopedMissing.push('google-android');
  if(!valid(evidence.google?.crossPlatform,'same-account-first-web-existing-android-local'))scopedMissing.push('google-cross-platform');
  if(!valid(evidence.localMatrix,'web-android-local-matrix'))scopedMissing.push('local-case-matrix');
 }
 return {accepted:missing.length===0&&deferred.length===0,scopedAccepted:scopedMissing.length===0,missing,scopedMissing,deferred,production:evidence.production?.status==='released'?'released':'not-released'};
}
export function rollbackPlan({artifactSchema,databaseSchema,restoreData=false}){
 if(restoreData)throw new Error('Data restoration requires a separate explicit recovery operation');
 if(artifactSchema!==databaseSchema)throw new Error('Incompatible rollback artifact');return ['worker','container-image','static-assets'];
}
