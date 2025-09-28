'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/lib/theme-context';
import CookieManager from '@/components/CookieManager';
import { Palette, RotateCcw, Save, Check, Cookie, Type, Sliders, Eye } from 'lucide-react';

// Primary color presets
const primaryColorPresets = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Yellow', value: '#ca8a04' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Cyan', value: '#0891b2' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' }
];

// Background color presets
const backgroundColorPresets = [
  // Solid colors
  { name: 'White', value: '#ffffff' },
  { name: 'Light Gray', value: '#f8fafc' },
  { name: 'Gray', value: '#f1f5f9' },
  { name: 'Cool Gray', value: '#f3f4f6' },
  { name: 'Warm Gray', value: '#fafaf9' },
  { name: 'Stone', value: '#f5f5f4' },
  { name: 'Light Blue', value: '#eff6ff' },
  { name: 'Light Purple', value: '#faf5ff' },
  { name: 'Light Pink', value: '#fdf2f8' },
  { name: 'Light Green', value: '#f0fdf4' },
  { name: 'Light Yellow', value: '#fefce8' },
  { name: 'Light Orange', value: '#fff7ed' },
  
  // Gradients
  { name: 'Blue Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Purple Gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Ocean Gradient', value: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)' },
  { name: 'Sunset Gradient', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { name: 'Forest Gradient', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Aurora Gradient', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: 'Fire Gradient', value: 'linear-gradient(135deg, #ff8a80 0%, #ffcc02 100%)' },
  { name: 'Ice Gradient', value: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' }
];

// Font presets
const fontPresets = [
  { name: 'Inter', value: 'Inter, system-ui, -apple-system, sans-serif' },
  { name: 'Roboto', value: 'Roboto, system-ui, -apple-system, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", system-ui, -apple-system, sans-serif' },
  { name: 'Lato', value: 'Lato, system-ui, -apple-system, sans-serif' },
  { name: 'Poppins', value: 'Poppins, system-ui, -apple-system, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, system-ui, -apple-system, sans-serif' },
  { name: 'Source Sans', value: '"Source Sans Pro", system-ui, -apple-system, sans-serif' },
  { name: 'Nunito', value: 'Nunito, system-ui, -apple-system, sans-serif' },
  { name: 'Kanit', value: 'Kanit, system-ui, -apple-system, sans-serif' },
  { name: 'Sarabun', value: 'Sarabun, system-ui, -apple-system, sans-serif' },
  { name: 'Prompt', value: 'Prompt, system-ui, -apple-system, sans-serif' },
  { name: 'Noto Thai', value: '"Noto Sans Thai", system-ui, -apple-system, sans-serif' }
];

// Font size options
const fontSizeOptions = [
  { name: 'เล็กมาก', value: 12 },
  { name: 'เล็ก', value: 13 },
  { name: 'ปกติ', value: 14 },
  { name: 'ใหญ่', value: 16 },
  { name: 'ใหญ่มาก', value: 18 },
  { name: 'ใหญ่พิเศษ', value: 20 },
  { name: 'ใหญ่สุด', value: 22 }
];

export default function SettingsPage() {
  const { colors, fonts, setColors, setFonts, resetToDefaults } = useTheme();
  
  const [tempColors, setTempColors] = useState(colors);
  const [tempFonts, setTempFonts] = useState(fonts);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setTempColors(colors);
    setTempFonts(fonts);
    setIsLoading(false);
  }, [colors, fonts]);

  useEffect(() => {
    const hasColorChanges = tempColors.primary !== colors.primary || tempColors.background !== colors.background;
    const hasFontChanges = tempFonts.family !== fonts.family || tempFonts.size !== fonts.size;
    setHasUnsavedChanges(hasColorChanges || hasFontChanges);
  }, [tempColors, tempFonts, colors, fonts]);

  const handleColorChange = (type: 'primary' | 'background', value: string) => {
    setTempColors(prev => ({ ...prev, [type]: value }));
  };

  const handleFontChange = (type: 'family' | 'size', value: string | number) => {
    setTempFonts(prev => ({ ...prev, [type]: value }));
  };

  const handleSaveColors = () => {
    console.log('Saving colors and fonts:', tempColors, tempFonts);
    setColors(tempColors);
    setFonts(tempFonts);
    setHasUnsavedChanges(false);
    
    // Force a re-render to show changes immediately
    setTimeout(() => {
      console.log('Settings saved successfully');
    }, 100);
  };

  const handleResetColors = () => {
    setTempColors(colors);
    setTempFonts(fonts);
    setHasUnsavedChanges(false);
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    setTempColors({ primary: '#2563eb', background: '#ffffff' });
    setTempFonts({ family: 'Inter, system-ui, -apple-system, sans-serif', size: 14 });
    setHasUnsavedChanges(false);
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-gray-50/80 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        
        {/* Page Header - Compact */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
            การตั้งค่าระบบ
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ปรับแต่งธีม สี และฟอนต์ตามความต้องการของคุณ
          </p>
        </div>
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">กำลังโหลดการตั้งค่า...</p>
          </div>
        )}
        
        {!isLoading && (
          <>
            {/* Compact Action Bar */}
            <div className="sticky top-4 z-20 mb-6 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleResetToDefaults}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-3 py-1.5 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 rounded-lg text-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    รีเซ็ต
                  </Button>
                  
                  <div className="hidden md:block text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg">
                    <span>สี: <strong className="text-gray-700 dark:text-gray-300">{colors.primary}</strong></span>
                    <span className="ml-3">ฟอนต์: <strong className="text-gray-700 dark:text-gray-300">{fonts.family.split(',')[0]} ({fonts.size}px)</strong></span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && (
                    <>
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium">มีการเปลี่ยนแปลง</span>
                      </div>
                      <Button
                        onClick={handleResetColors}
                        variant="outline"
                        size="sm"
                        className="px-3 py-1.5 rounded-lg border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 text-sm"
                      >
                        ยกเลิก
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={handleSaveColors}
                    disabled={!hasUnsavedChanges}
                    size="sm"
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                      hasUnsavedChanges 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Save className="h-3.5 w-3.5" />
                    บันทึก
                  </Button>
                </div>
              </div>
            </div>

            {/* 3 Columns Compact Grid */}
            <div className="grid lg:grid-cols-3 gap-4">
              
              {/* Column 1: Theme Preview & Primary Colors */}
              <div className="space-y-4">
                {/* Live Theme Preview - Compact */}
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ตัวอย่างธีม
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div 
                      className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all duration-300"
                      style={{
                        background: tempColors.background.startsWith('linear-gradient') 
                          ? tempColors.background 
                          : tempColors.background,
                        color: (() => {
                          if (tempColors.background.startsWith('linear-gradient')) {
                            return '#1f2937';
                          }
                          if (tempColors.background.startsWith('#')) {
                            const hex = tempColors.background.replace('#', '');
                            const r = parseInt(hex.substr(0, 2), 16);
                            const g = parseInt(hex.substr(2, 2), 16);
                            const b = parseInt(hex.substr(4, 2), 16);
                            const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                            return brightness > 155 ? '#1f2937' : '#ffffff';
                          }
                          return '#1f2937';
                        })()
                      }}
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <button 
                          className="px-3 py-1.5 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-md text-sm"
                          style={{ backgroundColor: tempColors.primary }}
                        >
                          ปุ่มหลัก
                        </button>
                        <button 
                          className="px-3 py-1.5 rounded-lg border-2 font-medium transition-all hover:scale-105 text-sm"
                          style={{ 
                            borderColor: tempColors.primary,
                            color: tempColors.primary
                          }}
                        >
                          ปุ่มรอง
                        </button>
                        <div 
                          className="px-2 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                          style={{ backgroundColor: tempColors.primary }}
                        >
                          แท็ก
                        </div>
                      </div>
                      <p className="text-xs opacity-80 leading-relaxed">
                        ตัวอย่างการแสดงผลของธีมและสีที่เลือก
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Primary Colors - Compact */}
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <div className="p-1.5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg shadow-md">
                        <Palette className="h-3 w-3 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        สีธีมหลัก
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {primaryColorPresets.map((preset) => {
                        const isSelected = tempColors.primary === preset.value;
                        return (
                          <button
                            key={preset.value}
                            onClick={() => handleColorChange('primary', preset.value)}
                            className={`group relative p-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? 'border-gray-400 dark:border-gray-500 shadow-lg ring-2 ring-blue-500/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                            }`}
                            title={preset.name}
                          >
                            <div 
                              className="w-8 h-8 rounded-lg shadow-sm border border-white/20"
                              style={{ backgroundColor: preset.value }}
                            />
                            {isSelected && (
                              <div className="absolute -top-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5">
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Column 2: Background Colors & Cookie Management */}
              <div className="space-y-4">
                {/* Background Colors - Compact */}
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md">
                        <Palette className="h-3 w-3 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        สีพื้นหลัง
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {/* Solid Colors */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        สีพื้นฐาน
                      </h4>
                      <div className="grid grid-cols-4 gap-1.5">
                        {backgroundColorPresets.slice(0, 12).map((preset) => {
                          const isSelected = tempColors.background === preset.value;
                          return (
                            <button
                              key={preset.value}
                              onClick={() => handleColorChange('background', preset.value)}
                              className={`group relative p-1.5 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                                isSelected
                                  ? 'border-gray-400 dark:border-gray-500 shadow-lg ring-2 ring-green-500/30'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                              }`}
                              title={preset.name}
                            >
                              <div 
                                className="w-full h-4 rounded shadow-sm border border-white/20"
                                style={{ backgroundColor: preset.value }}
                              />
                              {isSelected && (
                                <div className="absolute -top-0.5 -right-0.5 bg-green-500 rounded-full p-0.5">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Gradient Colors */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        สีไล่ระดับ
                      </h4>
                      <div className="grid grid-cols-2 gap-1.5">
                        {backgroundColorPresets.slice(12).map((preset) => {
                          const isSelected = tempColors.background === preset.value;
                          return (
                            <button
                              key={preset.value}
                              onClick={() => handleColorChange('background', preset.value)}
                              className={`group relative p-1.5 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                                isSelected
                                  ? 'border-gray-400 dark:border-gray-500 shadow-lg ring-2 ring-green-500/30'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                              }`}
                              title={preset.name}
                            >
                              <div 
                                className="w-full h-4 rounded shadow-sm border border-white/20"
                                style={{ background: preset.value }}
                              />
                              {isSelected && (
                                <div className="absolute -top-0.5 -right-0.5 bg-green-500 rounded-full p-0.5">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cookie Management - Compact */}
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-md">
                        <Cookie className="h-3 w-3 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        การจัดการคุกกี้
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CookieManager />
                  </CardContent>
                </Card>
              </div>

              {/* Column 3: Font Settings - Compact */}
              <div className="space-y-4">
                {/* Font Family - Compact */}
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg shadow-md">
                        <Type className="h-3 w-3 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        ฟอนต์
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {/* Main Fonts - Compact Grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {fontPresets.slice(0, 9).map((preset) => {
                        const isSelected = tempFonts.family === preset.value;
                        return (
                          <button
                            key={preset.value}
                            onClick={() => handleFontChange('family', preset.value)}
                            className={`group relative p-2 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? 'border-indigo-400 shadow-lg ring-2 ring-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                            }`}
                            title={preset.name}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <div 
                                className="text-sm font-medium transition-all"
                                style={{ fontFamily: preset.value }}
                              >
                                Aa
                              </div>
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">
                                {preset.name}
                              </span>
                              {isSelected && (
                                <div className="absolute -top-0.5 -right-0.5 bg-indigo-500 rounded-full p-0.5">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Thai Fonts - Mini */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
                        ฟอนต์ไทย
                      </h4>
                      <div className="grid grid-cols-3 gap-1">
                        {fontPresets.slice(9).map((preset) => {
                          const isSelected = tempFonts.family === preset.value;
                          return (
                            <button
                              key={preset.value}
                              onClick={() => handleFontChange('family', preset.value)}
                              className={`group relative p-1.5 rounded border transition-all duration-300 hover:scale-105 ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }`}
                              title={preset.name}
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <div 
                                  className="text-xs font-medium"
                                  style={{ fontFamily: preset.value }}
                                >
                                  Aa
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400 text-center leading-tight">
                                  {preset.name.replace(/[^ก-๙a-zA-Z0-9\s]/g, '')}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="absolute -top-0.5 -right-0.5 bg-indigo-500 rounded-full p-0.5">
                                  <div className="w-1 h-1 bg-white rounded-full" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Font Size - Compact */}
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                        <Sliders className="h-3 w-3 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ขนาด
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-1.5">
                      {fontSizeOptions.slice(0, 6).map((sizeOption) => {
                        const isSelected = tempFonts.size === sizeOption.value;
                        return (
                          <button
                            key={sizeOption.value}
                            onClick={() => handleFontChange('size', sizeOption.value)}
                            className={`group relative p-2 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? 'border-purple-400 shadow-lg ring-2 ring-purple-500/30 bg-purple-50/50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                            }`}
                            title={`${sizeOption.name} (${sizeOption.value}px)`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <div 
                                className="font-semibold transition-all"
                                style={{ fontSize: `${Math.min(sizeOption.value + 2, 18)}px` }}
                              >
                                Aa
                              </div>
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
                                {sizeOption.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {sizeOption.value}px
                              </span>
                              {isSelected && (
                                <div className="absolute -top-0.5 -right-0.5 bg-purple-500 rounded-full p-0.5">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Last size option */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {fontSizeOptions.slice(6).map((sizeOption) => {
                        const isSelected = tempFonts.size === sizeOption.value;
                        return (
                          <button
                            key={sizeOption.value}
                            onClick={() => handleFontChange('size', sizeOption.value)}
                            className={`group relative p-2 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? 'border-purple-400 shadow-lg ring-2 ring-purple-500/30 bg-purple-50/50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                            }`}
                            title={`${sizeOption.name} (${sizeOption.value}px)`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <div 
                                className="font-semibold transition-all"
                                style={{ fontSize: `${Math.min(sizeOption.value + 2, 18)}px` }}
                              >
                                Aa
                              </div>
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
                                {sizeOption.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {sizeOption.value}px
                              </span>
                              {isSelected && (
                                <div className="absolute -top-0.5 -right-0.5 bg-purple-500 rounded-full p-0.5">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Custom Size Input - Mini */}
                    <div className="bg-gray-50/70 dark:bg-gray-700/40 p-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <Label htmlFor="customFontSize" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          กำหนด:
                        </Label>
                        <div className="flex items-center gap-1">
                          <Input
                            id="customFontSize"
                            type="number"
                            min="10"
                            max="24"
                            value={tempFonts.size}
                            onChange={(e) => handleFontChange('size', parseInt(e.target.value) || 14)}
                            className="w-16 h-7 text-center font-mono border rounded-lg text-xs"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">px</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Font Preview - Compact */}
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-md">
                        <Eye className="h-3 w-3 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ตัวอย่าง
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div 
                      className="p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/40 dark:to-gray-600/40 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 transition-all duration-300"
                      style={{ 
                        fontFamily: tempFonts.family,
                        fontSize: `${tempFonts.size}px`
                      }}
                    >
                      <div className="space-y-2">
                        <div className="font-bold text-gray-800 dark:text-gray-200">หัวข้อใหญ่</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300">Main Title</div>
                        
                        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          ข้อความปกติภาษาไทยผสม English content สำหรับทดสอบ
                        </div>
                        
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          ข้อความขนาดเล็ก - Small text example
                        </div>
                        
                        <div className="mt-3 p-2 bg-white/60 dark:bg-gray-600/30 rounded-lg border-l-2 border-emerald-500">
                          <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">กล่องตัวอย่าง</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Example highlighted box</div>
                        </div>
                        
                        <div className="mt-2 flex gap-1.5 flex-wrap">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                            แท็ก
                          </span>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                            Tag
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}