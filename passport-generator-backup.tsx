'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Upload } from "lucide-react";
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

      canvas.width = 1155;  // Full resolution
      canvas.height = 864;  // Full resolution

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
        ctx.font = '16px Arial';
        ctx.fillText('Thai Passport Template', 50, 50);
      }

      // ===== การปรับตำแหน่งข้อความ (Text Positioning) =====
      // Canvas size: 1155x864 pixels
      // รูปแบบ: ctx.fillText(text, x, y) 
      // x = ตำแหน่งซ้าย-ขวา (0-1155), y = ตำแหน่งบน-ล่าง (0-864)
      
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';

      // 1. เลขหนังสือเดินทาง (Passport Number) - มุมขวาบน
      // ปรับ: เปลี่ยน x=750 (ซ้าย-ขวา), y=140 (บน-ล่าง)
      if (cardData.passportNo) {
        ctx.font = 'bold 20px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(cardData.passportNo, 745, 160); // x, y
      }

      // 2. นามสกุล (Surname) - คอลัมน์ซ้าย
      // ปรับ: เปลี่ยน x=370, y=180
      if (cardData.surname) {
        ctx.font = 'bold 20px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(cardData.surname, 355, 210); // x, y
      }

      // 3. คำนำหน้า + ชื่อ (Title + First Name) - คอลัมน์ซ้าย
      // ปรับ: เปลี่ยน x=370, y=210
      if (cardData.title && cardData.firstName) {
        ctx.font = 'bold 20px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(`${cardData.title} ${cardData.firstName}`, 355, 263); // x, y
      }

      // 4. ชื่อภาษาไทย (Name in Thai) - คอลัมน์ซ้าย
      // ปรับ: เปลี่ยน x=370, y=270
      if (cardData.nameInThai) {
        ctx.font = 'bold 22px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(cardData.nameInThai, 355, 319); // x, y
      }

      // 5. เพศ (Sex) - คอลัมน์ซ้าย
      // ปรับ: เปลี่ยน x=370, y=375
      if (cardData.sex) {
        ctx.font = 'bold 20px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(cardData.sex, 355, 425); // x, y
      }

      // 6. ส่วนสูง (Height) - คอลัมน์ซ้าย
      // ปรับ: เปลี่ยน x=370, y=415
      if (cardData.height) {
        ctx.font = 'bold 20px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(cardData.height, 355, 478); // x, y
      }

      // 7. วันที่ออกบัตร (Date of Issue) - คอลัมน์ซ้าย
      // ปรับ: เปลี่ยน x=370, y=455
      if (cardData.dateOfIssue) {
        ctx.font = 'bold 20px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(cardData.dateOfIssue, 355, 530); // x, y
      }

      // 8. วันหมดอายุ (Date of Expiry) - คอลัมน์ซ้าย
      // ปรับ: เปลี่ยน x=370, y=495
      if (cardData.dateOfExpiry) {
        ctx.font = 'bold 20px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(cardData.dateOfExpiry, 355, 580); // x, y
      }

      // 9. วันเกิด (Date of Birth) - คอลัมน์กลาง
      // ปรับ: เปลี่ยน x=590, y=325
      if (cardData.dateOfBirth) {
        ctx.font = 'bold 20px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(cardData.dateOfBirth, 530, 374); // x, y
      }

      // 10. สถานที่เกิด (Place of Birth) - คอลัมน์กลาง
      // ปรับ: เปลี่ยน x=590, y=375
      if (cardData.placeOfBirth) {
        ctx.font = 'bold 20px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(cardData.placeOfBirth, 530, 420); // x, y
      }

      // 11. เลขประจำตัวประชาชน (Identification Number) - คอลัมน์ขวา
      // ปรับ: เปลี่ยน x=750, y=325
      if (cardData.identificationNo) {
        const formattedId = cardData.identificationNo.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1$2$3$4$5');
        ctx.font = 'bold 20px "TH Sarabun PSK", Arial, sans-serif'; // ปรับขนาดฟอนต์ที่นี่
        ctx.fillText(formattedId, 750, 375); // x, y
      }

      // 12. ลายเซ็น (Signature) - ใช้ชื่อ + ฟอนต์ SOV_Laizen_Demo
      // ปรับ: เปลี่ยน x=750, y=600
      if (cardData.firstName) {
        // กรองเฉพาะตัวอักษร ไม่เอาตัวเลขหรือสัญลักษณ์
        const cleanName = cardData.firstName.replace(/[^a-zA-Z\s]/g, '').trim();
        
        if (cleanName) {
          ctx.font = '35px "SOV_Laizen_Demo", cursive, Arial'; // ใช้ฟอนต์ลายเซ็น
          ctx.fillStyle = '#04061fff'; // สีน้ำเงินเข้มสำหรับลายเซ็น
          ctx.fillText(cleanName, 750, 600); // ใช้ชื่อที่กรองแล้วเป็นลายเซ็น
          ctx.fillStyle = '#000000'; // เปลี่ยนกลับเป็นสีดำ
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
          
          // 📸 รูปใหญ่ (Main Photo) - ด้านซ้าย (ไม่มีลายน้ำทับ)
          const mainX = 80, mainY = 270, mainW = 250, mainH = 320;
          
          // วาดรูปหลักเฉยๆ
          ctx.drawImage(photo, mainX, mainY, mainW, mainH);
          
          // 📸 รูปเล็ก (Small Photo) - ด้านขวาล่าง + เอฟเฟ็กต์ขาวดำเงา
          const smallX = 605, smallY = 465, smallW = 100, smallH = 120;
          
          // สร้าง canvas ชั่วคราวสำหรับเอฟเฟ็กต์ขาวดำ
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d')!;
          tempCanvas.width = smallW;
          tempCanvas.height = smallH;
          
          // วาดรูปลงใน canvas ชั่วคราว
          tempCtx.drawImage(photo, 0, 0, smallW, smallH);
          
          // แปลงเป็นขาวดำ
          const imageData = tempCtx.getImageData(0, 0, smallW, smallH);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            // คำนวณความเข้มแสงแบบ grayscale
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = gray;     // R
            data[i + 1] = gray; // G
            data[i + 2] = gray; // B
            // data[i + 3] คือ alpha (ความโปร่งใส) ไม่เปลี่ยน
          }
          
          tempCtx.putImageData(imageData, 0, 0);
          
          // วาดเงาก่อน (สำหรับเอฟเฟ็กต์เงา)
          ctx.save();
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          
          // วาดรูปขาวดำพร้อมเงา
          ctx.drawImage(tempCanvas, smallX, smallY);
          
          // เพิ่มเอฟเฟ็กต์สะท้อนแสง (highlight)
          ctx.restore();
          ctx.save();
          ctx.globalAlpha = 0.2;
          
          // สร้าง gradient สำหรับเอฟเฟ็กต์สะท้อนแสง
          const gradient = ctx.createLinearGradient(smallX, smallY, smallX + smallW, smallY + smallH/3);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(smallX, smallY, smallW, smallH/3);
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
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        // 📦 กรอบรูปใหญ่ (Main Photo Placeholder)
        ctx.strokeRect(100, 300, 200, 250);
        
        // 📦 กรอบรูปเล็ก (Small Photo Placeholder)
        ctx.strokeRect(605, 465, 100, 120);
        ctx.fillStyle = '#cccccc';
        
        // เติมสีพื้นหลังกรอบ
        ctx.fillRect(100, 300, 200, 250);   // รูปใหญ่
        ctx.fillRect(605, 465, 100, 120);   // รูปเล็ก
        
        // เขียนข้อความใน placeholder
        ctx.fillStyle = '#666666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('กรุณาอัปโหลดรูป', 200, 420);
        ctx.fillText('PHOTO', 200, 440);
        ctx.fillText('PHOTO', 655, 530);
      }

      // ===== ลายน้ำแผนที่ประเทศไทย (นอกรูป ในบัตร) =====
      // วางที่มุมขวาล่างของบัตร ออกมาจากมุมขวารูปใหญ่
      ctx.save();
      ctx.globalAlpha = 0.18; // ความโปร่งใส: 0.1-1.0 (0.1=จางมาก, 1.0=เข้มเต็มที่)
      ctx.fillStyle = '#666666'; // สีลายน้ำ: #000000=ดำ, #666666=เทา, #999999=เทาอ่อน
      
      // 🎯 ตำแหน่งลายน้ำ (Watermark Position)
      // Canvas size: 1155x864 pixels
      const watermarkX = 280; // ตำแหน่งซ้าย-ขวา (0-1155) - ปรับที่นี่
      const watermarkY = 500; // ตำแหน่งบน-ล่าง (0-864) - ปรับที่นี่
      
      // 📐 ขนาดรูปแผนที่ไทย (Thailand Map Size)
      // ปรับขนาดโดยเปลี่ยนตัวเลขด้านล่าง
      const mapWidth = 90;  // ความกว้างแผนที่ (เริ่มต้น: 60px)
      const mapHeight = 80; // ความสูงแผนที่ (เริ่มต้น: 50px)
      
      // วาดรูปทรงแผนที่ไทย (ขนาดปรับได้)
      ctx.beginPath();
      ctx.moveTo(watermarkX + (mapWidth/2), watermarkY);                    // จุดบน
      ctx.lineTo(watermarkX + (mapWidth*0.83), watermarkY + (mapHeight*0.16)); // ขวาบน
      ctx.lineTo(watermarkX + mapWidth, watermarkY + (mapHeight*0.5));      // ขวากลาง
      ctx.lineTo(watermarkX + (mapWidth*0.83), watermarkY + (mapHeight*0.8)); // ขวาล่าง
      ctx.lineTo(watermarkX + (mapWidth*0.58), watermarkY + mapHeight);     // ล่างขวา
      ctx.lineTo(watermarkX + (mapWidth*0.33), watermarkY + (mapHeight*0.8)); // ล่างซ้าย
      ctx.lineTo(watermarkX + (mapWidth*0.17), watermarkY + (mapHeight*0.5)); // ซ้ายกลาง
      ctx.lineTo(watermarkX + (mapWidth*0.33), watermarkY + (mapHeight*0.16)); // ซ้ายบน
      ctx.closePath();
      ctx.fill();
      
      // 📝 ข้อความลายน้ำ (Watermark Text)
      const textSize = 12; // ขนาดฟอนต์ (8-20px แนะนำ)
      ctx.font = `bold ${textSize}px Arial`; // ปรับขนาดฟอนต์ที่นี่
      ctx.textAlign = 'center';
      
      // ตำแหน่งข้อความ (อิงจากขนาดแผนที่)
      const textX = watermarkX + (mapWidth/2);      // กึ่งกลางแผนที่
      const text1Y = watermarkY + mapHeight + 15;   // บรรทัดแรก (ห่างจากแผนที่ 15px)
      const text2Y = watermarkY + mapHeight + 30;   // บรรทัดสอง (ห่างจากแผนที่ 30px)
      
      ctx.fillText('KINGDOM OF', textX, text1Y);    // บรรทัดแรก
      ctx.fillText('THAILAND', textX, text2Y);      // บรรทัดสอง
      
      ctx.restore();

      // ===== MRZ (Machine Readable Zone) ข้อมูลด้านล่างบัตร =====
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 30px "Courier New", "Lucida Console", "Monaco", monospace'; // ฟอนต์มาตรฐาน monospace สำหรับ MRZ
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
      
      // 🎯 ตำแหน่ง MRZ (ด้านล่างบัตร)
      const mrzX = 110;           // ซ้าย-ขวา
      const mrzY1 = 700;         // บรรทัดแรก (บน-ล่าง)
      const mrzY2 = 760;         // บรรทัดสอง (บน-ล่าง)
      
      // วาดข้อความ MRZ แบบเพิ่มช่องว่างระหว่างตัวอักษร
      ctx.fillStyle = '#000000';
      
      // ฟังก์ชันวาดข้อความที่มีช่องว่างเพิ่มเติม
      const drawSpacedText = (text: string, x: number, y: number, letterSpacing: number = 3) => {
        let currentX = x;
        for (let i = 0; i < text.length; i++) {
          ctx.fillText(text[i], currentX, y);
          currentX += ctx.measureText(text[i]).width + letterSpacing;
        }
      };
      
      drawSpacedText(line1, mrzX, mrzY1, 3);  // บรรทัดแรก พร้อมช่องว่าง 3px
      drawSpacedText(line2, mrzX, mrzY2, 3);  // บรรทัดสอง พร้อมช่องว่าง 3px
      
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
                <CardTitle>Passport Maker - เครื่องมือสร้างหนังสือเดินทางไทย</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Left Column - Canvas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ตัวอย่างหนังสือเดินทาง</h3>
                    
                    <canvas
                      ref={canvasRef}
                      width={1155}
                      height={864}
                      className="w-full max-w-full h-auto rounded-lg shadow-lg bg-white"
                      style={{ 
                        maxWidth: '700px',
                        height: 'auto'
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