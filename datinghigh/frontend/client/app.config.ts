import type {ExpoConfig} from 'expo/config';
const config:ExpoConfig={
 name:'心動迴路',slug:'datinghigh',scheme:'datinghigh',version:'0.1.0',orientation:'default',userInterfaceStyle:'dark',
 web:{output:'single',name:'心動迴路'},
 ios:{bundleIdentifier:'com.datinghigh.app',supportsTablet:true},
 android:{package:'com.datinghigh.app'},
 plugins:['expo-router','expo-secure-store','expo-dev-client','./plugins/with-no-network-retry.cjs',...(process.env.GOOGLE_IOS_URL_SCHEME?[['react-native-nitro-google-signin',{iosUrlScheme:process.env.GOOGLE_IOS_URL_SCHEME}]] as ExpoConfig['plugins']:[])],
};export default config;
