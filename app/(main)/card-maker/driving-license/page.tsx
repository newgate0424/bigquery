'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, RefreshCw, Upload, Sparkles } from "lucide-react";
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';

interface DrivingLicenseData {
  fullName: string;
  englishName: string;
  idNumber: string;
  licenseNumber: string;
  birthDate: string;
  issueDate: string;
  expiryDate: string;
  photo?: string;
}

// Random data generators
const generateRandomLicenseNo = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const generateRandomIdNumber = (): string => {
  // สร้างเลขบัตรประชาชนไทยที่ถูกต้องตามอัลกอริทึม MOD 11
  // 12 หลักแรกสุ่ม, หลักที่ 13 คำนวณจาก checksum
  
  const digits: number[] = [];
  
  // สุ่ม 12 หลักแรก
  for (let i = 0; i < 12; i++) {
    if (i === 0) {
      // หลักแรกไม่ควรเป็น 0, 9
      digits.push(Math.floor(Math.random() * 7) + 1); // 1-7
    } else {
      digits.push(Math.floor(Math.random() * 10)); // 0-9
    }
  }
  
  // คำนวณหลักที่ 13 (check digit) ด้วย MOD 11
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (13 - i);
  }
  
  const mod = sum % 11;
  const checkDigit = (11 - mod) % 10;
  digits.push(checkDigit);
  
  return digits.join('');
};

