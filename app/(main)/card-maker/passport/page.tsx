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

// โหลดฟอนต์ SOV_Laizen_Demo สำหรับลายเซ็น
const loadSignatureFont = async () => {
  try {
    const font = new FontFace('SOV_Laizen_Demo', 'url(/fonts/SOV_Laizen_Demo.ttf)');
    await font.load();
    document.fonts.add(font);
    console.log('SOV_Laizen_Demo font loaded successfully');
  } catch (error) {
    console.error('Failed to load SOV_Laizen_Demo font:', error);
  }
};

interface CardData {
  surname: string;
  title: string;
  firstName: string;
  nameInThai: string;
  sex: string;
  height: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  dateOfBirth: string;
  placeOfBirth: string;
  identificationNo: string;
  passportNo: string;
  signature: string;
  photo?: string;
}

// Random data generators
const generateRandomPassportNo = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  let result = '';
  for (let i = 0; i < 2; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 7; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
};

const generateRandomIdNumber = (): string => {
  const digits = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10));
  return digits.join('');
};

const generateRandomDate = (minAge: number = 18, maxAge: number = 80): string => {
  const today = new Date();
  const birthYear = today.getFullYear() - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  return `${day.toString().padStart(2, '0')} ${months[month - 1]} ${birthYear}`;
};

