import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLandscape: false,
    };
  }

  const ua = navigator.userAgent || '';
  const isTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || 'ontouchstart' in window;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);
  const isLandscape = width > height;

  // Explicit Mobile Phone Checks (iOS iPhone/iPod, Android Mobile)
  const isPhoneUA = /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  
  // Tablet UA Checks (iPad, Android Tablet without Mobile)
  const isTabletUA = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua);

  // iPadOS on Safari masquerading as desktop Mac
  const isIPadOS = isTouch && !isPhoneUA && /Macintosh/i.test(ua) && maxDim >= 1024;

  let deviceType: DeviceType = 'desktop';

  // If UA is phone OR touch device with min dimension < 600px (smartphones in portrait or landscape)
  if (isPhoneUA || (isTouch && minDim < 600)) {
    deviceType = 'mobile';
  } else if (isTabletUA || isIPadOS || (isTouch && minDim >= 600)) {
    deviceType = 'tablet';
  } else {
    // Desktop or Laptop
    if (width < 768) {
      deviceType = 'mobile';
    } else if (width < 1024) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }
  }

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isLandscape,
  };
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(detectDevice);

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}
