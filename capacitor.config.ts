import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e1dbbb28cc29472086879feac5bcaa29',
  appName: 'career-prep-chat',
  webDir: 'dist',
  server: {
    url: 'https://e1dbbb28-cc29-4720-8687-9feac5bcaa29.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;