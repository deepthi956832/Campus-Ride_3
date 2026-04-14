import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.campusride.app',
  appName: 'Campus Ride',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
