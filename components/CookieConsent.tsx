'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import { useCookieConsent, type CookiePreferences } from '@/hooks/useCookieConsent';

interface CookieConsentProps {
  onAccept?: (preferences: CookiePreferences) => void;
  onDecline?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const { hasConsented, loading, saveConsent } = useCookieConsent();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: true,
    marketing: false,
    preferences: true,
  });

  useEffect(() => {
    if (!loading && hasConsented === false) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, hasConsented]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    const success = saveConsent(allAccepted);
    if (success) {
      setIsVisible(false);
      onAccept?.(allAccepted);
    }
  };

  const handleAcceptSelected = () => {
    const success = saveConsent(preferences);
    if (success) {
      setIsVisible(false);
      onAccept?.(preferences);
    }
  };

  const handleDecline = () => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    const success = saveConsent(minimalPreferences);
    if (success) {
      setIsVisible(false);
      onDecline?.();
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Don't render if loading or already consented
  if (loading || hasConsented || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      {/* Cookie Consent Card */}
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Cookie className="h-5 w-5 md:h-6 md:w-6 text-orange-500 flex-shrink-0" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                  เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์ของคุณ
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecline}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                เว็บไซต์นี้ใช้คุกกี้เพื่อให้บริการที่ดีที่สุดแก่คุณ การใช้เว็บไซต์นี้ต่อไป 
                หมายความว่าคุณยอมรับการใช้คุกกี้ตามที่เราได้กำหนดไว้ในนโยบายความเป็นส่วนตัว
              </p>

              {/* Cookie Details */}
              {showDetails && (
                <div className="space-y-4 p-4 bg-gray-50/70 dark:bg-gray-700/30 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    ตั้งค่าคุกกี้
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Necessary Cookies */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium text-gray-900 dark:text-white">คุกกี้จำเป็น</span>
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded ml-2">
                            จำเป็น
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          จำเป็นสำหรับการทำงานพื้นฐานของเว็บไซต์ เช่น การเข้าสู่ระบบ
                        </p>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-6 bg-green-500 rounded-full p-1">
                          <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                        </div>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">คุกกี้การวิเคราะห์</div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          ช่วยให้เราเข้าใจว่าผู้เยี่ยมใช้เว็บไซต์อย่างไร เพื่อปรับปรุงประสิทธิภาพ
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => togglePreference('analytics')}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${
                            preferences.analytics ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div 
                            className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              preferences.analytics ? 'ml-auto' : ''
                            }`} 
                          />
                        </button>
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">คุกกี้การตลาด</div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          ใช้เพื่อแสดงโฆษณาที่เกี่ยวข้องกับความสนใจของคุณ
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => togglePreference('marketing')}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${
                            preferences.marketing ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div 
                            className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              preferences.marketing ? 'ml-auto' : ''
                            }`} 
                          />
                        </button>
                      </div>
                    </div>

                    {/* Preference Cookies */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">คุกกี้การตั้งค่า</div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          จำการตั้งค่าและความชอบของคุณ เช่น ธีม ภาษา
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => togglePreference('preferences')}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${
                            preferences.preferences ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div 
                            className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              preferences.preferences ? 'ml-auto' : ''
                            }`} 
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  variant="outline"
                  size="sm"
                  className="order-3 sm:order-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {showDetails ? 'ซ่อนรายละเอียด' : 'ตั้งค่าคุกกี้'}
                </Button>
                
                <div className="flex gap-3 order-1 sm:order-2">
                  <Button
                    onClick={handleDecline}
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    ปฏิเสธ
                  </Button>
                  
                  {showDetails ? (
                    <Button
                      onClick={handleAcceptSelected}
                      size="sm"
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      บันทึกการตั้งค่า
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAcceptAll}
                      size="sm"
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      ยอมรับทั้งหมด
                    </Button>
                  )}
                </div>
              </div>

              {/* Privacy Policy Link */}
              <div className="pt-2 text-center">
                <a 
                  href="/privacy-policy" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  อ่านนโยบายความเป็นส่วนตัว
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CookieConsent;