'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, RefreshCw, Upload } from "lucide-react";
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';

interface IDCardData {
  fullName: string;
  englishName: string;
  idNumber: string;
  birthDate: string;
  issueDate: string;
  expiryDate: string;
  religion: string;
  address: string;
  district: string;
  amphoe: string;
  province: string;
  postalCode: string;
  photo?: string;
}

// Random data generators
const generateRandomIdNumber = (): string => {
  const digits = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10));
  return digits.join('');
};

const generateRandomDate = (minAge: number = 18, maxAge: number = 80): string => {
  const today = new Date();
  const birthYear = today.getFullYear() - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  
  return `${birthYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

const generateRandomName = (): { fullName: string; englishName: string } => {
  const thaiTitles = ['นาย', 'นาง', 'นางสาว'];
  const thaiFirstNames = [
    'สมชาย', 'สมหญิง', 'วิชัย', 'วรรณา', 'ประเสริฐ', 'สุนีย์', 'อนุชา', 'รัตนา', 'เกียรติ', 'สุดา',
    'ธนาคาร', 'จิราพร', 'สันติ', 'มาลี', 'นิรันดร์', 'พิมพ์ใจ', 'ชัยยา', 'อรุณ', 'สมศรี', 'บุญมี'
  ];
  const thaiSurnames = [
    'ใจดี', 'รักดี', 'เจริญ', 'สุขใส', 'ดีงาม', 'มั่งมี', 'เฮงสุข', 'ทองคำ', 'สว่างใส', 'บุญมาก',
    'ร่วงโรจน์', 'สีใส', 'ปานแก้ว', 'หอมกลิ่น', 'น้ำใส', 'ขำคม', 'ดีเด่น', 'ใหม่สด', 'เก่งการ', 'ยิ่งใหญ่'
  ];
  
  const engTitles = ['MR.', 'MS.', 'MRS.'];
  const engFirstNames = [
    'SOMCHAI', 'SOMYING', 'WICHAI', 'WANNA', 'PRASERT', 'SUNEE', 'ANUCHA', 'RATANA', 'KIAT', 'SUDA',
    'THANAKAN', 'JIRAPORN', 'SANTI', 'MALEE', 'NIRAN', 'PIMJAI', 'CHAIYA', 'ARUN', 'SOMSRI', 'BUNMEE'
  ];
  const engSurnames = [
    'JAIDEE', 'RAKDEE', 'CHAROEN', 'SUKJAI', 'DINGAM', 'MANGMEE', 'HENGSUK', 'THONGKHAM', 'SAWANGJAI', 'BUNMAK'
  ];
  
  const thaiTitle = thaiTitles[Math.floor(Math.random() * thaiTitles.length)];
  const thaiFirstName = thaiFirstNames[Math.floor(Math.random() * thaiFirstNames.length)];
  const thaiSurname = thaiSurnames[Math.floor(Math.random() * thaiSurnames.length)];
  const fullName = `${thaiTitle}${thaiFirstName} ${thaiSurname}`;
  
  const engTitle = engTitles[Math.floor(Math.random() * engTitles.length)];
  const engFirstName = engFirstNames[Math.floor(Math.random() * engFirstNames.length)];
  const engSurname = engSurnames[Math.floor(Math.random() * engSurnames.length)];
  const englishName = `${engTitle} ${engFirstName} ${engSurname}`;
  
  return { fullName, englishName };
};

const generateRandomAddress = (): { address: string; district: string; amphoe: string; province: string; postalCode: string } => {
  const addresses = [
    { address: '123 หมู่ 1', district: 'บางใหญ่', amphoe: 'บางใหญ่', province: 'นนทบุรี', postalCode: '11140' },
    { address: '456 ซอยรามคำแหง 24', district: 'หัวหมาก', amphoe: 'บางกะปิ', province: 'กรุงเทพฯ', postalCode: '10240' },
    { address: '789 หมู่ 5', district: 'บ้านใหม่', amphoe: 'ปากเกร็ด', province: 'นนทบุรี', postalCode: '11120' },
    { address: '321 ถนนพหลโยธิน', district: 'จตุจักร', amphoe: 'จตุจักร', province: 'กรุงเทพฯ', postalCode: '10900' },
    { address: '654 หมู่ 3', district: 'คลองหนึ่ง', amphoe: 'คลองหลวง', province: 'ปทุมธานี', postalCode: '12120' }
  ];
  return addresses[Math.floor(Math.random() * addresses.length)];
};

const IDCardGenerator: React.FC = () => {
  const { effectiveTheme, colors } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize canvas with template when component mounts
  useEffect(() => {
    const initializeCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        const templateImg = new Image();
        templateImg.onload = () => {
          ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
        };
        templateImg.src = '/card/th/idcard.png';
      } catch (error) {
        console.error('Error loading initial ID card template:', error);
      }
    };

    initializeCanvas();
  }, []);

  const [cardData, setCardData] = useState<IDCardData>({
    fullName: '',
    englishName: '',
    idNumber: '',
    birthDate: '',
    issueDate: '',
    expiryDate: '',
    religion: 'พุทธ',
    address: '',
    district: '',
    amphoe: '',
    province: '',
    postalCode: '',
    photo: undefined
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Random data generation function
  const generateRandomData = () => {
    const { fullName, englishName } = generateRandomName();
    const birthDate = generateRandomDate();
    const addressData = generateRandomAddress();
    const today = new Date();
    const issueYear = today.getFullYear() - Math.floor(Math.random() * 5);
    const expiryYear = issueYear + 10; // บัตรประชาชนหมดอายุ 10 ปี
    
    const issueDate = `${issueYear}-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`;
    const expiryDate = `${expiryYear}-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`;
    
    const religions = ['พุทธ', 'อิสลาม', 'คริสต์', 'ฮินดู', 'ซิกข์'];
    const religion = religions[Math.floor(Math.random() * religions.length)];
    
    setCardData({
      fullName,
      englishName,
      idNumber: generateRandomIdNumber(),
      issueDate,
      expiryDate,
      birthDate,
      religion,
      ...addressData,
      photo: cardData.photo
    });
  };

  const handleInputChange = (field: keyof IDCardData, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCardData(prev => ({
          ...prev,
          photo: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDateThai = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = (date.getFullYear() + 543).toString();
    return `${day} ${getThaiMonth(date.getMonth())} ${year}`;
  };

  const getThaiMonth = (monthIndex: number) => {
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return months[monthIndex] || '';
  };

  const drawTextWithShadow = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string = '#000000') => {
    // เงา
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText(text, x + 1, y + 1);
    
    // ข้อความหลัก
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };

  const generateCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);

    try {
      // โหลดเทมเพลต
      const templateImg = new Image();
      templateImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        templateImg.onload = resolve;
        templateImg.onerror = reject;
        templateImg.src = '/card/th/idcard.png';
      });

      // วาดเทมเพลต
      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

      // ตั้งค่าฟอนต์ไทย
      ctx.font = '22px "TH Sarabun PSK", Arial, sans-serif';
      ctx.textAlign = 'left';

      // วาดรูปผู้ใช้
      if (cardData.photo) {
        const userImg = new Image();
        userImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve) => {
          userImg.onload = resolve;
          userImg.src = cardData.photo!;
        });

        // วาดรูปในตำแหน่งที่กำหนด (ปรับตำแหน่งตามเทมเพลต)
        const photoX = 70;
        const photoY = 200;
        const photoWidth = 140;
        const photoHeight = 160;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoWidth, photoHeight);
        ctx.clip();
        ctx.drawImage(userImg, photoX, photoY, photoWidth, photoHeight);
        ctx.restore();
      }

      // วาดข้อมูลบัตรประชาชน
      ctx.font = '20px "TH Sarabun PSK", Arial, sans-serif';
      
      // เลขบัตรประชาชน
      if (cardData.idNumber) {
        ctx.font = '24px "TH Sarabun PSK", Arial, sans-serif';
        drawTextWithShadow(ctx, cardData.idNumber, 280, 200, '#cc0000');
        ctx.font = '20px "TH Sarabun PSK", Arial, sans-serif';
      }

      // ชื่อ-นามสกุล
      if (cardData.fullName) {
        ctx.font = '22px "TH Sarabun PSK", Arial, sans-serif';
        drawTextWithShadow(ctx, cardData.fullName, 280, 240);
        ctx.font = '20px "TH Sarabun PSK", Arial, sans-serif';
      }

      // ชื่อภาษาอังกฤษ
      if (cardData.englishName) {
        ctx.font = '18px Arial, sans-serif';
        drawTextWithShadow(ctx, cardData.englishName, 280, 270);
        ctx.font = '20px "TH Sarabun PSK", Arial, sans-serif';
      }

      // วันเกิด
      if (cardData.birthDate) {
        drawTextWithShadow(ctx, `เกิดวันที่: ${formatDateThai(cardData.birthDate)}`, 280, 310);
      }

      // ศาสนา
      if (cardData.religion) {
        drawTextWithShadow(ctx, `ศาสนา: ${cardData.religion}`, 280, 340);
      }

      // ที่อยู่
      let yPosition = 380;
      if (cardData.address) {
        drawTextWithShadow(ctx, `ที่อยู่: ${cardData.address}`, 280, yPosition);
        yPosition += 30;
      }

      // ตำบล/แขวง
      if (cardData.district) {
        drawTextWithShadow(ctx, `ตำบล/แขวง: ${cardData.district}`, 280, yPosition);
        yPosition += 30;
      }

      // อำเภอ/เขต
      if (cardData.amphoe) {
        drawTextWithShadow(ctx, `อำเภอ/เขต: ${cardData.amphoe}`, 280, yPosition);
        yPosition += 30;
      }

      // จังหวัด
      if (cardData.province) {
        drawTextWithShadow(ctx, `จังหวัด: ${cardData.province}`, 280, yPosition);
        yPosition += 30;
      }

      // รหัสไปรษณีย์
      if (cardData.postalCode) {
        drawTextWithShadow(ctx, `รหัสไปรษณีย์: ${cardData.postalCode}`, 280, yPosition);
        yPosition += 30;
      }

      // วันออกบัตรและวันหมดอายุ
      const dateY = canvas.height - 80;
      if (cardData.issueDate) {
        ctx.font = '16px "TH Sarabun PSK", Arial, sans-serif';
        drawTextWithShadow(ctx, `วันออกบัตร: ${formatDateThai(cardData.issueDate)}`, 50, dateY);
      }

      if (cardData.expiryDate) {
        ctx.font = '16px "TH Sarabun PSK", Arial, sans-serif';
        drawTextWithShadow(ctx, `วันหมดอายุ: ${formatDateThai(cardData.expiryDate)}`, 50, dateY + 25);
      }

    } catch (error) {
      console.error('Error generating ID card:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [cardData]);

  const downloadCard = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'thai-id-card.png';
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div 
      className={cn(
        "h-screen p-4 sm:p-6 transition-colors duration-200",
        effectiveTheme === 'dark' 
          ? "text-slate-100" 
          : "text-slate-900"
      )}
      style={{ 
        backgroundColor: colors.background
      }}
      data-page="card-maker"
    >
      <Card className={cn(
        "h-full overflow-hidden border-0 shadow-lg transition-colors duration-200",
        effectiveTheme === 'dark'
          ? "bg-slate-800/30 backdrop-blur-md shadow-slate-900/50"
          : "bg-white/30 backdrop-blur-md shadow-slate-200/50"
      )}>
        <div className="h-full overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ID Card Maker - เครื่องมือสร้างบัตรประชาชนไทย</CardTitle>
                  <Link href="/card-maker">
                    <Button variant="outline" className="flex items-center gap-2">
                      ← กลับเลือกบัตร
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Left Column - Canvas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ตัวอย่างบัตรประชาชน</h3>
                    
                    <canvas
                      ref={canvasRef}
                      width={1200}
                      height={756}
                      className="w-full max-w-full h-auto rounded-lg shadow-lg bg-white"
                      style={{ 
                        maxWidth: '600px',
                        height: 'auto',
                        aspectRatio: '1200/756'
                      }}
                    />
                    
                    <Button 
                      onClick={downloadCard} 
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      ดาวน์โหลดบัตรประชาชน
                    </Button>
                  </div>

                  {/* Right Column - Form */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">ข้อมูลบัตรประชาชน</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="idNumber">เลขบัตรประชาชน</Label>
                        <Input
                          id="idNumber"
                          value={cardData.idNumber}
                          onChange={(e) => handleInputChange('idNumber', e.target.value)}
                          placeholder="1234567890123"
                          maxLength={13}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fullName">ชื่อ-นามสกุล (ไทย)</Label>
                        <Input
                          id="fullName"
                          value={cardData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder="นาย สมชาย ใจดี"
                        />
                      </div>

                      <div>
                        <Label htmlFor="englishName">ชื่อ-นามสกุล (อังกฤษ)</Label>
                        <Input
                          id="englishName"
                          value={cardData.englishName}
                          onChange={(e) => handleInputChange('englishName', e.target.value)}
                          placeholder="MR. SOMCHAI JAIDEE"
                        />
                      </div>

                      <div>
                        <Label htmlFor="birthDate">วันเกิด</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={cardData.birthDate}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="religion">ศาสนา</Label>
                        <select
                          id="religion"
                          value={cardData.religion}
                          onChange={(e) => handleInputChange('religion', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="พุทธ">พุทธ</option>
                          <option value="อิสลาม">อิสลาม</option>
                          <option value="คริสต์">คริสต์</option>
                          <option value="ฮินดู">ฮินดู</option>
                          <option value="ซิกข์">ซิกข์</option>
                          <option value="ไม่ระบุ">ไม่ระบุ</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="address">ที่อยู่</Label>
                        <Input
                          id="address"
                          value={cardData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="123 หมู่ 1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="district">ตำบล/แขวง</Label>
                        <Input
                          id="district"
                          value={cardData.district}
                          onChange={(e) => handleInputChange('district', e.target.value)}
                          placeholder="บางใหญ่"
                        />
                      </div>

                      <div>
                        <Label htmlFor="amphoe">อำเภอ/เขต</Label>
                        <Input
                          id="amphoe"
                          value={cardData.amphoe}
                          onChange={(e) => handleInputChange('amphoe', e.target.value)}
                          placeholder="บางใหญ่"
                        />
                      </div>

                      <div>
                        <Label htmlFor="province">จังหวัด</Label>
                        <Input
                          id="province"
                          value={cardData.province}
                          onChange={(e) => handleInputChange('province', e.target.value)}
                          placeholder="นนทบุรี"
                        />
                      </div>

                      <div>
                        <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                        <Input
                          id="postalCode"
                          value={cardData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          placeholder="11140"
                        />
                      </div>

                      <div>
                        <Label htmlFor="issueDate">วันออกบัตร</Label>
                        <Input
                          id="issueDate"
                          type="date"
                          value={cardData.issueDate}
                          onChange={(e) => handleInputChange('issueDate', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="expiryDate">วันหมดอายุ</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={cardData.expiryDate}
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="photo">รูปถ่าย</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          ref={fileInputRef}
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={generateRandomData}
                        variant="outline"
                        className="flex-1"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        สุ่มข้อมูล
                      </Button>
                      
                      <Button 
                        onClick={generateCard} 
                        disabled={isGenerating}
                        className="flex-1"
                      >
                        {isGenerating ? 'กำลังสร้าง...' : 'สร้างบัตรประชาชน'}
                      </Button>
                    </div>
                  </div>
                </div>
                
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IDCardGenerator;