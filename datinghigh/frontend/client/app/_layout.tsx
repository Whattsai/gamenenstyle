import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SessionProvider} from '../src/session';
import './global.css';
export default function Layout(){return <SafeAreaProvider><SessionProvider><StatusBar style="light"/><Stack screenOptions={{headerShown:false,animation:'none'}}/></SessionProvider></SafeAreaProvider>;}
