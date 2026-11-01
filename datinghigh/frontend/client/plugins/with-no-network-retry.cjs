const{withMainApplication}=require('expo/config-plugins');
// The JS API client owns bounded read/auth retries. OkHttp must never replay a committed mutation after a lost response.
module.exports=config=>withMainApplication(config,mod=>{
 if(mod.modResults.language!=='kt')throw new Error('Expected Kotlin MainApplication for network policy');
 const marker='// DatingHigh: JS owns all request retries.';const contents=mod.modResults.contents;
 if(!contents.includes(marker)){
  const anchor='    super.onCreate()';if(contents.split(anchor).length!==2)throw new Error('Cannot locate unique application startup for network policy');
  mod.modResults.contents=contents.replace(anchor,`${anchor}\n    ${marker}\n    com.facebook.react.modules.network.OkHttpClientProvider.setOkHttpClientFactory {\n      com.facebook.react.modules.network.OkHttpClientProvider.createClientBuilder(applicationContext)\n        .retryOnConnectionFailure(false)\n        .build()\n    }`);
 }
 return mod;
});
