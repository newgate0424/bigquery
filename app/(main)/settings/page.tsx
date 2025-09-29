'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/lib/theme-context';
import { Palette, RotateCcw, Save, Check, Type, Sliders, Eye, Sparkles, Paintbrush2, Settings2, Wand2, Crown, Zap } from 'lucide-react';

// Primary color presets
const primaryColorPresets = [
  { name: 'Blue', value: '#2563eb', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Purple', value: '#7c3aed', gradient: 'from-purple-500 to-purple-600' },
  { name: 'Pink', value: '#ec4899', gradient: 'from-pink-500 to-pink-600' },
  { name: 'Red', value: '#dc2626', gradient: 'from-red-500 to-red-600' },
  { name: 'Orange', value: '#ea580c', gradient: 'from-orange-500 to-orange-600' },
  { name: 'Yellow', value: '#ca8a04', gradient: 'from-yellow-500 to-yellow-600' },
  { name: 'Green', value: '#16a34a', gradient: 'from-green-500 to-green-600' },
  { name: 'Teal', value: '#0d9488', gradient: 'from-teal-500 to-teal-600' },
  { name: 'Cyan', value: '#0891b2', gradient: 'from-cyan-500 to-cyan-600' },
  { name: 'Indigo', value: '#4f46e5', gradient: 'from-indigo-500 to-indigo-600' },
  { name: 'Violet', value: '#8b5cf6', gradient: 'from-violet-500 to-violet-600' },
  { name: 'Rose', value: '#f43f5e', gradient: 'from-rose-500 to-rose-600' }
];

// Background color presets with enhanced gradients
const backgroundColorPresets = [
  // Solid Minimalist
  { name: 'Pure White', value: '#ffffff', category: 'minimal', preview: 'bg-white border border-gray-200' },
  { name: 'Soft Gray', value: '#f8fafc', category: 'minimal', preview: 'bg-slate-50 border border-gray-200' },
  { name: 'Warm White', value: '#fafaf9', category: 'minimal', preview: 'bg-stone-50 border border-stone-200' },
  { name: 'Cool Gray', value: '#f3f4f6', category: 'minimal', preview: 'bg-gray-100 border border-gray-200' },
  
  // Vibrant Gradients
  { name: 'Cosmic Blue', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'vibrant', preview: 'bg-gradient-to-br from-indigo-400 to-purple-500' },
  { name: 'Sunset Dream', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', category: 'vibrant', preview: 'bg-gradient-to-br from-pink-300 to-pink-200' },
  { name: 'Ocean Wave', value: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', category: 'vibrant', preview: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
  { name: 'Forest Magic', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', category: 'vibrant', preview: 'bg-gradient-to-br from-teal-200 to-pink-200' },
  
  // Pastel Dreams
  { name: 'Morning Mist', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', category: 'pastel', preview: 'bg-gradient-to-br from-orange-100 to-orange-200' },
  { name: 'Lavender Field', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', category: 'pastel', preview: 'bg-gradient-to-br from-purple-100 to-pink-100' },
  { name: 'Mint Breeze', value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', category: 'pastel', preview: 'bg-gradient-to-br from-pink-200 to-yellow-100' },
  { name: 'Sky Whisper', value: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', category: 'pastel', preview: 'bg-gradient-to-br from-cyan-100 to-blue-200' },

  // Dark Themes
  { name: 'Midnight', value: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', category: 'dark', preview: 'bg-gradient-to-br from-slate-700 to-slate-600' },
  { name: 'Deep Space', value: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)', category: 'dark', preview: 'bg-gradient-to-br from-gray-900 to-gray-800' },
  { name: 'Aurora Dark', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'dark', preview: 'bg-gradient-to-br from-indigo-800 to-purple-800' },
  { name: 'Neon Glow', value: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)', category: 'dark', preview: 'bg-gradient-to-br from-pink-600 to-purple-600' }
];

// Enhanced font presets with categories
const fontPresets = [
  // Modern Sans
  { name: 'Inter', value: 'Inter, system-ui, sans-serif', category: 'modern', description: 'Clean & Modern' },
  { name: 'Poppins', value: 'Poppins, system-ui, sans-serif', category: 'modern', description: 'Friendly & Round' },
  { name: 'Outfit', value: 'Outfit, system-ui, sans-serif', category: 'modern', description: 'Bold & Contemporary' },
  { name: 'Plus Jakarta', value: '"Plus Jakarta Sans", system-ui, sans-serif', category: 'modern', description: 'Elegant & Refined' },
  
  // Classic Serif
  { name: 'Playfair', value: '"Playfair Display", Georgia, serif', category: 'serif', description: 'Elegant & Editorial' },
  { name: 'Crimson', value: '"Crimson Text", Georgia, serif', category: 'serif', description: 'Classic & Readable' },
  
  // Mono & Tech
  { name: 'JetBrains', value: '"JetBrains Mono", monospace', category: 'mono', description: 'Developer Friendly' },
  { name: 'Fira Code', value: '"Fira Code", monospace', category: 'mono', description: 'Code Optimized' },
  
  // Thai Fonts
  { name: 'Sarabun', value: '"Sarabun", sans-serif', category: 'thai', description: 'ฟอนต์ไทยมาตรฐาน' },
  { name: 'Kanit', value: '"Kanit", sans-serif', category: 'thai', description: 'ฟอนต์ไทยสมัยใหม่' },
  { name: 'Prompt', value: '"Prompt", sans-serif', category: 'thai', description: 'ฟอนต์ไทยทันสมัย' },
  { name: 'Mitr', value: '"Mitr", sans-serif', category: 'thai', description: 'ฟอนต์ไทยเป็นกันเอง' }
];

const fontSizeOptions = [
  { name: 'เล็กมาก', value: 12, description: 'สำหรับข้อความเสริม' },
  { name: 'เล็ก', value: 13, description: 'สำหรับรายละเอียด' },
  { name: 'ปกติ', value: 14, description: 'ขนาดมาตรฐาน' },
  { name: 'กลาง', value: 16, description: 'อ่านง่าย สบายตา' },
  { name: 'ใหญ่', value: 18, description: 'เน้นความชัดเจน' },
  { name: 'ใหญ่มาก', value: 20, description: 'สำหรับหัวข้อ' },
  { name: 'ยักษ์', value: 22, description: 'โดดเด่นที่สุด' }
];

export default function SettingsPage() {
  const { colors, fonts, setColors, setFonts } = useTheme();
  const [tempColors, setTempColors] = useState(colors);
  const [tempFonts, setTempFonts] = useState(fonts);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedBgCategory, setSelectedBgCategory] = useState<string>('minimal');
  const [selectedFontCategory, setSelectedFontCategory] = useState<string>('modern');

  // Track changes
  useEffect(() => {
    const hasChanges = 
      tempColors.primary !== colors.primary ||
      tempColors.background !== colors.background ||
      tempFonts.family !== fonts.family ||
      tempFonts.size !== fonts.size;
    setHasUnsavedChanges(hasChanges);
  }, [tempColors, tempFonts, colors, fonts]);

  const handleColorChange = (type: 'primary' | 'background', value: string) => {
    console.log(`Settings: Changing ${type} color to:`, value);
    setTempColors(prev => ({ ...prev, [type]: value }));
  };

  const handleFontChange = (type: 'family' | 'size', value: string | number) => {
    setTempFonts(prev => ({ ...prev, [type]: value }));
  };

  const handleSave = () => {
    console.log('Settings: Saving colors and fonts:', { colors: tempColors, fonts: tempFonts });
    setColors(tempColors);
    setFonts(tempFonts);
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    setTempColors({ primary: '#2563eb', background: '#ffffff' });
    setTempFonts({ family: 'Inter, system-ui, -apple-system, sans-serif', size: 14 });
    setHasUnsavedChanges(false);
  };

  const backgroundsByCategory = backgroundColorPresets.filter(bg => bg.category === selectedBgCategory);
  const fontsByCategory = fontPresets.filter(font => font.category === selectedFontCategory);

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Hero Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg mr-4">
                <Settings2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ศูนย์การปรับแต่ง
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              ออกแบบประสบการณ์ที่เป็นเอกลักษณ์ของคุณ ด้วยสี ฟอนต์ และธีมที่หลากหลาย
            </p>
          </div>
        </div>

        {/* Floating Action Bar */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    รีเซ็ต
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    บันทึก
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Column 1: Theme Preview & Primary Colors */}
          <div className="space-y-6">
            
            {/* Live Theme Preview */}
            <Card className="overflow-hidden border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-100/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                    ตัวอย่างแบบเรียลไทม์
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div 
                  className="relative rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500"
                  style={{ 
                    background: tempColors.background,
                    fontFamily: tempFonts.family,
                    fontSize: `${tempFonts.size}px`
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: tempColors.primary }}
                      ></div>
                      <h3 className="font-bold text-xl" style={{ color: tempColors.primary }}>
                        หัวข้อหลัก
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      ข้อความตัวอย่างภาษาไทยและ English content ที่ใช้ในการแสดงผลฟอนต์และขนาดที่เลือก
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span 
                        className="px-3 py-1.5 rounded-lg text-white text-sm font-medium shadow-sm"
                        style={{ backgroundColor: tempColors.primary }}
                      >
                        แท็กสี Primary
                      </span>
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                        แท็กปกติ
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Colors */}
            <Card className="overflow-hidden border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-blue-100/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-semibold">
                    สีหลัก
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {primaryColorPresets.map((preset) => {
                    const isSelected = tempColors.primary === preset.value;
                    return (
                      <button
                        key={preset.value}
                        onClick={() => handleColorChange('primary', preset.value)}
                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                          isSelected
                            ? 'border-gray-400 shadow-xl ring-4 ring-gray-400/30 bg-gray-50 dark:bg-gray-700/50'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-lg'
                        }`}
                        title={preset.name}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div 
                            className={`w-8 h-8 rounded-xl shadow-lg bg-gradient-to-br ${preset.gradient}`}
                          ></div>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
                            {preset.name}
                          </span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-1.5 shadow-lg">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Background Themes */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-100/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Paintbrush2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                    ธีมพื้นหลัง
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Category Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100/80 dark:bg-gray-700/50 rounded-xl">
                  {['minimal', 'vibrant', 'pastel', 'dark'].map((category) => {
                    const categoryNames = {
                      minimal: 'มินิมอล',
                      vibrant: 'สีสดใส', 
                      pastel: 'พาสเทล',
                      dark: 'โทนมืด'
                    };
                    
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedBgCategory(category)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedBgCategory === category
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        {categoryNames[category as keyof typeof categoryNames]}
                      </button>
                    );
                  })}
                </div>

                {/* Background Options */}
                <div className="grid grid-cols-2 gap-4">
                  {backgroundsByCategory.map((preset) => {
                    const isSelected = tempColors.background === preset.value;
                    return (
                      <button
                        key={preset.name}
                        onClick={() => handleColorChange('background', preset.value)}
                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                          isSelected
                            ? 'border-indigo-400 shadow-xl ring-4 ring-indigo-400/30 bg-indigo-50/50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-lg'
                        }`}
                        title={preset.name}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className={`w-full h-12 rounded-lg ${preset.preview} shadow-sm`}></div>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">
                            {preset.name}
                          </span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full p-1.5 shadow-lg">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 3: Typography & Font Settings */}
          <div className="space-y-6">
            
            {/* Font Family */}
            <Card className="overflow-hidden border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-emerald-100/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                    <Type className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-semibold">
                    ฟอนต์และตัวอักษร
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Font Category Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100/80 dark:bg-gray-700/50 rounded-xl">
                  {['modern', 'serif', 'mono', 'thai'].map((category) => {
                    const categoryNames = {
                      modern: 'โมเดิร์น',
                      serif: 'เซริฟ',
                      mono: 'โมโน',
                      thai: 'ไทย'
                    };
                    
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedFontCategory(category)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          selectedFontCategory === category
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        {categoryNames[category as keyof typeof categoryNames]}
                      </button>
                    );
                  })}
                </div>

                {/* Font Options */}
                <div className="space-y-3">
                  {fontsByCategory.map((preset) => {
                    const isSelected = tempFonts.family === preset.value;
                    return (
                      <button
                        key={preset.value}
                        onClick={() => handleFontChange('family', preset.value)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${
                          isSelected
                            ? 'border-emerald-400 shadow-lg ring-4 ring-emerald-400/30 bg-emerald-50/50 dark:bg-emerald-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div 
                              className="text-lg font-medium text-gray-900 dark:text-gray-100"
                              style={{ fontFamily: preset.value }}
                            >
                              {preset.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {preset.description}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full p-1.5 shadow-lg">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Font Size */}
            <Card className="overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-100/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
                    <Sliders className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-semibold">
                    ขนาดตัวอักษร
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {fontSizeOptions.map((sizeOption) => {
                    const isSelected = tempFonts.size === sizeOption.value;
                    return (
                      <button
                        key={sizeOption.value}
                        onClick={() => handleFontChange('size', sizeOption.value)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${
                          isSelected
                            ? 'border-orange-400 shadow-lg ring-4 ring-orange-400/30 bg-orange-50/50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div 
                              className="font-semibold text-gray-900 dark:text-gray-100"
                              style={{ fontSize: `${Math.min(sizeOption.value + 2, 20)}px` }}
                            >
                              Aa
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {sizeOption.name} ({sizeOption.value}px)
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {sizeOption.description}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-full p-1.5 shadow-lg">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Custom Size Input */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <div className="flex items-center gap-4">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <div className="flex-1">
                      <Label htmlFor="customSize" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        ขนาดกำหนดเอง
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          id="customSize"
                          type="number"
                          min="10"
                          max="24"
                          value={tempFonts.size}
                          onChange={(e) => handleFontChange('size', parseInt(e.target.value) || 14)}
                          className="w-20 h-9 text-center font-mono"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom spacing for floating action bar */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}