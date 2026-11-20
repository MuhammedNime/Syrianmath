import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function syncStatusBarTheme(darkMode: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({
      color: darkMode ? '#0f172a' : '#1d4ed8',
    });
    await StatusBar.setStyle({
      style: Style.Dark,
    });
  } catch {
    // Ignore on platforms/devices where StatusBar plugin is unavailable
  }
}

export function registerAndroidBackHandler(onBack: () => boolean): () => void {
  if (!isNativeAndroid()) {
    return () => {};
  }

  let removed = false;
  const handlePromise = CapApp.addListener('backButton', ({ canGoBack }) => {
    const handled = onBack();
    if (handled) return;
    if (canGoBack && window.history.length > 1) {
      window.history.back();
    } else {
      void CapApp.exitApp();
    }
  });

  return () => {
    if (removed) return;
    removed = true;
    void handlePromise.then((h) => h.remove()).catch(() => {});
  };
}
