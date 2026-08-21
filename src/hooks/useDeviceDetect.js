import { useState, useEffect } from 'react';

export function useDeviceDetect() {
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'Desktop', // 'Mobile' | 'Tablet' | 'Desktop'
    deviceName: 'PC / Laptop',
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    orientation: 'landscape', // 'portrait' | 'landscape'
  });

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = height > width ? 'portrait' : 'landscape';

      let type = 'Desktop';
      let deviceName = 'PC / Laptop';

      if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua) || (width >= 768 && width <= 1024)) {
        type = 'Tablet';
        deviceName = /iPad/i.test(ua) ? 'iPad / Tablet' : 'Android Tablet';
      } else if (/iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini/i.test(ua) || width < 768) {
        type = 'Mobile';
        if (/iPhone/i.test(ua)) deviceName = 'iPhone';
        else if (/Android/i.test(ua)) deviceName = 'Android Mobile';
        else deviceName = 'Smartphone';
      }

      setDeviceInfo({
        type,
        deviceName,
        width,
        height,
        orientation,
      });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return deviceInfo;
}
