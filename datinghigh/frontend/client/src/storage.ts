import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type {CredentialStore} from './api';
import {validateStoredValue} from './storage-policy';
// Web 的 sessionStorage 僅保存流程與非秘密撤銷 marker，不保存平台 token。
export const storage:CredentialStore={
 async get(key){return Platform.OS==='web'?typeof sessionStorage==='undefined'?null:sessionStorage.getItem(`datinghigh.${key}`):SecureStore.getItemAsync(`datinghigh.${key}`);},
 async set(key,value){validateStoredValue(Platform.OS,key,value);if(Platform.OS==='web'){
  if(key==='refresh')throw new Error('Web tokens cannot be persisted');sessionStorage.setItem(`datinghigh.${key}`,value);
 }else await SecureStore.setItemAsync(`datinghigh.${key}`,value,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});},
 async remove(key){if(Platform.OS==='web'){if(typeof sessionStorage!=='undefined')sessionStorage.removeItem(`datinghigh.${key}`);}else await SecureStore.deleteItemAsync(`datinghigh.${key}`);}
};