const generateRandomDate = (minAge: number = 18, maxAge: number = 80): string => {
  const today = new Date();
  const birthYear = today.getFullYear() - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${birthYear}`;
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

const generateRandomAddress = (): string => {
  const addresses = [
    '123 หมู่ 1 ตำบลบางใหญ่ อำเภอบางใหญ่ จังหวัดนนทบุรี 11140',
    '456 ซอยรามคำแหง 24 แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240',
    '789 หมู่ 5 ตำบลบ้านใหม่ อำเภอปากเกร็ด จังหวัดนนทบุรี 11120',
    '321 ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
    '654 หมู่ 3 ตำบลคลองหนึ่ง อำเภอคลองหลวง จังหวัดปทุมธานี 12120'
  ];
  return addresses[Math.floor(Math.random() * addresses.length)];
};

const DrivingLicenseGenerator: React.FC = () => {
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
        templateImg.src = '/card/th/driving.png';
      } catch (error) {
        console.error('Error loading initial driving license template:', error);
      }
    };

    initializeCanvas();
  }, []);

  const [cardData, setCardData] = useState<DrivingLicenseData>({
    fullName: '',
    englishName: '',
    idNumber: '',
    licenseNumber: '',
    birthDate: '',
    issueDate: '',
    expiryDate: '',
    photo: undefined
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAIPhoto, setUseAIPhoto] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // ฟังก์ชันสุ่มรูปจาก AI ผ่าน API route
  const generateAIPhoto = async () => {
    try {
      // เรียกใช้ API route เพื่อหลีกเลี่ยง CORS
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/ai-photo?t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI photo');
      }
      
      const blob = await response.blob();
      
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error generating AI photo:', error);
      return undefined;
    }
  };

  // ฟังก์ชันสุ่มรูป AI แบบแยกต่างหาก
  const handleGenerateAIPhoto = async () => {
    setIsLoadingAI(true);
    try {
      const aiPhoto = await generateAIPhoto();
      if (aiPhoto) {
        setCardData(prev => ({ ...prev, photo: aiPhoto }));
        setUseAIPhoto(true);
      }
    } catch (error) {
      console.error('Error loading AI photo:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Random data generation function
  const generateRandomData = async () => {
    const { fullName, englishName } = generateRandomName();
    const birthDate = generateRandomDate();
    const today = new Date();
    const issueYear = today.getFullYear() - Math.floor(Math.random() * 5);
    const expiryYear = issueYear + 5; // ใบขับขี่หมดอายุ 5 ปี
    
    const issueDate = `${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}/${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}/${issueYear}`;
    const expiryDate = `${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}/${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}/${expiryYear}`;
    
    // ถ้าเลือกใช้รูป AI ให้สุ่มรูปด้วย
    let photo = cardData.photo;
    if (useAIPhoto) {
      setIsLoadingAI(true);
      photo = await generateAIPhoto();
      setIsLoadingAI(false);
    }
    
    const newData = {
      fullName,
      englishName,
      idNumber: generateRandomIdNumber(),
      licenseNumber: generateRandomLicenseNo(),
      birthDate,
      issueDate,
      expiryDate,
      photo
    };
    
    setCardData(newData);
  };

  const handleInputChange = (field: keyof DrivingLicenseData, value: string) => {
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
    
    // รองรับรูปแบบ DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const monthIndex = parseInt(month) - 1;
    const thaiYear = parseInt(year) + 543;
    
    return `${parseInt(day)} ${thaiMonths[monthIndex]} ${thaiYear}`;
  };

  const formatDateEnglish = (dateString: string) => {
    if (!dateString) return '';
    
    // รองรับรูปแบบ DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    
    const englishMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthIndex = parseInt(month) - 1;
    
    return `${parseInt(day)} ${englishMonths[monthIndex]} ${year}`;
  };

  const drawTextWithShadow = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string = '#000000') => {
    // ข้อความหลัก (ไม่มีเงา)
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };

  const generateCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ตั้งค่าขนาด Canvas (ขนาดใหญ่สำหรับการดาวน์โหลด)
    const scale = 2.0; // ตัวคูณสำหรับขยายขนาด (1200 * 2 = 2400)
    canvas.width = 2400;
    canvas.height = 1512; // รักษาสัดส่วน 2400:1512 = 1200:756

    try {
      // โหลดเทมเพลต
      const templateImg = new Image();
      templateImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        templateImg.onload = resolve;
        templateImg.onerror = reject;
        templateImg.src = '/card/th/driving.png';
      });

      // วาดเทมเพลต
      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

      // ตั้งค่าฟอนต์ไทย
      ctx.font = `${24 * scale}px "TH Sarabun PSK", Arial, sans-serif`;
      ctx.textAlign = 'left';

      // วาดรูปผู้ใช้ (ตำแหน่งด้านซ้าย)
      if (cardData.photo) {
        const userImg = new Image();
        userImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve) => {
          userImg.onload = resolve;
          userImg.src = cardData.photo!;
        });

        // วาดรูปในตำแหน่งที่กำหนด (ปรับตามเทมเพลตใบขับขี่ไทย)
        const photoX = 60 * scale;
        const photoY = 310 * scale;
        const photoWidth = 240 * scale;
        const photoHeight = 300 * scale;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoWidth, photoHeight);
        ctx.clip();
        ctx.drawImage(userImg, photoX, photoY, photoWidth, photoHeight);
        ctx.restore();
      }

      // วาดข้อมูลใบขับขี่ตามตำแหน่งจริงของเทมเพลต
      
      // เลขใบขับขี่ (ไทย - มุมขวาบน)
      // font: ขนาด 28px, bold, ตำแหน่ง X: 550, Y: 175
      if (cardData.licenseNumber) {
        ctx.font = `bold ${40 * scale}px Arial, sans-serif`;
        ctx.textAlign = 'right';
        drawTextWithShadow(ctx, cardData.licenseNumber, 630 * scale, 184 * scale, '#000000');
      }
      
      // เลขใบขับขี่ (อังกฤษ - ใช้เลขเดียวกัน)
      // font: ขนาด 40px, ตำแหน่ง X: 930, Y: 175
      if (cardData.licenseNumber) {
        ctx.font = `bold ${40 * scale}px Arial, sans-serif`;
        ctx.textAlign = 'right';
        drawTextWithShadow(ctx, cardData.licenseNumber, 960 * scale, 186 * scale, '#000000');
      }
      
      // วันออกบัตร (ไทย - Issue Date - ด้านบน)
      // font: ขนาด 22px, ตำแหน่ง X: 440, Y: 238
      if (cardData.issueDate) {
        ctx.font = `bold ${27 * scale}px "TH Sarabun PSK", Arial, sans-serif`;
        ctx.textAlign = 'left';
        drawTextWithShadow(ctx, formatDateThai(cardData.issueDate), 480 * scale, 235 * scale, '#000000');
      }
      
      // วันออกบัตร (อังกฤษ)
      // font: ขนาด 22px, ตำแหน่ง X: 460, Y: 260
      if (cardData.issueDate) {
        ctx.font = `bold ${27 * scale}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        drawTextWithShadow(ctx, formatDateEnglish(cardData.issueDate), 490 * scale, 262 * scale, '#000000');
      }
      
      // วันหมดอายุ (ไทย - Expiry Date - ด้านบน)
      // font: ขนาด 22px, ตำแหน่ง X: 850, Y: 240
      if (cardData.expiryDate) {
        ctx.font = `bold ${27 * scale}px "TH Sarabun PSK", Arial, sans-serif`;
        ctx.textAlign = 'left';
        drawTextWithShadow(ctx, formatDateThai(cardData.expiryDate), 880 * scale, 235 * scale, '#000000');
      }
      
      // วันหมดอายุ (อังกฤษ)
      // font: ขนาด 22px, ตำแหน่ง X: 870, Y: 260
      if (cardData.expiryDate) {
        ctx.font = `bold ${27 * scale}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        drawTextWithShadow(ctx, formatDateEnglish(cardData.expiryDate), 890 * scale, 260 * scale, '#000000');
      }
      
      // ชื่อ-นามสกุล (ไทย - ตำแหน่งตรงกลาง)
      // font: ขนาด 38px, bold, ตำแหน่ง X: 400, Y: 350
      if (cardData.fullName) {
        ctx.font = `bold ${38 * scale}px "TH Sarabun PSK", Arial, sans-serif`;
        ctx.textAlign = 'left';
        drawTextWithShadow(ctx, cardData.fullName, 430 * scale, 380 * scale, '#000000');
      }

      // ชื่อภาษาอังกฤษ (ใต้ชื่อไทย)
      // font: ขนาด 30px, bold, ตำแหน่ง X: 400, Y: 390
      if (cardData.englishName) {
        ctx.font = `bold ${30 * scale}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        drawTextWithShadow(ctx, cardData.englishName, 430 * scale, 430 * scale, '#000000');
      }

      // วันเกิด (ไทย - Birth Date)
      // font: ขนาด 26px, ตำแหน่ง X: 450, Y: 539
      if (cardData.birthDate) {
        ctx.font = `bold ${26 * scale}px "TH Sarabun PSK", Arial, sans-serif`;
        ctx.textAlign = 'left';
        drawTextWithShadow(ctx, formatDateThai(cardData.birthDate), 490 * scale, 520 * scale, '#000000');
      }
      
      // วันเกิด (อังกฤษ)
      // font: ขนาด 26px, ตำแหน่ง X: 450, Y: 569
      if (cardData.birthDate) {
        ctx.font = `bold ${26 * scale}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        drawTextWithShadow(ctx, formatDateEnglish(cardData.birthDate), 490 * scale, 560 * scale, '#000000');
      }
      
      // เลขบัตรประชาชน (ID Number)
      // font: ขนาด 26px, ตำแหน่ง X: 660, Y: 600
      // รูปแบบ: X XXXX XXXXX XX X
      if (cardData.idNumber) {
        ctx.font = `bold ${26 * scale}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        const formattedId = `${cardData.idNumber.slice(0,1)} ${cardData.idNumber.slice(1,5)} ${cardData.idNumber.slice(5,10)} ${cardData.idNumber.slice(10,12)} ${cardData.idNumber.slice(12,13)}`;
        drawTextWithShadow(ctx, formattedId, 740 * scale, 600 * scale, '#000000');
      }

      // วาด Hologram 6 จุด
      const hologramImg = new Image();
      hologramImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve) => {
        hologramImg.onload = resolve;
        hologramImg.onerror = () => resolve(null); // ไม่ error ถ้าไม่มีไฟล์
        hologramImg.src = '/card/th/hologram.png';
      });

      if (hologramImg.complete && hologramImg.naturalWidth > 0) {
        // กำหนดตำแหน่งและขนาดของ hologram แต่ละจุด
        const hologramSize = 250 * scale; // ขนาดของแต่ละจุด (ปรับตาม scale)
        const hologramPositions = [
          { x: 150 * scale, y: 100 * scale, opacity: 0.35, brightness: 1.1, rotate: 0 },      // จุดที่ 1 - สว่างกว่า
          { x: 480 * scale, y: 100* scale, opacity: 0.15, brightness: 0.85, rotate: 45 },   // จุดที่ 2 - อ่อนลง
          { x: 880 * scale, y: 100 * scale, opacity: 0.18, brightness: 1.2, rotate: 90 },    // จุดที่ 3 - อ่อนลง
          { x: 220 * scale, y: 460 * scale, opacity: 0.3, brightness: 0.6, rotate: 180 },     // จุดที่ 4 - กลางๆ
          { x: 600 * scale, y: 460 * scale, opacity: 0.20, brightness: 1.15, rotate: 270 },  // จุดที่ 5 - อ่อนลง
          { x: 980 * scale, y: 460 * scale, opacity: 0.16, brightness: 0.95, rotate: 135 },  // จุดที่ 6 - อ่อนลง
        ];

        // วาด hologram ในแต่ละตำแหน่ง
        hologramPositions.forEach(pos => {
          ctx.save();
          
          // กำหนดความโปร่งแสง
          ctx.globalAlpha = pos.opacity;
          
          // เลื่อนไปยังจุดกลางของรูป
          ctx.translate(pos.x + hologramSize / 2, pos.y + hologramSize / 2);
          
          // หมุนรูป
          ctx.rotate((pos.rotate * Math.PI) / 180);
          
          // ตั้งค่าฟิลเตอร์สีเทาและความสว่าง
          ctx.filter = `grayscale(30%) brightness(${pos.brightness})`;
          
          // วาดรูปโดยใช้ตำแหน่งที่ปรับแล้ว
          ctx.drawImage(hologramImg, -hologramSize / 2, -hologramSize / 2, hologramSize, hologramSize);
          
          ctx.restore();
        });
      }

      // เพิ่มเอฟเฟกต์ให้ดูเหมือนรูปจากกล้อง
      // 1. เพิ่ม Film Grain / Noise
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // เพิ่ม noise เล็กน้อย
        const noise = (Math.random() - 0.5) * 8; // ค่า noise ระหว่าง -4 ถึง 4
        data[i] += noise;     // Red
        data[i + 1] += noise; // Green
        data[i + 2] += noise; // Blue
        
        // ปรับความสว่างเล็กน้อย (vignette effect - มืดที่ขอบ)
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
        const vignette = 1 - (distance / maxDistance) * 0.15; // มืดที่ขอบ 15%
        
        data[i] *= vignette;
        data[i + 1] *= vignette;
        data[i + 2] *= vignette;
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // 2. ปรับโทนสีให้ดูอบอุ่นขึ้น (warm tone)
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(255, 230, 200, 0.03)'; // สีส้มอ่อนๆ
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      // 3. ลดความคมชัดเล็กน้อย (slight blur)
      ctx.filter = 'blur(0.3px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';

    } catch (error) {
      console.error('Error generating driving license:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [cardData]);

  // Auto-generate card when photo changes
  useEffect(() => {
    if (cardData.photo && cardData.fullName) {
      // รอให้ state update เสร็จก่อน
      const timer = setTimeout(() => {
        generateCard();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [cardData.photo, generateCard]); // ทำงานเมื่อรูปเปลี่ยน

  const downloadCard = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'thai-driving-license.png';
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
                  <CardTitle>Driving License Maker - เครื่องมือสร้างใบขับขี่ไทย</CardTitle>
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
                    <h3 className="text-lg font-semibold">ตัวอย่างใบขับขี่</h3>
                    
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
                      ดาวน์โหลดใบขับขี่
                    </Button>
                  </div>

                  {/* Right Column - Form */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">ข้อมูลใบขับขี่</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
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
                        <Label htmlFor="licenseNumber">เลขใบขับขี่</Label>
                        <Input
                          id="licenseNumber"
                          value={cardData.licenseNumber}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                          placeholder="12345678"
                        />
                      </div>

                      <div>
                        <Label htmlFor="birthDate">วันเกิด</Label>
                        <Input
                          id="birthDate"
                          type="text"
                          value={cardData.birthDate}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          placeholder="19/02/1990"
                        />
                        <p className="text-xs text-gray-500 mt-1">รูปแบบ: DD/MM/YYYY</p>
                      </div>

                      <div>
                        <Label htmlFor="issueDate">วันออกบัตร</Label>
                        <Input
                          id="issueDate"
                          type="text"
                          value={cardData.issueDate}
                          onChange={(e) => handleInputChange('issueDate', e.target.value)}
                          placeholder="01/01/2020"
                        />
                        <p className="text-xs text-gray-500 mt-1">รูปแบบ: DD/MM/YYYY</p>
                      </div>

                      <div>
                        <Label htmlFor="expiryDate">วันหมดอายุ</Label>
                        <Input
                          id="expiryDate"
                          type="text"
                          value={cardData.expiryDate}
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                          placeholder="01/01/2025"
                        />
                        <p className="text-xs text-gray-500 mt-1">รูปแบบ: DD/MM/YYYY</p>
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
                          disabled={useAIPhoto}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={useAIPhoto}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleGenerateAIPhoto}
                          disabled={isLoadingAI}
                          title="สุ่มรูป AI"
                        >
                          {isLoadingAI ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="useAIPhoto"
                          checked={useAIPhoto}
                          onChange={(e) => setUseAIPhoto(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="useAIPhoto" className="text-sm text-gray-700 cursor-pointer">
                          ใช้รูป AI (สุ่มอัตโนมัติเมื่อสุ่มข้อมูล)
                        </label>
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
                        {isGenerating ? 'กำลังสร้าง...' : 'สร้างใบขับขี่'}
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

export default DrivingLicenseGenerator;