const generateRandomName = (): { title: string; firstName: string; surname: string; nameInThai: string } => {
  // คำนำหน้าภาษาอังกฤษ
  const titles = ['MR.', 'MS.', 'MRS.', 'DR.', 'PROF.'];
  
  // ชื่อภาษาอังกฤษ (เพิ่มเยอะขึ้น)
  const firstNames = [
    'ALEXANDER', 'BENJAMIN', 'CHRISTOPHER', 'DANIEL', 'EDWARD', 'FRANKLIN', 'GABRIEL', 'HARRISON',
    'ISABELLA', 'JENNIFER', 'KATHERINE', 'LILLIAN', 'MARGARET', 'NATALIE', 'OLIVIA', 'PATRICIA',
    'QUINTON', 'REBECCA', 'STEPHANIE', 'THEODORE', 'VICTORIA', 'WILLIAM', 'XAVIER', 'YVONNE', 'ZACHARY',
    'ANDREW', 'BRIAN', 'CHARLES', 'DAVID', 'ETHAN', 'FREDERICK', 'GEORGE', 'HENRY', 'ISAAC', 'JACOB',
    'AMANDA', 'BARBARA', 'CAROL', 'DIANA', 'ELIZABETH', 'FIONA', 'GRACE', 'HELEN', 'IRENE', 'JULIA'
  ];
  
  // นามสกุลภาษาอังกฤษ (เพิ่มเยอะขึ้น)
  const surnames = [
    'ANDERSON', 'BROWN', 'CLARK', 'DAVIS', 'EVANS', 'FOSTER', 'GARCIA', 'HARRIS', 'JACKSON', 'JOHNSON',
    'KING', 'LEWIS', 'MARTIN', 'NELSON', 'PARKER', 'RODRIGUEZ', 'SMITH', 'TAYLOR', 'THOMAS', 'WALKER',
    'WHITE', 'WILSON', 'YOUNG', 'ALLEN', 'BAKER', 'CAMPBELL', 'CARTER', 'COLLINS', 'COOPER', 'EDWARDS',
    'FLORES', 'GONZALEZ', 'GREEN', 'HALL', 'HERNANDEZ', 'HILL', 'JONES', 'LEE', 'LOPEZ', 'MARTINEZ',
    'MILLER', 'MITCHELL', 'MOORE', 'MORALES', 'MORGAN', 'MURPHY', 'PEREZ', 'PHILLIPS', 'RIVERA', 'ROBERTS'
  ];
  
  // ชื่อภาษาไทย พร้อมคำนำหน้า
  const thaiTitles = ['นาย', 'นาง', 'นางสาว'];
  const thaiFirstNames = [
    'สมชาย', 'สมหญิง', 'วิชัย', 'วรรณา', 'ประเสริฐ', 'สุนีย์', 'อนุชา', 'รัตนา', 'เกียรติ', 'สุดา',
    'ธนาคาร', 'จิราพร', 'สันติ', 'มาลี', 'นิรันดร์', 'พิมพ์ใจ', 'ชัยยา', 'อรุณ', 'สมศรี', 'บุญมี',
    'เสาวภา', 'กมล', 'ศิริ', 'วันเพ็ญ', 'ประยงค์', 'ทองดี', 'ลักษณา', 'จิตต์', 'วิไล', 'สุพร',
    'ดาวเรือง', 'กานต์', 'สายใจ', 'บุญเลิศ', 'อนงค์', 'เจษฎา', 'ปรีชา', 'วิมล', 'สุรีย์', 'นิภา'
  ];
  const thaiSurnames = [
    'ใจดี', 'รักดี', 'เจริญ', 'สุขใส', 'ดีงาม', 'มั่งมี', 'เฮงสุข', 'ทองคำ', 'สว่างใส', 'บุญมาก',
    'ร่วงโรจน์', 'สีใส', 'ปานแก้ว', 'หอมกลิ่น', 'น้ำใส', 'ขำคม', 'ดีเด่น', 'ใหม่สด', 'เก่งการ', 'ยิ่งใหญ่',
    'สุวรรณ', 'บุญชู', 'สมบูรณ์', 'ประสงค์', 'วิเศษ', 'เลิศล้ำ', 'อุดมการ', 'เจริญรุ่ง', 'ศิลป์', 'กิจการ'
  ];
  
  const title = titles[Math.floor(Math.random() * titles.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  
  // สร้างชื่อไทย โดยสุ่มคำนำหน้า + ชื่อ + นามสกุล
  const thaiTitle = thaiTitles[Math.floor(Math.random() * thaiTitles.length)];
  const thaiFirstName = thaiFirstNames[Math.floor(Math.random() * thaiFirstNames.length)];
  const thaiSurname = thaiSurnames[Math.floor(Math.random() * thaiSurnames.length)];
  const nameInThai = `${thaiTitle}${thaiFirstName} ${thaiSurname}`;
  
  return { title, firstName, surname, nameInThai };
};

const generateRandomPlace = (): string => {
  // สถานที่เกิดในประเทศไทย (เพิ่มเยอะขึ้น)
  const places = [
    'BANGKOK', 'NONTHABURI', 'PATHUM THANI', 'SAMUT PRAKAN', 'SAMUT SAKHON',
    'CHIANG MAI', 'CHIANG RAI', 'LAMPHUN', 'LAMPANG', 'MAE HONG SON',
    'NAKHON RATCHASIMA', 'BURI RAM', 'SURIN', 'SI SA KET', 'UBON RATCHATHANI',
    'KHON KAEN', 'UDON THANI', 'LOEI', 'NONG KHAI', 'MAHA SARAKHAM',
    'RAYONG', 'CHANTHABURI', 'TRAT', 'CHON BURI', 'PRACHIN BURI',
    'NAKHON PATHOM', 'RATCHABURI', 'KANCHANABURI', 'SUPHAN BURI', 'LOPBURI',
    'PHUKET', 'KRABI', 'PHANG NGA', 'RANONG', 'SURAT THANI',
    'NAKHON SI THAMMARAT', 'PHATTHALUNG', 'SONGKHLA', 'PATTANI', 'YALA'
  ];
  return places[Math.floor(Math.random() * places.length)];
};

// ลบฟังก์ชัน getRandomAIPhoto ออก

const CardMakerPage: React.FC = () => {
  const { effectiveTheme, colors } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // โหลดฟอนต์เมื่อ component mount
  useEffect(() => {
    loadSignatureFont();
  }, []);

  // โหลดรูปบัตรเริ่มต้นเมื่อ component mount
  useEffect(() => {
    const initializeCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        // โหลดรูปพื้นหลังบัตรพาสปอร์ต
        const bgImage = new Image();
        bgImage.onload = () => {
          // วาดรูปพื้นหลัง
          ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        };
        bgImage.src = '/card/th/th-id.png'; // ใช้รูปบัตรพาสปอร์ตไทย
      } catch (error) {
        console.error('Error loading initial passport template:', error);
      }
    };

    initializeCanvas();
  }, []);
  
  const [cardData, setCardData] = useState<CardData>({
    surname: '',
    title: '',
    firstName: '',
    nameInThai: '',
    sex: '',
    height: '',
    dateOfIssue: '',
    dateOfExpiry: '',
    dateOfBirth: '',
    placeOfBirth: '',
    identificationNo: '',
    passportNo: '',
    signature: '',
    photo: undefined
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Random data generation function
  const generateRandomData = () => {
    const { title, firstName, surname, nameInThai } = generateRandomName();
    const birthDate = generateRandomDate();
    const issueYear = new Date().getFullYear() - Math.floor(Math.random() * 5);
    const expiryYear = issueYear + 10;
    
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const issueMonth = months[Math.floor(Math.random() * 12)];
    const expiryMonth = months[Math.floor(Math.random() * 12)];
    const issueDay = Math.floor(Math.random() * 28) + 1;
    const expiryDay = Math.floor(Math.random() * 28) + 1;
    
    setCardData(prev => ({
      // เก็บรูปเดิมไว้ ไม่รีเซ็ต
      photo: prev.photo,
      // อัปเดตข้อมูลอื่นๆ
      surname,
      title,
      firstName,
      nameInThai,
      sex: Math.random() > 0.5 ? 'M' : 'F',
      height: (Math.floor(Math.random() * 40) + 150).toString() + ' CM',
      dateOfIssue: `${issueDay.toString().padStart(2, '0')} ${issueMonth} ${issueYear}`,
      dateOfExpiry: `${expiryDay.toString().padStart(2, '0')} ${expiryMonth} ${expiryYear}`,
      dateOfBirth: birthDate,
      placeOfBirth: generateRandomPlace(),
      identificationNo: generateRandomIdNumber(),
      passportNo: generateRandomPassportNo(),
      signature: 'Sample Signature'
    }));
  };

  const handleInputChange = (field: keyof CardData, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('File read successfully, data URL length:', result?.length);
        console.log('Data URL preview:', result?.substring(0, 100) + '...');
        
        setCardData(prev => ({
          ...prev,
          photo: result
        }));
        
        console.log('Photo data set in cardData');
      };
      
      reader.onerror = (e) => {
        console.error('FileReader error:', e);
      };
      
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  const generateCard = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) {
        console.log('Canvas or context not available');
        return;
      }

      canvas.width = 1800;  // Higher resolution for download
      canvas.height = 1200; // Higher resolution for download

      // Clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load the passport template
      const cardTemplate = new Image();
      cardTemplate.crossOrigin = 'anonymous';
      
      try {
        await new Promise<void>((resolve, reject) => {
          cardTemplate.onload = () => {
            console.log('Template loaded successfully');
            resolve();
          };
          cardTemplate.onerror = (err) => {
            console.error('Template load error:', err);
            reject(new Error('Failed to load template'));
          };
          cardTemplate.src = '/card/th/th-id.png';
        });
      } catch (templateError) {
        console.error('Template loading failed:', templateError);
        // Continue without template
      }

      // Draw template if loaded successfully
      if (cardTemplate.complete && cardTemplate.naturalWidth > 0) {
        ctx.drawImage(cardTemplate, 0, 0, canvas.width, canvas.height);
      } else {
        // Draw a simple rectangle as fallback
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        ctx.fillStyle = '#000000';
        ctx.font = '25px Arial'; // scaled font size
        ctx.fillText('Thai Passport Template', 78, 69); // scaled position
      }

      // ===== การปรับตำแหน่งข้อความ (Text Positioning) =====
      // Canvas size: 1155x864 pixels
      // รูปแบบ: ctx.fillText(text, x, y) 
      // x = ตำแหน่งซ้าย-ขวา (0-1155), y = ตำแหน่งบน-ล่าง (0-864)
      
      // ฟังก์ชันสำหรับเขียนข้อความพร้อมเงา
      const drawTextWithShadow = (text: string, x: number, y: number, font: string) => {
        ctx.font = font;
        
        // วาดเงา
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText(text, x + 1, y + 1);
        ctx.restore();
        
        // วาดข้อความหลัก
        ctx.fillStyle = '#000000';
        ctx.fillText(text, x, y);
      };
      
      ctx.textAlign = 'left';

      // 1. เลขหนังสือเดินทาง (Passport Number) - มุมขวาบน
      if (cardData.passportNo) {
        drawTextWithShadow(cardData.passportNo, 1162, 222, 'bold 31px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 2. นามสกุล (Surname) - คอลัมน์ซ้าย
      if (cardData.surname) {
        drawTextWithShadow(cardData.surname, 554, 292, 'bold 31px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 3. คำนำหน้า + ชื่อ (Title + First Name) - คอลัมน์ซ้าย
      if (cardData.title && cardData.firstName) {
        drawTextWithShadow(`${cardData.title} ${cardData.firstName}`, 554, 366, 'bold 31px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 4. ชื่อภาษาไทย (Name in Thai) - คอลัมน์ซ้าย
      if (cardData.nameInThai) {
        drawTextWithShadow(cardData.nameInThai, 554, 443, 'bold 34px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 5. เพศ (Sex) - คอลัมน์ซ้าย
      if (cardData.sex) {
        drawTextWithShadow(cardData.sex, 554, 591, 'bold 31px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 6. ส่วนสูง (Height) - คอลัมน์ซ้าย
      if (cardData.height) {
        drawTextWithShadow(cardData.height, 554, 664, 'bold 31px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 7. วันที่ออกบัตร (Date of Issue) - คอลัมน์ซ้าย
      if (cardData.dateOfIssue) {
        drawTextWithShadow(cardData.dateOfIssue, 554, 737, 'bold 31px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 8. วันหมดอายุ (Date of Expiry) - คอลัมน์ซ้าย
      if (cardData.dateOfExpiry) {
        drawTextWithShadow(cardData.dateOfExpiry, 554, 806, 'bold 31px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 9. วันเกิด (Date of Birth) - คอลัมน์ขวา
      if (cardData.dateOfBirth) {
        drawTextWithShadow(cardData.dateOfBirth, 827, 520, 'bold 31px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 10. สถานที่เกิด (Place of Birth) - คอลัมน์ขวา
      if (cardData.placeOfBirth) {
        drawTextWithShadow(cardData.placeOfBirth, 827, 590, 'bold 31px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 11. เลขประจำตัวประชาชน (Identification Number) - คอลัมน์ขวา
      if (cardData.identificationNo) {
        const formattedId = cardData.identificationNo.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1$2$3$4$5');
        drawTextWithShadow(formattedId, 1170, 521, 'bold 31px "TH Sarabun PSK", Arial, sans-serif');
      }

      // 12. วันเกิดแบบลายน้ำ 3 บรรทัด (Date of Birth Watermark) - มุมขวาบน
      if (cardData.dateOfBirth) {
        const textX = 1620;    // ตำแหน่ง X ของข้อความ (กึ่งกลาง)
        const textY = 640;     // ตำแหน่ง Y เริ่มต้น
        
        // แยกวันที่ออกเป็นส่วนๆ
        const dateParts = cardData.dateOfBirth.split(' ');
        if (dateParts.length >= 3) {
          const day = dateParts[0];     // วัน
          const month = dateParts[1];   // เดือน
          const year = dateParts[2];    // ปี
          
          ctx.save();
          ctx.textAlign = 'center';
          
          // วันที่ (บรรทัดแรก) - ลายน้ำเข้มหน่อย
          ctx.font = 'bold 36px Arial';
          ctx.globalAlpha = 0.4;  // ลายน้ำเข้มหน่อย
          ctx.fillStyle = '#666666';  // สีเทาเข้ม
          ctx.fillText(day, textX, textY);
          
          // เดือน (บรรทัดสอง) - ลายน้ำเข้มหน่อย
          ctx.font = 'bold 24px Arial';
          ctx.globalAlpha = 0.4;  // ลายน้ำเข้มหน่อย
          ctx.fillStyle = '#666666';  // สีเทาเข้ม
          ctx.fillText(month, textX, textY + 35);
          
          // ปี (บรรทัดสาม) - ลายน้ำเข้มหน่อย
          ctx.font = 'bold 28px Arial';
          ctx.globalAlpha = 0.4;  // ลายน้ำเข้มหน่อย
          ctx.fillStyle = '#666666';  // สีเทาเข้ม
          ctx.fillText(year, textX, textY + 70);
          
          ctx.restore();
        }
      }

      // 13. ลายเซ็น (Signature) - ใช้ชื่อ + ฟอนต์ SOV_Laizen_Demo พร้อมเงา
      if (cardData.firstName) {
        // กรองเฉพาะตัวอักษร ไม่เอาตัวเลขหรือสัญลักษณ์
        const cleanName = cardData.firstName.replace(/[^a-zA-Z\s]/g, '').trim();
        
        if (cleanName) {
          ctx.font = '55px "SOV_Laizen_Demo", cursive, Arial';
          
          // วาดเงาลายเซ็น
          ctx.save();
          ctx.fillStyle = 'rgba(4, 6, 31, 0.3)';
          ctx.fillText(cleanName, 1171, 835);
          ctx.restore();
          
          // วาดลายเซ็นหลัก
          ctx.fillStyle = '#04061fff';
          ctx.fillText(cleanName, 1170, 834);
          ctx.fillStyle = '#000000';
        }
      }

      // ===== โหลดและวาดรูปภาพ (เฉพาะรูปที่อัปโหลด) =====
      if (cardData.photo && cardData.photo.startsWith('data:')) {
        try {
          console.log('Loading uploaded photo...');
          
          const photo = new Image();
          
          await new Promise<void>((resolve, reject) => {
            photo.onload = () => {
              console.log('Uploaded photo loaded successfully, size:', photo.width, 'x', photo.height);
              resolve();
            };
            
            photo.onerror = (err) => {
              console.error('Uploaded photo load error:', err);
              reject(new Error('Failed to load uploaded photo'));
            };
            
            // โหลดรูปที่อัปโหลด (data URL ไม่ต้องใช้ crossOrigin)
            photo.src = cardData.photo!;
          });

          // ===== การปรับตำแหน่งรูปภาพพร้อมเอฟเฟ็กต์ (Photo Positioning with Effects) =====
          // รูปแบบ: ctx.drawImage(photo, x, y, width, height)
          // Canvas size: 1155x864 pixels
          
          // 📸 รูปใหญ่ (Main Photo) - ด้านซ้าย พร้อมเอฟเฟกต์ขาวดำเล็กน้อย
          const mainX = 125, mainY = 375, mainW = 390, mainH = 445; // scaled coordinates and sizes
          
          // สร้าง canvas ชั่วคราวสำหรับเอฟเฟ็กต์ขาวดำเล็กน้อยในรูปใหญ่
          const mainTempCanvas = document.createElement('canvas');
          const mainTempCtx = mainTempCanvas.getContext('2d')!;
          mainTempCanvas.width = mainW;
          mainTempCanvas.height = mainH;
          
          // วาดรูปลงใน canvas ชั่วคราว
          mainTempCtx.drawImage(photo, 0, 0, mainW, mainH);
          
          // แปลงเป็นขาวดำเล็กน้อย (desaturate)
          const mainImageData = mainTempCtx.getImageData(0, 0, mainW, mainH);
          const mainData = mainImageData.data;
          
          for (let i = 0; i < mainData.length; i += 4) {
            // คำนวณความเข้มแสงแบบ grayscale
            const gray = Math.round(0.299 * mainData[i] + 0.587 * mainData[i + 1] + 0.114 * mainData[i + 2]);
            
            // ผสมสีเดิมกับขาวดำ 30% (เอฟเฟกต์ขาวดำเล็กน้อย)
            mainData[i] = Math.round(mainData[i] * 0.7 + gray * 0.3);     // R
            mainData[i + 1] = Math.round(mainData[i + 1] * 0.7 + gray * 0.3); // G
            mainData[i + 2] = Math.round(mainData[i + 2] * 0.7 + gray * 0.3); // B
            // data[i + 3] คือ alpha (ความโปร่งใส) ไม่เปลี่ยน
          }
          
          mainTempCtx.putImageData(mainImageData, 0, 0);
          
          // วาดรูปหลักที่มีเอฟเฟกต์ขาวดำเล็กน้อย
          ctx.drawImage(mainTempCanvas, mainX, mainY);
          
          // 📸 รูปเล็ก (Small Photo) - ด้านขวาล่าง + เอฟเฟ็กต์ขาวดำเงา
          const smallX = 944, smallY = 646, smallW = 156, smallH = 167; // scaled coordinates and sizes
          
          // สร้าง canvas ชั่วคราวสำหรับเอฟเฟ็กต์ขาวดำ
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d')!;
          tempCanvas.width = smallW;
          tempCanvas.height = smallH;
          
          // วาดรูปลงใน canvas ชั่วคราว
          tempCtx.drawImage(photo, 0, 0, smallW, smallH);
          
          // แปลงเป็นเงา (Shadow Effect) - ทำให้เป็นขาวดำเข้มขึ้นแต่ยังเห็นรูป
          const imageData = tempCtx.getImageData(0, 0, smallW, smallH);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // ถ้าไม่โปร่งใส
              // แปลงเป็นขาวดำ
              const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
              // ทำให้เข้มขึ้น 70% เพื่อให้ดูเป็นเงาแต่ยังเห็นรูป
              const darkerGray = Math.round(gray * 0.3);
              data[i] = darkerGray;     // R
              data[i + 1] = darkerGray; // G  
              data[i + 2] = darkerGray; // B
              data[i + 3] = 180;        // Alpha = โปร่งใส 70% (180/255)
            }
          }
          
          tempCtx.putImageData(imageData, 0, 0);
          
          // วาดเงาโดยเลื่อนตำแหน่ง
          ctx.save();
          ctx.globalAlpha = 0.8; // เพิ่มความชัดขึ้น
          ctx.drawImage(tempCanvas, smallX + 2, smallY + 2); // เลื่อนเงาเล็กน้อย +2, +2
          ctx.restore();
        } catch (photoError) {
          console.error('Photo loading failed:', photoError);
          console.log('แสดง placeholder แทนรูป');
        }
      } else {
        console.log('ไม่มีรูปที่อัปโหลด แสดง placeholder');
      }
      
      // ===== วาด placeholder กรณีไม่มีรูป =====
      if (!cardData.photo || !cardData.photo.startsWith('data:')) {
        // ===== กรณีไม่มีรูป - วาดกรอบสี่เหลี่ยม (Placeholder) =====
        // ใช้ตำแหน่งเดียวกับรูปจริง
        const mainX = 125, mainY = 375, mainW = 390, mainH = 445; // ตำแหน่งรูปใหญ่
        const smallX = 944, smallY = 646, smallW = 156, smallH = 167; // ตำแหน่งรูปเล็ก
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        // 📦 กรอบรูปใหญ่ (Main Photo Placeholder)
        ctx.strokeRect(mainX, mainY, mainW, mainH);
        
        // 📦 กรอบรูปเล็ก (Small Photo Placeholder)
        ctx.strokeRect(smallX, smallY, smallW, smallH);
        ctx.fillStyle = '#cccccc';
        
        // เติมสีพื้นหลังกรอบ
        ctx.fillRect(mainX, mainY, mainW, mainH);   // รูปใหญ่
        ctx.fillRect(smallX, smallY, smallW, smallH);   // รูปเล็ก
        
        // เขียนข้อความใน placeholder
        ctx.fillStyle = '#666666';
        ctx.font = '25px Arial'; // scaled font size
        ctx.textAlign = 'center';
        
        // ข้อความรูปใหญ่ - กึ่งกลางของกรอบ
        const mainCenterX = mainX + mainW/2;
        const mainCenterY = mainY + mainH/2;
        ctx.fillText('กรุณาอัปโหลดรูป', mainCenterX, mainCenterY - 10);
        ctx.fillText('PHOTO', mainCenterX, mainCenterY + 20);
        
        // ข้อความรูปเล็ก - กึ่งกลางของกรอบ
        const smallCenterX = smallX + smallW/2;
        const smallCenterY = smallY + smallH/2;
        ctx.fillText('PHOTO', smallCenterX, smallCenterY);
      }

      // ===== ลายน้ำแบบวงกลมสีเทาพร้อมเอฟเฟ็กต์สะท้อนแสง =====
      // วางที่มุมขวาล่างของบัตร พร้อมข้อความ ธงชาติ แผนที่ และตราครุฑ
      ctx.save();
      
      // 🎯 ปรับตำแหน่งและขนาดวงกลมลายน้ำ (Watermark Circle Position & Size)
      const centerX = 537; // ตำแหน่งกึ่งกลาง X (เปลี่ยนตรงนี้เพื่อย้ายซ้าย-ขวา)
      const centerY = 720; // ตำแหน่งกึ่งกลาง Y (เปลี่ยนตรงนี้เพื่อย้ายบน-ล่าง)
      const circleRadius = 100; // รัศมีวงกลม (เปลี่ยนตรงนี้เพื่อปรับขนาดวงกลม)
      
      // วาดวงกลมพื้นหลังสีเทาพร้อมเงา
      ctx.globalAlpha = 0.15;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#9ca3af'; // สีเทาหลัก
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // เอฟเฟ็กต์สะท้อนแสงวงกลมใหญ่
      ctx.save();
      ctx.globalAlpha = 0.08;
      const highlightGradient = ctx.createRadialGradient(
        centerX - 25, centerY - 25, 0,
        centerX, centerY, circleRadius
      );
      highlightGradient.addColorStop(0, '#ffffff');
      highlightGradient.addColorStop(0.7, 'rgba(255,255,255,0.3)');
      highlightGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // ตัดเฉพาะภายในวงกลมสำหรับวาดเนื้อหา
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius - 3, 0, Math.PI * 2);
      ctx.clip();
      
      // 📝 ข้อความ "KINGDOM OF THAILAND" ด้านบนของวงกลม พร้อมเอฟเฟ็กต์เงาและขอบ
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      
      const topTextY1 = centerY - circleRadius + 20;   // บรรทัดแรก
      const topTextY2 = centerY - circleRadius + 35;   // บรรทัดสอง
      
      // วาดเงาข้อความ (Shadow)
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#000000';
      ctx.fillText('Kingdom of', centerX + 1, topTextY1 + 1); // เงาบรรทัด 1
      ctx.fillText('Thailand', centerX + 1, topTextY2 + 1);   // เงาบรรทัด 2
      ctx.restore();
      
      // วาดขอบข้อความ (Stroke/Outline)
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeText('Kingdom of', centerX, topTextY1);       // ขอบบรรทัด 1
      ctx.strokeText('Thailand', centerX, topTextY2);         // ขอบบรรทัด 2
      ctx.restore();
      
      // วาดตัวหนังสือหลัก (Main Text)
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#4c525cff';
      ctx.fillText('Kingdom of', centerX, topTextY1);         // ข้อความบรรทัด 1
      ctx.fillText('Thailand', centerX, topTextY2);           // ข้อความบรรทัด 2
      ctx.restore();
      
      // 🇹🇭 ปรับตำแหน่งและขนาดธงชาติไทย (Thai Flag Position & Size)
      ctx.globalAlpha = 0.10;
      const flagX = centerX - 80;         // ตำแหน่ง X ธงชาติ (เปลี่ยนตรงนี้เพื่อย้ายซ้าย-ขวา)
      const flagY = centerY - 30;         // ตำแหน่ง Y ธงชาติ (เปลี่ยนตรงนี้เพื่อย้ายบน-ล่าง)
      const flagWidth = 200;               // ความกว้างธงชาติ (เปลี่ยนตรงนี้เพื่อปรับขนาด)
      const flagHeight = 200;              // ความสูงธงชาติ (เปลี่ยนตรงนี้เพื่อปรับขนาด)
      
      // แถบธงสีเทาต่างโทน
      ctx.fillStyle = '#d1d5db'; // เทาอ่อน (แดง)
      ctx.fillRect(flagX, flagY, flagWidth, flagHeight/5);
      
      ctx.fillStyle = '#f3f4f6'; // เทาอ่อนมาก (ขาว)
      ctx.fillRect(flagX, flagY + flagHeight/5, flagWidth, flagHeight/5);
      
      ctx.fillStyle = '#9ca3af'; // เทากลาง (น้ำเงิน)
      ctx.fillRect(flagX, flagY + (flagHeight*2/5), flagWidth, flagHeight/5);
      
      ctx.fillStyle = '#f3f4f6'; // เทาอ่อนมาก (ขาว)
      ctx.fillRect(flagX, flagY + (flagHeight*3/5), flagWidth, flagHeight/5);
      
      ctx.fillStyle = '#d1d5db'; // เทาอ่อน (แดง)
      ctx.fillRect(flagX, flagY + (flagHeight*4/5), flagWidth, flagHeight/5);
      
      // วาดตราครุฑจากไฟล์ PNG (ฝั่งซ้าย)
      try {
        const garudaImage = new Image();
        garudaImage.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          garudaImage.onload = () => resolve();
          garudaImage.onerror = () => reject(new Error('Failed to load Garuda image'));
          garudaImage.src = '/photos/Garuda.png';
        });
        
        // 🦅 ปรับตำแหน่งและขนาดตราครุฑ (Garuda Position & Size)
        const garudaX = centerX - 70;      // ตำแหน่ง X ตราครุฑ (เปลี่ยนตรงนี้เพื่อย้ายซ้าย-ขวา)
        const garudaY = centerY - 1;      // ตำแหน่ง Y ตราครุฑ (เปลี่ยนตรงนี้เพื่อย้ายบน-ล่าง)
        const garudaWidth = 80;            // ความกว้างตราครุฑ (เปลี่ยนตรงนี้เพื่อปรับขนาด)
        const garudaHeight = 80;           // ความสูงตราครุฑ (เปลี่ยนตรงนี้เพื่อปรับขนาด)
        
        // ตั้งค่าความโปร่งใสและเอฟเฟ็กต์สีเทา
        ctx.save();
        ctx.globalAlpha = 0.3; // เพิ่มความชัดขึ้น (จาก 0.4 เป็น 0.5)
        
        // สร้าง canvas ชั่วคราวเพื่อแปลงเป็นสีเทา
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = garudaWidth;
        tempCanvas.height = garudaHeight;
        
        // วาดรูปครุฑลงใน canvas ชั่วคราว
        tempCtx.drawImage(garudaImage, 0, 0, garudaWidth, garudaHeight);
        
        // แปลงเป็นสีเทาเข้มขึ้น
        const imageData = tempCtx.getImageData(0, 0, garudaWidth, garudaHeight);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          // ปรับให้เป็นสีเทาเข้มขึ้น
          const darkerGray = Math.round(gray * 0.7); // ทำให้เข้มขึ้น 30%
          data[i] = darkerGray;     // R
          data[i + 1] = darkerGray; // G
          data[i + 2] = darkerGray; // B
          // data[i + 3] = alpha (ไม่เปลี่ยน)
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        // วาดตราครุฑสีเทาลงใน canvas หลัก
        ctx.drawImage(tempCanvas, garudaX, garudaY);
        ctx.restore();
        
      } catch (garudaError) {
        console.error('Failed to load Garuda image:', garudaError);
        // ใช้ placeholder แทน พร้อมเอฟเฟ็กต์เงาและขอบ
        const placeholderX = centerX - 50;
        const placeholderY = centerY + 5;
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        // วาดเงา placeholder
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#000000';
        ctx.fillText('GARUDA', placeholderX + 1, placeholderY + 1);
        ctx.restore();
        
        // วาดขอบ placeholder
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeText('GARUDA', placeholderX, placeholderY);
        ctx.restore();
        
        // วาดตัวหนังสือหลัก placeholder
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#6b7280';
        ctx.fillText('GARUDA', placeholderX, placeholderY);
        ctx.restore();
      }
      
      // วาดแผนที่ประเทศไทยจากไฟล์ PNG (ฝั่งขวา)
      try {
        const thaiMapImage = new Image();
        thaiMapImage.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          thaiMapImage.onload = () => resolve();
          thaiMapImage.onerror = () => reject(new Error('Failed to load Thai map image'));
          thaiMapImage.src = '/photos/thai.png';
        });
        
        // 🗺️ ปรับตำแหน่งและขนาดแผนที่ไทย (Thai Map Position & Size)
        const mapX = centerX + 2;         // ตำแหน่ง X แผนที่ไทย (เปลี่ยนตรงนี้เพื่อย้ายซ้าย-ขวา)
        const mapY = centerY - 40;         // ตำแหน่ง Y แผนที่ไทย (เปลี่ยนตรงนี้เพื่อย้ายบน-ล่าง)
        const mapWidth = 80;               // ความกว้างแผนที่ไทย (เปลี่ยนตรงนี้เพื่อปรับขนาด)
        const mapHeight = 110;              // ความสูงแผนที่ไทย (เปลี่ยนตรงนี้เพื่อปรับขนาด)
        
        // ตั้งค่าความโปร่งใสและเอฟเฟ็กต์สีเทา (ปรับให้เห็นได้แต่ไม่บังข้อความ)
        ctx.save();
        ctx.globalAlpha = 0.20;
        
        // สร้าง canvas ชั่วคราวเพื่อแปลงเป็นสีเทา
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = mapWidth;
        tempCanvas.height = mapHeight;
        
        // วาดแผนที่ลงใน canvas ชั่วคราว
        tempCtx.drawImage(thaiMapImage, 0, 0, mapWidth, mapHeight);
        
        // แปลงเป็นสีเทา
        const imageData = tempCtx.getImageData(0, 0, mapWidth, mapHeight);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          const darkerGray = Math.round(gray * 0.8); // ทำให้เข้มขึ้น 20%
          data[i] = darkerGray;     // R
          data[i + 1] = darkerGray; // G
          data[i + 2] = darkerGray; // B
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        // วาดแผนที่ไทยสีเทาลงใน canvas หลัก
        ctx.drawImage(tempCanvas, mapX, mapY);
        ctx.restore();
        
      } catch (mapError) {
        console.error('Failed to load Thai map image:', mapError);
        // ใช้ placeholder รูปทรงแผนที่แทน
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#9ca3af';
        
        const mapCenterX = centerX + 35; // ฝั่งขวา
        const mapCenterY = centerY + 5;  // กลางแนวตั้ง
        const mapScale = 0.7;            // เพิ่มขนาด
        const mapW = 25 * mapScale;
        const mapH = 35 * mapScale;
        
        // วาดรูปทรงแผนที่ไทยแบบชัดเจนขึ้น
        ctx.beginPath();
        ctx.moveTo(mapCenterX, mapCenterY - mapH/2);                        // จุดบน
        ctx.lineTo(mapCenterX + mapW*0.4, mapCenterY - mapH*0.3);          // ขวาบน
        ctx.lineTo(mapCenterX + mapW*0.5, mapCenterY - mapH*0.1);          // ขวากลางบน
        ctx.lineTo(mapCenterX + mapW*0.45, mapCenterY + mapH*0.1);         // ขวากลางล่าง
        ctx.lineTo(mapCenterX + mapW*0.2, mapCenterY + mapH/2);            // ล่างขวา
        ctx.lineTo(mapCenterX - mapW*0.1, mapCenterY + mapH*0.4);          // ล่างซ้าย
        ctx.lineTo(mapCenterX - mapW*0.3, mapCenterY + mapH*0.1);          // ซ้ายล่าง
        ctx.lineTo(mapCenterX - mapW*0.25, mapCenterY - mapH*0.1);         // ซ้ายกลาง
        ctx.lineTo(mapCenterX - mapW*0.1, mapCenterY - mapH*0.35);         // ซ้ายบน
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.restore(); // ยกเลิก clipping
      
      // วาดขอบวงกลมสีเทา
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // เอฟเฟ็กต์สะท้อนแสงขอบวงกลม
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX - 15, centerY - 15, circleRadius * 0.7, Math.PI * 0.8, Math.PI * 1.3);
      ctx.stroke();
      
      ctx.restore();

      // ===== ลายน้ำเส้นคลื่นแนวนอน (Wave Pattern Watermark) =====
      // วาดในโซนล่างของรูปภาพใหญ่ แบบอ่อนๆ และรูปแบบคลื่นหลากหลาย
      ctx.save();
      ctx.globalAlpha = 0.25; // เพิ่มความชัดขึ้น (จาก 0.15 เป็น 0.25)
      
      // ตำแหน่งเส้นคลื่น - ใต้รูปภาพใหญ่
      const mainPhotoX = 125; // ตำแหน่ง X ของรูปใหญ่
      const mainPhotoY = 375; // ตำแหน่ง Y ของรูปใหญ่
      const mainPhotoW = 390; // ความกว้างรูปใหญ่
      const mainPhotoH = 445; // ความสูงรูปใหญ่
      
      // เริ่มวาดเส้นคลื่นจากโซนล่างของรูปใหญ่
      const waveStartY = mainPhotoY + mainPhotoH - 50; // เริ่มจาก 50px จากล่างรูป
      const waveEndY = mainPhotoY + mainPhotoH + 10;   // สิ้นสุดใต้รูป 10px
      const waveCount = 4; // ลดเหลือ 4 เส้น
      
      // สร้างรูปแบบคลื่นที่แตกต่างกันสำหรับแต่ละเส้น
      const wavePatterns = [
        { length: 45, amplitude: 12, style: 'smooth' },    // คลื่นเรียบ
        { length: 60, amplitude: 8, style: 'sharp' },      // คลื่นแหลม
        { length: 35, amplitude: 15, style: 'wide' },      // คลื่นกว้าง
        { length: 55, amplitude: 10, style: 'irregular' }  // คลื่นไม่สม่ำเสมอ
      ];

      for (let i = 0; i < waveCount; i++) {
        const currentY = waveStartY + (i * (waveEndY - waveStartY) / (waveCount - 1));
        const pattern = wavePatterns[i];
        
        ctx.save();
        ctx.strokeStyle = '#313131ff'; // สีน้ำเงินเข้มขึ้น
        ctx.lineWidth = 5; // เพิ่มความหนา (จาก 2 เป็น 3)
        
        ctx.beginPath();
        ctx.moveTo(mainPhotoX + 20, currentY);
        
        // สร้างเส้นคลื่นตามรูปแบบที่กำหนด
        for (let x = 0; x < mainPhotoW - 40; x += pattern.length) {
          const cp1x = mainPhotoX + 20 + x + pattern.length/3;
          const cp2x = mainPhotoX + 20 + x + (pattern.length*2/3);
          const endX = mainPhotoX + 20 + x + pattern.length;
          const endY = currentY;
          
          let cp1y, cp2y;
          
          switch (pattern.style) {
            case 'smooth':
              cp1y = currentY + pattern.amplitude * Math.sin(x * 0.1);
              cp2y = currentY - pattern.amplitude * Math.sin(x * 0.1 + Math.PI/2);
              break;
            case 'sharp':
              cp1y = currentY + pattern.amplitude;
              cp2y = currentY - pattern.amplitude * 1.5;
              break;
            case 'wide':
              cp1y = currentY + pattern.amplitude * 0.7;
              cp2y = currentY - pattern.amplitude * 0.5;
              break;
            case 'irregular':
            default:
              cp1y = currentY + pattern.amplitude * (0.5 + Math.random() * 0.5);
              cp2y = currentY - pattern.amplitude * (0.5 + Math.random() * 0.5);
              break;
          }
          
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        }
        
        ctx.stroke();
        ctx.restore();
      }
      
      ctx.restore();

      // ===== MRZ (Machine Readable Zone) ข้อมูลด้านล่างบัตร =====
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 47px "Courier New", "Lucida Console", "Monaco", monospace'; // ฟอนต์มาตรฐาน monospace สำหรับ MRZ (scaled: 30*1.56=47)
      ctx.textAlign = 'left';
      
      // 🔤 เตรียมข้อมูลสำหรับ MRZ
      const surname = cardData.surname || 'UNKNOWN';
      const firstName = cardData.firstName || 'UNKNOWN';
      const passportNo = cardData.passportNo || 'AB1234567';
      const idNo = cardData.identificationNo || '1234567890123';
      
      // แปลงปี ค.ศ. เป็น พ.ศ. (Buddhist Era)
      const issueYear = cardData.dateOfIssue ? 
        parseInt(cardData.dateOfIssue.split(' ')[2]) + 543 : 
        new Date().getFullYear() + 543;
      
      // 📝 บรรทัดที่ 1: P<THA(Surname)<<Name<<<<<<<<<<<<<<<<<<<
      const line1Start = `P<THA${surname}<<${firstName}`;
      const line1MaxLength = 44; // ความยาวมาตรฐาน MRZ
      const line1 = line1Start.padEnd(line1MaxLength, '<');
      
      // 📝 บรรทัดที่ 2: Passport No.THA(เลขท้าย2ตัวปีเกิด เดือนเกิด เดือนที่ออกบัตรM วันที่ออกบัตร เดือนที่ออกบัตร) และเลขบัตรID No. และ< 60
      
      // แปลงเดือนเป็นตัวอักษร A-L (Jan=A, Dec=L)
      const getMonthLetter = (month: number): string => {
        const letters = 'ABCDEFGHIJKL';
        return letters[month - 1] || 'A';
      };
      
      // ดึงข้อมูลวันเกิด
      const birthDate = cardData.dateOfBirth ? new Date(cardData.dateOfBirth) : new Date();
      const birthYear = birthDate.getFullYear().toString().slice(-2); // เลขท้าย 2 ตัว
      const birthMonth = (birthDate.getMonth() + 1).toString().padStart(2, '0');
      
      // ดึงข้อมูลวันที่ออกบัตร  
      const issueDate = cardData.dateOfIssue ? new Date(cardData.dateOfIssue) : new Date();
      const issueMonthLetter = getMonthLetter(issueDate.getMonth() + 1);
      const issueDay = issueDate.getDate().toString().padStart(2, '0');
      const issueMonth = (issueDate.getMonth() + 1).toString().padStart(2, '0');
      
      // สร้างข้อมูลในวงเล็บ
      const encodedData = `${birthYear}${birthMonth}${issueMonthLetter}${issueDay}${issueMonth}`;
      
      const line2Start = `${passportNo}THA${encodedData}${idNo}<60`;
      const line2MaxLength = 44;
      const line2 = line2Start.padEnd(line2MaxLength, '<');
      
      // 🎯 ตำแหน่ง MRZ (ด้านล่างบัตร) - ปรับขนาดตามอัตราส่วนใหม่
      const mrzX = 172;           // ซ้าย-ขวา (scaled: 110*1.56=172)
      const mrzY1 = 973;         // บรรทัดแรก (บน-ล่าง) (scaled: 700*1.39=973)
      const mrzY2 = 1056;         // บรรทัดสอง (บน-ล่าง) (scaled: 760*1.39=1056)
      
      // วาดข้อความ MRZ แบบเพิ่มช่องว่างระหว่างตัวอักษร พร้อมเงา
      
      // ฟังก์ชันวาดข้อความ MRZ พร้อมเงา
      const drawSpacedTextWithShadow = (text: string, x: number, y: number, letterSpacing: number = 3) => {
        let currentX = x;
        
        // วาดเงาก่อน
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < text.length; i++) {
          ctx.fillText(text[i], currentX + 1, y + 1);
          currentX += ctx.measureText(text[i]).width + letterSpacing;
        }
        ctx.restore();
        
        // วาดข้อความหลัก
        currentX = x;
        ctx.fillStyle = '#000000';
        for (let i = 0; i < text.length; i++) {
          ctx.fillText(text[i], currentX, y);
          currentX += ctx.measureText(text[i]).width + letterSpacing;
        }
      };
      
      drawSpacedTextWithShadow(line1, mrzX, mrzY1, 5);  // บรรทัดแรก พร้อมช่องว่างและเงา
      drawSpacedTextWithShadow(line2, mrzX, mrzY2, 5);  // บรรทัดสอง พร้อมช่องว่างและเงา
      
      ctx.restore();

    } catch (error) {
      console.error('Error generating passport:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [cardData]);

  const downloadCard = () => {
    if (!canvasRef.current) return;
    
    // Use canvas directly for download (already full resolution)
    const link = document.createElement('a');
    link.download = 'thai-passport.png';
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
                  <CardTitle>Passport Maker - เครื่องมือสร้างหนังสือเดินทางไทย</CardTitle>
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
                    <h3 className="text-lg font-semibold">ตัวอย่างหนังสือเดินทาง</h3>
                    
                    <canvas
                      ref={canvasRef}
                      width={1800}
                      height={1200}
                      className="w-full max-w-full h-auto rounded-lg shadow-lg bg-white"
                      style={{ 
                        maxWidth: '700px',
                        height: 'auto',
                        aspectRatio: '1800/1200'
                      }}
                    />
                    
                    <Button 
                      onClick={downloadCard} 
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      ดาวน์โหลดหนังสือเดินทาง
                    </Button>
                  </div>

                  {/* Right Column - Form */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">ข้อมูลหนังสือเดินทาง</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="surname">Surname</Label>
                        <Input
                          id="surname"
                          value={cardData.surname}
                          onChange={(e) => handleInputChange('surname', e.target.value)}
                          placeholder="นามสกุล (อังกฤษ)"
                        />
                      </div>

                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={cardData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Mr./Ms./Mrs."
                        />
                      </div>

                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={cardData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="ชื่อ (อังกฤษ)"
                        />
                      </div>

                      <div>
                        <Label htmlFor="nameInThai">Name in Thai</Label>
                        <Input
                          id="nameInThai"
                          value={cardData.nameInThai}
                          onChange={(e) => handleInputChange('nameInThai', e.target.value)}
                          placeholder="ชื่อ-นามสกุล (ไทย)"
                        />
                      </div>

                      <div>
                        <Label htmlFor="sex">Sex</Label>
                        <Input
                          id="sex"
                          value={cardData.sex}
                          onChange={(e) => handleInputChange('sex', e.target.value)}
                          placeholder="M/F"
                          maxLength={1}
                        />
                      </div>

                      <div>
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          value={cardData.height}
                          onChange={(e) => handleInputChange('height', e.target.value)}
                          placeholder="170 CM"
                        />
                      </div>

                      <div>
                        <Label htmlFor="dateOfIssue">Date of Issue</Label>
                        <Input
                          id="dateOfIssue"
                          value={cardData.dateOfIssue}
                          onChange={(e) => handleInputChange('dateOfIssue', e.target.value)}
                          placeholder="dd/mm/yyyy"
                        />
                      </div>

                      <div>
                        <Label htmlFor="dateOfExpiry">Date of Expiry</Label>
                        <Input
                          id="dateOfExpiry"
                          value={cardData.dateOfExpiry}
                          onChange={(e) => handleInputChange('dateOfExpiry', e.target.value)}
                          placeholder="dd/mm/yyyy"
                        />
                      </div>

                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          value={cardData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          placeholder="dd/mm/yyyy"
                        />
                      </div>

                      <div>
                        <Label htmlFor="placeOfBirth">Place of Birth</Label>
                        <Input
                          id="placeOfBirth"
                          value={cardData.placeOfBirth}
                          onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                          placeholder="Bangkok"
                        />
                      </div>

                      <div>
                        <Label htmlFor="identificationNo">ID No. (13 หลัก)</Label>
                        <Input
                          id="identificationNo"
                          value={cardData.identificationNo}
                          onChange={(e) => handleInputChange('identificationNo', e.target.value)}
                          placeholder="1234567890123"
                          maxLength={13}
                        />
                      </div>

                      <div>
                        <Label htmlFor="passportNo">Passport No.</Label>
                        <Input
                          id="passportNo"
                          value={cardData.passportNo}
                          onChange={(e) => handleInputChange('passportNo', e.target.value)}
                          placeholder="AB1234567"
                          maxLength={9}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signature">Signature</Label>
                      <Input
                        id="signature"
                        value={cardData.signature}
                        onChange={(e) => handleInputChange('signature', e.target.value)}
                        placeholder="ลายเซ็น"
                      />
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
                        {isGenerating ? 'กำลังสร้าง...' : 'สร้างหนังสือเดินทาง'}
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

export default CardMakerPage;