/** 專用 Android fixture 的就緒條件：manifest 與完整 bundle 都可讀，避免冷編譯超過原生下載期限。 */
export async function warmNativeMetro(fetcher=fetch){
 const response=await fetcher('http://localhost:8084/',{headers:{'expo-platform':'android',accept:'application/json'},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('NATIVE_METRO_MANIFEST_UNAVAILABLE');
 const manifest=await response.json();let url;
 try{url=new URL(manifest.launchAsset.url);}catch{throw new Error('NATIVE_METRO_MANIFEST_INVALID');}
 if(url.protocol!=='http:'||!['localhost','127.0.0.1'].includes(url.hostname)||url.port!=='8084'||url.username||url.password||!url.pathname.endsWith('.bundle')||url.searchParams.get('platform')!=='android')throw new Error('NATIVE_METRO_MANIFEST_INVALID');
 const bundle=await fetcher(url.toString(),{signal:AbortSignal.timeout(120000)});
 if(!bundle.ok)throw new Error('NATIVE_METRO_BUNDLE_UNAVAILABLE');
 await bundle.arrayBuffer();
}
