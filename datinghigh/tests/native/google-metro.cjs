const path=require('node:path');
if(process.env.NODE_ENV==='production'||process.env.DATINGHIGH_NATIVE_FAULT_PROFILE!=='1'||process.env.DATINGHIGH_NATIVE_GOOGLE_PROFILE!=='1')throw new Error('Controlled native Google profile is development-test-only');
module.exports=function configureControlledGoogle(config){const previous=config.resolver.resolveRequest;
config.cacheVersion=`${config.cacheVersion??''}-controlled-native-google`;
config.resolver.resolveRequest=(context,name,platform)=>name==='react-native-nitro-google-signin'&&context.originModulePath.replaceAll('\\','/').endsWith('/src/GoogleButton.tsx')?{type:'sourceFile',filePath:path.join(__dirname,'google-sdk.js')}:previous?previous(context,name,platform):context.resolveRequest(context,name,platform);
return config;};
