const path=require('node:path');const{getDefaultConfig}=require('expo/metro-config');const config=getDefaultConfig(__dirname);
// Dedicated development test profile. Release/export builds cannot include the SecureStore fault adapter.
const faults=process.env.DATINGHIGH_NATIVE_FAULT_PROFILE==='1';if(faults&&process.env.NODE_ENV==='production')throw new Error('Native fault profile is development-only');
if(faults){const fixture=path.resolve(__dirname,'../../tests/native');config.watchFolders=[...config.watchFolders,fixture];config.resolver.nodeModulesPaths=[path.join(__dirname,'node_modules'),...(config.resolver.nodeModulesPaths??[])];config.cacheVersion=`${config.cacheVersion??''}-native-fault-profile`;
 const previous=config.resolver.resolveRequest;config.resolver.resolveRequest=(context,name,platform)=>name==='expo-secure-store'&&context.originModulePath.replaceAll('\\','/').endsWith('/src/storage.ts')?{type:'sourceFile',filePath:path.join(fixture,'secure-store.js')}:previous?previous(context,name,platform):context.resolveRequest(context,name,platform);
}if(process.env.DATINGHIGH_NATIVE_GOOGLE_PROFILE==='1')require('../../tests/native/google-metro.cjs')(config);
module.exports=config;
