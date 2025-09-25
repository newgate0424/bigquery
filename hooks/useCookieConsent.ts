'use client';

import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsentData {
  preferences: CookiePreferences;
  timestamp: string;
  version: string;
}

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_CONSENT_VERSION = '1.0';

export const useCookieConsent = () => {
  const [consentData, setConsentData] = useState<CookieConsentData | null>(null);
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Load consent data from localStorage on mount
  useEffect(() => {
    console.log('🍪 [Hook] Loading cookie consent from localStorage...');
    try {
      const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      console.log('🍪 [Hook] Raw consent data:', savedConsent);
      
      if (savedConsent) {
        const parsedConsent: CookieConsentData = JSON.parse(savedConsent);
        console.log('🍪 [Hook] Parsed consent data:', parsedConsent);
        
        // Check if consent version is current
        if (parsedConsent.version === COOKIE_CONSENT_VERSION) {
          console.log('🍪 [Hook] Consent version is current, setting hasConsented = true');
          setConsentData(parsedConsent);
          setHasConsented(true);
        } else {
          console.log('🍪 [Hook] Consent version outdated, clearing and setting hasConsented = false');
          // Clear outdated consent
          localStorage.removeItem(COOKIE_CONSENT_KEY);
          setHasConsented(false);
        }
      } else {
        console.log('🍪 [Hook] No consent data found, setting hasConsented = false');
        setHasConsented(false);
      }
    } catch (error) {
      console.error('🍪 [Hook] Error loading cookie consent:', error);
      setHasConsented(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debug: Track state changes
  useEffect(() => {
    console.log('🍪 [Hook] State changed - hasConsented:', hasConsented, 'loading:', loading);
  }, [hasConsented, loading]);

  // Save consent preferences
  const saveConsent = (preferences: CookiePreferences) => {
    try {
      const consentData: CookieConsentData = {
        preferences,
        timestamp: new Date().toISOString(),
        version: COOKIE_CONSENT_VERSION,
      };

      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
      setConsentData(consentData);
      setHasConsented(true);

      // Apply consent preferences
      applyConsentPreferences(preferences);
      
      console.log('🍪 Cookie consent saved:', preferences);
      return true;
    } catch (error) {
      console.error('Error saving cookie consent:', error);
      return false;
    }
  };

  // Clear consent data
  const clearConsent = () => {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      setConsentData(null);
      setHasConsented(false);
      
      // Clear cookies based on preferences
      applyConsentPreferences({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      });
      
      console.log('🍪 Cookie consent cleared');
      return true;
    } catch (error) {
      console.error('Error clearing cookie consent:', error);
      return false;
    }
  };

  // Apply consent preferences (enable/disable tracking)
  const applyConsentPreferences = (preferences: CookiePreferences) => {
    // Analytics cookies (Google Analytics, etc.)
    if (preferences.analytics) {
      // Enable analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        });
      }
      console.log('📊 Analytics cookies enabled');
    } else {
      // Disable analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied'
        });
      }
      console.log('📊 Analytics cookies disabled');
    }

    // Marketing cookies (advertising, social media)
    if (preferences.marketing) {
      // Enable marketing tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted'
        });
      }
      console.log('📢 Marketing cookies enabled');
    } else {
      // Disable marketing tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      }
      console.log('📢 Marketing cookies disabled');
    }

    // Preference cookies (theme, language, settings)
    if (preferences.preferences) {
      console.log('⚙️ Preference cookies enabled');
      // Preference cookies are handled by the application itself
    } else {
      console.log('⚙️ Preference cookies disabled');
      // Clear non-essential preference cookies
      clearNonEssentialCookies();
    }

    // Necessary cookies are always enabled
    console.log('🔒 Necessary cookies always enabled');
  };

  // Clear non-essential cookies
  const clearNonEssentialCookies = () => {
    if (typeof document === 'undefined') return;

    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // List of essential cookies that should not be cleared
    const essentialCookies = [
      'cookie-consent',
      'auth-token',
      'session-id',
      'csrf-token',
      '_secure_session_id',
      'next-auth',
    ];

    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      
      // Don't clear essential cookies
      if (!essentialCookies.some(essential => cookieName.includes(essential))) {
        // Clear the cookie by setting it to expire in the past
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      }
    });
  };

  // Check if specific cookie type is allowed
  const isAllowed = (cookieType: keyof CookiePreferences): boolean => {
    if (!hasConsented || !consentData) {
      return cookieType === 'necessary'; // Only necessary cookies allowed by default
    }
    return consentData.preferences[cookieType];
  };

  // Get consent age in days
  const getConsentAge = (): number | null => {
    if (!consentData) return null;
    
    const consentDate = new Date(consentData.timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - consentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Check if consent needs renewal (older than 365 days)
  const needsRenewal = (): boolean => {
    const age = getConsentAge();
    return age !== null && age > 365;
  };

  return {
    // State
    consentData,
    hasConsented,
    loading,
    
    // Actions
    saveConsent,
    clearConsent,
    
    // Utilities
    isAllowed,
    getConsentAge,
    needsRenewal,
    applyConsentPreferences,
  };
};

// Extend window type for gtag
declare global {
  interface Window {
    gtag: (command: string, action: string, parameters: any) => void;
  }
}