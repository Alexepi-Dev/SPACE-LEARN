import { useEffect, useState } from 'react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowButton(false);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);
    // Detect if already installed (PWA display mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // @ts-ignore - prompt exists on the saved event
    const promptEvent = deferredPrompt as any;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setShowButton(false);
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return null; // don't show anything if already installed
  }

  return (
    <>{showButton && (
      <button
        onClick={handleInstallClick}
        className="fixed bottom-4 right-4 bg-[#174F3B] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#236B50]"
      >
        Installer SPACE LEARN sur mon PC
      </button>
    )}</>
  );
}
