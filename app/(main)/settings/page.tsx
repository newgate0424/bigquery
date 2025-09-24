'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, RotateCcw, Save, Check, Cookie } from 'lucide-react';
import CookieManager from '@/components/CookieManager';

const primaryColorPresets = [
  { name: 'Blue Ocean', value: '#2563eb', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Emerald Green', value: '#16a34a', gradient: 'from-emerald-500 to-emerald-600' },
  { name: 'Royal Purple', value: '#9333ea', gradient: 'from-purple-500 to-purple-600' },
  { name: 'Crimson Red', value: '#dc2626', gradient: 'from-red-500 to-red-600' },
  { name: 'Sunset Orange', value: '#ea580c', gradient: 'from-orange-500 to-orange-600' },
  { name: 'Pink Rose', value: '#db2777', gradient: 'from-pink-500 to-pink-600' },
  { name: 'Indigo Night', value: '#4338ca', gradient: 'from-indigo-500 to-indigo-600' },
  { name: 'Teal Ocean', value: '#0d9488', gradient: 'from-teal-500 to-teal-600' },
  { name: 'Amber Gold', value: '#d97706', gradient: 'from-amber-500 to-amber-600' },
  { name: 'Violet Dream', value: '#7c3aed', gradient: 'from-violet-500 to-violet-600' },
  { name: 'Lime Fresh', value: '#65a30d', gradient: 'from-lime-500 to-lime-600' },
  { name: 'Cyan Blue', value: '#0891b2', gradient: 'from-cyan-500 to-cyan-600' },
];

const backgroundColorPresets = [
  // Solid Colors - Light
  { name: 'Pure White', value: '#ffffff', preview: 'bg-white', border: 'border-gray-300', type: 'solid' },
  { name: 'Soft Gray', value: '#f9fafb', preview: 'bg-gray-50', border: 'border-gray-300', type: 'solid' },
  { name: 'Warm Cream', value: '#fefce8', preview: 'bg-yellow-50', border: 'border-yellow-200', type: 'solid' },
  { name: 'Sky Blue', value: '#eff6ff', preview: 'bg-blue-50', border: 'border-blue-200', type: 'solid' },
  { name: 'Mint Green', value: '#f0fdf4', preview: 'bg-green-50', border: 'border-green-200', type: 'solid' },
  { name: 'Lavender', value: '#faf5ff', preview: 'bg-purple-50', border: 'border-purple-200', type: 'solid' },
  { name: 'Rose Pink', value: '#fdf2f8', preview: 'bg-pink-50', border: 'border-pink-200', type: 'solid' },
  { name: 'Warm Beige', value: '#fafaf9', preview: 'bg-stone-50', border: 'border-stone-300', type: 'solid' },
  
  // Solid Colors - Dark
  { name: 'Deep Dark', value: '#0f172a', preview: 'bg-slate-900', border: 'border-slate-700', type: 'solid' },
  { name: 'Midnight Blue', value: '#1e293b', preview: 'bg-slate-800', border: 'border-slate-600', type: 'solid' },
  { name: 'Charcoal Gray', value: '#374151', preview: 'bg-gray-700', border: 'border-gray-500', type: 'solid' },
  { name: 'Navy Blue', value: '#1e3a8a', preview: 'bg-blue-800', border: 'border-blue-600', type: 'solid' },
  
  // Gradient Backgrounds
  { name: 'Ocean Breeze', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', preview: 'bg-gradient-to-br from-blue-500 to-purple-600', border: 'border-blue-300', type: 'gradient' },
  { name: 'Sunset Glow', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', preview: 'bg-gradient-to-br from-pink-400 to-red-500', border: 'border-pink-300', type: 'gradient' },
  { name: 'Forest Mist', value: 'linear-gradient(135deg, #c3f0ca 0%, #57ae6b 100%)', preview: 'bg-gradient-to-br from-green-200 to-green-600', border: 'border-green-300', type: 'gradient' },
  { name: 'Golden Hour', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', preview: 'bg-gradient-to-br from-yellow-200 to-orange-400', border: 'border-orange-300', type: 'gradient' },
  { name: 'Arctic Aurora', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', preview: 'bg-gradient-to-br from-teal-200 to-pink-300', border: 'border-teal-300', type: 'gradient' },
  { name: 'Deep Space', value: 'linear-gradient(135deg, #2c3e50 0%, #000428 100%)', preview: 'bg-gradient-to-br from-slate-700 to-slate-900', border: 'border-slate-500', type: 'gradient' },
  { name: 'Purple Rain', value: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)', preview: 'bg-gradient-to-br from-purple-500 to-teal-500', border: 'border-purple-300', type: 'gradient' },
  { name: 'Cherry Blossom', value: 'linear-gradient(135deg, #ffeef8 0%, #f8d7da 100%)', preview: 'bg-gradient-to-br from-pink-50 to-rose-200', border: 'border-pink-300', type: 'gradient' },
  { name: 'Electric Blue', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', preview: 'bg-gradient-to-br from-blue-400 to-cyan-400', border: 'border-blue-300', type: 'gradient' },
  { name: 'Emerald Dream', value: 'linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%)', preview: 'bg-gradient-to-br from-emerald-300 to-green-500', border: 'border-emerald-300', type: 'gradient' },
  { name: 'Royal Purple', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', preview: 'bg-gradient-to-br from-indigo-600 to-purple-700', border: 'border-purple-300', type: 'gradient' },
  { name: 'Fire Sunset', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', preview: 'bg-gradient-to-br from-red-300 to-pink-200', border: 'border-red-300', type: 'gradient' },
];

export default function SettingsPage() {
  const { colors, setColors, resetToDefaults } = useTheme();
  const [tempColors, setTempColors] = useState(colors);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync tempColors when colors change from context
  useEffect(() => {
    console.log('Settings: colors changed from context', colors);
    setTempColors(colors);
    setIsLoading(false);
  }, [colors]);

  const handleColorChange = (type: 'primary' | 'background', value: string) => {
    setTempColors(prev => ({ ...prev, [type]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveColors = () => {
    console.log('Saving colors:', tempColors);
    setColors(tempColors);
    setHasUnsavedChanges(false);
    
    // Force a re-render to show changes immediately
    setTimeout(() => {
      console.log('Colors saved successfully');
    }, 100);
  };

  const handleResetColors = () => {
    setTempColors(colors);
    setHasUnsavedChanges(false);
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    setTempColors({ primary: '#2563eb', background: '#ffffff' });
    setHasUnsavedChanges(false);
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">กำลังโหลดการตั้งค่า...</p>
          </div>
        )}
        
        {!isLoading && (
          <>
            {/* Cookie Management Section */}
            <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                    <Cookie className="h-5 w-5 text-white" />
                  </div>
                  การจัดการคุกกี้
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CookieManager />
              </CardContent>
            </Card>

            {/* Live Preview Section */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <div className="w-5 h-5 bg-white rounded"></div>
              </div>
              ตัวอย่างสีธีม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
              style={{
                background: tempColors.background.startsWith('linear-gradient') 
                  ? tempColors.background 
                  : tempColors.background,
                color: (() => {
                  if (tempColors.background.startsWith('linear-gradient')) {
                    return '#1f2937'; // Default dark text for gradients
                  }
                  // For solid colors, determine if it's dark or light
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
              <div className="flex items-center gap-4 flex-wrap">
                <button 
                  className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-lg"
                  style={{ backgroundColor: tempColors.primary }}
                >
                  ปุ่มหลัก
                </button>
                <button 
                  className="px-4 py-2 rounded-lg border-2 font-medium transition-all hover:scale-105"
                  style={{ 
                    borderColor: tempColors.primary,
                    color: tempColors.primary
                  }}
                >
                  ปุ่มรอง
                </button>
                <div 
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tempColors.primary }}
                >
                  แท็ก
                </div>
              </div>
              <p className="mt-4 opacity-75">
                นี่คือตัวอย่างการแสดงผลของสีธีมที่คุณเลือก สีจะมีผลกับปุ่มและองค์ประกอบต่างๆ ในแอปพลิเคชัน
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Primary Color Settings */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                <Palette className="h-5 w-5 text-white" />
              </div>
              สีธีมหลัก
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {primaryColorPresets.map((preset) => {
                const isSelected = tempColors.primary === preset.value;
                return (
                  <button
                    key={preset.value}
                    onClick={() => handleColorChange('primary', preset.value)}
                    className={`group relative p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      isSelected
                        ? 'border-gray-400 dark:border-gray-500 shadow-lg ring-2 ring-blue-500 ring-opacity-50'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${preset.gradient} shadow-lg relative overflow-hidden`}>
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center gap-4 p-4 bg-gray-50/70 dark:bg-gray-700/40 rounded-xl">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">สีกำหนดเอง:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={tempColors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-12 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border">
                  {tempColors.primary}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Background Color Settings */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 rounded"></div>
              </div>
              สีพื้นหลัง
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Solid Colors Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">สีพื้นธรรมดา</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {backgroundColorPresets.filter(preset => preset.type === 'solid').map((preset) => {
                  const isSelected = tempColors.background === preset.value;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleColorChange('background', preset.value)}
                      className={`group relative p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        isSelected
                          ? `${preset.border} shadow-lg ring-2 ring-blue-500 ring-opacity-50`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-8 rounded-lg ${preset.preview} border border-gray-200 dark:border-gray-600 relative overflow-hidden shadow-sm`}>
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <Check className="h-4 w-4 text-gray-800" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gradient Colors Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">สีกราเดี้ยน</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {backgroundColorPresets.filter(preset => preset.type === 'gradient').map((preset) => {
                  const isSelected = tempColors.background === preset.value;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleColorChange('background', preset.value)}
                      className={`group relative p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        isSelected
                          ? `${preset.border} shadow-lg ring-2 ring-blue-500 ring-opacity-50`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-16 h-8 rounded-lg ${preset.preview} border border-gray-200 dark:border-gray-600 relative overflow-hidden shadow-sm`}>
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <Check className="h-4 w-4 text-white drop-shadow-sm" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 p-4 bg-gray-50/70 dark:bg-gray-700/40 rounded-xl">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">สีกำหนดเอง:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={tempColors.background.startsWith('#') ? tempColors.background : '#ffffff'}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="w-12 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border max-w-[200px] truncate">
                  {tempColors.background}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/70 to-gray-100/70 dark:from-gray-800/60 dark:to-gray-700/60 rounded-xl border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm">
          <div className="flex flex-col gap-1">
            <Button
              onClick={handleResetToDefaults}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4" />
              รีเซ็ตเป็นค่าเริ่มต้น
            </Button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Primary: {colors.primary} | Background: {colors.background.length > 20 ? 'Gradient' : colors.background}
              <br />
              Temp: {tempColors.primary} | {tempColors.background.length > 20 ? 'Gradient' : tempColors.background}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">มีการเปลี่ยนแปลงที่ยังไม่บันทึก</span>
                </div>
                <Button
                  onClick={handleResetColors}
                  variant="outline"
                  size="sm"
                  className="px-3 py-2"
                >
                  ยกเลิก
                </Button>
              </>
            )}
            <Button
              onClick={handleSaveColors}
              disabled={!hasUnsavedChanges}
              className={`flex items-center gap-2 px-4 py-2 transition-all ${
                hasUnsavedChanges 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg' 
                  : ''
              }`}
            >
              <Save className="h-4 w-4" />
              บันทึกการเปลี่ยนแปลง
            </Button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}