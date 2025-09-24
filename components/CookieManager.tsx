'use client';

import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Cookie, Settings, Trash2, RefreshCw } from 'lucide-react';
import { useCookieConsent, type CookiePreferences } from '@/hooks/useCookieConsent';

const CookieManager: React.FC = () => {
  const { 
    consentData, 
    hasConsented, 
    loading,
    clearConsent,
    getConsentAge,
    needsRenewal 
  } = useCookieConsent();

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2 text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>กำลังโหลดข้อมูลคุกกี้...</span>
        </div>
      </Card>
    );
  }

  if (!hasConsented || !consentData) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2 text-orange-600">
          <Cookie className="h-4 w-4" />
          <span>ยังไม่ได้ตั้งค่าการยินยอมใช้คุกกี้</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          กรุณารีเฟรชหน้าเพื่อตั้งค่าการใช้คุกกี้
        </p>
      </Card>
    );
  }

  const consentAge = getConsentAge();
  const isExpired = needsRenewal();

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getStatusText = (enabled: boolean) => {
    return enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน';
  };

  const handleResetSettings = () => {
    if (confirm('คุณต้องการล้างการตั้งค่าคุกกี้และตั้งค่าใหม่หรือไม่?')) {
      clearConsent();
      // Refresh page to show cookie consent banner again
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      {/* Cookie Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Cookie className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">สถานะการใช้คุกกี้</h3>
          </div>
          <Button
            onClick={handleResetSettings}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            รีเซ็ตการตั้งค่า
          </Button>
        </div>

        {/* Consent Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">วันที่ตั้งค่า</div>
            <div className="font-medium">
              {new Date(consentData.timestamp).toLocaleDateString('th-TH')}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">อายุการตั้งค่า</div>
            <div className="font-medium">
              {consentAge} วัน
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">สถานะ</div>
            <div className={`font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
              {isExpired ? 'หมดอายุ' : 'ใช้งานได้'}
            </div>
          </div>
        </div>

        {isExpired && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-orange-700">
              <Settings className="h-4 w-4" />
              <span className="font-medium">การตั้งค่าหมดอายุแล้ว</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              การตั้งค่าคุกกี้ของคุณมีอายุเกิน 1 ปี กรุณาตั้งค่าใหม่เพื่อให้เป็นไปตามกฎหมาย
            </p>
          </div>
        )}

        {/* Cookie Types Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            รายละเอียดการตั้งค่า
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Necessary Cookies */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">คุกกี้จำเป็น</div>
                <div className="text-xs text-gray-500">การทำงานพื้นฐานของเว็บไซต์</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consentData.preferences.necessary)}`}>
                {getStatusText(consentData.preferences.necessary)}
              </span>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">คุกกี้การวิเคราะห์</div>
                <div className="text-xs text-gray-500">ติดตามการใช้งานและประสิทธิภาพ</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consentData.preferences.analytics)}`}>
                {getStatusText(consentData.preferences.analytics)}
              </span>
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">คุกกี้การตลาด</div>
                <div className="text-xs text-gray-500">โฆษณาและเนื้อหาที่เกี่ยวข้อง</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consentData.preferences.marketing)}`}>
                {getStatusText(consentData.preferences.marketing)}
              </span>
            </div>

            {/* Preference Cookies */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">คุกกี้การตั้งค่า</div>
                <div className="text-xs text-gray-500">ธีม ภาษา และความชอบ</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consentData.preferences.preferences)}`}>
                {getStatusText(consentData.preferences.preferences)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy Policy Link */}
      <Card className="p-4">
        <div className="text-center text-sm text-gray-600">
          หากต้องการข้อมูลเพิ่มเติมเกี่ยวกับการใช้คุกกี้ 
          <a 
            href="/privacy-policy" 
            className="text-blue-600 hover:underline ml-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            อ่านนโยบายความเป็นส่วนตัว
          </a>
        </div>
      </Card>
    </div>
  );
};

export default CookieManager;